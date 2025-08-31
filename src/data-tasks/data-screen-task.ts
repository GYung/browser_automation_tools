import type { AcquisitionHandler, OutputHandler } from "../types";
import { PageScreenAcquisitionHandler, type TaskProgressListener } from "../data-acquisition/page-screen-acquisition.js";
import { BaseTask } from "./base-task.js";
import { HtmlOutputHandler } from "../data-output/html-output.js";

/**
 * 数据采集任务
 */
export class DataScreenTask extends BaseTask {
 
  /**
   * 获取采集处理器
   * @returns 采集处理器实例
   */
  protected getAcquisitionHandler(): AcquisitionHandler {
    // 创建匿名进度监听器
    const progressListener: TaskProgressListener = {
      onTaskStart: (taskIndex, task) => {
        console.log(`🚀 截图任务开始: ${taskIndex + 1} - ${task.url}`);
        console.log(`📁 输出文件: ${task.filename || `screenshot-${taskIndex + 1}`}`);
      }
    };
    
    return new PageScreenAcquisitionHandler(progressListener);
  }

  protected getOutputHandler(): OutputHandler {
    return new HtmlOutputHandler();
  }

  protected getTaskDescription(): string {
    return "对指定网页进行截图，并生成HTML页面展示截图";
  }

  protected getUsage(): string {
    return "npm run task screen <configName>";
  }
}
