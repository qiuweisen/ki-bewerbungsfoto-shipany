// AI生成记录相关类型定义

export interface AIGenerationRecord {
  id?: number;
  uuid: string;
  user_uuid: string;
  type: 'image' | 'video' | 'text';
  provider: string;
  model: string;
  prompt: string;
  options?: Record<string, any>;
  result_urls?: string[];
  result_data?: any; // 用于存储非URL类型的结果
  credits_cost: number;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface AIGenerationRequest {
  // 基础生成参数
  prompt: string;
  provider: string;
  model: string;
  options?: Record<string, any>;
  
  // 用户信息
  userUuid?: string;
  
  // 业务控制参数（从配置或外层传入）
  saveRecord?: boolean;
  consumeCredits?: boolean;
  creditsRequired?: number;
  enableStorage?: boolean;
  
  // 记录相关
  type?: 'image' | 'video' | 'text';
}

export interface AIGenerationResult {
  success: boolean;
  data?: any;
  error?: string;
  recordUuid?: string; // 如果保存了记录，返回记录UUID
  creditsConsumed?: number;
}
