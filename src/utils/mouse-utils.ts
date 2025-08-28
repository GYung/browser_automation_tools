import type { ElementHandle, Page } from 'puppeteer-core';

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
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 移动到元素中心
   * @param element 目标元素
   * @param options 移动选项
   */
  async moveToElementCenter( element: ElementHandle<Element>,options: MouseMoveOptions = {}): Promise<void> {
    try {
      const {steps = 10} = options;

      // 获取元素的位置和尺寸
      const boundingBox = await element.boundingBox();
      if (!boundingBox) {
        throw new Error('无法获取元素边界框');
      }

      // 计算元素中心点
      const centerX = boundingBox.x + boundingBox.width / 2;
      const centerY = boundingBox.y + boundingBox.height / 2;

      console.log(`🖱️ 移动到元素中心: (${centerX.toFixed(2)}, ${centerY.toFixed(2)})`);

      // 执行移动
      await this.page.mouse.move(centerX, centerY, { steps });
      

      console.log('✅ 鼠标移动完成');
    } catch (error) {
      console.error('❌ 鼠标移动到元素中心失败:', error);
      throw error;
    }
  }

  /**
   * 移动到指定坐标
   * @param x X坐标
   * @param y Y坐标
   * @param options 移动选项
   */
  async moveToPosition(
    x: number,
    y: number,
    options: MouseMoveOptions = {}
  ): Promise<void> {
    try {
      const { duration = 500, steps = 10, delay = 100 } = options;

      console.log(`🖱️ 移动到坐标: (${x}, ${y})`);

      // 执行移动
      await this.page.mouse.move(x, y, { steps });
      
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
