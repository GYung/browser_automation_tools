import type { Page } from "puppeteer-core";
import { ElementLocator, ExpressionType } from "./element-locator";

/**
 * ElementLocator 使用示例
 */
export class ElementLocatorExample {
  
  /**
   * 示例1: 自动识别表达式类型
   */
  static async exampleAutoDetect(page: Page) {
    console.log("=== 示例1: 自动识别表达式类型 ===");
    
    // CSS选择器 - 自动识别
    const result1 = await ElementLocator.locateElement(page, {
      expression: "#login-button",
      index: 0,
      timeout: 5000
    });
    
    if (result1.success && result1.element) {
      console.log("✅ CSS选择器定位成功");
      await result1.element.click();
    }
    
    // XPath - 自动识别
    const result2 = await ElementLocator.locateElement(page, {
      expression: "//button[contains(text(), '登录')]",
      index: 0
    });
    
    if (result2.success && result2.element) {
      console.log("✅ XPath定位成功");
      await result2.element.click();
    }
    
    // 文本内容 - 自动识别
    const result3 = await ElementLocator.locateElement(page, {
      expression: "搜索",
      index: 0
    });
    
    if (result3.success && result3.element) {
      console.log("✅ 文本内容定位成功");
      await result3.element.click();
    }
  }
  
  /**
   * 示例2: 指定表达式类型
   */
  static async exampleSpecifyType(page: Page) {
    console.log("=== 示例2: 指定表达式类型 ===");
    
    // 强制使用CSS选择器
    const result1 = await ElementLocator.locateElement(page, {
      expression: "button.btn-primary",
      expressionType: ExpressionType.CSS_SELECTOR,
      index: 0
    });
    
    if (result1.success && result1.element) {
      console.log("✅ 指定CSS选择器类型成功");
      await result1.element.click();
    }
    
    // 强制使用XPath
    const result2 = await ElementLocator.locateElement(page, {
      expression: "//input[@type='text']",
      expressionType: ExpressionType.XPATH,
      index: 0
    });
    
    if (result2.success && result2.element) {
      console.log("✅ 指定XPath类型成功");
      await result2.element.type("测试文本");
    }
  }
  
  /**
   * 示例3: 使用父选择器缩小范围
   */
  static async exampleWithParent(page: Page) {
    console.log("=== 示例3: 使用父选择器缩小范围 ===");
    
    const result = await ElementLocator.locateElement(page, {
      expression: "提交",
      parentSelector: ".form-container",
      index: 0,
      waitForVisible: true,
      scrollIntoView: true
    });
    
    if (result.success && result.element) {
      console.log("✅ 在指定父元素内定位成功");
      await result.element.click();
    }
  }
  
  /**
   * 示例4: 使用备用策略
   */
  static async exampleWithFallback(page: Page) {
    console.log("=== 示例4: 使用备用策略 ===");
    
    const result = await ElementLocator.locateElement(page, {
      expression: "#submit-button",
      fallbackStrategies: [
        "button[type='submit']",
        "//button[contains(text(), '提交')]",
        "input[value='提交']"
      ],
      index: 0
    });
    
    if (result.success && result.element) {
      console.log("✅ 主策略或备用策略定位成功");
      await result.element.click();
    }
  }
  
  /**
   * 示例5: 便捷方法使用
   */
  static async exampleConvenienceMethods(page: Page) {
    console.log("=== 示例5: 便捷方法使用 ===");
    
    // 通过文本定位
    const textResult = await ElementLocator.locateByText(page, "登录", {
      exact: false,
      index: 0
    });
    
    if (textResult.success && textResult.element) {
      console.log("✅ 文本定位成功");
      await textResult.element.click();
    }
    
    // 通过属性值定位
    const attrResult = await ElementLocator.locateByAttribute(page, "login", {
      index: 0
    });
    
    if (attrResult.success && attrResult.element) {
      console.log("✅ 属性值定位成功");
      await attrResult.element.click();
    }
    
    // 通过XPath文本定位
    const xpathResult = await ElementLocator.locateByXPathText(page, "搜索", {
      index: 0
    });
    
    if (xpathResult.success && xpathResult.element) {
      console.log("✅ XPath文本定位成功");
      await xpathResult.element.click();
    }
  }
  
  /**
   * 示例6: 处理多个匹配元素
   */
  static async exampleMultipleElements(page: Page) {
    console.log("=== 示例6: 处理多个匹配元素 ===");
    
    const result = await ElementLocator.locateElement(page, {
      expression: "button",
      index: 2, // 选择第3个按钮
      timeout: 5000
    });
    
    if (result.success && result.element) {
      console.log(`✅ 成功选择第3个按钮，总共找到 ${result.matchedCount} 个按钮`);
      await result.element.click();
    }
  }
  
  /**
   * 示例7: 错误处理
   */
  static async exampleErrorHandling(page: Page) {
    console.log("=== 示例7: 错误处理 ===");
    
    const result = await ElementLocator.locateElement(page, {
      expression: "#non-existent-element",
      timeout: 3000
    });
    
    if (!result.success) {
      console.log(`❌ 定位失败: ${result.error}`);
      
      // 尝试备用策略
      const fallbackResult = await ElementLocator.locateElement(page, {
        expression: "button",
        fallbackStrategies: ["a", "input"],
        index: 0
      });
      
      if (fallbackResult.success && fallbackResult.element) {
        console.log("✅ 备用策略成功");
        await fallbackResult.element.click();
      }
    }
  }
}
