import type { AcquisitionHandler, AcquisitionResult } from "../types/index.js";
import { BrowserManager } from "../core/browser-manager.js";
import * as fs from "fs/promises";
import * as path from "path";

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
      // viewport: input.viewport || { width: 1920, height: 1080 },
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
      console.log(`🚀 使用共享浏览器实例`);

      // 从浏览器管理器获取浏览器实例并创建新页面
      const browserManager = BrowserManager.getInstance();
      const page = await browserManager.newPage();
      console.log(`📄 新页面创建成功`);

      // 设置视口
      // await page.setViewport(config.viewport);
      // console.log(`📱 视口设置: ${config.viewport.width}x${config.viewport.height}`);

      // 访问页面
      console.log(`🔗 正在访问页面...`);
      await page.goto(config.url, {
        waitUntil: "networkidle2", // 等待网络空闲
        timeout: 30000, // 30秒超时
      });

      console.log(`✅ 页面加载完成`);

      // 等待指定时间
      if (config.waitTime > 0) {
        console.log(`⏳ 等待 ${config.waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, config.waitTime));
      }

      // 获取页面信息
      const pageInfo = {
        title: await page.title(),
        url: page.url(),
        viewport: config.viewport,
      };

      console.log(`📋 页面信息:`, pageInfo);

      // 截图
      console.log(`📸 开始截图...`);
      const screenshot = await page.screenshot({
        path: config.screenshotPath,
        fullPage: config.fullPage,
      });

      console.log(`✅ 截图完成: ${config.screenshotPath}`);

      // 返回结果
      const result: AcquisitionResult = {
        success: true,
        url: config.url,
        screenshotPath: config.screenshotPath,
        pageInfo,
        screenshot: screenshot,
        timestamp: new Date().toISOString(),
      };

      console.log(`🎉 数据采集完成`);
      return result;
    } catch (error) {
      console.error(`❌ 数据采集失败:`, error);
      throw error;
    } finally {
      // 注意：这里不关闭浏览器，因为它是共享实例
      console.log(`📄 页面处理完成，保持浏览器实例运行`);
    }
  }
}
