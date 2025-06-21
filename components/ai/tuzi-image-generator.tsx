"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Loader2, Download, Copy } from "lucide-react";
import { toast } from "sonner";

interface TuziImageGeneratorProps {
  className?: string;
}

interface GeneratedImage {
  base64: string;
  mimeType: string;
}

export function TuziImageGenerator({ className }: TuziImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [outputFormat, setOutputFormat] = useState("png");
  const [seed, setSeed] = useState("");
  const [safetyTolerance, setSafetyTolerance] = useState([2]);
  const [promptUpsampling, setPromptUpsampling] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);

  const aspectRatioOptions = [
    { value: "21:9", label: "超宽屏 (21:9)" },
    { value: "16:9", label: "宽屏 (16:9)" },
    { value: "4:3", label: "标准屏幕 (4:3)" },
    { value: "1:1", label: "正方形 (1:1)" },
    { value: "3:4", label: "竖屏 (3:4)" },
    { value: "9:16", label: "手机竖屏 (9:16)" },
    { value: "9:21", label: "超长竖屏 (9:21)" },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("请输入提示词");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const requestBody = {
        prompt: prompt.trim(),
        provider: "tuzi",
        model: "flux-kontext-pro",
        options: {
          aspectRatio,
          outputFormat,
          safetyTolerance: safetyTolerance[0],
          promptUpsampling,
          ...(seed && { seed: parseInt(seed) }),
        }
      };

      const response = await fetch("/api/demo/gen-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "生成失败");
      }

      if (data.success && data.data && data.data.length > 0) {
        // 从返回的数据中提取图像信息
        const imageData = data.data[0];
        setGeneratedImage({
          base64: imageData.base64 || imageData.body, // 兼容不同的返回格式
          mimeType: "image/" + outputFormat,
        });
        toast.success("图像生成成功！");
      } else {
        throw new Error("未收到有效的图像数据");
      }
    } catch (error) {
      console.error("生成失败:", error);
      toast.error(error instanceof Error ? error.message : "生成失败");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = `data:${generatedImage.mimeType};base64,${generatedImage.base64}`;
    link.download = `tuzi-generated-${Date.now()}.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("图像已下载");
  };

  const handleCopyBase64 = async () => {
    if (!generatedImage) return;

    try {
      await navigator.clipboard.writeText(generatedImage.base64);
      toast.success("Base64 已复制到剪贴板");
    } catch (error) {
      toast.error("复制失败");
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>兔子 AI 图像生成</CardTitle>
          <CardDescription>
            使用兔子 API 的 Flux-Kontext-Pro 模型生成高质量图像
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 提示词输入 */}
          <div className="space-y-2">
            <Label htmlFor="prompt">提示词</Label>
            <Textarea
              id="prompt"
              placeholder="描述你想要生成的图像..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {/* 宽高比选择 */}
          <div className="space-y-2">
            <Label htmlFor="aspect-ratio">宽高比</Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger>
                <SelectValue placeholder="选择宽高比" />
              </SelectTrigger>
              <SelectContent>
                {aspectRatioOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 输出格式 */}
          <div className="space-y-2">
            <Label htmlFor="output-format">输出格式</Label>
            <Select value={outputFormat} onValueChange={setOutputFormat}>
              <SelectTrigger>
                <SelectValue placeholder="选择输出格式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 种子值 */}
          <div className="space-y-2">
            <Label htmlFor="seed">种子值 (可选)</Label>
            <Input
              id="seed"
              type="number"
              placeholder="输入种子值以获得可重复的结果"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />
          </div>

          {/* 安全容忍度 */}
          <div className="space-y-2">
            <Label htmlFor="safety-tolerance">
              安全容忍度: {safetyTolerance[0]} (0=最严格, 6=最宽松)
            </Label>
            <Slider
              id="safety-tolerance"
              min={0}
              max={6}
              step={1}
              value={safetyTolerance}
              onValueChange={setSafetyTolerance}
              className="w-full"
            />
          </div>

          {/* 提示上采样 */}
          <div className="flex items-center space-x-2">
            <Switch
              id="prompt-upsampling"
              checked={promptUpsampling}
              onCheckedChange={setPromptUpsampling}
            />
            <Label htmlFor="prompt-upsampling">启用提示上采样</Label>
          </div>

          {/* 生成按钮 */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              "生成图像"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 生成结果 */}
      {generatedImage && (
        <Card>
          <CardHeader>
            <CardTitle>生成结果</CardTitle>
            <div className="flex space-x-2">
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                下载
              </Button>
              <Button onClick={handleCopyBase64} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                复制 Base64
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <img
                src={`data:${generatedImage.mimeType};base64,${generatedImage.base64}`}
                alt="Generated by Tuzi AI"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
