import type { AcquisitionHandler, OutputHandler } from "../types";
import { PageScrapeAcquisitionHandler } from "../data-acquisition/page-scrape-acquisition.js";
import { BaseTask } from "./base-task.js";
import { TextOutputHandler } from "../data-output/text-output.js";

/**
 * 数据抓取任务 - 负责从网页抓取数据
 */
export class DataScrapeTask extends BaseTask {
  /**
   * 获取数据处理处理器实例
   * @returns 数据处理处理器实例
   */
  protected getAcquisitionHandler(): AcquisitionHandler {
    return new PageScrapeAcquisitionHandler();
  }

  protected getOutputHandler(): OutputHandler {
    return new TextOutputHandler();
  }

  protected getTaskDescription(): string {
    return "抓取指定网页的数据（标题、链接、图片等），并输出为文本文件";
  }

  protected getUsage(): string {
    return "npm run task scrape [url] [outputPath] [waitTime]";
  }
}
