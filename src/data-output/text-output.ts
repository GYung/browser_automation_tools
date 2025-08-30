import type { OutputHandler, OutputHandlerInput } from "../types/index.js";
import * as fs from "fs/promises";
import * as path from "path";
import { appConfig } from "../config/index.js";

/**
 * 文本输出处理器
 * 负责将抓取的数据输出为文本格式
 */
export class TextOutputHandler implements OutputHandler {
  /**
   * 实现接口方法 - 执行输出处理
   * @param input - 输出处理器输入数据
   * @param context - 执行上下文
   * @returns 输出结果
   */
  async execute(input: OutputHandlerInput, context: any): Promise<void> {
    console.log(`TextOutputHandler开始生成文本输出`);

    try {
      // 获取输出路径，优先使用 metadata 中的路径，否则使用默认配置
      const outputPath = input.metadata?.outputPath || 
        `${appConfig.outputDir}/text-output.txt`;
      const outputDir = path.dirname(outputPath);

      // 确保输出目录存在
      await fs.mkdir(outputDir, { recursive: true });

      // 生成文本内容
      const textContent = this.generateTextContent(input);

      // 写入文本文件
      await fs.writeFile(outputPath, textContent, "utf-8");
      console.log(`✅ 文本文件生成完成: ${outputPath}`);

      // 同时在控制台输出摘要
      console.log(`📊 数据摘要:`);
      console.log(`   - 页面URL: ${input.url || "未知"}`);
      
      // 遍历所有数据键值对
      for (const [key, value] of input.data.entries()) {
        if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            console.log(`   - ${key}: ${value.length}个元素`);
          } else {
            console.log(`   - ${key}: ${JSON.stringify(value).substring(0, 100)}...`);
          }
        } else {
          console.log(`   - ${key}: ${value}`);
        }
      }

      console.log(`🎉 文本输出处理完成`);
    } catch (error) {
      console.error(`❌ 文本输出处理失败:`, error);
      throw error;
    }
  }

  /**
   * 生成文本内容
   */
  private generateTextContent(data: any): string {
    const { data: dataMap, url } = data;

    let content = "";

    // 基本信息
    content += `页面数据抓取报告\n`;
    content += `================\n\n`;
    content += `URL: ${url || "未知"}\n`;
    content += `时间: ${new Date().toLocaleString("zh-CN")}\n\n`;

    // 遍历所有数据键值对
    for (const [key, value] of dataMap.entries()) {
      content += `【${key}】\n`;
      content += `----------------------------------------\n`;
      
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          // 数组类型数据
          content += `共 ${value.length} 个元素:\n\n`;
          value.slice(0, 20).forEach((item: any, index: number) => {
                         if (typeof item === 'object' && item !== null) {
               content += `${index + 1}. `;
               if (item.text) content += `${item.text}\n`;
               else content += `${JSON.stringify(item)}\n`;
               
               // 显示其他属性
               Object.keys(item).forEach((propKey) => {
                 if (propKey !== 'text' && item[propKey]) {
                   content += `   ${propKey}: ${item[propKey]}\n`;
                 }
               });
               content += `\n`;
             } else {
               content += `${index + 1}. ${item}\n`;
             }
          });
          
          if (value.length > 20) {
            content += `... 还有 ${value.length - 20} 个元素\n`;
          }
        } else {
          // 对象类型数据
          content += `${JSON.stringify(value, null, 2)}\n`;
        }
      } else {
        // 基本类型数据
        content += `${value}\n`;
      }
      
      content += `\n`;
    }

    return content;
  }
}
