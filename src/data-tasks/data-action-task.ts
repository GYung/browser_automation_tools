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
}
