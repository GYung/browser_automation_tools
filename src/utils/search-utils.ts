import type { Page } from "puppeteer-core";

/**
 * 搜索配置接口
 */
export interface SearchConfig {
  inputSelector: string; // 搜索框选择器
  keyword: string; // 搜索关键词
  submitSelector?: string; // 提交按钮选择器（可选，如果不提供则按回车键）
  waitTime?: number; // 搜索后等待时间
  timeout?: number; // 等待元素出现的超时时间
}

/**
 * 搜索结果接口
 */
export interface SearchResult {
  success: boolean;
  error?: string;
}

/**
 * 搜索工具类
 * 封装页面搜索相关的操作
 */
export class SearchUtils {
  /**
   * 执行搜索操作
   * @param page Puppeteer页面实例
   * @param config 搜索配置
   * @returns 搜索结果
   */
  static async performSearch(page: Page, config: SearchConfig): Promise<SearchResult> {
    try {
      const { inputSelector, keyword, submitSelector, waitTime = 2000, timeout = 10000 } = config;
      
      console.log(`🔍 执行搜索: ${keyword}`);
      
      // 等待搜索框出现
      await page.waitForSelector(inputSelector, { timeout });
      
      // 清空搜索框并输入关键词
      await page.click(inputSelector);
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.type(inputSelector, keyword);
      console.log(`✅ 输入搜索关键词: ${keyword}`);

      // 提交搜索
      if (submitSelector) {
        // 点击提交按钮
        await page.waitForSelector(submitSelector, { timeout });
        await page.click(submitSelector);
        console.log(`✅ 点击搜索按钮`);
      } else {
        // 按回车键提交
        await page.keyboard.press('Enter');
        console.log(`✅ 按回车键提交搜索`);
      }

      // 等待搜索结果加载
      if (waitTime > 0) {
        console.log(`⏳ 等待搜索结果加载 ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ 搜索失败: ${errorMessage}`);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  /**
   * 搜索并等待页面加载完成
   * @param page Puppeteer页面实例
   * @param config 搜索配置
   * @returns 搜索结果
   */
  static async searchAndWait(page: Page, config: SearchConfig): Promise<SearchResult> {
    const result = await this.performSearch(page, config);
    
    if (result.success) {
      try {
        // 等待页面加载完成
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log(`✅ 页面加载完成`);
      } catch (error) {
        console.warn(`⚠️ 等待页面加载超时，继续执行`);
      }
    }
    
    return result;
  }
}
