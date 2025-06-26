import { getUserUuid } from "@/services/user";
import { redirect } from "next/navigation";
import ImageToImageGenerator from "@/components/ai/image-to-image-generator";

export default async function ImageToImagePage() {
  const userUuid = await getUserUuid();

  const callbackUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/image-to-image`;
  if (!userUuid) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Image to Image Generation</h1>
          <p className="text-muted-foreground">
            Transform your images with AI. Upload an image and describe how you want to modify it.
          </p>
        </div>
        
        <ImageToImageGenerator
          provider="tuzi"
          model="flux-kontext-pro"
        />
      </div>
    </div>
  );
}
