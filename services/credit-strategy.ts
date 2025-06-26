/**
 * 积分分配策略服务
 * 使用策略模式，支持多种积分分配策略
 */

import { User } from "@/types/user";
import { CreditsAmount } from "./credit";
import { getGeolocationInfo, assessRegistrationRisk, logGeolocationEvent } from "./geolocation-service";

export interface CreditStrategy {
  name: string;
  description: string;
  calculateCredits(headers: Headers, user: User): Promise<number>;
}

/**
 * 默认积分策略 - 固定积分
 */
class DefaultCreditStrategy implements CreditStrategy {
  name = "default";
  description = "Fixed credits for all users";

  async calculateCredits(headers: Headers, user: User): Promise<number> {
    return CreditsAmount.NewUserGet;
  }
}

/**
 * 地理位置积分策略 - 基于国家分配积分
 */
class GeolocationCreditStrategy implements CreditStrategy {
  name = "geolocation";
  description = "Credits based on user's country";

  async calculateCredits(headers: Headers, user: User): Promise<number> {
    try {
      // 获取地理位置信息
      const geolocation = getGeolocationInfo(headers);
      
      // 评估注册风险
      const emailDomain = user.email.split('@')[1];
      const riskAssessment = assessRegistrationRisk(geolocation, {
        emailDomain,
        userAgent: headers.get('user-agent') || undefined,
      });

      // 记录地理位置事件
      await logGeolocationEvent('signup', geolocation, riskAssessment, {
        userEmail: user.email,
        userId: user.uuid
      });

      // 在开发环境下显示积分分配信息
      if (process.env.NODE_ENV === 'development') {
        console.log(`New user signup - Country: ${geolocation.countryCode}, Credits: ${geolocation.signupCredits}, Tier: ${geolocation.tier}, Risk: ${riskAssessment.riskScore}`);
      }

      return geolocation.signupCredits;
    } catch (error) {
      console.error('Geolocation credit strategy error:', error);
      // 出错时回退到默认积分
      return CreditsAmount.NewUserGet;
    }
  }
}

/**
 * A/B测试积分策略 - 用于测试不同积分数量的效果
 */
class ABTestCreditStrategy implements CreditStrategy {
  name = "ab_test";
  description = "A/B test different credit amounts";

  async calculateCredits(headers: Headers, user: User): Promise<number> {
    // 简单的A/B测试：基于用户UUID的最后一位数字
    const lastDigit = parseInt(user.uuid?.slice(-1) || '0');
    
    // 50% 用户获得标准积分，50% 获得双倍积分
    const isGroupB = lastDigit >= 5;
    const baseCredits = CreditsAmount.NewUserGet;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`A/B Test - User: ${user.uuid}, Group: ${isGroupB ? 'B' : 'A'}, Credits: ${isGroupB ? baseCredits * 2 : baseCredits}`);
    }
    
    return isGroupB ? baseCredits * 2 : baseCredits;
  }
}

/**
 * 获取当前启用的积分策略
 */
function getCreditStrategy(): CreditStrategy {
  const strategyName = process.env.CREDIT_STRATEGY || 'default';
  
  switch (strategyName) {
    case 'geolocation':
      return new GeolocationCreditStrategy();
    case 'ab_test':
      return new ABTestCreditStrategy();
    case 'default':
    default:
      return new DefaultCreditStrategy();
  }
}

/**
 * 获取新用户注册积分
 * 使用策略模式，支持不同的积分分配策略
 */
export async function getNewUserCredits(headers: Headers, user: User): Promise<number> {
  const strategy = getCreditStrategy();
  
  try {
    const credits = await strategy.calculateCredits(headers, user);
    
    // 记录策略使用情况
    if (process.env.NODE_ENV === 'development') {
      console.log(`Credit Strategy: ${strategy.name} - ${strategy.description}, Credits: ${credits}`);
    }
    
    return credits;
  } catch (error) {
    console.error(`Credit strategy ${strategy.name} failed:`, error);
    // 出错时使用默认策略
    const defaultStrategy = new DefaultCreditStrategy();
    return await defaultStrategy.calculateCredits(headers, user);
  }
}

/**
 * 获取所有可用的积分策略
 */
export function getAvailableCreditStrategies(): CreditStrategy[] {
  return [
    new DefaultCreditStrategy(),
    new GeolocationCreditStrategy(),
    new ABTestCreditStrategy(),
  ];
}

/**
 * 验证积分策略配置
 */
export function validateCreditStrategyConfig(): {
  isValid: boolean;
  strategy: string;
  message: string;
} {
  const strategyName = process.env.CREDIT_STRATEGY || 'default';
  const availableStrategies = getAvailableCreditStrategies().map(s => s.name);
  
  if (!availableStrategies.includes(strategyName)) {
    return {
      isValid: false,
      strategy: strategyName,
      message: `Invalid credit strategy: ${strategyName}. Available strategies: ${availableStrategies.join(', ')}`
    };
  }
  
  // 如果使用地理位置策略，检查相关配置
  if (strategyName === 'geolocation') {
    const geoEnabled = process.env.GEO_CREDITS_ENABLED === 'true';
    if (!geoEnabled) {
      return {
        isValid: false,
        strategy: strategyName,
        message: 'Geolocation credit strategy requires GEO_CREDITS_ENABLED=true'
      };
    }
  }
  
  return {
    isValid: true,
    strategy: strategyName,
    message: `Credit strategy ${strategyName} is properly configured`
  };
}
