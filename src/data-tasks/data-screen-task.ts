
import type { AcquisitionHandler,OutputHandler } from "../types";
import { PageScreenAcquisitionHandler } from '../data-acquisition/page-screen-acquisition.js';
import { BaseTask } from './base-task.js';
import { HtmlOutputHandler } from "../data-output/html-output";

/**
 * 数据采集任务 - 负责从各种数据源采集数据
 */
export class DataScreenTask extends BaseTask {
  
  /**
   * 获取数据处理处理器实例
   * @returns 数据处理处理器实例
   */
  protected getAcquisitionHandler(): AcquisitionHandler | null {
    return new PageScreenAcquisitionHandler();
  }

  protected getOutputHandler(): OutputHandler | null {
    return new HtmlOutputHandler();
  }

}