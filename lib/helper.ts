import fs from "fs/promises";
import path from "path";
import { cloudinary } from "@/lib/cloudinary";

export async function uploadLocalImageToCloudinary(
  imagePath: string,
  folder: string
): Promise<string> {
  const absolutePath = path.join(process.cwd(), "public", imagePath);

  const buffer = await fs.readFile(absolutePath);

  const result = await new Promise<{ secure_url: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
          },
          (error, result) => {
            if (error) return reject(error);

            if (!result?.secure_url) {
              return reject(new Error("Cloudinary upload failed."));
            }

            resolve(result);
          }
        )
        .end(buffer);
    }
  );

  return result.secure_url;
}
