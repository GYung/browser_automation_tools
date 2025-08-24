import type { OutputHandler } from "../types";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * 文本输出处理器
 * 负责将抓取的数据输出为文本格式
 */
export class TextOutputHandler implements OutputHandler {
  /**
   * 实现接口方法 - 执行输出处理
   * @param input - 输入参数（包含采集结果）
   * @param context - 执行上下文
   * @returns 输出结果
   */
  async execute(input: any, context: any): Promise<void> {
    console.log(`TextOutputHandler开始生成文本输出`);

    try {
      // 获取输出路径
      const outputPath = input.outputPath || "./output/scraped-data.txt";
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
      console.log(`   - 页面标题: ${input.pageInfo?.title || "未知"}`);
      console.log(`   - 页面URL: ${input.url || "未知"}`);
      console.log(`   - 标题数量: ${input.pageData?.headings?.length || 0}`);
      console.log(`   - 链接数量: ${input.pageData?.links?.length || 0}`);
      console.log(`   - 图片数量: ${input.pageData?.images?.length || 0}`);
      console.log(
        `   - 文本块数量: ${input.pageData?.textContent?.length || 0}`,
      );

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
    const { pageInfo, pageData, url, timestamp } = data;

    let content = "";

    // 基本信息
    content += `页面抓取报告\n`;
    content += `============\n\n`;
    content += `标题: ${pageInfo?.title || "未知"}\n`;
    content += `URL: ${url || "未知"}\n`;
    content += `时间: ${new Date(timestamp).toLocaleString("zh-CN")}\n\n`;

    // 主要标题
    if (pageData?.headings && pageData.headings.length > 0) {
      content += `主要标题:\n`;
      pageData.headings.slice(0, 5).forEach((heading: any) => {
        content += `- ${heading.text}\n`;
      });
      content += `\n`;
    }

    // 主要链接
    if (pageData?.links && pageData.links.length > 0) {
      content += `主要链接:\n`;
      pageData.links.slice(0, 5).forEach((link: any) => {
        content += `- ${link.text || "无文本"}\n`;
      });
      content += `\n`;
    }

    // 统计
    content += `统计: 标题${pageData?.headings?.length || 0}个, 链接${pageData?.links?.length || 0}个, 图片${pageData?.images?.length || 0}个`;

    return content;
  }
}
