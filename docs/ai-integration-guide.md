# AI 接口集成开发指南

## 概述

本指南详细介绍如何在 ShipAny 模板中集成各种 AI 服务，包括文生图、文生视频、文本生成等功能。

## 当前支持的 AI 服务

### 1. 文生图服务
- **OpenAI DALL-E**: 高质量图像生成
- **Replicate**: 多种开源模型
- **Kling**: 国产 AI 图像生成

### 2. 文生视频服务  
- **Kling**: 支持文本到视频生成

### 3. 文本生成服务
- **OpenAI GPT**: 通用文本生成
- **DeepSeek**: 国产大语言模型
- **OpenRouter**: 多模型聚合服务

## AI SDK 架构

### 核心结构
```
aisdk/
├── index.ts              # 主入口
├── types/               # 类型定义
├── provider/            # 提供商抽象
├── generate-video/      # 视频生成
└── kling/              # Kling 提供商实现
```

### 提供商接口设计
```typescript
// aisdk/types/provider.ts
export interface AIProvider {
  name: string;
  image?(model: string): ImageModel;
  video?(model: string): VideoModel;
  text?(model: string): TextModel;
}
```

## 新增文生图提供商

### 1. 创建提供商实现

```typescript
// aisdk/your-provider/provider.ts
import { AIProvider } from "../types/provider";

export interface YourProviderSettings {
  apiKey: string;
  baseURL?: string;
}

export class YourProvider implements AIProvider {
  readonly name = "your-provider";
  
  constructor(private settings: YourProviderSettings) {}
  
  image(model: string) {
    return new YourImageModel(model, this.settings);
  }
}

export function createYourProvider(settings: YourProviderSettings) {
  return new YourProvider(settings);
}
```

### 2. 实现图像模型

```typescript
// aisdk/your-provider/image-model.ts
import { ImageModelV1 } from "@ai-sdk/provider";

export class YourImageModel implements ImageModelV1 {
  readonly specificationVersion = "v1";
  readonly provider = "your-provider";
  
  constructor(
    public readonly modelId: string,
    private settings: YourProviderSettings
  ) {}
  
  async doGenerate(options: ImageGenerateOptions) {
    // 实现图像生成逻辑
    const response = await fetch(`${this.settings.baseURL}/generate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.settings.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: options.prompt,
        model: this.modelId,
        n: options.n || 1,
      }),
    });
    
    const data = await response.json();
    
    return {
      images: data.images.map((img: any) => ({
        base64: img.base64,
        mimeType: "image/png",
      })),
      warnings: [],
    };
  }
}
```

### 3. 在 API 路由中使用

```typescript
// app/api/generate-image/route.ts
import { yourProvider } from "@/aisdk/your-provider";

export async function POST(req: Request) {
  const { prompt, model } = await req.json();
  
  const imageModel = yourProvider.image(model);
  
  const { images } = await generateImage({
    model: imageModel,
    prompt,
    n: 1,
  });
  
  return Response.json({ images });
}
```

## 新增文生视频功能

### 1. 创建视频模型接口

```typescript
// aisdk/types/video-model.ts
export interface VideoGenerateOptions {
  prompt: string;
  duration?: number;
  aspectRatio?: string;
  fps?: number;
}

export interface VideoGenerateResult {
  videos: Array<{
    url?: string;
    base64?: string;
    mimeType: string;
  }>;
  warnings: string[];
}

export interface VideoModelV1 {
  readonly specificationVersion: "v1";
  readonly provider: string;
  readonly modelId: string;
  
  doGenerate(options: VideoGenerateOptions): Promise<VideoGenerateResult>;
}
```

### 2. 实现视频生成函数

```typescript
// aisdk/generate-video/generate-video.ts
import { VideoModelV1, VideoGenerateOptions } from "../types/video-model";

export async function generateVideo(options: {
  model: VideoModelV1;
  prompt: string;
  duration?: number;
  aspectRatio?: string;
}) {
  return await options.model.doGenerate({
    prompt: options.prompt,
    duration: options.duration,
    aspectRatio: options.aspectRatio,
  });
}
```

### 3. 创建 API 路由

```typescript
// app/api/generate-video/route.ts
import { generateVideo } from "@/aisdk";
import { kling } from "@/aisdk/kling";
import { respData, respErr } from "@/lib/resp";

export async function POST(req: Request) {
  try {
    const { prompt, provider = "kling", model = "kling-v1" } = await req.json();
    
    if (!prompt) {
      return respErr("缺少提示词");
    }
    
    let videoModel;
    switch (provider) {
      case "kling":
        videoModel = kling.video(model);
        break;
      default:
        return respErr("不支持的提供商");
    }
    
    const result = await generateVideo({
      model: videoModel,
      prompt,
      duration: 5, // 5秒视频
    });
    
    return respData(result);
  } catch (error) {
    console.error("视频生成失败:", error);
    return respErr("视频生成失败");
  }
}
```

## 前端组件开发

### 1. 图像生成组件

```typescript
// components/image-generator.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("请输入提示词");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch("/api/demo/gen-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          provider: "openai",
          model: "dall-e-3",
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setImages(data.data.map((img: any) => img.url));
        toast.success("图像生成成功");
      } else {
        toast.error(data.message || "生成失败");
      }
    } catch (error) {
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="输入图像描述..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "生成中..." : "生成图像"}
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {images.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Generated ${index + 1}`}
            className="w-full rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
```

### 2. 视频生成组件

```typescript
// components/video-generator.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("5");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          duration: parseInt(duration),
          provider: "kling",
          model: "kling-v1",
        }),
      });
      
      const data = await response.json();
      if (data.success && data.data.videos[0]) {
        setVideoUrl(data.data.videos[0].url);
      }
    } catch (error) {
      console.error("视频生成失败:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="描述你想要生成的视频..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
      />
      
      <div className="flex gap-4">
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5秒</SelectItem>
            <SelectItem value="10">10秒</SelectItem>
            <SelectItem value="15">15秒</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "生成中..." : "生成视频"}
        </Button>
      </div>
      
      {videoUrl && (
        <video
          src={videoUrl}
          controls
          className="w-full rounded-lg"
          autoPlay
          muted
        />
      )}
    </div>
  );
}
```

## 积分消耗集成

### 在 AI 接口中集成积分系统

```typescript
// app/api/generate-image/route.ts
import { getServerSession } from "next-auth";
import { CreditService } from "@/services/credit";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user) {
    return respErr("请先登录");
  }
  
  // 检查积分余额
  const credits = await CreditService.getBalance(session.user.uuid);
  const requiredCredits = 10; // 生成一张图片需要10积分
  
  if (credits < requiredCredits) {
    return respErr("积分不足，请先充值");
  }
  
  try {
    // 生成图像
    const result = await generateImage({...});
    
    // 消耗积分
    await CreditService.consume({
      userUuid: session.user.uuid,
      credits: requiredCredits,
      transType: "image_generation",
    });
    
    return respData(result);
  } catch (error) {
    return respErr("生成失败");
  }
}
```

## 错误处理与重试

### 实现重试机制

```typescript
// lib/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

// 在 AI 接口中使用
const result = await withRetry(() => 
  generateImage({ model: imageModel, prompt })
);
```

## 性能优化

### 1. 请求队列管理

```typescript
// lib/queue.ts
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  
  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.process();
    });
  }
  
  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      await task();
    }
    this.processing = false;
  }
}

export const aiQueue = new RequestQueue();
```

### 2. 结果缓存

```typescript
// lib/ai-cache.ts
import { cache } from "@/lib/cache";

export async function getCachedResult<T>(
  key: string,
  generator: () => Promise<T>,
  ttl = 3600
): Promise<T> {
  const cached = await cache.get(key);
  if (cached) return cached;
  
  const result = await generator();
  await cache.set(key, result, ttl);
  return result;
}

// 使用示例
const cacheKey = `image:${hashPrompt(prompt)}:${model}`;
const result = await getCachedResult(cacheKey, () =>
  generateImage({ model: imageModel, prompt })
);
```

## 监控与日志

### AI 服务监控

```typescript
// lib/ai-monitor.ts
export class AIMonitor {
  static async logRequest(provider: string, model: string, prompt: string) {
    console.log(`[AI] ${provider}/${model}: ${prompt.slice(0, 100)}...`);
  }
  
  static async logResult(provider: string, success: boolean, duration: number) {
    console.log(`[AI] ${provider}: ${success ? 'SUCCESS' : 'FAILED'} (${duration}ms)`);
  }
  
  static async logError(provider: string, error: any) {
    console.error(`[AI] ${provider} ERROR:`, error);
  }
}
```

## 下一步

1. 选择需要集成的 AI 服务提供商
2. 实现对应的提供商接口
3. 创建 API 路由和前端组件
4. 集成积分系统和用户认证
5. 添加错误处理和监控
6. 测试完整的用户流程

更多 AI SDK 使用示例请参考 [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)。
