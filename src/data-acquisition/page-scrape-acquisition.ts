import type { AcquisitionHandler, AcquisitionResult } from "../types/index.js";
import { DataType } from "../types/index.js";
import { BrowserManager } from "../core/browser-manager.js";
import { ScrapeUtils } from "../utils/scrape-utils.js";
import { getScrapeConfig, getScrapeTask, type ScrapeTask } from "../config/scrape-config.js";
import { BrowserController } from "../core/browser-controller.js";

/**
 * 页面抓取采集器
 * 负责从网页抓取文本内容、链接、标题等信息
 */
export class PageScrapeAcquisitionHandler implements AcquisitionHandler {
  /**
   * 实现接口方法 - 执行数据采集
   * @param input - 输入参数，包含配置名称或直接配置
   * @param context - 执行上下文
   * @returns 采集结果
   */
  async execute(input: any, context: any): Promise<AcquisitionResult> {
    console.log(`PageScrapeAcquisitionHandler 开始执行数据采集`);

    const browserManager = BrowserManager.getInstance();
    const results: any[] = [];

    try {
      // 获取任务列表
      const configName = input || 'quick';
      const tasks = getScrapeConfig(configName);
      
      if (tasks.length === 0) {
        throw new Error(`未找到配置名称: ${configName}`);
      }
      
      console.log(`📊 配置: ${configName}, 任务数量: ${tasks.length}`);
      
      // 执行所有任务
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (!task) continue;
        
        console.log(`\n🔄 执行任务 ${i + 1}/${tasks.length}: ${task.taskName} (${task.url})`);
        
        // 创建新页面并导航到目标URL
        const page = await browserManager.newPageWithUrl(task.url);
        
        try {
          // 执行页面操作（如果有配置）
          if (task.operations && task.operations.length > 0) {
            console.log(`🔧 执行页面操作...`);
            // 转换任务格式以适配 BrowserController
            const browserTask = {
              url: task.url,
              filename: `${task.taskName}_screenshot.png`, // 临时文件名
              waitTime: task.waitTime || 2000,
              operations: task.operations as any, // 类型转换，因为 ScrapeTask 和 ScreenshotTask 的 operations 类型不同
            };
            await BrowserController.getInstance().execute(page, browserTask);
          }

          // 执行数据抓取
          const scrapeResult = await this.scrapeTaskData(page, task);

          if (!scrapeResult.success) {
            throw new Error(scrapeResult.error || "数据抓取失败");
          }

          results.push({
            taskName: task.taskName,
            url: task.url,
            data: scrapeResult.data,
            success: true,
          });

          console.log(`✅ 任务 ${i + 1} 完成`);
        } finally {
          await page.close();
        }
      }

      // 构建结果
      const dataMap = new Map<string, any>();
      
      // 只添加详细任务数据，避免重复
      results.forEach((result, index) => {
        dataMap.set(`task_${index + 1}_${result.taskName}`, result.data);
      });

      console.log(`🎉 所有数据采集完成`);
      return {
        success: true,
        url: tasks[0]?.url || '',
        dataType: DataType.TEXT,
        data: dataMap,
        metadata: { 
          taskCount: tasks.length, 
          results,
          configName,
          outputPath: tasks[0]?.filename ? `./output/${tasks[0].filename}` : './output/scraped-data.txt'
        },
      };
    } catch (error) {
      console.error(`❌ 数据采集失败:`, error);
      throw error;
    }
  }

  /**
   * 执行单个任务的数据抓取
   * @param page 页面实例
   * @param task 抓取任务配置
   * @returns 抓取结果
   */
  private async scrapeTaskData(page: any, task: ScrapeTask): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // 转换元素配置格式
      const textElements = task.elements.map(element => ({
        selector: element.selector,
        name: element.name,
        attributes: element.attributes || ['textContent'],
      }));

      // 使用抓取工具执行页面数据抓取
      const scrapeResult = await ScrapeUtils.scrapePageData(page, {
        waitTime: task.waitTime || 2000,
        textElements,
      });

      if (!scrapeResult.success) {
        return {
          success: false,
          error: scrapeResult.error || "页面数据抓取失败"
        };
      }

      // 构建结构化的数据结果
      const structuredData = {
        taskName: task.taskName,
        url: task.url,
        pageTitle: scrapeResult.title,
        pageDescription: scrapeResult.description,
        scrapedElements: scrapeResult.textElements,
        timestamp: new Date().toISOString(),
      };

      return {
        success: true,
        data: structuredData
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
