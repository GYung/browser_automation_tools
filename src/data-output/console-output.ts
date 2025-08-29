import type { OutputHandler, OutputHandlerInput } from "../types";

/**
 * 控制台输出处理器
 * 负责在控制台打印执行结果
 */
export class ConsoleOutputHandler implements OutputHandler {
  /**
   * 实现接口方法 - 执行输出处理
   * @param input - 输出处理器输入数据
   * @param context - 执行上下文
   * @returns 输出结果
   */
  async execute(input: OutputHandlerInput, context: any): Promise<void> {
    console.log(`ConsoleOutputHandler 开始输出`);
      // 根据数据类型显示不同的信息
      if (input.dataType === "image") {
        console.log(`📸 数据类型: 图片`);
        console.log(`📁 保存路径: ${input.metadata?.screenshotPath || "未知"}`);
      } else if (input.dataType === "text") {
        console.log(`📝 数据类型: 文本`);
        if (input.data?.get("keyword")) {
          console.log(`🔍 搜索关键字: ${input.data.get("keyword")}`);
          console.log(`📊 搜索结果数量: ${input.metadata?.resultCount || 0}`);
        }
      }
      console.log(`🎉 Console输出完成`);
  }
}
