// PHẢI là import đầu tiên trong file — xóa global.self/window "ô nhiễm"
// trước khi @xenova/transformers chạy logic detect môi trường của nó.
import "./envPatch.js";

import { env, pipeline, RawImage } from "@xenova/transformers";
import sharp from "sharp";

// Tắt đa luồng WASM để đảm bảo tính ổn định trên Docker/Linux
env.backends.onnx.wasm.numThreads = 1;

let embedder = null;

/**
 * Đọc Buffer ảnh bằng sharp trực tiếp, tự dựng RawImage thủ công.
 * Né hẳn việc RawImage.read() tự detect môi trường (nguồn gốc lỗi
 * "loadImageFunction is not a function" khi detect sai trong Node.js).
 */
async function bufferToRawImage(buffer) {
  const img = sharp(buffer);
  const metadata = await img.metadata();
  const rawChannels = metadata.channels;

  const { data, info } = await img
    .rotate() // tự động xoay ảnh theo EXIF, giống hành vi gốc của thư viện
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rawImage = new RawImage(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    info.channels,
  );

  if (rawChannels !== undefined && rawChannels !== info.channels) {
    rawImage.convert(rawChannels);
  }

  return rawImage;
}

async function getEmbedder() {
  if (!embedder) {
    console.log("Đang khởi tạo mô hình AI Image Feature Extraction...");
    embedder = await pipeline(
      "image-feature-extraction",
      "Xenova/clip-vit-base-patch32",
    );
    console.log("✅ Khởi tạo mô hình AI thành công!");
  }
  return embedder;
}

// Hàm chuyển đổi dữ liệu ảnh thành Vector
export const getImageVector = async (imageInput) => {
  const extractor = await getEmbedder();
  let image;

  if (typeof imageInput === "string") {
    // Nếu đầu vào là URL hoặc đường dẫn file
    image = await RawImage.read(imageInput);
  } else if (Buffer.isBuffer(imageInput)) {
    // Trường hợp nhận Buffer từ Multer (req.file.buffer):
    // Đọc thẳng từ Buffer bằng sharp, không cần ghi file tạm ra đĩa
    image = await bufferToRawImage(imageInput);
  } else {
    image = imageInput;
  }

  // Trích xuất feature vector
  const output = await extractor(image);
  return Array.from(output.data);
};

// Hàm tính Cosine Similarity giữa 2 Vector
export const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};
