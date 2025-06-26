# API 参考文档

ShipAny 模板提供的完整 API 接口参考。

## 🔐 认证

所有需要用户身份的 API 都需要通过 NextAuth.js 会话认证。

```javascript
// 前端自动处理认证
// 后端通过 getUserUuid() 获取用户身份
```

## 📁 文件上传 API

### POST /api/upload/image
上传图片文件到云存储

**描述**: 上传图片文件，支持后续图生图等功能使用

**请求格式**: `multipart/form-data`

**请求参数**:
- `file` (File): 图片文件，支持 JPEG/PNG/WebP 格式，最大 10MB

**响应示例**:
```json
{
  "success": true,
  "data": {
    "url": "https://your-domain.com/uploads/user-uuid/timestamp.jpg",
    "location": "https://storage.endpoint.com/bucket/uploads/user-uuid/timestamp.jpg",
    "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "fileName": "uploads/user-uuid/timestamp.jpg",
    "size": 1024000,
    "type": "image/jpeg"
  }
}
```

**错误响应**:
- `no auth`: 用户未登录
- `no file provided`: 未提供文件
- `invalid file type`: 文件类型不支持 (仅支持 JPEG/PNG/WebP)
- `file too large`: 文件超过 10MB 限制
- `upload failed`: 上传到云存储失败

### 存储配置

项目使用 S3 兼容的存储接口，支持 Cloudflare R2、AWS S3 等：

**环境变量配置**:
```bash
# 存储服务配置
STORAGE_ENDPOINT=https://your-account.r2.cloudflarestorage.com
STORAGE_REGION=auto
STORAGE_ACCESS_KEY=your-access-key
STORAGE_SECRET_KEY=your-secret-key
STORAGE_BUCKET=your-bucket-name
STORAGE_DOMAIN=https://your-custom-domain.com  # 可选，自定义域名
```

**存储路径规则**:
- 用户上传文件: `uploads/{userUuid}/{timestamp}.{extension}`
- AI生成结果: `ai-generated/{userUuid}/{orderId}/{filename}`

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

### POST /api/ai/image-to-image
图生图 AI 生成（基于输入图片生成新图片）

**请求参数**:
```json
{
  "prompt": "string",           // 必需，图片修改描述
  "provider": "string",         // 必需，AI提供商 (tuzi/openai等)
  "model": "string",            // 必需，模型名称 (如 flux-kontext-pro)
  "bizNo": "string",            // 必需，业务号（确保幂等性）
  "inputImage": "string",       // 可选，输入图片的base64格式 (data:image/...)
  "inputImageUrl": "string",    // 可选，输入图片的URL地址
  "options": "object"           // 可选，提供商特定参数
}
```

**注意**: `inputImage` 和 `inputImageUrl` 必须提供其中一个，不能同时提供

**响应格式**:
```json
{
  "success": true,
  "data": {
    "orderId": 123,
    "images": [
      {
        "url": "https://example.com/generated-image.jpg",
        "location": "https://storage.com/bucket/image.jpg"
      }
    ],
    "creditsConsumed": 10,
    "isRetry": false
  }
}
```

**错误响应**:
- `invalid params`: 缺少必需参数
- `invalid inputImage format`: base64格式错误
- `invalid inputImageUrl format`: URL格式错误
- `insufficient credits`: 积分不足
- `generation failed`: 生成失败

**使用场景**:
1. **单图生成**: 使用 `inputImageUrl` 或 `inputImage` 参数
2. **多图组合**: 使用 `inputImageUrls` 参数（数组）
3. **先上传后生成**: 用户先调用 `/api/upload/image` 上传图片，获得URL
4. **直接base64生成**: 前端直接将图片转为base64（适合小图片或demo）

**Provider特殊实现**:
- **Tuzi API**: 自动将图片URL拼接到提示词前面，支持多图组合
- **其他Provider**: 按各自API规范处理输入图片

**环境变量配置**: 与文生图共享相同配置

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

## 🌍 地理位置检测 API

### GET /api/geolocation/test
测试地理位置检测功能

**描述**: 检测当前请求的地理位置信息，用于验证 Cloudflare IP Geolocation 功能

**响应示例**:
```json
{
  "success": true,
  "data": {
    "validation": {
      "enabled": true,
      "message": "Cloudflare IP Geolocation is working correctly"
    },
    "geolocation": {
      "countryCode": "US",
      "countryName": "United States",
      "isHighRisk": false,
      "signupCredits": 100,
      "tier": "tier1",
      "description": "发达国家，高付费意愿",
      "source": "cloudflare"
    },
    "riskAssessment": {
      "riskScore": 5,
      "factors": [],
      "recommendation": "allow"
    }
  }
}
```

### GET /api/admin/geolocation/config
查看地理位置积分配置（管理员）

**描述**: 查看当前的地理位置积分配置和环境变量状态

**权限**: 需要管理员权限

**响应示例**:
```json
{
  "success": true,
  "data": {
    "config": {
      "tier1": {
        "countries": ["US", "CA", "GB"],
        "signupCredits": 100,
        "description": "发达国家，高付费意愿"
      },
      "tier3": {
        "countries": ["IN", "BD", "PK"],
        "signupCredits": 20,
        "description": "高风险地区，需要控制滥用"
      }
    }
  }
}
```

## 地理位置积分配置

### 环境变量配置
```bash
# 启用地理位置积分功能
GEO_CREDITS_ENABLED=true

# 分层配置
GEO_CREDITS_TIER1_COUNTRIES="US,CA,GB,DE,FR"
GEO_CREDITS_TIER1_AMOUNT=100
GEO_CREDITS_TIER3_COUNTRIES="IN,BD,PK,NG"
GEO_CREDITS_TIER3_AMOUNT=20
GEO_CREDITS_DEFAULT_AMOUNT=75
```

### 前置条件
1. 域名必须通过 Cloudflare 代理
2. 在 Cloudflare Dashboard 中启用 IP Geolocation
3. 设置 `ADMIN_EMAILS` 环境变量（管理接口需要）

## 📞 技术支持

如有 API 使用问题，请参考：
- [AI 功能指南](./ai-guide.md)
- [地理位置积分策略](./geolocation-credits.md)
- [开发指南](./development-guide.md)
- [GitHub Issues](https://github.com/shipanyai/shipany-template-one/issues)
