import type { Page } from "puppeteer-core";

/**
 * 截图配置接口
 */
export interface ScreenshotConfig {
  url: string;
  screenshotPath: string;
  waitTime?: number;
  format?: 'png' | 'jpeg' | 'webp';
}

/**
 * 截图结果接口
 */
export interface ScreenshotResult {
  success: boolean;
  screenshot: Buffer;
  screenshotPath: string;
  error?: string;
}

/**
 * 截图工具类
 * 封装页面访问到截图完成的逻辑
 */
export class ScreenshotUtils {
  /**
   * 执行截图操作
   * @param page Puppeteer页面实例
   * @param config 截图配置
   * @returns 截图结果
   */
  static async takeScreenshot(page: Page, config: ScreenshotConfig): Promise<ScreenshotResult> {
    console.log(`📸 开始截图操作`);
    console.log(`🌐 目标页面: ${config.url}`);
    console.log(`💾 保存路径: ${config.screenshotPath}`);

    try {
      // 访问页面
      console.log(`🔗 正在访问页面...`);
      await page.goto(config.url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });
      console.log(`✅ 页面加载完成`);

      // 等待指定时间
      if (config.waitTime && config.waitTime > 0) {
        console.log(`⏳ 等待 ${config.waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, config.waitTime));
      }

      // 截图
      console.log(`📸 开始截图...`);
      const screenshot = await page.screenshot({
        path: config.screenshotPath as any,
        fullPage: true, // 默认全页面截图
      });
      console.log(`✅ 截图完成: ${config.screenshotPath}`);

      return {
        success: true,
        screenshot: Buffer.from(screenshot),
        screenshotPath: config.screenshotPath,
      };
    } catch (error) {
      console.error(`❌ 截图失败:`, error);
      return {
        success: false,
        screenshot: Buffer.alloc(0),
        screenshotPath: config.screenshotPath,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
