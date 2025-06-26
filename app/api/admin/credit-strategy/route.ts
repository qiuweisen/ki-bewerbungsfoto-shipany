import { respData, respErr } from "@/lib/resp";
import { getUserInfo } from "@/services/user";
import { getAvailableCreditStrategies, validateCreditStrategyConfig } from "@/services/credit-strategy";
import { getGeolocationCreditsConfig } from "@/config/geolocation-credits";

export async function GET(req: Request) {
  try {
    // 检查管理员权限
    const userInfo = await getUserInfo();
    if (!userInfo || !userInfo.email) {
      return respErr("no auth");
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(",");
    if (!adminEmails?.includes(userInfo.email)) {
      return respErr("access denied");
    }

    // 获取当前策略配置
    const currentStrategy = process.env.CREDIT_STRATEGY || 'default';
    const validation = validateCreditStrategyConfig();
    const availableStrategies = getAvailableCreditStrategies();

    // 获取地理位置配置（如果使用地理位置策略）
    let geolocationConfig = null;
    if (currentStrategy === 'geolocation') {
      geolocationConfig = getGeolocationCreditsConfig();
    }

    return respData({
      currentStrategy,
      validation,
      availableStrategies: availableStrategies.map(strategy => ({
        name: strategy.name,
        description: strategy.description
      })),
      geolocationConfig,
      environmentVariables: {
        CREDIT_STRATEGY: process.env.CREDIT_STRATEGY || 'default',
        GEO_CREDITS_ENABLED: process.env.GEO_CREDITS_ENABLED || 'false',
        GEO_CREDITS_TIER1_COUNTRIES: process.env.GEO_CREDITS_TIER1_COUNTRIES || 'Using default',
        GEO_CREDITS_TIER1_AMOUNT: process.env.GEO_CREDITS_TIER1_AMOUNT || 'Using default',
        GEO_CREDITS_TIER2_COUNTRIES: process.env.GEO_CREDITS_TIER2_COUNTRIES || 'Using default',
        GEO_CREDITS_TIER2_AMOUNT: process.env.GEO_CREDITS_TIER2_AMOUNT || 'Using default',
        GEO_CREDITS_TIER3_COUNTRIES: process.env.GEO_CREDITS_TIER3_COUNTRIES || 'Using default',
        GEO_CREDITS_TIER3_AMOUNT: process.env.GEO_CREDITS_TIER3_AMOUNT || 'Using default',
        GEO_CREDITS_DEFAULT_AMOUNT: process.env.GEO_CREDITS_DEFAULT_AMOUNT || 'Using default',
      },
      instructions: {
        strategies: {
          default: "Fixed credits for all users (uses CreditsAmount.NewUserGet)",
          geolocation: "Credits based on user's country (requires Cloudflare IP Geolocation)",
          ab_test: "A/B test different credit amounts (50% standard, 50% double)"
        },
        configuration: {
          "Set strategy": "CREDIT_STRATEGY=geolocation",
          "Enable geolocation": "GEO_CREDITS_ENABLED=true",
          "Configure countries": "GEO_CREDITS_TIER3_COUNTRIES=IN,BD,PK,NG",
          "Set credits": "GEO_CREDITS_TIER3_AMOUNT=20"
        },
        examples: {
          "Enable geolocation strategy": {
            "CREDIT_STRATEGY": "geolocation",
            "GEO_CREDITS_ENABLED": "true",
            "GEO_CREDITS_TIER3_COUNTRIES": "IN,BD,PK,NG",
            "GEO_CREDITS_TIER3_AMOUNT": "20"
          },
          "Enable A/B test": {
            "CREDIT_STRATEGY": "ab_test"
          },
          "Use default strategy": {
            "CREDIT_STRATEGY": "default"
          }
        }
      }
    });
  } catch (error) {
    console.error("Get credit strategy config error:", error);
    return respErr("failed to get credit strategy configuration");
  }
}
