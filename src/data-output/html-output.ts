import type { OutputHandler } from "../types";
import * as fs from "fs/promises";
import * as path from "path";
import { BrowserManager } from "../core/browser-manager.js";

/**
 * HTML输出处理器
 * 负责生成HTML页面展示截图
 */
export class HtmlOutputHandler implements OutputHandler {
  /**
   * 实现接口方法 - 执行输出处理
   * @param input - 输入参数
   * @param context - 执行上下文
   * @returns 输出结果
   */
  async execute(input: any, context: any) {
    console.log(`HtmlOutputHandler开始生成HTML页面`);

    try {
      // 获取截图路径
      const screenshotPath = input.screenshotPath || "./output/screenshot.png";
      const outputDir = path.dirname(screenshotPath);
      const htmlPath = path.join(outputDir, "screenshot-viewer.html");

      // 确保输出目录存在
      await fs.mkdir(outputDir, { recursive: true });

      // 检查截图文件是否存在
      try {
        await fs.access(screenshotPath);
        console.log(`📸 找到截图文件: ${screenshotPath}`);
      } catch (error) {
        console.error(`❌ 截图文件不存在: ${screenshotPath}`);
        throw new Error(`截图文件不存在: ${screenshotPath}`);
      }

      // 获取截图文件的相对路径（用于HTML中的img src）
      const screenshotFileName = path.basename(screenshotPath);
      const relativeScreenshotPath = `./${screenshotFileName}`;

      // 生成HTML内容
      const htmlContent = this.generateHtmlContent({
        screenshotPath: relativeScreenshotPath,
        pageInfo: input.pageInfo || {},
        timestamp: input.timestamp || new Date().toISOString(),
        url: input.url || "未知页面",
      });

      // 写入HTML文件
      await fs.writeFile(htmlPath, htmlContent, "utf-8");
      console.log(`✅ HTML页面生成完成: ${htmlPath}`);

      // 在浏览器中打开HTML文件
      await this.openInBrowser(htmlPath);

      // 返回结果
      const result = {
        success: true,
        htmlPath: htmlPath,
        screenshotPath: screenshotPath,
        timestamp: new Date().toISOString(),
      };

      console.log(`🎉 HTML输出处理完成`);
      // 不返回结果，符合 OutputHandler 接口
    } catch (error) {
      console.error(`❌ HTML输出处理失败:`, error);
      throw error;
    }
  }

  /**
   * 生成HTML内容
   */
  private generateHtmlContent(data: {
    screenshotPath: string;
    pageInfo: any;
    timestamp: string;
    url: string;
  }): string {
    const { screenshotPath, pageInfo, timestamp, url } = data;

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>截图查看器</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 20px;
        }
        .info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .info p {
            margin: 5px 0;
            color: #666;
        }
        .screenshot {
            text-align: center;
        }
        .screenshot img {
            max-width: 100%;
            height: auto;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📸 页面截图</h1>
        
        <div class="info">
            <p><strong>页面标题:</strong> ${pageInfo.title || "未知标题"}</p>
            <p><strong>页面URL:</strong> <a href="${url}" target="_blank">${url}</a></p>
            <p><strong>截图时间:</strong> ${new Date(timestamp).toLocaleString("zh-CN")}</p>
        </div>
        
        <div class="screenshot">
            <img src="${screenshotPath}" alt="页面截图" />
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * 在浏览器中打开HTML文件
   */
  private async openInBrowser(htmlPath: string): Promise<void> {
    try {
      const absolutePath = path.resolve(htmlPath);
      const fileUrl = `file://${absolutePath}`;

      // 使用BrowserManager打开新页面
      const browserManager = BrowserManager.getInstance();
      const page = await browserManager.newPage();

      console.log(`🌐 正在浏览器中打开: ${fileUrl}`);
      await page.goto(fileUrl);
      console.log(`✅ 已在浏览器中打开HTML页面`);
    } catch (error) {
      console.warn(`⚠️ 无法在浏览器中打开页面: ${error}`);
      console.log(`📝 请手动打开文件: ${htmlPath}`);
    }
  }
}
