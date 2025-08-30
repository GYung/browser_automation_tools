import type { Page, ElementHandle } from "puppeteer-core";

/**
 * 表达式类型枚举
 */
export enum ExpressionType {
  CSS_SELECTOR = 'css_selector',
  XPATH = 'xpath',
  TEXT_CONTENT = 'text_content'
}

/**
 * 元素定位配置接口
 */
export interface ElementLocatorConfig {
  expression: string; // 定位表达式
  expressionType?: ExpressionType; // 表达式类型，如果不指定则自动识别
  parentSelector?: string | undefined; // 父元素选择器，用于缩小搜索范围
  index?: number | undefined; // 如果有多个匹配元素，选择第几个（从0开始）
  timeout?: number | undefined; // 等待超时时间
  scrollIntoView?: boolean | undefined; // 是否滚动到元素位置
}

/**
 * 元素定位结果接口
 */
export interface ElementLocatorResult {
  success: boolean;
  element?: ElementHandle<Element>;
  error?: string;
  matchedCount?: number; // 匹配的元素数量
}

/**
 * 智能元素定位工具类
 * 解决没有固定唯一标识的元素定位问题
 */
export class LocatorUtils {
  /**
   * 智能定位元素 - 自动识别表达式类型
   */
  static async locateElement(page: Page, config: ElementLocatorConfig): Promise<ElementLocatorResult> {
    try {
      const expressionType = config.expressionType || this.detectExpressionType(config.expression);
      console.log(`🔍 使用表达式类型 ${expressionType} 定位元素: ${config.expression}`);
      
      let elements: ElementHandle<Element>[];
      const timeout = config.timeout || 10000;
      
      // 根据表达式类型进行定位
      switch (expressionType) {
        case ExpressionType.CSS_SELECTOR:
          elements = await this.locateByCSSSelector(page, config.expression, config.parentSelector, timeout);
          break;
        case ExpressionType.XPATH:
          elements = await this.locateByXPath(page, config.expression, config.parentSelector, timeout);
          break;
        case ExpressionType.TEXT_CONTENT:
          elements = await this.locateByTextContent(page, config.expression, config.parentSelector, timeout);
          break;
        default:
          throw new Error(`不支持的表达式类型: ${expressionType}`);
      }
      
      // 选择指定索引的元素
      const targetIndex = config.index || 0;
      if (targetIndex >= elements.length) {
        throw new Error(`索引 ${targetIndex} 超出范围，总共找到 ${elements.length} 个元素`);
      }
      
      const element = elements[targetIndex];
      
      // 所有定位方法都已经在各自的实现中等待了元素，这里不需要重复等待
      console.log(`✅ 元素定位完成，已在定位时等待元素出现`);
      
      // 滚动到元素位置
      if (config.scrollIntoView && element) {
        try {
          await element.scrollIntoView();
        } catch (error) {
          console.warn(`⚠️ 滚动到元素位置失败: ${error}`);
        }
      }
      
      console.log(`✅ 成功定位元素，匹配数量: ${elements.length}`);
      
      return {
        success: true,
        element: element!,
        matchedCount: elements.length
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ 元素定位失败: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * 自动检测表达式类型
   */
  private static detectExpressionType(expression: string): ExpressionType {
    // XPath 检测规则
    if (expression.startsWith('//') || expression.startsWith('./') || expression.startsWith('../')) {
      return ExpressionType.XPATH;
    }
    
    // CSS 选择器检测规则
    if (expression.includes('#') || expression.includes('.') || 
        expression.includes('[') || expression.includes('>') || 
        expression.includes('+') || expression.includes('~') ||
        /^[a-zA-Z][a-zA-Z0-9-]*$/.test(expression)) {
      return ExpressionType.CSS_SELECTOR;
    }
    
    // 默认为文本内容
    return ExpressionType.TEXT_CONTENT;
  }
  
  /**
   * 通过CSS选择器定位元素
   */
  private static async locateByCSSSelector(page: Page, selector: string, parentSelector?: string, timeout: number = 10000): Promise<ElementHandle<Element>[]> {
    const fullSelector = parentSelector ? `${parentSelector} ${selector}` : selector;
    await page.waitForSelector(fullSelector, { timeout });
    return await page.$$(fullSelector);
  }
  
  /**
   * 通过XPath定位元素
   */
  private static async locateByXPath(page: Page, xpath: string, parentSelector?: string, timeout: number = 10000): Promise<ElementHandle<Element>[]> {
    let fullXPath = xpath;
    
    // 如果指定了父选择器，需要将CSS选择器转换为XPath上下文
    if (parentSelector) {
      // 简化处理：在父元素内查找
      fullXPath = `(${parentSelector})${xpath.startsWith('//') ? xpath.substring(1) : xpath}`;
    }
    
    // 使用 Puppeteer 官方支持的 XPath 语法
    const xpathSelector = `::-p-xpath(${fullXPath})`;
    
    try {
      // 等待元素出现
      await page.waitForSelector(xpathSelector, { timeout });
      // 获取所有匹配的元素
      return await page.$$(xpathSelector);
    } catch (error) {
      console.warn(`⚠️ XPath 定位失败，尝试备用方法: ${error}`);
      
      // 备用方法：使用 page.evaluate()
      const elements = await page.evaluate((xpath) => {
        const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        const elements = [];
        for (let i = 0; i < result.snapshotLength; i++) {
          elements.push(result.snapshotItem(i));
        }
        return elements;
      }, fullXPath);
      
      // 将DOM元素转换为ElementHandle
      const elementHandles: ElementHandle<Element>[] = [];
      for (const element of elements) {
        if (element) {
          const handle = await page.evaluateHandle((el) => el, element);
          elementHandles.push(handle as ElementHandle<Element>);
        }
      }
      
      return elementHandles;
    }
  }
  
  /**
   * 通过文本内容定位元素
   * 将纯文本转换为 XPath 表达式来查找包含该文本的元素
   */
  private static async locateByTextContent(page: Page, text: string, parentSelector?: string, timeout: number = 10000): Promise<ElementHandle<Element>[]> {
    const escapedText = this.escapeXPath(text);
    // 构建 XPath：查找包含指定文本的元素（文本内容、aria-label、title 等）
    const xpath = `//*[contains(text(), "${escapedText}") or contains(@aria-label, "${escapedText}") or contains(@title, "${escapedText}")]`;
    
    let fullXPath = xpath;
    if (parentSelector) {
      fullXPath = `(${parentSelector})${xpath.substring(1)}`;
    }
    
    // 使用 Puppeteer 官方支持的 XPath 语法
    const xpathSelector = `::-p-xpath(${fullXPath})`;
    
    try {
      // 等待元素出现
      await page.waitForSelector(xpathSelector, { timeout });
      // 获取所有匹配的元素
      return await page.$$(xpathSelector);
    } catch (error) {
      console.warn(`⚠️ 文本内容 XPath 定位失败，尝试备用方法: ${error}`);
      
      // 备用方法：使用 page.evaluate()
      const elements = await page.evaluate((xpath) => {
        const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        const elements = [];
        for (let i = 0; i < result.snapshotLength; i++) {
          elements.push(result.snapshotItem(i));
        }
        return elements;
      }, fullXPath);
      
      // 将DOM元素转换为ElementHandle
      const elementHandles: ElementHandle<Element>[] = [];
      for (const element of elements) {
        if (element) {
          const handle = await page.evaluateHandle((el) => el, element);
          elementHandles.push(handle as ElementHandle<Element>);
        }
      }
      
      return elementHandles;
    }
  }
  
  /**
   * 转义XPath中的特殊字符
   */
  private static escapeXPath(text: string): string {
    return text.replace(/"/g, '\\"');
  }
  
  /**
   * 获取元素的详细信息（用于调试）
   */
  static async getElementInfo(page: Page, element: ElementHandle<Element>): Promise<any> {
    return await page.evaluate((el) => {
      return {
        tagName: el.tagName.toLowerCase(),
        id: el.id,
        className: el.className,
        textContent: el.textContent?.trim().substring(0, 100),
        innerHTML: el.innerHTML?.substring(0, 200),
        attributes: Array.from(el.attributes).map(attr => ({
          name: attr.name,
          value: attr.value
        })),
        boundingBox: el.getBoundingClientRect()
      };
    }, element);
  }
}
