import type { AcquisitionHandler, AcquisitionResult } from "../types/index.js";
import { BrowserManager } from "../core/browser-manager.js";

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
    console.log(`PageDataAcquisitionHandler 开始执行数据采集`);

    // 默认配置
    const config = {
      url: input.url || "https://www.baidu.com",
      waitTime: input.waitTime || 2000,
      selectors: input.selectors || {
        title: "title",
        headings: "h1, h2, h3, h4, h5, h6",
        links: "a[href]",
        text: "p, div, span",
        images: "img[src]",
      },
      ...input,
    };

    console.log(`🌐 准备爬取页面: ${config.url}`);

    try {
      console.log(`🚀 使用共享浏览器实例`);

      // 从浏览器管理器获取浏览器实例并创建新页面
      const browserManager = BrowserManager.getInstance();
      const page = await browserManager.newPage();

      // 设置页面视口
      await page.setViewport({ width: 1920, height: 1080 });
      console.log(`📄 新页面创建成功`);

      // 访问页面
      console.log(`🔗 正在访问页面...`);
      await page.goto(config.url, {
        waitUntil: "networkidle2", // 等待网络空闲
        timeout: 30000, // 30秒超时
      });

      console.log(`✅ 页面加载完成`);

      // 等待指定时间
      if (config.waitTime > 0) {
        console.log(`⏳ 等待 ${config.waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, config.waitTime));
      }

      // 获取页面基本信息
      const pageInfo = {
        title: await page.title(),
        url: page.url(),
      };

      console.log(`📋 页面信息:`, pageInfo);

      // 爬取页面数据
      const pageData = await page.evaluate((selectors: any) => {
        const data: any = {};

        // 获取标题
        try {
          data.title = document.title;
        } catch (e) {
          data.title = "";
        }

        // 获取所有标题元素
        try {
          const headings = document.querySelectorAll(selectors.headings);
          data.headings = Array.from(headings).map((h: any) => ({
            tag: h.tagName.toLowerCase(),
            text: h.textContent?.trim() || "",
            level: parseInt(h.tagName.charAt(1)),
          }));
        } catch (e) {
          data.headings = [];
        }

        // 获取所有链接
        try {
          const links = document.querySelectorAll(selectors.links);
          data.links = Array.from(links)
            .map((a: any) => ({
              text: a.textContent?.trim() || "",
              href: a.getAttribute("href") || "",
              title: a.getAttribute("title") || "",
            }))
            .filter((link) => link.href && link.href !== "#");
        } catch (e) {
          data.links = [];
        }

        // 获取所有图片
        try {
          const images = document.querySelectorAll(selectors.images);
          data.images = Array.from(images)
            .map((img: any) => ({
              src: img.getAttribute("src") || "",
              alt: img.getAttribute("alt") || "",
              title: img.getAttribute("title") || "",
              width: img.getAttribute("width") || "",
              height: img.getAttribute("height") || "",
            }))
            .filter((img) => img.src);
        } catch (e) {
          data.images = [];
        }

        // 获取主要文本内容
        try {
          const textElements = document.querySelectorAll(selectors.text);
          data.textContent = Array.from(textElements)
            .map((el: any) => el.textContent?.trim() || "")
            .filter((text) => text.length > 10) // 过滤掉太短的文本
            .slice(0, 20); // 只取前20个文本块
        } catch (e) {
          data.textContent = [];
        }

        // 获取页面元数据
        try {
          const metaTags = document.querySelectorAll("meta");
          data.meta = Array.from(metaTags)
            .map((meta: any) => ({
              name:
                meta.getAttribute("name") ||
                meta.getAttribute("property") ||
                "",
              content: meta.getAttribute("content") || "",
            }))
            .filter((meta) => meta.name && meta.content);
        } catch (e) {
          data.meta = [];
        }

        return data;
      }, config.selectors);

      console.log(`📊 数据爬取完成`);

      // 返回结果
      const result: AcquisitionResult = {
        success: true,
        url: config.url,
        pageInfo,
        pageData,
        timestamp: new Date().toISOString(),
      };

      console.log(`🎉 数据采集完成`);
      return result;
    } catch (error) {
      console.error(`❌ 数据采集失败:`, error);
      throw error;
    } finally {
      // 注意：这里不关闭浏览器，因为它是共享实例
      console.log(`📄 页面处理完成，保持浏览器实例运行`);
    }
  }
}
