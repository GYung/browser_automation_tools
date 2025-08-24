import type { AcquisitionHandler,OutputHandler } from "../types";

/**
 * 任务基类 - 定义所有任务的基本结构和接口
 */
export abstract class BaseTask {

  async execute(context: any) {
    // 采集
    const acquisitionHandler = this.getAcquisitionHandler();
    acquisitionHandler?.execute({}, context);

    // 输出
    const outputHandler = this.getOutputHandler();
    outputHandler?.execute({}, context);
  }

  // 搜集
  /**
    * 获取数据处理处理器实例
    * @returns 数据处理处理器实例
    */
  protected getAcquisitionHandler(): AcquisitionHandler | null {
    return null;
  }
  // 整合
  // 分析
  // 输出
  protected getOutputHandler(): OutputHandler | null {
    return null;
  }


}
