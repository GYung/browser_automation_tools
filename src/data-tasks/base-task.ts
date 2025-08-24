import type {
  AcquisitionHandler,
  OutputHandler,
  AcquisitionResult,
} from "../types";

/**
 * 任务基类 - 定义所有任务的基本结构和接口
 */
export abstract class BaseTask {
  async execute(input: any, context: any) {
    // 采集 - 采集器是必须的
    const acquisitionHandler = this.getAcquisitionHandler();
    if (!acquisitionHandler) {
      throw new Error("任务必须提供采集处理器 (AcquisitionHandler)");
    }

    const acquisitionResult = await acquisitionHandler.execute(input, context);
    
    // 检查采集结果 - 如果没有采集到数据或采集失败，报错
    if (!acquisitionResult || !acquisitionResult.success) {
      throw new Error("没有采集到有效数据");
    }

    // 输出 - 传递采集结果
    const outputHandler = this.getOutputHandler();
    if (outputHandler) {
      await outputHandler.execute(acquisitionResult, context);
    }
  }


  /**
   * 获取采集处理器
   * @returns 采集处理器实例
   */
  protected abstract getAcquisitionHandler(): AcquisitionHandler;

  /**
   * 获取输出处理器
   * @returns 输出处理器实例
   */
  protected abstract getOutputHandler(): OutputHandler;

  /**
   * 获取任务描述
   * @returns 任务描述
   */
  protected abstract getTaskDescription(): string;

  /**
   * 获取使用方法
   * @returns 使用方法说明
   */
  protected abstract getUsage(): string;
}
