import type { OutputHandler, AcquisitionResult } from "../types";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * 文本输出处理器
 * 负责将抓取的数据输出为文本格式
 */
export class TextOutputHandler implements OutputHandler {
  /**
   * 实现接口方法 - 执行输出处理
   * @param input - 采集结果
   * @param context - 执行上下文
   * @returns 输出结果
   */
  async execute(input: AcquisitionResult, context: any): Promise<void> {
    console.log(`TextOutputHandler开始生成文本输出`);

    try {
      // 获取输出路径
      const outputPath = input.metadata?.outputPath || "./output/scraped-data.txt";
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
      console.log(`   - 页面标题: ${input.data.get("title") || "未知"}`);
      console.log(`   - 页面描述: ${input.data.get("description") || "无"}`);
      
      // 显示各类型元素数量
      const textElements = input.data.get("textElements") || {};
      const elementTypes = Object.keys(textElements);
      if (elementTypes.length > 0) {
        console.log(`   - 元素类型: ${elementTypes.join(", ")}`);
        elementTypes.forEach((type) => {
          const elements = textElements[type];
          console.log(`     ${type}: ${elements.length}个`);
        });
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
    content += `页面文本抓取报告\n`;
    content += `================\n\n`;
    content += `URL: ${url || "未知"}\n`;
    content += `时间: ${new Date().toLocaleString("zh-CN")}\n\n`;

    // 页面标题和描述
    const title = dataMap.get("title") || "未知";
    const description = dataMap.get("description") || "无描述";
    content += `页面标题: ${title}\n`;
    content += `页面描述: ${description}\n\n`;

    // 文本元素数据
    const textElements = dataMap.get("textElements") || {};
    const elementTypes = Object.keys(textElements);
    
    if (elementTypes.length > 0) {
      content += `文本元素数据:\n`;
      content += `==============\n\n`;
      
      elementTypes.forEach((elementType) => {
        const elements = textElements[elementType];
        content += `【${elementType}】 (共${elements.length}个):\n`;
        content += `----------------------------------------\n`;
        
        elements.slice(0, 10).forEach((element: any, index: number) => {
          content += `${index + 1}. [${element.tag}] ${element.text}\n`;
          
          // 显示其他属性
          Object.keys(element).forEach((key) => {
            if (key !== 'tag' && key !== 'text' && element[key]) {
              content += `   ${key}: ${element[key]}\n`;
            }
          });
          content += `\n`;
        });
        
        if (elements.length > 10) {
          content += `... 还有 ${elements.length - 10} 个${elementType}元素\n`;
        }
        content += `\n`;
      });
    } else {
      content += `未找到任何文本元素数据\n`;
    }



    return content;
  }
}
