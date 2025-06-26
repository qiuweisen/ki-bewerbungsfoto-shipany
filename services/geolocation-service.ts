/**
 * 地理位置检测和积分分配服务
 */

import { getCountryCodeFromHeaders, getSignupCreditsByCountry, getCountryTierInfo, isHighRiskCountry } from "@/config/geolocation-credits";

export interface GeolocationInfo {
  countryCode: string;
  isHighRisk: boolean;
  signupCredits: number;
  tier: string;
  description: string;
  source: 'cloudflare' | 'fallback';
}

export interface RiskAssessment {
  riskScore: number;
  factors: string[];
  recommendation: 'allow' | 'review' | 'block';
}

/**
 * 从请求头获取地理位置信息
 */
export function getGeolocationInfo(headers: Headers): GeolocationInfo {
  const countryCode = getCountryCodeFromHeaders(headers);
  const tierInfo = getCountryTierInfo(countryCode);
  
  return {
    countryCode,
    isHighRisk: isHighRiskCountry(countryCode),
    signupCredits: tierInfo.credits,
    tier: tierInfo.tier,
    description: tierInfo.description,
    source: headers.get('cf-ipcountry') ? 'cloudflare' : 'fallback'
  };
}

/**
 * 计算用户注册风险评分
 */
export function assessRegistrationRisk(
  geolocation: GeolocationInfo,
  additionalData?: {
    emailDomain?: string;
    userAgent?: string;
    ipAddress?: string;
  }
): RiskAssessment {
  let riskScore = 0;
  const factors: string[] = [];

  // 地理位置风险评分
  switch (geolocation.tier) {
    case 'tier3':
      riskScore += 40;
      factors.push(`High-risk country: ${geolocation.countryCode}`);
      break;
    case 'tier2':
      riskScore += 20;
      factors.push(`Medium-risk country: ${geolocation.countryCode}`);
      break;
    case 'tier1':
      riskScore += 5;
      break;
    default:
      riskScore += 10;
      factors.push(`Unknown country tier: ${geolocation.countryCode}`);
  }

  // Tor 网络检测
  if (geolocation.countryCode === 'TOR') {
    riskScore += 60;
    factors.push('Tor network detected');
  }

  // 无法确定国家
  if (geolocation.countryCode === 'UNKNOWN') {
    riskScore += 30;
    factors.push('Country code unknown');
  }

  // 临时邮箱检测
  if (additionalData?.emailDomain) {
    const tempEmailDomains = [
      '10minutemail.com',
      'guerrillamail.com',
      'tempmail.org',
      'mailinator.com',
      'yopmail.com',
      'temp-mail.org'
    ];
    
    if (tempEmailDomains.some(domain => additionalData.emailDomain!.toLowerCase().includes(domain))) {
      riskScore += 50;
      factors.push('Temporary email domain detected');
    }
  }

  // 可疑 User Agent 检测
  if (additionalData?.userAgent) {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(additionalData.userAgent!))) {
      riskScore += 40;
      factors.push('Suspicious user agent detected');
    }
  }

  // 确定推荐操作
  let recommendation: 'allow' | 'review' | 'block';
  if (riskScore >= 80) {
    recommendation = 'block';
  } else if (riskScore >= 50) {
    recommendation = 'review';
  } else {
    recommendation = 'allow';
  }

  return {
    riskScore,
    factors,
    recommendation
  };
}

/**
 * 记录地理位置和风险信息（用于分析）
 */
export async function logGeolocationEvent(
  eventType: 'signup' | 'login' | 'api_call',
  geolocation: GeolocationInfo,
  riskAssessment?: RiskAssessment,
  additionalData?: Record<string, any>
) {
  // 这里可以集成到日志系统或分析平台
  const logData = {
    timestamp: new Date().toISOString(),
    eventType,
    geolocation,
    riskAssessment,
    additionalData
  };

  // 开发环境下打印日志
  if (process.env.NODE_ENV === 'development') {
    console.log('Geolocation Event:', JSON.stringify(logData, null, 2));
  }

  // 生产环境可以发送到日志服务
  // 例如: await sendToAnalytics(logData);
}

/**
 * 获取国家名称（用于显示）
 */
export function getCountryName(countryCode: string): string {
  const countryNames: Record<string, string> = {
    'US': 'United States',
    'CA': 'Canada',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'AU': 'Australia',
    'JP': 'Japan',
    'KR': 'South Korea',
    'IN': 'India',
    'CN': 'China',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'RU': 'Russia',
    'TR': 'Turkey',
    'ZA': 'South Africa',
    'BD': 'Bangladesh',
    'PK': 'Pakistan',
    'NG': 'Nigeria',
    'EG': 'Egypt',
    'VN': 'Vietnam',
    'ID': 'Indonesia',
    'TH': 'Thailand',
    'MY': 'Malaysia',
    'PH': 'Philippines',
    'UNKNOWN': 'Unknown',
    'TOR': 'Tor Network'
  };

  return countryNames[countryCode] || countryCode;
}

/**
 * 验证 Cloudflare 地理位置功能是否启用
 */
export function validateCloudflareGeolocation(headers: Headers): {
  enabled: boolean;
  message: string;
} {
  const cfIpCountry = headers.get('cf-ipcountry');
  
  if (!cfIpCountry) {
    return {
      enabled: false,
      message: 'Cloudflare IP Geolocation not enabled. Please enable it in Cloudflare Dashboard > Network > IP Geolocation'
    };
  }

  return {
    enabled: true,
    message: 'Cloudflare IP Geolocation is working correctly'
  };
}
