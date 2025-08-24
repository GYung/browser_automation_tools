import type { AcquisitionHandler, OutputHandler } from "../types";
import { PageActionAcquisitionHandler } from "../data-acquisition/page-action-acquisition.js";
import { BaseTask } from "./base-task.js";
import { ConsoleOutputHandler } from "../data-output/console-output.js";

/**
 * 页面操作任务 - 负责在页面中执行各种操作
 */
export class DataActionTask extends BaseTask {
  /**
   * 获取数据处理处理器实例
   * @returns 数据处理处理器实例
   */
  protected getAcquisitionHandler(): AcquisitionHandler {
    return new PageActionAcquisitionHandler();
  }

  protected getOutputHandler(): OutputHandler {
    return new ConsoleOutputHandler();
  }

  protected getTaskDescription(): string {
    return "在指定网页中执行搜索操作，并在控制台输出执行结果";
  }

  protected getUsage(): string {
    return "npm run task action [url] [keyword] [selectors] [waitTime]";
  }
}
