import type { AcquisitionHandler, AcquisitionResult } from "../types/index.js";
import { DataType } from "../types/index.js";
import { BrowserManager } from "../core/browser-manager.js";
import { ScrapeUtils } from "../utils/scrape-utils.js";
import { getScrapeConfig, type ScrapeTask } from "../config/scrape-config.js";
import { BrowserController } from "../core/browser-controller.js";
import { appConfig } from "../config/index.js";

/**
 * 任务进度回调监听器接口
 */
export interface TaskProgressListener {
  onTaskEnd?: (taskResult: any) => void;
}

/**
 * 页面抓取采集器
 * 负责从网页抓取文本内容、链接、标题等信息
 */
export class PageScrapeAcquisitionHandler implements AcquisitionHandler {
  private progressListener: TaskProgressListener | undefined;

  constructor(progressListener?: TaskProgressListener) {
    this.progressListener = progressListener;
  }

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
      const configName = input;
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
        
        // 创建新页面
        const page = await browserManager.newPage();
        try {
          // 执行数据抓取
          const scrapeResult = await this.executeScrapeTask(page, task);
          if (!scrapeResult.success) {
            throw new Error(scrapeResult.error || "数据抓取失败");
          }

          const taskResult = {
            taskName: task.taskName,
            url: task.url,
            data: scrapeResult.data,
            success: true,
          }

           // 调用任务结束回调
           this.progressListener?.onTaskEnd?.(taskResult);
          
          results.push(taskResult);

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
   * 执行任务并同时进行 API 数据抓取
   * @param page 页面实例
   * @param task 抓取任务配置
   * @returns 抓取结果
   */
  private async executeScrapeTask(page: any, task: ScrapeTask): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // 设置默认等待时间
      const waitTime = task.waitTime || 3000;
      
      // 设置 API 监听器
      const apiScrapePromise = ScrapeUtils.scrapeApiData(page, {apis:task.apis || [], waitTime});
      
      // 导航到目标页面
      await page.goto(task.url, {
        waitUntil: 'networkidle2',
        timeout: appConfig.pageLoadTimeout,
      });
      
      // 执行页面操作（如果有配置）
      if (task.operations && task.operations.length > 0) {
        console.log(`🔧 执行页面操作...`);
        await BrowserController.getInstance().execute(page, task);
      }

      // 执行页面数据抓取
      const pageScrapeResult = await ScrapeUtils.scrapePageData(page, {textElements:task.elements || [], waitTime});
      
      // 等待 API 数据收集完成
      const apiScrapeResult = await apiScrapePromise;
      
      // 构建结果
      const scrapeResult: { success: boolean; data?: any; error?: string } = {
        success: pageScrapeResult.success && apiScrapeResult.success,
        data: {
          pageTitle: pageScrapeResult.title,
          pageElements: pageScrapeResult.textElements,
          apiData: apiScrapeResult.apiData || [],
        }
      };

      // 只有在有错误时才添加 error 属性
      const errorMessage = pageScrapeResult.error || apiScrapeResult.error;
      if (errorMessage) {
        scrapeResult.error = errorMessage;
      }

      return scrapeResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

}
