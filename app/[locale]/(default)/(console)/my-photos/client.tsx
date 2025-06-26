"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Icon from "@/components/icon";
import moment from "moment";
import { AIGenerationOrder } from "@/types/ai-generation-record";

interface MyPhotosClientProps {
  photos: AIGenerationOrder[];
  translations: {
    noPhotos: string;
    downloadAll: string;
    download: string;
    delete: string;
    confirmDelete: string;
    deleteSuccess: string;
    deleteError: string;
    createdAt: string;
    prompt: string;
    provider: string;
    model: string;
    viewDetails: string;
    closeDetails: string;
    copyPrompt: string;
    promptCopied: string;
    selectAll: string;
    deselectAll: string;
    selectedCount: string;
    batchDelete: string;
    confirmBatchDelete: string;
  };
}

export default function MyPhotosClient({ photos, translations }: MyPhotosClientProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // 选择/取消选择照片
  const togglePhotoSelection = useCallback((photoId: number | undefined) => {
    if (photoId === undefined) return;
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  }, []);

  // 全选/取消全选
  const toggleSelectAll = useCallback(() => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map(photo => photo.id).filter((id): id is number => id !== undefined)));
    }
  }, [photos, selectedPhotos.size]);

  // 下载图片
  const downloadImage = useCallback(async (url: string, filename?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || `image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  }, []);

  // 批量下载选中的图片
  const downloadSelectedPhotos = useCallback(async () => {
    const selectedPhotosList = photos.filter(photo => photo.id && selectedPhotos.has(photo.id));

    for (const photo of selectedPhotosList) {
      if (photo.result_urls && photo.result_urls.length > 0) {
        for (let i = 0; i < photo.result_urls.length; i++) {
          const url = photo.result_urls[i];
          const filename = `${photo.provider}_${photo.id}_${i + 1}.png`;
          await downloadImage(url, filename);
          // 添加延迟避免浏览器限制
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    toast.success(`Downloaded ${selectedPhotosList.length} photos`);
  }, [photos, selectedPhotos, downloadImage]);

  // 删除照片
  const deletePhoto = useCallback(async (photoId: number | undefined) => {
    if (!photoId || !confirm(translations.confirmDelete)) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/ai-generations/${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(translations.deleteSuccess);
        // 刷新页面或从列表中移除
        window.location.reload();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(translations.deleteError);
    } finally {
      setIsDeleting(false);
    }
  }, [translations]);

  // 批量删除
  const batchDeletePhotos = useCallback(async () => {
    if (selectedPhotos.size === 0) return;
    if (!confirm(translations.confirmBatchDelete.replace('{count}', selectedPhotos.size.toString()))) return;

    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedPhotos).map(photoId =>
        fetch(`/api/ai-generations/${photoId}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      toast.success(`Deleted ${selectedPhotos.size} photos`);
      setSelectedPhotos(new Set());
      window.location.reload();
    } catch (error) {
      console.error('Batch delete failed:', error);
      toast.error(translations.deleteError);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedPhotos, translations]);

  // 复制提示词
  const copyPrompt = useCallback((prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success(translations.promptCopied);
  }, [translations]);

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="RiImageLine" className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{translations.noPhotos}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectAll}
          >
            <Icon name="RiCheckboxMultipleLine" className="w-4 h-4 mr-2" />
            {selectedPhotos.size === photos.length ? translations.deselectAll : translations.selectAll}
          </Button>
          
          {selectedPhotos.size > 0 && (
            <span className="text-sm text-muted-foreground">
              {translations.selectedCount.replace('{count}', selectedPhotos.size.toString())}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedPhotos.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSelectedPhotos}
              >
                <Icon name="RiDownloadLine" className="w-4 h-4 mr-2" />
                {translations.downloadAll}
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={batchDeletePhotos}
                disabled={isDeleting}
              >
                <Icon name="RiDeleteBinLine" className="w-4 h-4 mr-2" />
                {translations.batchDelete}
              </Button>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* 照片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id || `photo-${Math.random()}`}
            photo={photo}
            isSelected={photo.id ? selectedPhotos.has(photo.id) : false}
            onToggleSelect={() => togglePhotoSelection(photo.id)}
            onDownload={downloadImage}
            onDelete={() => deletePhoto(photo.id)}
            onCopyPrompt={copyPrompt}
            translations={translations}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </div>
  );
}

// 照片卡片组件
function PhotoCard({
  photo,
  isSelected,
  onToggleSelect,
  onDownload,
  onDelete,
  onCopyPrompt,
  translations,
  isDeleting
}: {
  photo: AIGenerationOrder;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDownload: (url: string, filename?: string) => void;
  onDelete: () => void;
  onCopyPrompt: (prompt: string) => void;
  translations: any;
  isDeleting: boolean;
}) {
  const firstImageUrl = photo.result_urls?.[0];
  
  if (!firstImageUrl) return null;

  return (
    <Card className={`group relative overflow-hidden transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-0">
        {/* 选择框 */}
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="bg-white/80 border-white"
          />
        </div>

        {/* 图片 */}
        <div className="relative aspect-square">
          <Image
            src={firstImageUrl}
            alt={photo.prompt || "Generated image"}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          
          {/* 悬停操作按钮 */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onDownload(firstImageUrl, `${photo.provider}_${photo.id}.png`)}
            >
              <Icon name="RiDownloadLine" className="w-4 h-4" />
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                  <Icon name="RiEyeLine" className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>{translations.viewDetails}</DialogTitle>
                </DialogHeader>
                <PhotoDetails photo={photo} onCopyPrompt={onCopyPrompt} translations={translations} />
              </DialogContent>
            </Dialog>
            
            <Button
              size="sm"
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Icon name="RiDeleteBinLine" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 照片信息 */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {photo.provider}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {moment(photo.created_at).format("MM-DD HH:mm")}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {photo.prompt}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// 照片详情组件
function PhotoDetails({ 
  photo, 
  onCopyPrompt, 
  translations 
}: { 
  photo: AIGenerationOrder; 
  onCopyPrompt: (prompt: string) => void;
  translations: any;
}) {
  return (
    <div className="space-y-6">
      {/* 图片展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {photo.result_urls?.map((url, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              src={url}
              alt={`Generated image ${index + 1}`}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* 详细信息 */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">{translations.prompt}</label>
          <div className="flex items-start gap-2 mt-1">
            <p className="text-sm text-muted-foreground flex-1 p-2 bg-muted rounded">
              {photo.prompt}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyPrompt(photo.prompt || '')}
            >
              <Icon name="RiFileCopyLine" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{translations.provider}</label>
            <p className="text-sm text-muted-foreground mt-1">{photo.provider}</p>
          </div>
          <div>
            <label className="text-sm font-medium">{translations.model}</label>
            <p className="text-sm text-muted-foreground mt-1">{photo.model}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">{translations.createdAt}</label>
          <p className="text-sm text-muted-foreground mt-1">
            {moment(photo.created_at).format("YYYY-MM-DD HH:mm:ss")}
          </p>
        </div>
      </div>
    </div>
  );
}
