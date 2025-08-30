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
    console.log(`\n📊 --------------控制台输出开始------------------\n`);
    console.log(`🔗 URL: ${input.url || '未知'}`);
    console.log(`📋 数据类型: ${this.getDataTypeDisplay(input.dataType)}`);
    
    // 显示基本信息
    if (input.metadata?.taskCount) {
      console.log(`📊 任务数量: ${input.metadata.taskCount}`);
    }
    
    // 显示数据内容
    if (input.data) {
      console.log(`\n📄 数据内容:`);
      this.displayData(input.data);
    }
    
    console.log(`🎉 ---------------控制台输出完成-----------------\n`);
  }

  /**
   * 获取数据类型的显示文本
   * @param dataType 数据类型
   * @returns 显示文本
   */
  private getDataTypeDisplay(dataType: string): string {
    const typeMap: Record<string, string> = {
      'image': '📸 图片',
      'text': '📝 文本',
    };
    return typeMap[dataType] || dataType;
  }

  /**
   * 显示数据内容
   * @param data 数据
   */
  private displayData(data: any): void {
    if (data instanceof Map) {
      data.forEach((value, key) => {
        if (key.startsWith('task_')) {
          console.log(`   📋 ${key}: ${this.formatTaskData(value)}`);
        } else {
          console.log(`   🔧 ${key}: ${this.formatValue(value)}`);
        }
      });
    } else if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        console.log(`   🔧 ${key}: ${this.formatValue(value)}`);
      });
    } else {
      console.log(`   ${data}`);
    }
  }

  /**
   * 格式化任务数据
   * @param taskData 任务数据
   * @returns 格式化字符串
   */
  private formatTaskData(taskData: any): string {
    if (typeof taskData === 'object' && taskData !== null) {
      const parts = [];
      if (taskData.taskName) parts.push(`任务: ${taskData.taskName}`);
      if (taskData.pageTitle) parts.push(`标题: ${taskData.pageTitle}`);
      if (taskData.pageElements) parts.push(`元素: ${Object.keys(taskData.pageElements).length} 类`);
      if (taskData.apiData) parts.push(`API: ${taskData.apiData.length} 个`);
      return parts.join(', ') || '任务数据';
    }
    return String(taskData);
  }

  /**
   * 格式化值显示
   * @param value 值
   * @returns 格式化后的字符串
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) return String(value);
    if (Array.isArray(value)) return `[${value.length} 项]`;
    if (typeof value === 'object') return `{${Object.keys(value).length} 个属性}`;
    return String(value);
  }
}
