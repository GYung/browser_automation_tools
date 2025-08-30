import type { Page } from "puppeteer-core";
/**
 * 按键配置接口
 */
export interface KeyConfig {
  selector?: string; // 目标元素选择器（可选，如果不提供则在当前焦点元素上按键）
  key: string; // 按键名称，如 'Enter', 'Tab', 'Escape' 等
  value?: string; // 要输入的文本内容
  waitTime?: number; // 按键后等待时间
  timeout?: number; // 等待元素出现的超时时间
}

/**
 * 操作结果接口
 */
export interface PressResult {
  success: boolean;
  error?: string;
}

/**
 * 输入工具类
 * 封装页面输入相关的操作
 */
export class KeyboardUtils {

  /**
   * 按键操作
   * @param page Puppeteer页面实例
   * @param config 按键配置
   * @returns 操作结果
   */
  static async pressKey(page: Page, config: KeyConfig): Promise<PressResult> {
    try {
      const {key, waitTime = 0, timeout = 10000 } = config;
      
      console.log(`⌨️ 按键: ${key}`);
      
      // 按键
      await page.keyboard.press(key as any);
      console.log(`✅ 按键完成: ${key}`);

      // 等待指定时间
      if (waitTime > 0) {
        console.log(`⏳ 等待 ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ 按键失败: ${errorMessage}`);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  /**
   * 文本输入操作
   * @param page Puppeteer页面实例
   * @param config 文本输入配置
   * @returns 操作结果
   */
  static async inputText(page: Page, config: KeyConfig): Promise<PressResult> {
    try {
      const {value, waitTime = 0, timeout = 10000 } = config;
      
      console.log(`⌨️ 键盘输入文本: "${value}"`);
      
    
      // 输入文本
      await page.keyboard.type(value || '');
      console.log(`✅ 文本输入完成: "${value}"`);

      // 等待指定时间
      if (waitTime > 0) {
        console.log(`⏳ 等待 ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ 文本输入失败: ${errorMessage}`);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

}
