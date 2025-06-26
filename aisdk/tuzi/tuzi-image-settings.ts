/**
 * 兔子 API 图像生成设置
 */
export interface TuziImageSettings {
  /**
   * 输入图像的 Base64 编码字符串（已废弃，兔子API不支持base64）
   * @deprecated 兔子API通过URL在提示词中实现图生图
   */
  inputImage?: string;

  /**
   * 单个输入图像的 URL 地址
   * 兔子API会将此URL添加到提示词前面
   */
  inputImageUrl?: string;

  /**
   * 多个输入图像的 URL 地址列表
   * 兔子API会将这些URL按空格分隔添加到提示词前面
   * 支持多图组合生成
   */
  inputImageUrls?: string[];
  
  /**
   * 随机种子，用于可重复生成
   */
  seed?: number;
  
  /**
   * 图像宽高比
   * 支持的比例范围在 21:9 到 9:21 之间
   * 常用选项：
   * - "21:9" - 超宽屏
   * - "16:9" - 宽屏
   * - "4:3" - 标准屏幕
   * - "1:1" - 正方形
   * - "3:4" - 竖屏
   * - "9:16" - 手机竖屏
   * - "9:21" - 超长竖屏
   */
  aspectRatio?: "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21" | string;
  
  /**
   * 输出格式
   */
  outputFormat?: "jpeg" | "png";
  
  /**
   * Webhook 通知 URL
   */
  webhookUrl?: string;
  
  /**
   * Webhook 签名密钥
   */
  webhookSecret?: string;
  
  /**
   * 是否对提示进行上采样
   */
  promptUpsampling?: boolean;
  
  /**
   * 安全容忍度级别 (0-6)
   * 0 (最严格) - 6 (最宽松)
   */
  safetyTolerance?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * 兔子 API 支持的模型
 */
export const TUZI_MODELS = {
  FLUX_KONTEXT_PRO: "flux-kontext-pro",
} as const;

export type TuziModel = typeof TUZI_MODELS[keyof typeof TUZI_MODELS];
