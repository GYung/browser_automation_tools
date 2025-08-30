import type { Page } from "puppeteer-core";
import { LocatorUtils } from "./locator-utils.js";

/**
 * 输入配置接口
 */
export interface InputConfig {
  selector: string; // 输入框选择器
  value: string; // 要输入的值
  clearFirst?: boolean; // 是否先清空输入框
  waitTime?: number; // 输入后等待时间
  timeout?: number; // 等待元素出现的超时时间
}

/**
 * 按键配置接口
 */
export interface KeyConfig {
  selector?: string; // 目标元素选择器（可选，如果不提供则在当前焦点元素上按键）
  key: string; // 按键名称，如 'Enter', 'Tab', 'Escape' 等
  waitTime?: number; // 按键后等待时间
  timeout?: number; // 等待元素出现的超时时间
}

/**
 * 操作结果接口
 */
export interface InputResult {
  success: boolean;
  error?: string;
}

/**
 * 输入工具类
 * 封装页面输入相关的操作
 */
export class InputUtils {
  /**
   * 输入文本到指定元素
   * @param page Puppeteer页面实例
   * @param config 输入配置
   * @returns 操作结果
   */
  static async inputText(page: Page, config: InputConfig): Promise<InputResult> {
    try {
      const { selector, value, clearFirst = true, waitTime = 0, timeout = 10000 } = config;
      
      console.log(`⌨️ 输入文本: ${value}`);
      
      // 使用 LocatorUtils 定位元素
      const locateResult = await LocatorUtils.locateElement(page, {
        expression: selector,
        timeout: timeout,
        scrollIntoView: true
      });
      
      if (!locateResult.success || !locateResult.element) {
        throw new Error(`元素定位失败: ${locateResult.error || '未找到元素'}`);
      }
      
      // 点击输入框获取焦点
      await locateResult.element.click();
      
      // 清空输入框（如果需要）
      if (clearFirst) {
        await page.keyboard.down('Control');
        await page.keyboard.press('KeyA');
        await page.keyboard.up('Control');
        console.log(`🧹 清空输入框`);
      }
      
      // 输入文本
      await page.keyboard.type(value);
      console.log(`✅ 输入完成: ${value}`);

      // 等待指定时间
      if (waitTime > 0) {
        console.log(`⏳ 等待 ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ 输入失败: ${errorMessage}`);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }
}
