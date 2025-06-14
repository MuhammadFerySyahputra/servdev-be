// config/r2Storage.js
import dotenv from "dotenv";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

// Validasi environment variables
const requiredEnvVars = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_DOMAIN",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Debug: Log credential lengths (hapus setelah berhasil)
console.log("R2 Credential Lengths:");
console.log("Access Key ID length:", process.env.R2_ACCESS_KEY_ID?.length);
console.log(
  "Secret Access Key length:",
  process.env.R2_SECRET_ACCESS_KEY?.length
);

// Konfigurasi R2 Client
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Upload file ke R2
export const uploadToR2 = async (file, folder = "products") => {
  try {
    // Validasi file
    if (!file || !file.buffer) {
      throw new Error("Invalid file provided");
    }

    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    console.log(`Uploading file: ${fileName}`);

    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);
    await r2Client.send(command);

    // Return public URL
    const publicUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;
    console.log(`File uploaded successfully: ${publicUrl}`);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw new Error(`Failed to upload image to R2: ${error.message}`);
  }
};

// Delete file dari R2
export const deleteFromR2 = async (fileUrl) => {
  try {
    if (!fileUrl) {
      throw new Error("File URL is required");
    }

    // Extract key from URL
    const key = fileUrl.replace(`https://${process.env.R2_PUBLIC_DOMAIN}/`, "");

    console.log(`Deleting file: ${key}`);

    const deleteParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await r2Client.send(command);

    console.log(`File deleted successfully: ${key}`);
    return true;
  } catch (error) {
    console.error("Error deleting from R2:", error);
    throw new Error(`Failed to delete image from R2: ${error.message}`);
  }
};

// Upload multiple files ke R2
export const uploadMultipleToR2 = async (files, folder = "products") => {
  try {
    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }

    console.log(`Uploading ${files.length} files to R2...`);

    const uploadPromises = files.map((file, index) => {
      console.log(`Processing file ${index + 1}:`, file.originalname);
      return uploadToR2(file, folder);
    });

    const urls = await Promise.all(uploadPromises);

    console.log(`Successfully uploaded ${urls.length} files`);
    return urls;
  } catch (error) {
    console.error("Error uploading multiple files to R2:", error);
    throw new Error(`Failed to upload images to R2: ${error.message}`);
  }
};

// Delete multiple files dari R2
export const deleteMultipleFromR2 = async (fileUrls) => {
  try {
    if (!fileUrls || fileUrls.length === 0) {
      return true;
    }

    console.log(`Deleting ${fileUrls.length} files from R2...`);

    const deletePromises = fileUrls.map((url) => deleteFromR2(url));
    await Promise.all(deletePromises);

    console.log(`Successfully deleted ${fileUrls.length} files`);
    return true;
  } catch (error) {
    console.error("Error deleting multiple files from R2:", error);
    throw new Error(`Failed to delete images from R2: ${error.message}`);
  }
};
