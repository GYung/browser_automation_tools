import type { AcquisitionHandler, AcquisitionResult } from "../types/index.js";
import { DataType } from "../types/index.js";
import * as fs from "fs/promises";
import * as path from "path";
import { ScreenshotUtils } from "../utils/screenshot-utils.js";
import { BrowserManager } from "../core/browser-manager.js";

/**
 * 页面截图数据采集器
 * 负责从网页收集数据
 */
export class PageScreenAcquisitionHandler implements AcquisitionHandler {
  /**
   * 实现接口方法 - 执行数据采集
   * @param input - 输入参数，包含 url 和截图配置
   * @param context - 执行上下文
   * @returns 采集结果
   */
  async execute(input: any, context: any) {
    console.log(`PageScreenAcquisitionHandler 开始执行数据采集`);

    // 默认配置
    const config = {
      url: input.url || "https://www.baidu.com",
      screenshotPath: input.screenshotPath || "./output/screenshot.png",
      waitTime: input.waitTime || 2000,
      fullPage: input.fullPage || false,
      ...input,
    };

    console.log(`🌐 准备访问页面: ${config.url}`);
    console.log(`📸 截图保存路径: ${config.screenshotPath}`);

    // 确保输出目录存在
    const outputDir = path.dirname(config.screenshotPath);
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`📁 确保输出目录存在: ${outputDir}`);

    try {
      // 获取浏览器实例并创建新页面
      const browserManager = BrowserManager.getInstance();
      const page = await browserManager.newPage();
      console.log(`📄 新页面创建成功`);

      // 使用截图工具执行截图操作
      const screenshotResult = await ScreenshotUtils.takeScreenshot(page, {
        url: config.url,
        screenshotPath: config.screenshotPath,
        waitTime: config.waitTime,
        fullPage: config.fullPage,
      });

      if (!screenshotResult.success) {
        throw new Error(screenshotResult.error || "截图失败");
      }

      // 返回结果
      const result: AcquisitionResult = {
        success: true,
        url: config.url,
        dataType: DataType.IMAGE,
        data: new Map([
          ["screenshot", screenshotResult.screenshot],
        ]),
        metadata: {
          screenshotPath: config.screenshotPath,
          fullPage: config.fullPage,
        },
      };

      console.log(`🎉 数据采集完成`);
      return result;
    } catch (error) {
      console.error(`❌ 数据采集失败:`, error);
      throw error;
    }
  }
}
