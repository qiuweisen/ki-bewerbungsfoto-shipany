"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Icon from "@/components/icon";

interface ImageToImageGeneratorProps {
  onGenerate?: (result: any) => void;
  provider?: string;
  model?: string;
  defaultOptions?: Record<string, any>;
}

export default function ImageToImageGenerator({
  onGenerate,
  provider = "tuzi",
  model = "flux-kontext-pro",
  defaultOptions = {}
}: ImageToImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [inputImages, setInputImages] = useState<string[]>([]);
  const [inputImageFiles, setInputImageFiles] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [outputFormat, setOutputFormat] = useState("png");
  const [safetyTolerance, setSafetyTolerance] = useState("2");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择（支持多文件）
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // 验证文件类型和大小
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only JPEG, PNG, and WebP are allowed`);
        return;
      }

      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}. Maximum size is 10MB`);
        return;
      }
    }

    setInputImageFiles(files);

    // 创建预览
    const previews: string[] = [];
    for (const file of files) {
      const reader = new FileReader();
      const preview = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      previews.push(preview);
    }
    setInputImages(previews);
  }, []);

  // 上传图片到云存储（支持多文件）
  const uploadImagesToCloud = useCallback(async () => {
    if (inputImageFiles.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of inputImageFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          uploadedUrls.push(result.data.url);
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      }

      setUploadedImageUrls(uploadedUrls);
      toast.success(`${uploadedUrls.length} images uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [inputImageFiles]);

  // 生成图片
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    // 检查是否有输入图片
    if (inputImages.length === 0 && uploadedImageUrls.length === 0) {
      toast.error('Please select input images');
      return;
    }

    setIsGenerating(true);
    try {
      // 构建请求体
      const requestBody: any = {
        prompt: prompt,
        provider: provider,
        model: model,
        bizNo: Date.now().toString(),
        options: {
          aspectRatio: aspectRatio,
          outputFormat: outputFormat,
          safetyTolerance: parseInt(safetyTolerance),
          ...defaultOptions,
        }
      };

      // 优先使用已上传的URL，否则使用base64
      if (uploadedImageUrls.length > 0) {
        if (uploadedImageUrls.length === 1) {
          requestBody.inputImageUrl = uploadedImageUrls[0];
        } else {
          requestBody.inputImageUrls = uploadedImageUrls;
        }
      } else if (inputImages.length > 0) {
        if (inputImages.length === 1) {
          requestBody.inputImage = inputImages[0];
        } else {
          // 多图base64暂不支持，提示用户先上传
          toast.error('Multiple images require cloud upload. Please upload images first.');
          return;
        }
      }

      // 调用图生图API
      const response = await fetch('/api/ai/image-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.success) {
        const imageUrls = result.data.images.map((img: any) => img.url || img.location);
        setGeneratedImages(imageUrls);
        toast.success('Image generated successfully');

        if (onGenerate) {
          onGenerate(result.data);
        }
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, inputImages, uploadedImageUrls, aspectRatio, outputFormat, safetyTolerance, onGenerate]);

  // 清除输入
  const handleClear = useCallback(() => {
    setInputImages([]);
    setInputImageFiles([]);
    setUploadedImageUrls([]);
    setPrompt("");
    setGeneratedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="RiImageEditLine" className="w-5 h-5" />
            Image to Image Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 图片上传区域 */}
          <div className="space-y-2">
            <Label>Input Image</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              {inputImages.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inputImages.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image}
                          alt={`Input image ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-auto rounded-lg object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          P{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Icon name="RiImageLine" className="w-4 h-4 mr-2" />
                      Change Image
                    </Button>

                    {inputImageFiles.length > 0 && uploadedImageUrls.length === 0 && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={uploadImagesToCloud}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Icon name="RiLoader4Line" className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Icon name="RiUploadCloudLine" className="w-4 h-4 mr-2" />
                            Upload to Cloud
                          </>
                        )}
                      </Button>
                    )}

                    {uploadedImageUrls.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Icon name="RiCheckLine" className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">
                          {uploadedImageUrls.length} image{uploadedImageUrls.length > 1 ? 's' : ''} uploaded
                        </span>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInputImages([]);
                        setInputImageFiles([]);
                        setUploadedImageUrls([]);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <Icon name="RiDeleteBinLine" className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Icon name="RiImageAddLine" className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Click to upload an image or drag and drop
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon name="RiUploadLine" className="w-4 h-4 mr-2" />
                    Select Image
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports JPEG, PNG, WebP (max 10MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* 提示词输入 */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe how you want to modify the image..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {/* 参数设置 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">Square (1:1)</SelectItem>
                  <SelectItem value="4:3">Standard (4:3)</SelectItem>
                  <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                  <SelectItem value="3:4">Portrait (3:4)</SelectItem>
                  <SelectItem value="9:16">Mobile (9:16)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Safety Level</Label>
              <Select value={safetyTolerance} onValueChange={setSafetyTolerance}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Strictest (0)</SelectItem>
                  <SelectItem value="1">Very Strict (1)</SelectItem>
                  <SelectItem value="2">Strict (2)</SelectItem>
                  <SelectItem value="3">Moderate (3)</SelectItem>
                  <SelectItem value="4">Relaxed (4)</SelectItem>
                  <SelectItem value="5">Very Relaxed (5)</SelectItem>
                  <SelectItem value="6">Most Relaxed (6)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || isUploading || !prompt.trim() || (inputImages.length === 0 && uploadedImageUrls.length === 0)}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Icon name="RiLoader4Line" className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : isUploading ? (
                <>
                  <Icon name="RiUploadLine" className="w-4 h-4 mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Icon name="RiMagicLine" className="w-4 h-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isGenerating || isUploading}
            >
              <Icon name="RiRefreshLine" className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* 模型信息 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">Tuzi API</Badge>
            <Badge variant="secondary">flux-kontext-pro</Badge>
            <span>•</span>
            <span>Image-to-Image Generation</span>
          </div>
        </CardContent>
      </Card>

      {/* 生成结果 */}
      {generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={imageUrl}
                    alt={`Generated image ${index + 1}`}
                    width={400}
                    height={400}
                    className="w-full h-auto rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(imageUrl, '_blank')}
                    >
                      <Icon name="RiDownloadLine" className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
