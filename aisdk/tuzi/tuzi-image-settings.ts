/**
 * 兔子 API 图像生成设置
 */
export interface TuziImageSettings {
  /**
   * 输入图像的 Base64 编码字符串（方案三暂时不支持）
   */
  inputImage?: string;
  
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
