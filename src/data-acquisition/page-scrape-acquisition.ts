import type { AcquisitionHandler, AcquisitionResult } from "../types/index.js";
import { DataType } from "../types/index.js";
import { BrowserManager } from "../core/browser-manager.js";
import { ScrapeUtils } from "../utils/scrape-utils.js";

/**
 * 页面抓取采集器
 * 负责从网页抓取文本内容、链接、标题等信息
 */
export class PageScrapeAcquisitionHandler implements AcquisitionHandler {
  /**
   * 实现接口方法 - 执行数据采集
   * @param input - 输入参数，包含 url 和爬取配置
   * @param context - 执行上下文
   * @returns 采集结果
   */
  async execute(input: any, context: any): Promise<AcquisitionResult> {
    console.log(`PageScrapeAcquisitionHandler 开始执行数据采集`);

          // 默认配置
      const config = {
        url: input.url || "https://www.baidu.com",
        waitTime: input.waitTime || 2000,
        textElements: input.textElements || [
          {
            selector: "h1, h2, h3, h4, h5, h6",
            name: "headings",
            attributes: ["textContent", "className", "id"],
          }
        ],
        ...input,
      };

    console.log(`🌐 准备爬取页面: ${config.url}`);

    try {
      // 从浏览器管理器获取浏览器实例并创建新页面
      const browserManager = BrowserManager.getInstance();
      const page = await browserManager.newPageWithUrl(config.url);
    
      // 使用抓取工具执行页面数据抓取
      const scrapeResult = await ScrapeUtils.scrapePageData(page, {
        waitTime: config.waitTime,
        textElements: config.textElements,
      });

      if (!scrapeResult.success) {
        throw new Error(scrapeResult.error || "页面数据抓取失败");
      }


      // 返回结果
      const dataMap = new Map<string, any>([
        ["title", scrapeResult.title],
        ["description", scrapeResult.description],
        ["textElements", scrapeResult.textElements],
      ]);

      const result: AcquisitionResult = {
        success: true,
        url: config.url,
        dataType: DataType.TEXT,
        data: dataMap,
        metadata: {
         
        },
      };

      console.log(`🎉 数据采集完成`);
      return result;
    } catch (error) {
      console.error(`❌ 数据采集失败:`, error);
      throw error;
    }
  }
}
