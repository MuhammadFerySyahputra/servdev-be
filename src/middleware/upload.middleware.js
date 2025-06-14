// middleware/upload.middleware.js
import multer from "multer";
import path from "path";

// Konfigurasi memory storage untuk R2
const storage = multer.memoryStorage();

// Filter hanya file gambar
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  // Cek MIME type juga untuk keamanan ekstra
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  const isValidMimeType = allowedMimeTypes.includes(file.mimetype);

  if (isValid && isValidMimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, jpeg, png, webp)"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 10,
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
});

export const uploadProductImages = upload.array("images", 10); // Max 10 gambar
