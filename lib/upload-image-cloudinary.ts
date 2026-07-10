import { cloudinary } from "./cloudinary";

const uploadImageToCloudinary = async (
  image: File,
  folder: string
): Promise<string> => {
  const bytes = await image.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadResult = await new Promise<{ secure_url: string }>(
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

  return uploadResult.secure_url;
};

export default uploadImageToCloudinary;
