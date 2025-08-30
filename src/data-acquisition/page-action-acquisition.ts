import type { AcquisitionHandler, AcquisitionResult } from "../types/index.js";
import { DataType } from "../types/index.js";
import { BrowserManager } from "../core/browser-manager.js";
import { getActionConfig, type ActionTask } from "../config/action-config.js";
import { BrowserController } from "../core/browser-controller.js";
import { appConfig } from "../config/index.js";

/**
 * 页面操作采集器
 * 负责在页面中执行各种操作（如搜索、点击等）
 */
export class PageActionAcquisitionHandler implements AcquisitionHandler {
  /**
   * 实现接口方法 - 执行页面操作
   * @param input - 输入参数，包含配置名称或直接配置
   * @param context - 执行上下文
   * @returns 采集结果
   */
  async execute(input: any, context: any): Promise<AcquisitionResult> {
    console.log(`PageActionAcquisitionHandler 开始执行页面操作`);

    const browserManager = BrowserManager.getInstance();
    const results: any[] = [];

    try {
      // 获取任务列表
      const configName = input || 'baidu_search';
      const tasks = getActionConfig(configName);
      
      if (tasks.length === 0) {
        throw new Error(`未找到配置名称: ${configName}`);
      }
      
      console.log(`📊 配置: ${configName}, 任务数量: ${tasks.length}`);
      
      // 执行所有任务
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (!task) continue;
        
        console.log(`\n🔄 执行任务 ${i + 1}/${tasks.length}: ${task.taskName} (${task.url})`);
        
        // 创建新页面并导航
        const page = await browserManager.newPageWithUrl(task.url);
        
        try {
          // 执行页面操作（如果有配置）
      if (task.operations && task.operations.length > 0) {
        console.log(`🔧 开始执行页面操作...`);
        await BrowserController.getInstance().execute(page, task);
        console.log(`✅ 页面操作执行完成`);
      }

          results.push({
            taskName: task.taskName,
            url: task.url,
            description: task.description,
            success: true,
          });

          console.log(`✅ 任务 ${i + 1} 完成`);
        } finally {
          await page.close();
        }
      }

      // 构建结果
      const dataMap = new Map<string, any>();
      
      // 添加任务数据
      results.forEach((result, index) => {
        dataMap.set(`task_${index + 1}_${result.taskName}`, result.data);
      });

      console.log(`🎉 所有页面操作完成`);
      return {
        success: true,
        url: tasks[0]?.url || '',
        dataType: DataType.TEXT,
        data: dataMap,
        metadata: { 
          taskCount: tasks.length, 
          results,
          configName,
        },
      };
    } catch (error) {
      console.error(`❌ 页面操作失败:`, error);
      throw error;
    }
  }

}
