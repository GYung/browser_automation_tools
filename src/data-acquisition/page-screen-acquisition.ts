import type { AcquisitionHandler, AcquisitionResult } from "../types/index.js";
import { DataType } from "../types/index.js";
import * as fs from "fs/promises";
import { ScreenshotUtils } from "../utils/screenshot-utils.js";
import { BrowserManager } from "../core/browser-manager.js";
import { getScreenshotConfig, generateScreenshotPath, type ScreenshotTask } from "../config/screenshot-config.js";

/**
 * 页面截图数据采集器
 * 负责从网页收集数据
 */
export class PageScreenAcquisitionHandler implements AcquisitionHandler {
  /**
   * 实现接口方法 - 执行数据采集
   * @param input - 输入参数，包含配置名称
   * @param context - 执行上下文
   * @returns 采集结果
   */
  async execute(input: any, context: any) {
    console.log(`PageScreenAcquisitionHandler 开始执行数据采集`);

    // 获取配置名称，默认为 'quick'
    const configName = input || 'quick';
    
    // 获取截图任务列表
    const screenshotTasks = getScreenshotConfig(configName);
    
    if (screenshotTasks.length === 0) {
      throw new Error(`未找到配置名称: ${configName}`);
    }

    console.log(`📸 配置名称: ${configName}`);
    console.log(`📸 任务数量: ${screenshotTasks.length}`);

    // 确保输出目录存在
    await fs.mkdir('./output', { recursive: true });
    console.log(`📁 确保输出目录存在: ./output`);

    const results: any[] = [];
    const browserManager = BrowserManager.getInstance();

    try {
      // 执行所有截图任务
      for (let i = 0; i < screenshotTasks.length; i++) {
        const task = screenshotTasks[i];
        if (!task) continue;
        
        console.log(`\n🔄 执行任务 ${i + 1}/${screenshotTasks.length}: ${task.url}`);
        
        // 生成截图路径
        const screenshotPath = generateScreenshotPath(task.filename);
        console.log(`📸 截图保存路径: ${screenshotPath}`);

        // 获取浏览器实例并创建新页面（自动处理 cookies）
        const page = await browserManager.newPageWithUrl(task.url);
        console.log(`📄 页面创建并导航完成`);

        // 使用截图工具执行截图操作
        const screenshotResult = await ScreenshotUtils.takeScreenshot(page, {
          url: task.url,
          screenshotPath,
          waitTime: task.waitTime,
        });

        if (!screenshotResult.success) {
          throw new Error(screenshotResult.error || "截图失败");
        }

        // 关闭页面
        await page.close();

        // 保存结果
        results.push({
          url: task.url,
          filename: task.filename,
          screenshotPath,
          success: true,
        });

        console.log(`✅ 任务 ${i + 1} 完成`);
      }

      // 构建截图名和地址的映射
      const screenshotMap = new Map<string, string>();
      results.forEach(result => {
        screenshotMap.set(result.filename, result.screenshotPath);
      });

      // 返回结果
      const result: AcquisitionResult = {
        success: true,
        url: screenshotTasks[0]?.url || '', // 使用第一个任务的 URL 作为主 URL
        dataType: DataType.IMAGE,
        data: screenshotMap, // 截图名 -> 截图地址的映射
        metadata: {
          configName,
          taskCount: screenshotTasks.length,
          results,
        },
      };

      console.log(`🎉 所有数据采集完成`);
      return result;
    } catch (error) {
      console.error(`❌ 数据采集失败:`, error);
      throw error;
    }
  }


}
