import type {
  AcquisitionHandler,
  OutputHandler,
  AnalysisHandler,
  AnalysisResult,
  AcquisitionResult,
  OutputHandlerInput,
} from "../types";

/**
 * 任务基类 - 定义所有任务的基本结构和接口
 */
export abstract class BaseTask {
  async execute(input: any, context = {}) {
    // 1.采集 - 采集器是必须的
    const acquisitionHandler = this.getAcquisitionHandler();
    if (!acquisitionHandler) {
      throw new Error("任务必须提供采集处理器 (AcquisitionHandler)");
    }

    const acquisitionResult = await acquisitionHandler.execute(input, context);
    
    // 检查采集结果 - 如果没有采集到数据或采集失败，报错
    if (!acquisitionResult || !acquisitionResult.success) {
      throw new Error("没有采集到有效数据");
    }

    let outputInput;
    // 2.分析
    const analysisHandler = this.getAnalysisHandler();
    if (analysisHandler) {
      const analysisResult = await analysisHandler.execute(acquisitionResult, context);
      outputInput = this.analysisToOutput(analysisResult, context);
    } else {
      outputInput = this.acquisitionToOutput(acquisitionResult, context)
    }

    // 3.输出
    const outputHandler = this.getOutputHandler();
    if (outputHandler) {
      await outputHandler.execute(outputInput, context);
    }
  }

  /**
   * 获取采集处理器
   * @returns 采集处理器实例
   */
  protected abstract getAcquisitionHandler(): AcquisitionHandler;

   /**
   * 获取分析处理器
   * @returns 分析处理器实例（可选）
   */
   protected getAnalysisHandler(): AnalysisHandler | undefined {
    return undefined;
  }

  /**
   * 获取输出处理器
   * @returns 输出处理器实例（可选）
   */
  protected  getOutputHandler(): OutputHandler | undefined {
    return undefined;
  }
 
  /**
   * 将采集结果转换为输出处理器的输入对象
   * (子类可以重写此方法来自定义转换逻辑)
   * @param acquisitionResult 采集结果
   * @param context 上下文信息
   * @returns 输出处理器的输入对象
   */
  protected acquisitionToOutput(acquisitionResult: AcquisitionResult, context: any): OutputHandlerInput {
    return {
      url: acquisitionResult.url || "",
      data: acquisitionResult.data,
      dataType: acquisitionResult.dataType,
      metadata: acquisitionResult.metadata || {},
    };
  }

  /**
   * 将分析结果转换为输出处理器的输入对象
   * (子类可以重写此方法来自定义转换逻辑)
   * @param analysisResult 分析结果
   * @param context 上下文信息
   * @returns 输出处理器的输入对象
   */
  protected analysisToOutput(analysisResult: AnalysisResult, context: any): OutputHandlerInput {
    return {
      url: analysisResult.url || "",
      data: analysisResult.analysisData,
      dataType: analysisResult.dataType,
      metadata: analysisResult.metadata || {},
    };
  }

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
