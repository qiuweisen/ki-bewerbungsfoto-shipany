import { respData, respErr } from "@/lib/resp";
import { getGeolocationInfo, assessRegistrationRisk, validateCloudflareGeolocation, getCountryName } from "@/services/geolocation-service";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const h = await headers();
    
    // 验证 Cloudflare 地理位置功能
    const validation = validateCloudflareGeolocation(h);
    
    // 获取地理位置信息
    const geolocation = getGeolocationInfo(h);
    
    // 评估风险
    const riskAssessment = assessRegistrationRisk(geolocation, {
      userAgent: h.get('user-agent') || undefined,
    });

    // 获取所有相关的 headers
    const relevantHeaders = {
      'cf-ipcountry': h.get('cf-ipcountry'),
      'cf-connecting-ip': h.get('cf-connecting-ip'),
      'cf-ray': h.get('cf-ray'),
      'user-agent': h.get('user-agent'),
      'x-forwarded-for': h.get('x-forwarded-for'),
    };

    return respData({
      validation,
      geolocation: {
        ...geolocation,
        countryName: getCountryName(geolocation.countryCode)
      },
      riskAssessment,
      headers: relevantHeaders,
      timestamp: new Date().toISOString(),
      instructions: {
        setup: validation.enabled 
          ? "Cloudflare IP Geolocation is working correctly" 
          : "Please enable IP Geolocation in Cloudflare Dashboard",
        testing: "This endpoint shows your current geolocation detection results",
        configuration: "Use /api/admin/geolocation/config to view and configure credit tiers"
      }
    });
  } catch (error) {
    console.error("Geolocation test error:", error);
    return respErr("failed to test geolocation");
  }
}
