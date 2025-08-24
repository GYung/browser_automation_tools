import type { OutputHandler, AcquisitionResult } from "../types";

/**
 * 控制台输出处理器
 * 负责在控制台打印执行结果
 */
export class ConsoleOutputHandler implements OutputHandler {
  /**
   * 实现接口方法 - 执行输出处理
   * @param input - 采集结果
   * @param context - 执行上下文
   * @returns 输出结果
   */
  async execute(input: AcquisitionResult, context: any): Promise<void> {
    if (input.success) {
      console.log(`✅ 任务执行成功`);
      
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
    } else {
      console.log(`❌ 任务执行失败: 采集失败`);
    }
  }
}
