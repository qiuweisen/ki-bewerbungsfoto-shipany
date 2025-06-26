import { respData, respErr } from "@/lib/resp";
import { getUserInfo } from "@/services/user";
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

    // 获取当前配置
    const config = getGeolocationCreditsConfig();
    
    // 获取环境变量状态
    const envStatus = {
      enabled: process.env.GEO_CREDITS_ENABLED === 'true',
      tier1Countries: process.env.GEO_CREDITS_TIER1_COUNTRIES || 'Using default',
      tier1Amount: process.env.GEO_CREDITS_TIER1_AMOUNT || 'Using default',
      tier2Countries: process.env.GEO_CREDITS_TIER2_COUNTRIES || 'Using default',
      tier2Amount: process.env.GEO_CREDITS_TIER2_AMOUNT || 'Using default',
      tier3Countries: process.env.GEO_CREDITS_TIER3_COUNTRIES || 'Using default',
      tier3Amount: process.env.GEO_CREDITS_TIER3_AMOUNT || 'Using default',
      defaultAmount: process.env.GEO_CREDITS_DEFAULT_AMOUNT || 'Using default',
    };

    return respData({
      config,
      envStatus,
      instructions: {
        enable: "Set GEO_CREDITS_ENABLED=true to enable geolocation-based credits",
        configure: "Use environment variables to override default configuration",
        examples: {
          "GEO_CREDITS_TIER1_COUNTRIES": "US,CA,GB,DE,FR",
          "GEO_CREDITS_TIER1_AMOUNT": "100",
          "GEO_CREDITS_TIER2_COUNTRIES": "BR,MX,RU,TR",
          "GEO_CREDITS_TIER2_AMOUNT": "50",
          "GEO_CREDITS_TIER3_COUNTRIES": "IN,BD,PK,NG",
          "GEO_CREDITS_TIER3_AMOUNT": "20",
          "GEO_CREDITS_DEFAULT_AMOUNT": "75"
        }
      }
    });
  } catch (error) {
    console.error("Get geolocation config error:", error);
    return respErr("failed to get configuration");
  }
}
