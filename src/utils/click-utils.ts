import type { Page } from "puppeteer-core";
import { LocatorUtils } from "./locator-utils.js";

/**
 * 点击配置接口
 */
export interface ClickConfig {
  selector: string;
  waitTime?: number; // 点击后等待时间
  timeout?: number; // 等待元素出现的超时时间
}

/**
 * 复杂点击配置接口
 */
export interface ComplexClickConfig {
  parentSelector: string; // 父元素选择器
  childIndex?: number; // 子元素索引（从0开始）
  childSelector?: string; // 子元素选择器
  waitTime?: number; // 点击后等待时间
  timeout?: number; // 等待元素出现的超时时间
}

/**
 * 点击结果接口
 */
export interface ClickResult {
  success: boolean;
  error?: string;
}

/**
 * 点击工具类
 * 封装页面点击相关的操作
 */
export class ClickUtils {
  /**
   * 点击页面元素
   * @param page Puppeteer页面实例
   * @param config 点击配置
   * @returns 点击结果
   */
  static async clickElement(page: Page, config: ClickConfig): Promise<ClickResult> {
    try {
      const { selector, waitTime = 0, timeout = 10000 } = config;
      
      console.log(`🎯 点击元素: ${selector}`);
      
      // 使用 LocatorUtils 定位元素
      const locateResult = await LocatorUtils.locateElement(page, {
        expression: selector,
        timeout: timeout,
        scrollIntoView: true
      });
      
      if (!locateResult.success || !locateResult.element) {
        throw new Error(`元素定位失败: ${locateResult.error || '未找到元素'}`);
      }
      
      // 使用 Puppeteer 的 click 方法点击元素
      await locateResult.element.click();
      console.log(`✅ 点击成功`);

      // 等待指定时间
      if (waitTime > 0) {
        console.log(`⏳ 等待 ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ 点击失败: ${errorMessage}`);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  /**
   * 点击多个元素（按顺序）
   * @param page Puppeteer页面实例
   * @param configs 点击配置数组
   * @returns 点击结果数组
   */
  static async clickElements(page: Page, configs: ClickConfig[]): Promise<ClickResult[]> {
    const results: ClickResult[] = [];
    
    for (const config of configs) {
      const result = await this.clickElement(page, config);
      results.push(result);
      
      // 如果点击失败，可以选择是否继续
      if (!result.success) {
        console.warn(`⚠️ 跳过后续点击操作`);
        break;
      }
    }
    
    return results;
  }

  /**
   * 等待元素出现并点击
   * @param page Puppeteer页面实例
   * @param selector 元素选择器
   * @param timeout 超时时间
   * @returns 是否成功
   */
  static async waitAndClick(page: Page, selector: string, timeout = 10000): Promise<boolean> {
    try {
      // 使用 LocatorUtils 定位并点击元素
      const result = await this.clickElement(page, {
        selector: selector,
        timeout: timeout
      });
      return result.success;
    } catch (error) {
      console.warn(`⚠️ 等待并点击失败: ${error}`);
      return false;
    }
  }

  /**
   * 点击父元素的指定子元素
   * @param page Puppeteer页面实例
   * @param config 复杂点击配置
   * @returns 点击结果
   */
  static async clickChildElement(page: Page, config: ComplexClickConfig): Promise<ClickResult> {
    try {
      const { parentSelector, childIndex, childSelector, waitTime = 0, timeout = 10000 } = config;
      
      console.log(`🎯 点击子元素: ${parentSelector} -> ${childIndex !== undefined ? `第${childIndex}个子元素` : childSelector}`);
      
      // 等待父元素出现
      await page.waitForSelector(parentSelector, { timeout });
      
      // 使用JavaScript点击子元素
      const clickResult = await page.evaluate((parentSel, childIdx, childSel) => {
        const parent = document.querySelector(parentSel);
        if (!parent) {
          throw new Error(`找不到父元素: ${parentSel}`);
        }
        
        let targetElement: Element | null = null;
        
                 if (childIdx !== undefined) {
           // 按索引选择子元素
           const children = Array.from(parent.children);
           if (childIdx >= 0 && childIdx < children.length) {
             targetElement = children[childIdx] || null;
           } else {
             throw new Error(`子元素索引超出范围: ${childIdx}, 总共有 ${children.length} 个子元素`);
           }
         } else if (childSel) {
          // 按选择器选择子元素
          targetElement = parent.querySelector(childSel);
          if (!targetElement) {
            throw new Error(`在父元素中找不到子元素: ${childSel}`);
          }
        } else {
          throw new Error('必须指定 childIndex 或 childSelector');
        }
        
        // 点击元素
        (targetElement as HTMLElement).click();
        return true;
      }, parentSelector, childIndex, childSelector);
      
      if (!clickResult) {
        throw new Error('点击操作失败');
      }
      
      console.log(`✅ 点击子元素成功`);

      // 等待指定时间
      if (waitTime > 0) {
        console.log(`⏳ 等待 ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ 点击子元素失败: ${errorMessage}`);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  /**
   * 点击表格行中的指定单元格
   * @param page Puppeteer页面实例
   * @param rowSelector 行选择器（如 'tr'）
   * @param cellIndex 单元格索引（从0开始）
   * @param waitTime 点击后等待时间
   * @returns 点击结果
   */
  static async clickTableCell(page: Page, rowSelector: string, cellIndex: number, waitTime = 0): Promise<ClickResult> {
    return this.clickChildElement(page, {
      parentSelector: rowSelector,
      childIndex: cellIndex,
      waitTime
    });
  }

  /**
   * 点击表格行中的指定单元格（通过选择器）
   * @param page Puppeteer页面实例
   * @param rowSelector 行选择器（如 'tr'）
   * @param cellSelector 单元格选择器（如 'td.button'）
   * @param waitTime 点击后等待时间
   * @returns 点击结果
   */
  static async clickTableCellBySelector(page: Page, rowSelector: string, cellSelector: string, waitTime = 0): Promise<ClickResult> {
    return this.clickChildElement(page, {
      parentSelector: rowSelector,
      childSelector: cellSelector,
      waitTime
    });
  }
}
