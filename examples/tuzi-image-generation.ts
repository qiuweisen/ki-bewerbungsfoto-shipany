import { tuzi, TUZI_MODELS } from "../aisdk";

/**
 * 兔子 API 图像生成示例
 *
 * 使用前请确保设置环境变量：
 * TUZI_API_KEY=your-tuzi-api-key
 */

async function basicImageGeneration() {
  console.log("=== 基础图像生成 ===");

  try {
    const result = await tuzi.image(TUZI_MODELS.FLUX_KONTEXT_PRO).doGenerate({
      prompt: "一只可爱的小猫咪坐在花园里",
      n: 1,
      size: undefined,
      aspectRatio: undefined,
      seed: undefined,
      providerOptions: {
        tuzi: {
          aspectRatio: "1:1",
          outputFormat: "png",
          safetyTolerance: 2,
        }
      }
    });

    console.log("生成成功！");
    console.log(`生成了 ${result.images.length} 张图片`);

    // 保存图片示例
    if (result.images.length > 0) {
      const fs = require('fs');
      const imageData = result.images[0];
      fs.writeFileSync('generated-image.png', imageData);
      console.log("图片已保存为 generated-image.png");
    }

  } catch (error) {
    console.error("生成失败:", error);
  }
}

async function advancedImageGeneration() {
  console.log("\n=== 高级图像生成（带种子和特定比例）===");

  try {
    const result = await tuzi.image(TUZI_MODELS.FLUX_KONTEXT_PRO).doGenerate({
      prompt: "未来科技城市的夜景，霓虹灯闪烁，赛博朋克风格",
      n: 1,
      size: undefined,
      aspectRatio: undefined,
      seed: undefined,
      providerOptions: {
        tuzi: {
          aspectRatio: "16:9", // 宽屏比例
          outputFormat: "jpeg",
          seed: 42, // 固定种子确保可重复性
          promptUpsampling: true, // 启用提示上采样
          safetyTolerance: 3,
        }
      }
    });

    console.log("高级生成成功！");
    console.log(`生成了 ${result.images.length} 张图片`);

    if (result.images.length > 0) {
      const fs = require('fs');
      const imageData = result.images[0];
      fs.writeFileSync('cyberpunk-city.jpg', imageData);
      console.log("图片已保存为 cyberpunk-city.jpg");
    }

  } catch (error) {
    console.error("高级生成失败:", error);
  }
}

async function imageReferenceGeneration() {
  console.log("\n=== 图像参考生成 ===");

  try {
    // 这个示例展示如何使用图像 URL 作为参考
    const result = await tuzi.image(TUZI_MODELS.FLUX_KONTEXT_PRO).doGenerate({
      prompt: "https://tuziai.oss-cn-shenzhen.aliyuncs.com/style/default_style_small.png 让这个女人带上墨镜，衣服换个颜色",
      n: 1,
      size: undefined,
      aspectRatio: undefined,
      seed: undefined,
      providerOptions: {
        tuzi: {
          aspectRatio: "3:4", // 竖屏比例
          outputFormat: "png",
          safetyTolerance: 2,
        }
      }
    });

    console.log("图像参考生成成功！");
    console.log(`生成了 ${result.images.length} 张图片`);

    if (result.images.length > 0) {
      const fs = require('fs');
      const imageData = result.images[0];
      fs.writeFileSync('styled-portrait.png', imageData);
      console.log("图片已保存为 styled-portrait.png");
    }

  } catch (error) {
    console.error("图像参考生成失败:", error);
  }
}

async function mobileOptimizedGeneration() {
  console.log("\n=== 手机优化生成 ===");

  try {
    const result = await tuzi.image(TUZI_MODELS.FLUX_KONTEXT_PRO).doGenerate({
      prompt: "极简风格的手机壁纸，渐变色背景，几何图形装饰",
      n: 1,
      size: undefined,
      aspectRatio: undefined,
      seed: undefined,
      providerOptions: {
        tuzi: {
          aspectRatio: "9:16", // 手机竖屏比例
          outputFormat: "png",
          safetyTolerance: 1, // 更严格的安全设置
          promptUpsampling: false,
        }
      }
    });

    console.log("手机壁纸生成成功！");
    console.log(`生成了 ${result.images.length} 张图片`);

    if (result.images.length > 0) {
      const fs = require('fs');
      const imageData = result.images[0];
      fs.writeFileSync('mobile-wallpaper.png', imageData);
      console.log("手机壁纸已保存为 mobile-wallpaper.png");
    }

  } catch (error) {
    console.error("手机壁纸生成失败:", error);
  }
}

// 运行所有示例
async function runAllExamples() {
  console.log("开始运行兔子 API 图像生成示例...\n");
  
  await basicImageGeneration();
  await advancedImageGeneration();
  await imageReferenceGeneration();
  await mobileOptimizedGeneration();
  
  console.log("\n所有示例运行完成！");
}

// 如果直接运行此文件
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export {
  basicImageGeneration,
  advancedImageGeneration,
  imageReferenceGeneration,
  mobileOptimizedGeneration,
  runAllExamples
};
