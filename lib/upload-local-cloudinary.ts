import fs from "fs/promises";
import path from "path";
import { cloudinary } from "@/lib/cloudinary";
import type { CloudinaryUploadResult } from "@/lib/upload-image-cloudinary";

export async function uploadLocalImageToCloudinary(
  imagePath: string,
  folder: string
): Promise<CloudinaryUploadResult> {
  const absolutePath = path.join(process.cwd(), "public", imagePath);

  const buffer = await fs.readFile(absolutePath);

  const result = await new Promise<{
    secure_url: string;
    public_id: string;
  }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
        },
        (error, result) => {
          if (error) return reject(error);

          if (!result?.secure_url || !result?.public_id) {
            return reject(new Error("Cloudinary upload failed."));
          }

          resolve(result);
        }
      )
      .end(buffer);
  });

  return { url: result.secure_url, publicId: result.public_id };
}
