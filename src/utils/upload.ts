export const uploadImageAPI = async (file: File): Promise<string> => {
  try {
    // --- BƯỚC 1: XIN CHỮ KÝ TỪ SERVER ---
    // Gọi API nội bộ để lấy signature, timestamp, api_key...
    const signResponse = await fetch("/api/sign-cloudinary", {
      method: "POST",
    });

    if (!signResponse.ok) {
      throw new Error("Không thể lấy chữ ký upload từ server");
    }

    const signData = await signResponse.json();

    // --- BƯỚC 2: UPLOAD THẲNG LÊN CLOUDINARY ---
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signData.apiKey);
    formData.append("timestamp", signData.timestamp.toString());
    formData.append("signature", signData.signature);
    formData.append("folder", signData.folder);

    // URL upload của Cloudinary (dùng cloudName lấy được từ bước 1)
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`;

    const cloudResponse = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    if (!cloudResponse.ok) {
      const errorData = await cloudResponse.json();
      throw new Error(
        errorData.error?.message || "Lỗi khi upload lên Cloudinary"
      );
    }

    const cloudData = await cloudResponse.json();
    console.log("Cloudinary Upload Success:", cloudData);

    // --- BƯỚC 3: LƯU THÔNG TIN VÀO DATABASE (MONGODB) ---
    // Gửi metadata về server để lưu model File (phục vụ việc dọn rác sau này)
    const saveResponse = await fetch("/api/save-file", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: cloudData.secure_url,
        publicId: cloudData.public_id,
        format: cloudData.format,
        bytes: cloudData.bytes,
        resource_type: cloudData.resource_type,
      }),
    });

    if (!saveResponse.ok) {
      console.error(
        "Cảnh báo: Không thể lưu file vào DB, nhưng ảnh đã lên Cloud."
      );
    }

    return cloudData.secure_url;
  } catch (error: any) {
    console.error("Quy trình upload thất bại:", error);
    throw new Error(error.message || "Upload thất bại");
  }
};
