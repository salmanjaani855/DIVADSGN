import multer from "multer";

// Files are held in memory and streamed to Cloudinary manually inside the
// controller (via cloudinary.uploader.upload_stream) -- this avoids writing
// temp files to disk and keeps the upload logic self-contained/testable.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});
