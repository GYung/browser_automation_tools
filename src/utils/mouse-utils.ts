import type { ElementHandle, Page } from 'puppeteer-core';
import { LocatorUtils } from './locator-utils.js';

/**
 * 鼠标移动配置选项
 */
export interface MouseMoveOptions {
  duration?: number; // 移动持续时间（毫秒）
  steps?: number;    // 移动步数
  delay?: number;    // 移动后延迟（毫秒）
}

/**
 * 鼠标工具类
 * 提供鼠标移动功能
 */
export class MouseUtils {

  /**
   * 静态方法：移动到元素中心（通过选择器定位）
   * @param page Puppeteer页面实例
   * @param selector 元素选择器
   * @param options 移动选项
   */
   static async moveToElementCenter(page: Page, selector: string, options: MouseMoveOptions = {}): Promise<void> {
    try {
      console.log(`🖱️ 移动到元素中心: ${selector}`);
      
      // 使用 LocatorUtils 定位元素
      const locateResult = await LocatorUtils.locateElement(page, {
        expression: selector,
        timeout: 10000,
        scrollIntoView: true
      });
      
      if (!locateResult.success || !locateResult.element) {
        throw new Error(`元素定位失败: ${locateResult.error || '未找到元素'}`);
      }
      
      // 获取元素的位置和尺寸
      const boundingBox = await locateResult.element.boundingBox();
      if (!boundingBox) {
        throw new Error('无法获取元素边界框');
      }

      // 计算元素中心点
      const centerX = boundingBox.x + boundingBox.width / 2;
      const centerY = boundingBox.y + boundingBox.height / 2;

      console.log(`🖱️ 移动到元素中心: (${centerX.toFixed(2)}, ${centerY.toFixed(2)})`);

      // 执行移动
      const { steps = 10 } = options;
      await page.mouse.move(centerX, centerY, { steps });

      console.log('✅ 鼠标移动完成');
    } catch (error) {
      console.error('❌ 鼠标移动到元素中心失败:', error);
      throw error;
    }
  }

  /**
   * 静态方法：移动到指定坐标
   * @param page Puppeteer页面实例
   * @param x X坐标
   * @param y Y坐标
   * @param options 移动选项
   */
  static async moveToPosition(page: Page, x: number, y: number, options: MouseMoveOptions = {}): Promise<void> {
    try {
      const { duration = 500, steps = 10, delay = 100 } = options;

      console.log(`🖱️ 移动到坐标: (${x}, ${y})`);

      // 执行移动
      await page.mouse.move(x, y, { steps });
      
      // 等待指定时间
      if (duration > 0) {
        await new Promise(resolve => setTimeout(resolve, duration));
      }

      // 移动后延迟
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      console.log('✅ 鼠标移动完成');
    } catch (error) {
      console.error('❌ 鼠标移动到坐标失败:', error);
      throw error;
    }
  }


}
