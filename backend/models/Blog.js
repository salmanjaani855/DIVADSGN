import mongoose from "mongoose";
import slugify from "slugify";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImageUrl: { type: String, default: "" },
    accessLevel: {
      type: String,
      enum: ["free", "pro", "premium"],
      default: "free",
    },
    author: { type: String, default: "Admin" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Auto-generate a unique kebab-case slug from the title whenever it changes.
// A numeric suffix is appended on collision (e.g. "my-post-2").
blogSchema.pre("validate", async function (next) {
  if (!this.isModified("title") && this.slug) return next();

  const base = slugify(this.title, { lower: true, strict: true, trim: true });
  let candidate = base;
  let counter = 1;

  const Blog = this.constructor;
  while (
    await Blog.exists({ slug: candidate, _id: { $ne: this._id } })
  ) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }

  this.slug = candidate;
  next();
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
