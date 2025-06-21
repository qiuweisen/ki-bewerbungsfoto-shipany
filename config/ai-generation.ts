// AI生成服务配置
export interface AIGenerationConfig {
  saveRecord: boolean;        // 是否保存生成记录
  consumeCredits: boolean;    // 是否扣减积分
  creditsPerGeneration: number; // 每次生成需要的积分
  enableStorage: boolean;     // 是否启用云存储
}

export const AI_GENERATION_CONFIG = {
  image: {
    saveRecord: process.env.AI_IMAGE_SAVE_RECORD === 'true' || true,
    consumeCredits: process.env.AI_IMAGE_CONSUME_CREDITS === 'true' || true,
    creditsPerGeneration: parseInt(process.env.AI_IMAGE_CREDITS_COST || '10'),
    enableStorage: process.env.AI_IMAGE_ENABLE_STORAGE === 'true' || true,
  } as AIGenerationConfig,
  
  video: {
    saveRecord: process.env.AI_VIDEO_SAVE_RECORD === 'true' || true,
    consumeCredits: process.env.AI_VIDEO_CONSUME_CREDITS === 'true' || true,
    creditsPerGeneration: parseInt(process.env.AI_VIDEO_CREDITS_COST || '50'),
    enableStorage: process.env.AI_VIDEO_ENABLE_STORAGE === 'true' || true,
  } as AIGenerationConfig,
  
  text: {
    saveRecord: process.env.AI_TEXT_SAVE_RECORD === 'true' || false,
    consumeCredits: process.env.AI_TEXT_CONSUME_CREDITS === 'true' || true,
    creditsPerGeneration: parseInt(process.env.AI_TEXT_CREDITS_COST || '5'),
    enableStorage: false, // 文本生成不需要存储
  } as AIGenerationConfig,
} as const;

// 获取特定类型的配置
export function getAIGenerationConfig(type: 'image' | 'video' | 'text'): AIGenerationConfig {
  return AI_GENERATION_CONFIG[type];
}
