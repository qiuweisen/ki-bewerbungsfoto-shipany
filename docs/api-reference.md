# API 参考文档

ShipAny 模板提供的完整 API 接口参考。

## 🔐 认证

所有需要用户身份的 API 都需要通过 NextAuth.js 会话认证。

```javascript
// 前端自动处理认证
// 后端通过 getUserUuid() 获取用户身份
```

## 🤖 AI 功能 API

### POST /api/ai/generate-image
生成 AI 图片（业务完整版，推荐使用）

**请求参数**:
```json
{
  "prompt": "string",      // 必需，图片描述
  "provider": "string",    // 必需，AI提供商 (openai/tuzi/kling/replicate)
  "model": "string",       // 必需，模型名称
  "bizNo": "string",       // 必需，业务号（确保幂等性）
  "options": "object"      // 可选，提供商特定参数
}
```

**响应格式**:
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "url": "string",
        "location": "string", 
        "provider": "string",
        "filename": "string"
      }
    ],
    "orderId": 123,
    "creditsConsumed": 10,
    "isRetry": false
  }
}
```

### POST /api/demo/gen-image
纯图片生成（无业务逻辑）

**请求参数**:
```json
{
  "prompt": "string",
  "provider": "string", 
  "model": "string",
  "options": "object"
}
```

### GET /api/ai-generations
获取用户生成历史

**查询参数**:
- `type`: 类型过滤 (image/video/text)
- `page`: 页码，默认 1
- `limit`: 每页数量，默认 20

**响应格式**:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "user_uuid": "string",
      "biz_no": "string",
      "type": "image",
      "provider": "tuzi",
      "model": "tuzi-general",
      "prompt": "string",
      "status": "success",
      "result_urls": ["string"],
      "credits_cost": 10,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/ai/order-status
查询订单状态（轮询用）

**查询参数**:
- `orderId`: 订单ID
- `bizNo`: 业务号

**响应格式**:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "status": "success",
    "result_urls": ["string"],
    "result_data": "object",
    "error_message": "string"
  }
}
```

## 👤 用户相关 API

### GET /api/get-user-info
获取当前用户信息

**响应格式**:
```json
{
  "success": true,
  "data": {
    "uuid": "string",
    "email": "string",
    "nickname": "string",
    "avatar_url": "string",
    "created_at": "string"
  }
}
```

### GET /api/get-user-credits
获取用户积分信息

**响应格式**:
```json
{
  "success": true,
  "data": {
    "left_credits": 100,
    "total_credits": 200,
    "used_credits": 100
  }
}
```

## 💰 支付相关 API

### POST /api/checkout
创建支付会话

**请求参数**:
```json
{
  "priceId": "string",     // Stripe 价格 ID
  "quantity": 1,           // 数量
  "mode": "payment"        // 支付模式
}
```

**响应格式**:
```json
{
  "success": true,
  "data": {
    "sessionId": "string",
    "url": "string"
  }
}
```

### POST /api/stripe-notify
Stripe Webhook 通知处理

**说明**: 由 Stripe 自动调用，处理支付状态更新。

## 📝 反馈相关 API

### POST /api/add-feedback
添加用户反馈

**请求参数**:
```json
{
  "content": "string",     // 反馈内容
  "rating": 5              // 评分 1-5
}
```

**响应格式**:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "message": "反馈提交成功"
  }
}
```

## 🔑 邀请相关 API

### POST /api/update-invite
更新邀请码

**请求参数**:
```json
{
  "inviteCode": "string"   // 新的邀请码
}
```

### POST /api/update-invite-code
更新邀请码（别名）

功能同 `/api/update-invite`

## 🏥 健康检查 API

### GET /api/ping
服务健康检查

**响应格式**:
```json
{
  "success": true,
  "data": {
    "message": "pong",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## 📊 错误响应格式

所有 API 的错误响应都遵循统一格式：

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

### 常见错误码

| 错误信息 | 说明 | 处理建议 |
|---------|------|----------|
| `no auth` | 用户未认证 | 跳转到登录页 |
| `invalid params` | 参数错误 | 检查请求参数 |
| `积分不足` | 积分余额不足 | 跳转到充值页 |
| `generation failed` | 生成失败 | 重试或联系支持 |
| `order not found` | 订单不存在 | 检查订单ID |
| `access denied` | 权限不足 | 检查用户权限 |

## 🔧 使用示例

### JavaScript/TypeScript

```javascript
// 生成图片
const generateImage = async (prompt, provider = 'tuzi') => {
  const response = await fetch('/api/ai/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      provider,
      model: provider === 'tuzi' ? 'tuzi-general' : 'dall-e-3',
      bizNo: Date.now().toString(),
      options: {}
    })
  });
  
  return await response.json();
};

// 查询订单状态
const checkOrderStatus = async (orderId) => {
  const response = await fetch(`/api/ai/order-status?orderId=${orderId}`);
  return await response.json();
};

// 获取生成历史
const getHistory = async (page = 1, limit = 20) => {
  const response = await fetch(`/api/ai-generations?page=${page}&limit=${limit}`);
  return await response.json();
};
```

### cURL

```bash
# 生成图片
curl -X POST http://localhost:3000/api/ai/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "一只可爱的小猫",
    "provider": "tuzi",
    "model": "tuzi-general",
    "bizNo": "1703123456789"
  }'

# 查询订单状态
curl -X GET "http://localhost:3000/api/ai/order-status?orderId=123"

# 获取生成历史
curl -X GET "http://localhost:3000/api/ai-generations?type=image&page=1&limit=10"
```

## 📱 前端集成

### React Hook 示例

```javascript
import { useState, useCallback } from 'react';

export function useAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error };
}
```

## 🔒 安全注意事项

1. **认证检查**: 所有敏感 API 都需要用户认证
2. **参数验证**: 服务端验证所有输入参数
3. **权限控制**: 用户只能访问自己的数据
4. **幂等性**: 重要操作支持幂等性处理
5. **错误处理**: 不暴露敏感的系统信息

## 📞 技术支持

如有 API 使用问题，请参考：
- [AI 功能指南](./ai-guide.md)
- [开发指南](./development-guide.md)
- [GitHub Issues](https://github.com/shipanyai/shipany-template-one/issues)
