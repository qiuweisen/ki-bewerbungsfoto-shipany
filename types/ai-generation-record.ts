// AI生成订单相关类型定义

export enum OrderStatus {
  CREATED = 'created',
  CREDITS_DEDUCTED = 'credits_deducted',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface AIGenerationOrder {
  id?: number;
  user_uuid: string;
  biz_no: string; // 前端传入的业务号
  type: 'image' | 'video' | 'text';
  provider: string;
  model: string;
  prompt: string;
  options?: Record<string, any>;
  credits_cost: number;
  status: OrderStatus;
  result_urls?: string[];
  result_data?: any;
  provider_request_id?: string;
  credits_trans_no?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
  retry_count: number;
}

export interface AIGenerationRequest {
  // 基础生成参数
  prompt: string;
  provider: string;
  model: string;
  options?: Record<string, any>;
  
  // 幂等性参数
  bizNo: string; // 前端传入的业务号（时间戳）
  
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
  orderId?: number; // 订单ID
  creditsConsumed?: number;
  isRetry?: boolean; // 是否为重试请求
}
