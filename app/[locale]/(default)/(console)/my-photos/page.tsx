import { getAIGenerationOrdersByUser } from "@/models/ai-generation-record";
import { getUserUuid } from "@/services/user";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import MyPhotosClient from "./client";

export default async function MyPhotosPage() {
  const t = await getTranslations();
  const userUuid = await getUserUuid();

  const callbackUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/my-photos`;
  if (!userUuid) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  // 获取图片生成记录，只要成功的记录
  const photos = await getAIGenerationOrdersByUser(userUuid, 'image', 1, 50);
  const successPhotos = photos.filter(photo => 
    photo.status === 'success' && 
    photo.result_urls && 
    photo.result_urls.length > 0
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("my_photos.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("my_photos.description")}</p>
      </div>
      
      <MyPhotosClient 
        photos={successPhotos} 
        translations={{
          noPhotos: t("my_photos.no_photos"),
          downloadAll: t("my_photos.download_all"),
          download: t("my_photos.download"),
          delete: t("my_photos.delete"),
          confirmDelete: t("my_photos.confirm_delete"),
          deleteSuccess: t("my_photos.delete_success"),
          deleteError: t("my_photos.delete_error"),
          createdAt: t("my_photos.created_at"),
          prompt: t("my_photos.prompt"),
          provider: t("my_photos.provider"),
          model: t("my_photos.model"),
          viewDetails: t("my_photos.view_details"),
          closeDetails: t("my_photos.close_details"),
          copyPrompt: t("my_photos.copy_prompt"),
          promptCopied: t("my_photos.prompt_copied"),
          selectAll: t("my_photos.select_all"),
          deselectAll: t("my_photos.deselect_all"),
          selectedCount: t("my_photos.selected_count"),
          batchDelete: t("my_photos.batch_delete"),
          confirmBatchDelete: t("my_photos.confirm_batch_delete"),
        }}
      />
    </div>
  );
}
