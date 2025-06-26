import { respData, respErr } from "@/lib/resp";
import { getImageProcessingService } from "@/services/image-processing-service";

export async function GET(req: Request) {
  try {
    const imageService = getImageProcessingService();
    const variants = imageService.getSupportedVariants();

    return respData({
      variants,
      provider: imageService.getServiceInfo()
    });
  } catch (error) {
    console.error("Get variants error:", error);
    return respErr(error instanceof Error ? error.message : "Failed to get variants");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageUrl, variant } = body;

    if (!imageUrl) {
      return respErr("imageUrl is required");
    }

    if (!variant) {
      return respErr("variant is required");
    }

    const imageService = getImageProcessingService();
    const result = await imageService.applyVariant(imageUrl, variant);

    return respData(result);
  } catch (error) {
    console.error("Apply variant error:", error);
    return respErr(error instanceof Error ? error.message : "Failed to apply variant");
  }
}
