# 兔子 API (Tuzi AI) 集成指南

## 概述

兔子 API 是一个高性价比的 AI 图像生成服务，提供 Flux-Kontext-Pro 模型，支持多种图像生成功能。本项目已集成兔子 API，提供完整的 TypeScript SDK 和 React 组件。

## 特性

- 🎨 **高质量图像生成** - 基于 Flux-Kontext-Pro 模型
- 💰 **价格优势** - 相对便宜的 API 调用费用
- 🖼️ **多种宽高比** - 支持 21:9 到 9:21 的各种比例
- 🎯 **图像参考** - 支持使用图像 URL 作为参考
- 🔧 **灵活配置** - 丰富的参数设置选项
- 🔒 **安全控制** - 可调节的安全容忍度

## 快速开始

### 1. 环境配置

在 `.env.local` 文件中添加兔子 API 密钥：

```bash
TUZI_API_KEY=your-tuzi-api-key
TUZI_BASE_URL=https://api.tu-zi.com
```

### 2. 基础使用

```typescript
import { tuzi, TUZI_MODELS } from "@/aisdk";

// 基础图像生成
const result = await tuzi.image(TUZI_MODELS.FLUX_KONTEXT_PRO).doGenerate({
  prompt: "一只可爱的小猫咪坐在花园里",
  n: 1,
  providerOptions: {
    tuzi: {
      aspectRatio: "1:1",
      outputFormat: "png",
      safetyTolerance: 2,
    }
  }
});

// 获取生成的图像
const image = result.images[0];
console.log("Base64 图像:", image.base64);
```

### 3. 高级配置

```typescript
// 使用种子和特定设置
const result = await tuzi.image(TUZI_MODELS.FLUX_KONTEXT_PRO).doGenerate({
  prompt: "未来科技城市的夜景，霓虹灯闪烁，赛博朋克风格",
  n: 1,
  providerOptions: {
    tuzi: {
      aspectRatio: "16:9",
      outputFormat: "jpeg",
      seed: 42, // 固定种子确保可重复性
      promptUpsampling: true, // 启用提示上采样
      safetyTolerance: 3,
    }
  }
});
```

### 4. 图像参考生成

```typescript
// 使用图像 URL 作为参考
const result = await tuzi.image(TUZI_MODELS.FLUX_KONTEXT_PRO).doGenerate({
  prompt: "https://example.com/reference-image.jpg 让这个人带上墨镜，衣服换个颜色",
  n: 1,
  providerOptions: {
    tuzi: {
      aspectRatio: "3:4",
      outputFormat: "png",
      safetyTolerance: 2,
    }
  }
});
```

## API 参数说明

### 必填参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `model` | string | 模型名称 | "flux-kontext-pro" |
| `prompt` | string | 文本提示，可包含图片URL | "一只可爱的猫咪" |

### 可选参数

| 参数 | 类型 | 默认值 | 说明 | 示例 |
|------|------|--------|------|------|
| `input_image` | string | null | Base64编码的输入图像 | "data:image/jpeg;base64,..." |
| `seed` | integer | null | 随机种子，用于可重复生成 | 42 |
| `aspect_ratio` | string | "1:1" | 图像宽高比 | "16:9", "1:1", "9:16" |
| `output_format` | string | "jpeg" | 输出格式 | "jpeg", "png" |
| `webhook_url` | string | null | Webhook通知URL | "https://your-webhook.com" |
| `webhook_secret` | string | null | Webhook签名密钥 | "your-secret-key" |
| `prompt_upsampling` | boolean | false | 是否对提示进行上采样 | true, false |
| `safety_tolerance` | integer | 2 | 安全容忍度级别(0-6) | 0(最严格) - 6(最宽松) |

## 支持的宽高比

| 比例 | 说明 | 适用场景 |
|------|------|----------|
| "21:9" | 超宽屏 | 电影海报、横幅 |
| "16:9" | 宽屏 | 桌面壁纸、视频缩略图 |
| "4:3" | 标准屏幕 | 传统显示器 |
| "1:1" | 正方形 | 社交媒体头像、Instagram |
| "3:4" | 竖屏 | 杂志封面 |
| "9:16" | 手机竖屏 | 手机壁纸、Stories |
| "9:21" | 超长竖屏 | 长图、信息图表 |

## React 组件使用

项目提供了现成的 React 组件：

```tsx
import { TuziImageGenerator } from "@/components/ai/tuzi-image-generator";

export default function MyPage() {
  return (
    <div>
      <h1>AI 图像生成</h1>
      <TuziImageGenerator />
    </div>
  );
}
```

## API 路由

项目提供了 Next.js API 路由：

```typescript
// POST /api/ai/tuzi/generate
const response = await fetch("/api/ai/tuzi/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt: "一只可爱的小猫咪",
    aspectRatio: "1:1",
    outputFormat: "png",
    safetyTolerance: 2,
  }),
});

const data = await response.json();
```

## 使用技巧

### 1. 图像参考使用

在提示词中可以直接包含图像 URL：

```typescript
const prompt = "https://example.com/image.jpg 让这个女人带上墨镜，衣服换个颜色";
```

### 2. 种子使用

使用相同的种子和提示词可以生成相似的图像：

```typescript
const settings = {
  seed: 42,
  // 其他设置保持一致
};
```

### 3. 安全容忍度调节

- `0-2`: 适合商业用途，内容更安全
- `3-4`: 平衡创意和安全
- `5-6`: 更多创意自由，需要人工审核

## 错误处理

```typescript
try {
  const result = await tuzi.image(TUZI_MODELS.FLUX_KONTEXT_PRO).doGenerate({
    prompt: "your prompt",
    // ... 其他参数
  });
} catch (error) {
  if (error.message.includes("API key")) {
    console.error("API 密钥错误");
  } else if (error.message.includes("quota")) {
    console.error("配额不足");
  } else {
    console.error("生成失败:", error.message);
  }
}
```

## 性能优化

1. **缓存结果**: 对于相同的提示词和设置，可以缓存生成结果
2. **批量处理**: 如果需要生成多张图片，考虑使用队列系统
3. **图像压缩**: 根据用途选择合适的输出格式和质量

## 费用控制

1. **监控使用量**: 定期检查 API 调用次数
2. **设置限制**: 在应用中设置每日/每月生成限制
3. **优化提示词**: 精确的提示词可以减少重新生成的需要

## 常见问题

### Q: 如何获取兔子 API 密钥？
A: 访问 [兔子 AI 官网](https://tu-zi.com) 注册账户并获取 API 密钥。

### Q: 支持哪些图像格式？
A: 目前支持 JPEG 和 PNG 格式输出。

### Q: 生成时间大概多久？
A: 通常在 10-30 秒内完成，具体时间取决于图像复杂度和服务器负载。

### Q: 如何处理生成失败？
A: 检查 API 密钥、网络连接和提示词内容，必要时调整安全容忍度。

## 更多资源

- [兔子 API 官方文档](https://wiki.tu-zi.com/zh/Code/Flux-Kontext)
- [示例代码](../examples/tuzi-image-generation.ts)
- [React 组件源码](../components/ai/tuzi-image-generator.tsx)
