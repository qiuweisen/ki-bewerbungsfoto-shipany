import { respData, respErr } from "@/lib/resp";
import { getImageProcessingService } from "@/services/image-processing-service";
import { ImageTransformOptions } from "@/types/image-processing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageUrl, options } = body;

    if (!imageUrl) {
      return respErr("imageUrl is required");
    }

    const imageService = getImageProcessingService();
    const result = await imageService.transform(imageUrl, options || {});

    return respData(result);
  } catch (error) {
    console.error("Image transform error:", error);
    return respErr(error instanceof Error ? error.message : "Transform failed");
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');
    
    if (!imageUrl) {
      return respErr("url parameter is required");
    }

    // 从查询参数构建选项
    const options: ImageTransformOptions = {};
    
    const width = url.searchParams.get('width');
    const height = url.searchParams.get('height');
    const quality = url.searchParams.get('quality');
    const format = url.searchParams.get('format');
    const fit = url.searchParams.get('fit');

    if (width) options.width = parseInt(width);
    if (height) options.height = parseInt(height);
    if (quality) options.quality = parseInt(quality);
    if (format) options.format = format as any;
    if (fit) options.fit = fit as any;

    const imageService = getImageProcessingService();
    const result = await imageService.transform(imageUrl, options);

    return respData(result);
  } catch (error) {
    console.error("Image transform error:", error);
    return respErr(error instanceof Error ? error.message : "Transform failed");
  }
}
