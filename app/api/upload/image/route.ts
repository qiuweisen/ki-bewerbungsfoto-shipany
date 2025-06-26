import { respData, respErr } from "@/lib/resp";
import { getUserUuid } from "@/services/user";
import { newStorage } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const userUuid = await getUserUuid();
    if (!userUuid) {
      return respErr("no auth");
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return respErr("no file provided");
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return respErr("invalid file type. Only JPEG, PNG, and WebP are allowed");
    }

    // 验证文件大小 (最大 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return respErr("file too large. Maximum size is 10MB");
    }

    // 生成文件名
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `uploads/${userUuid}/${timestamp}.${extension}`;

    // 上传到云存储
    const storage = newStorage();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await storage.uploadFile({
      body: buffer,
      key: fileName,
      contentType: file.type,
    });

    // 转换为 base64 用于 API 调用
    const base64 = buffer.toString('base64');
    const base64WithPrefix = `data:${file.type};base64,${base64}`;

    return respData({
      url: uploadResult.url,
      location: uploadResult.location,
      base64: base64WithPrefix,
      fileName: fileName,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return respErr("upload failed");
  }
}
