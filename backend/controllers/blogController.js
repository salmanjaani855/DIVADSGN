import Blog from "../models/Blog.js";
import { getUserPlanRank, isBlogAccessible } from "../middleware/accessControl.js";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import streamifier from "streamifier";

const PLAN_RANK = { free: 0, pro: 1, premium: 2 };
const rankToPlan = (rank) =>
  Object.keys(PLAN_RANK).find((plan) => PLAN_RANK[plan] === rank) || "free";

// Strips HTML tags and returns roughly the first `wordLimit` words of plain text.
// Used to build a teaser excerpt for locked blog content.
const stripHtmlAndTruncate = (html, wordLimit = 100) => {
  const text = (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ");
  return words.slice(0, wordLimit).join(" ") + (words.length > wordLimit ? "..." : "");
};

const listItemFields = (blog, locked) => ({
  _id: blog._id,
  title: blog.title,
  slug: blog.slug,
  excerpt: blog.excerpt,
  coverImageUrl: blog.coverImageUrl,
  accessLevel: blog.accessLevel,
  tags: blog.tags,
  author: blog.author,
  createdAt: blog.createdAt,
  locked,
});

export const listBlogs = async (req, res, next) => {
  try {
    const viewerPlan = rankToPlan(getUserPlanRank(req.user));
    const blogs = await Blog.find().sort({ createdAt: -1 });

    const result = blogs.map((blog) => {
      const locked = !isBlogAccessible(viewerPlan, blog.accessLevel);
      return listItemFields(blog, locked);
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const viewerPlan = rankToPlan(getUserPlanRank(req.user));
    const locked = !isBlogAccessible(viewerPlan, blog.accessLevel);

    if (!locked) {
      return res.status(200).json({
        _id: blog._id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        coverImageUrl: blog.coverImageUrl,
        accessLevel: blog.accessLevel,
        author: blog.author,
        tags: blog.tags,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
        locked: false,
      });
    }

    return res.status(200).json({
      title: blog.title,
      slug: blog.slug,
      coverImageUrl: blog.coverImageUrl,
      author: blog.author,
      tags: blog.tags,
      createdAt: blog.createdAt,
      accessLevel: blog.accessLevel,
      excerpt: stripHtmlAndTruncate(blog.content, 100),
      locked: true,
      content: null,
    });
  } catch (err) {
    next(err);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const { title, excerpt, content, coverImageUrl, accessLevel, author, tags } = req.body;

    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    const blog = await Blog.create({
      title,
      excerpt,
      content,
      coverImageUrl,
      accessLevel,
      author,
      tags,
    });

    res.status(201).json({ blog });
  } catch (err) {
    next(err);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { title, excerpt, content, coverImageUrl, accessLevel, author, tags } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (title !== undefined) blog.title = title;
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (content !== undefined) blog.content = content;
    if (coverImageUrl !== undefined) blog.coverImageUrl = coverImageUrl;
    if (accessLevel !== undefined) blog.accessLevel = accessLevel;
    if (author !== undefined) blog.author = author;
    if (tags !== undefined) blog.tags = tags;

    await blog.save();

    res.status(200).json({ blog });
  } catch (err) {
    next(err);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json({ message: "Blog deleted" });
  } catch (err) {
    next(err);
  }
};

export const uploadImage = async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured) {
      return res.status(503).json({ message: "Cloudinary is not configured" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "blog-covers" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await streamUpload();
    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    next(err);
  }
};
