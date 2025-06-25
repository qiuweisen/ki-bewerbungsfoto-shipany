# 图片对比组件

一个支持拖拽的图片对比组件，用于展示 AI 处理前后的效果对比。

## 功能特性

- ✅ 支持鼠标拖拽和触摸滑动
- ✅ 响应式设计，适配各种屏幕尺寸
- ✅ 多种宽高比支持 (16:9, 4:3, 1:1, 3:2)
- ✅ 可自定义标签显示
- ✅ 平滑的交互动画
- ✅ 无障碍访问支持
- ✅ TypeScript 类型支持

## 基础使用

```tsx
import ImageComparison from "@/components/blocks/image-comparison";

export default function MyComponent() {
  return (
    <ImageComparison
      beforeImage={{
        src: "/images/before.jpg",
        alt: "处理前的图片"
      }}
      afterImage={{
        src: "/images/after.jpg",
        alt: "处理后的图片"
      }}
      beforeLabel="原图"
      afterLabel="AI处理后"
    />
  );
}
```

## 组件属性

### ImageComparisonProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `beforeImage` | `{src: string, alt?: string}` | - | 左侧图片（原图） |
| `afterImage` | `{src: string, alt?: string}` | - | 右侧图片（处理后） |
| `className` | `string` | - | 自定义样式类名 |
| `aspectRatio` | `"16/9" \| "4/3" \| "1/1" \| "3/2"` | `"16/9"` | 图片宽高比 |
| `showLabels` | `boolean` | `true` | 是否显示标签 |
| `beforeLabel` | `string` | `"原图"` | 左侧图片标签 |
| `afterLabel` | `string` | `"AI处理后"` | 右侧图片标签 |
| `initialPosition` | `number` | `50` | 初始分割线位置 (0-100) |

## 使用示例

### 1. 基础对比

```tsx
<ImageComparison
  beforeImage={{ src: "/before.jpg", alt: "原图" }}
  afterImage={{ src: "/after.jpg", alt: "AI增强后" }}
/>
```

### 2. 自定义宽高比

```tsx
<ImageComparison
  beforeImage={{ src: "/portrait-before.jpg" }}
  afterImage={{ src: "/portrait-after.jpg" }}
  aspectRatio="3/2"
  beforeLabel="原始人像"
  afterLabel="AI美化"
/>
```

### 3. 无标签模式

```tsx
<ImageComparison
  beforeImage={{ src: "/landscape-before.jpg" }}
  afterImage={{ src: "/landscape-after.jpg" }}
  showLabels={false}
  initialPosition={30}
/>
```

### 4. 自定义样式

```tsx
<ImageComparison
  beforeImage={{ src: "/before.jpg" }}
  afterImage={{ src: "/after.jpg" }}
  className="max-w-4xl mx-auto shadow-2xl"
  aspectRatio="1/1"
/>
```

## 展示组件使用

如果需要展示多个对比案例，可以使用 `ImageComparisonShowcase` 组件：

```tsx
import ImageComparisonShowcase from "@/components/blocks/image-comparison-showcase";

const showcaseData = {
  title: "AI 图像处理效果展示",
  description: "查看我们的 AI 技术如何提升图像质量",
  items: [
    {
      title: "风景照片增强",
      description: "提升色彩饱和度和对比度",
      beforeImage: { src: "/landscape-before.jpg" },
      afterImage: { src: "/landscape-after.jpg" },
      beforeLabel: "原图",
      afterLabel: "AI增强"
    },
    {
      title: "人像美化",
      description: "智能美颜和肤色优化",
      beforeImage: { src: "/portrait-before.jpg" },
      afterImage: { src: "/portrait-after.jpg" },
      beforeLabel: "原图",
      afterLabel: "AI美化"
    }
  ],
  columns: 2,
  aspectRatio: "16/9"
};

export default function ShowcasePage() {
  return <ImageComparisonShowcase section={showcaseData} />;
}
```

## 在落地页中使用

可以将图片对比组件集成到落地页的配置中：

```json
{
  "name": "image-comparison-showcase",
  "title": "AI 处理效果对比",
  "description": "拖动分割线查看 AI 处理前后的惊人效果",
  "items": [
    {
      "title": "图像超分辨率",
      "description": "将低分辨率图像提升至高清画质",
      "beforeImage": {
        "src": "/demos/low-res.jpg",
        "alt": "低分辨率图像"
      },
      "afterImage": {
        "src": "/demos/high-res.jpg", 
        "alt": "高分辨率图像"
      },
      "beforeLabel": "480p",
      "afterLabel": "4K"
    }
  ]
}
```

## 样式自定义

组件使用 Tailwind CSS 构建，可以通过 `className` 属性进行样式自定义：

```tsx
<ImageComparison
  // ... 其他属性
  className="rounded-xl shadow-lg border-2 border-primary/20"
/>
```

## 性能优化

1. **图片优化**: 使用 Next.js Image 组件自动优化
2. **懒加载**: 支持图片懒加载
3. **响应式**: 根据屏幕尺寸自动调整
4. **事件优化**: 使用 useCallback 优化事件处理

## 无障碍访问

- 支持键盘导航
- 提供适当的 ARIA 标签
- 图片包含 alt 属性
- 支持屏幕阅读器

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- 移动端浏览器

## 注意事项

1. 确保两张图片尺寸一致，以获得最佳对比效果
2. 图片应该有相同的主体内容，只是处理效果不同
3. 建议使用高质量的图片以展示处理效果
4. 在移动端测试触摸交互是否正常

## 故障排除

### 图片不显示
- 检查图片路径是否正确
- 确认图片文件存在且可访问
- 检查 Next.js 图片域名配置

### 拖拽不响应
- 确认容器有正确的尺寸
- 检查是否有其他元素阻挡事件
- 在移动端测试触摸事件

### 性能问题
- 优化图片大小和格式
- 使用适当的图片分辨率
- 考虑使用图片 CDN
