/**
 * 基于地理位置的积分配置
 * 支持通过环境变量自定义配置
 */

export interface CreditTier {
  countries: string[];
  signupCredits: number;
  description: string;
}

export interface GeolocationCreditsConfig {
  tier1: CreditTier;
  tier2: CreditTier;
  tier3: CreditTier;
  default: {
    signupCredits: number;
    description: string;
  };
}

/**
 * 默认的地理位置积分配置
 */
const DEFAULT_CONFIG: GeolocationCreditsConfig = {
  // 第一层: 高价值市场 (标准积分)
  tier1: {
    countries: ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'JP', 'KR', 'NL', 'SE', 'NO', 'DK', 'CH'],
    signupCredits: 100,
    description: '发达国家，高付费意愿'
  },
  
  // 第二层: 中等市场 (减少积分)
  tier2: {
    countries: ['BR', 'MX', 'RU', 'TR', 'ZA', 'AR', 'CL', 'TH', 'MY', 'PH'],
    signupCredits: 50,
    description: '新兴市场，中等付费意愿'
  },
  
  // 第三层: 高风险市场 (最少积分)
  tier3: {
    countries: ['IN', 'BD', 'PK', 'NG', 'EG', 'VN', 'ID', 'LK'],
    signupCredits: 20,
    description: '高风险地区，需要控制滥用'
  },
  
  // 默认层: 其他国家
  default: {
    signupCredits: 75,
    description: '其他国家默认积分'
  }
};

/**
 * 从环境变量解析配置
 */
function parseConfigFromEnv(): GeolocationCreditsConfig {
  const config = { ...DEFAULT_CONFIG };

  // 解析第一层配置
  if (process.env.GEO_CREDITS_TIER1_COUNTRIES) {
    config.tier1.countries = process.env.GEO_CREDITS_TIER1_COUNTRIES.split(',').map(c => c.trim().toUpperCase());
  }
  if (process.env.GEO_CREDITS_TIER1_AMOUNT) {
    config.tier1.signupCredits = parseInt(process.env.GEO_CREDITS_TIER1_AMOUNT);
  }

  // 解析第二层配置
  if (process.env.GEO_CREDITS_TIER2_COUNTRIES) {
    config.tier2.countries = process.env.GEO_CREDITS_TIER2_COUNTRIES.split(',').map(c => c.trim().toUpperCase());
  }
  if (process.env.GEO_CREDITS_TIER2_AMOUNT) {
    config.tier2.signupCredits = parseInt(process.env.GEO_CREDITS_TIER2_AMOUNT);
  }

  // 解析第三层配置
  if (process.env.GEO_CREDITS_TIER3_COUNTRIES) {
    config.tier3.countries = process.env.GEO_CREDITS_TIER3_COUNTRIES.split(',').map(c => c.trim().toUpperCase());
  }
  if (process.env.GEO_CREDITS_TIER3_AMOUNT) {
    config.tier3.signupCredits = parseInt(process.env.GEO_CREDITS_TIER3_AMOUNT);
  }

  // 解析默认积分
  if (process.env.GEO_CREDITS_DEFAULT_AMOUNT) {
    config.default.signupCredits = parseInt(process.env.GEO_CREDITS_DEFAULT_AMOUNT);
  }

  return config;
}

/**
 * 获取地理位置积分配置
 */
export function getGeolocationCreditsConfig(): GeolocationCreditsConfig {
  return parseConfigFromEnv();
}

/**
 * 根据国家代码获取注册积分
 */
export function getSignupCreditsByCountry(countryCode: string): number {
  // 如果功能被禁用，返回默认积分
  if (process.env.GEO_CREDITS_ENABLED !== 'true') {
    return parseInt(process.env.GEO_CREDITS_DEFAULT_AMOUNT || '100');
  }

  const config = getGeolocationCreditsConfig();
  const upperCountryCode = countryCode.toUpperCase();

  // 检查各个层级
  if (config.tier1.countries.includes(upperCountryCode)) {
    return config.tier1.signupCredits;
  }
  
  if (config.tier2.countries.includes(upperCountryCode)) {
    return config.tier2.signupCredits;
  }
  
  if (config.tier3.countries.includes(upperCountryCode)) {
    return config.tier3.signupCredits;
  }

  // 返回默认积分
  return config.default.signupCredits;
}

/**
 * 获取国家的层级信息
 */
export function getCountryTierInfo(countryCode: string): { tier: string; credits: number; description: string } {
  const config = getGeolocationCreditsConfig();
  const upperCountryCode = countryCode.toUpperCase();

  if (config.tier1.countries.includes(upperCountryCode)) {
    return { tier: 'tier1', credits: config.tier1.signupCredits, description: config.tier1.description };
  }
  
  if (config.tier2.countries.includes(upperCountryCode)) {
    return { tier: 'tier2', credits: config.tier2.signupCredits, description: config.tier2.description };
  }
  
  if (config.tier3.countries.includes(upperCountryCode)) {
    return { tier: 'tier3', credits: config.tier3.signupCredits, description: config.tier3.description };
  }

  return { tier: 'default', credits: config.default.signupCredits, description: config.default.description };
}

/**
 * 检测是否为高风险国家
 */
export function isHighRiskCountry(countryCode: string): boolean {
  const config = getGeolocationCreditsConfig();
  return config.tier3.countries.includes(countryCode.toUpperCase());
}

/**
 * 特殊国家代码处理
 */
export function getCountryCodeFromHeaders(headers: Headers): string {
  const countryCode = headers.get('cf-ipcountry') || 'XX';
  
  // 处理特殊代码
  switch (countryCode) {
    case 'XX':
      return 'UNKNOWN';
    case 'T1':
      return 'TOR';
    default:
      return countryCode.toUpperCase();
  }
}
