import type { AcquisitionHandler, AcquisitionResult } from "../types/index.js";
import { DataType } from "../types/index.js";
import * as fs from "fs/promises";
import { ScreenshotUtils } from "../utils/screenshot-utils.js";
import { BrowserManager } from "../core/browser-manager.js";
import { getScreenshotConfig, generateScreenshotPath, type ScreenshotTask } from "../config/screenshot-config.js";
import type { Page } from "puppeteer-core";
import { BrowserController } from "../core/browser-controller.js";
import { appConfig } from "../config/index.js";

/**
 * 任务进度回调监听器接口
 */
export interface TaskProgressListener {
  onTaskStart?: (taskIndex: number, task: ScreenshotTask) => void;
}

/**
 * 页面截图数据采集器
 */
export class PageScreenAcquisitionHandler implements AcquisitionHandler {
  private progressListener: TaskProgressListener | undefined;

  constructor(progressListener?: TaskProgressListener) {
    this.progressListener = progressListener;
  }

  async execute(input: any, context: any) {
    console.log(`PageScreenAcquisitionHandler 开始执行数据采集`);

    // 确保输出目录存在
    await fs.mkdir('./output', { recursive: true });

    const browserManager = BrowserManager.getInstance();
    const results: any[] = [];

    try {
      // 获取任务列表
      const configName = input || 'quick';
      const tasks = getScreenshotConfig(configName);
      
      if (tasks.length === 0) {
        throw new Error(`未找到配置名称: ${configName}`);
      }
      
      console.log(`📸 配置: ${configName}, 任务数量: ${tasks.length}`);
      
      // 执行所有任务
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (!task) continue;
        
        console.log(`\n🔄 执行任务 ${i + 1}/${tasks.length}: ${task.url}`);
        
        // 调用任务开始回调
        this.progressListener?.onTaskStart?.(i, task);
        
         // 直接导航到目标页面（登录状态已在初始化时处理）
        const page = await browserManager.newPageWithUrl(task.url);
       
  
         try {
           // 执行操作
           await BrowserController.getInstance().execute(page, task);

          // 执行截图
          const screenshotPath = generateScreenshotPath(task.filename || `screenshot-${i + 1}`);
          const screenshotResult = await ScreenshotUtils.takeScreenshot(page, {
            url: task.url,
            screenshotPath,
            waitTime: task.waitTime || 2000,
          });

          if (!screenshotResult.success) {
            throw new Error(screenshotResult.error || "截图失败");
          }

          const result = {
            url: task.url,
            selector: "没什么用",
            filename: task.filename || `screenshot-${i + 1}`,
            screenshotPath,
            success: true,
          };

          results.push(result);

          console.log(`✅ 任务 ${i + 1} 完成`);
        } catch (error) {
          console.error(`❌ 任务 ${i + 1} 失败:`, error);
          throw error;
        } finally {
          await page.close();
        }
      }

      // 构建结果
      const screenshotMap = new Map<string, string>();
      results.forEach(result => {
        screenshotMap.set(result.filename, result.screenshotPath);
      });

      console.log(`🎉 所有数据采集完成`);
      return {
        success: true,
        url: tasks[0]?.url || '',
        dataType: DataType.IMAGE,
        data: screenshotMap,
        metadata: { taskCount: tasks.length, results },
      };
    } catch (error) {
      console.error(`❌ 数据采集失败:`, error);
      throw error;
    }
  }
 
}
