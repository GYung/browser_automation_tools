import type { OutputHandler } from "../types";

/**
 * 控制台输出处理器
 * 负责在控制台打印执行结果
 */
export class ConsoleOutputHandler implements OutputHandler {
  /**
   * 实现接口方法 - 执行输出处理
   * @param input - 输入参数（包含采集结果）
   * @param context - 执行上下文
   * @returns 输出结果
   */
  async execute(input: any, context: any): Promise<void> {
    if (input.success) {
      console.log(`✅ 任务执行成功`);
    } else {
      console.log(`❌ 任务执行失败: ${input.error || "未知错误"}`);
    }
  }
}
