import type { AcquisitionHandler, AcquisitionResult } from "../types/index.js";
import { BrowserManager } from "../core/browser-manager.js";

/**
 * 页面操作采集器
 * 负责在页面中执行各种操作（如搜索、点击等）
 */
export class PageActionAcquisitionHandler implements AcquisitionHandler {
  /**
   * 实现接口方法 - 执行搜索
   * @param input - 输入参数，包含 url、搜索关键字和选择器配置
   * @param context - 执行上下文
   * @returns 采集结果
   */
  async execute(input: any, context: any): Promise<AcquisitionResult> {
    console.log(`PageActionAcquisitionHandler 开始执行操作`);

    // 默认配置
    const config = {
      url: input.url || "https://www.baidu.com",
      keyword: input.keyword || "测试搜索",
      selectors: input.selectors || {
        searchInput: "#kw", // 百度搜索框
        searchButton: "#su", // 搜索按钮
      },
      waitTime: input.waitTime || 2000,
      ...input,
    };

    console.log(`🌐 准备搜索页面: ${config.url}`);
    console.log(`🔍 搜索关键字: ${config.keyword}`);

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
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      console.log(`✅ 页面加载完成`);

      // 等待页面稳定（缩短等待时间）
      if (config.waitTime > 0) {
        console.log(`⏳ 等待 ${config.waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // 获取页面基本信息
      const pageInfo = {
        title: await page.title(),
        url: page.url(),
      };

      console.log(`📋 页面信息:`, pageInfo);

      // 执行搜索
      console.log(`🔍 开始执行搜索...`);

      // 等待搜索框出现并聚焦
      await page.waitForSelector(config.selectors.searchInput, {
        timeout: 10000,
      });
      await page.focus(config.selectors.searchInput);

      // 清空搜索框并输入关键字
      await page.keyboard.down("Control");
      await page.keyboard.press("KeyA");
      await page.keyboard.up("Control");
      await page.type(config.selectors.searchInput, config.keyword);

      console.log(`📝 已输入关键字: ${config.keyword}`);

      // 按回车键提交搜索
      await page.keyboard.press("Enter");
      console.log(`🔍 已按回车键提交搜索`);

      // 等待搜索结果加载
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`⏳ 等待搜索结果加载...`);

      // 获取搜索结果信息
      const searchResults = await page.evaluate(() => {
        const results: any = {};

        // 获取搜索结果数量
        try {
          const resultElements = document.querySelectorAll(
            ".result, .c-container, .g",
          );
          results.count = resultElements.length;
        } catch (e) {
          results.count = 0;
        }

        // 获取前几个搜索结果的标题
        try {
          const titles = document.querySelectorAll("h3, .t, .c-title");
          results.titles = Array.from(titles)
            .slice(0, 5)
            .map((el: any) => el.textContent?.trim() || "");
        } catch (e) {
          results.titles = [];
        }

        return results;
      });

      console.log(`📊 搜索结果: ${searchResults.count} 个结果`);

      // 返回结果
      const result: AcquisitionResult = {
        success: true,
        url: config.url,
        pageInfo,
        keyword: config.keyword,
        searchResults,
        timestamp: new Date().toISOString(),
      };

      console.log(`🎉 搜索完成`);
             
       // 测试采集失败的情况（可以注释掉这行来恢复正常）
      // return { success: false, error: "测试采集失败" };
             
      return result;
    } catch (error) {
      console.error(`❌ 搜索失败:`, error);
      throw error;
    } finally {
      console.log(`📄 搜索处理完成，保持浏览器实例运行`);
    }
  }
}
