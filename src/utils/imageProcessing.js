// src/utils/imageProcessing.js
import imageCompression from "browser-image-compression";

/**
 * Nén và chuyển đổi danh sách các file ảnh sang định dạng WebP
 * @param {File[]} files - Danh sách các file ảnh cần xử lý
 * @param {Object} options - Tùy chọn cho việc nén ảnh
 * @returns {Promise<File[]>} Danh sách các file đã được xử lý
 */
export const processImages = async (files, options = {}) => {
  // Cấu hình mặc định
  const defaultConfig = {
    maxSizeMB: 1, // Giới hạn dung lượng 1 MB
    maxWidthOrHeight: 1920, // Giới hạn độ phân giải Full HD
    useWebWorker: true,
  };

  // Merge options với config mặc định
  const config = { ...defaultConfig, ...options };

  try {
    // Nén và chuyển đổi file
    const webpImages = await Promise.all(
      files.map((file) =>
        imageCompression(file, config) // Nén ảnh
          .then((compressedBlob) => convertToWebP(compressedBlob)) // Chuyển đổi sang WebP
      )
    );

    // Tạo các File objects từ blobs đã xử lý
    const processedFiles = webpImages.map(
      (blob, i) =>
        new File(
          [blob],
          files[i].name.replace(/\.[^/.]+$/, "") + ".webp",
          { type: "image/webp" }
        )
    );

    return processedFiles;
  } catch (error) {
    console.error("Error processing images:", error);
    throw error;
  }
};

/**
 * Chuyển đổi một blob ảnh sang định dạng WebP
 * @param {Blob} blob - Blob ảnh cần chuyển đổi
 * @returns {Promise<Blob>} Blob ảnh đã chuyển sang WebP
 */
const convertToWebP = (blob) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (webpBlob) => {
          if (webpBlob) {
            resolve(webpBlob);
          } else {
            reject(new Error("Conversion to WebP failed"));
          }
        },
        "image/webp"
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
};

/**
 * Tạo đối tượng FormData từ danh sách các file đã xử lý
 * @param {File[]} files - Danh sách các file đã xử lý
 * @param {string} fieldName - Tên trường cho FormData
 * @returns {FormData} Đối tượng FormData chứa các file
 */
export const createFormDataFromFiles = (files, fieldName = "files") => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`${fieldName}[${index}]`, file);
  });
  return formData;
};