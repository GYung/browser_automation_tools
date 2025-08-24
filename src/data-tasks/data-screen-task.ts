import type { AcquisitionHandler, OutputHandler } from "../types";
import { PageScreenAcquisitionHandler } from "../data-acquisition/page-screen-acquisition.js";
import { BaseTask } from "./base-task.js";
import { HtmlOutputHandler } from "../data-output/html-output.js";

/**
 * 数据采集任务 - 负责从各种数据源采集数据
 */
export class DataScreenTask extends BaseTask {
  /**
   * 获取数据处理处理器实例
   * @returns 数据处理处理器实例
   */
  protected getAcquisitionHandler(): AcquisitionHandler {
    return new PageScreenAcquisitionHandler();
  }

  protected getOutputHandler(): OutputHandler {
    return new HtmlOutputHandler();
  }

  protected getTaskDescription(): string {
    return "对指定网页进行截图，并生成HTML页面展示截图";
  }

  protected getUsage(): string {
    return "npm run task screen [url] [screenshotPath] [waitTime] [fullPage]";
  }
}
