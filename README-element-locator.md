# ElementLocator 智能元素定位工具

## 概述

`ElementLocator` 是一个智能的元素定位工具，能够自动识别传入的表达式类型（XPath 或 CSS 选择器），并安全地支持这两种表达式。它解决了 Puppeteer 项目中元素没有固定唯一标识的定位问题。

## 主要特性

- 🔍 **自动识别表达式类型**: 自动检测 XPath、CSS 选择器、文本内容等
- 🛡️ **安全定位**: 支持多种定位策略，提高定位成功率
- 🔄 **备用策略**: 当主策略失败时，自动尝试备用策略
- 📍 **父元素范围**: 支持在指定父元素内搜索，提高定位精度
- 🎯 **多元素处理**: 支持从多个匹配元素中选择指定索引的元素
- ⏱️ **超时控制**: 可配置等待超时时间
- 👁️ **可见性检查**: 支持等待元素可见和滚动到元素位置

## 表达式类型

### 1. CSS 选择器 (ExpressionType.CSS_SELECTOR)
```typescript
// 自动识别为 CSS 选择器
"#login-button"           // ID 选择器
".btn-primary"            // 类选择器
"button[type='submit']"   // 属性选择器
"form > input"            // 子选择器
```

### 2. XPath (ExpressionType.XPATH)
```typescript
// 自动识别为 XPath
"//button[contains(text(), '登录')]"     // 文本包含
"//input[@type='text']"                  // 属性匹配
"//div[@class='container']//button"      // 嵌套查找
"//*[@id='submit']"                      // 通配符
```

### 3. 文本内容 (ExpressionType.TEXT_CONTENT)
```typescript
// 自动识别为文本内容
"登录"                    // 纯文本
"搜索"                    // 纯文本
"提交表单"                // 纯文本
```

### 4. 属性值 (ExpressionType.ATTRIBUTE_VALUE)
```typescript
// 自动识别为属性值
"login"                   // 在多个属性中搜索
"submit"                  // 在多个属性中搜索
```

## 基本用法

### 1. 自动识别表达式类型

```typescript
import { ElementLocator } from './element-locator';

// CSS 选择器 - 自动识别
const result1 = await ElementLocator.locateElement(page, {
  expression: "#login-button",
  index: 0,
  timeout: 5000
});

// XPath - 自动识别
const result2 = await ElementLocator.locateElement(page, {
  expression: "//button[contains(text(), '登录')]",
  index: 0
});

// 文本内容 - 自动识别
const result3 = await ElementLocator.locateElement(page, {
  expression: "搜索",
  index: 0
});

if (result1.success && result1.element) {
  await result1.element.click();
}
```

### 2. 指定表达式类型

```typescript
import { ElementLocator, ExpressionType } from './element-locator';

// 强制使用 CSS 选择器
const result = await ElementLocator.locateElement(page, {
  expression: "button.btn-primary",
  expressionType: ExpressionType.CSS_SELECTOR,
  index: 0
});

// 强制使用 XPath
const result2 = await ElementLocator.locateElement(page, {
  expression: "//input[@type='text']",
  expressionType: ExpressionType.XPATH,
  index: 0
});
```

### 3. 使用父选择器缩小范围

```typescript
const result = await ElementLocator.locateElement(page, {
  expression: "提交",
  parentSelector: ".form-container",  // 在表单容器内搜索
  index: 0,
  waitForVisible: true,
  scrollIntoView: true
});
```

### 4. 使用备用策略

```typescript
const result = await ElementLocator.locateElement(page, {
  expression: "#submit-button",
  fallbackStrategies: [
    "button[type='submit']",
    "//button[contains(text(), '提交')]",
    "input[value='提交']"
  ],
  index: 0
});
```

## 便捷方法

### 1. 文本定位

```typescript
// 通过文本内容定位
const result = await ElementLocator.locateByText(page, "登录", {
  exact: false,        // 部分匹配
  index: 0,
  timeout: 5000
});
```

### 2. 属性值定位

```typescript
// 通过属性值定位
const result = await ElementLocator.locateByAttribute(page, "login", {
  index: 0,
  timeout: 5000
});
```

### 3. XPath 文本定位

```typescript
// 通过 XPath 文本定位
const result = await ElementLocator.locateByXPathText(page, "搜索", {
  index: 0,
  timeout: 5000
});
```

## 配置选项

### ElementLocatorConfig 接口

```typescript
interface ElementLocatorConfig {
  expression: string;                    // 定位表达式
  expressionType?: ExpressionType;       // 表达式类型（可选，自动识别）
  parentSelector?: string | undefined;   // 父元素选择器
  index?: number | undefined;            // 元素索引（从0开始）
  timeout?: number | undefined;          // 超时时间（毫秒）
  waitForVisible?: boolean | undefined;  // 是否等待元素可见
  scrollIntoView?: boolean | undefined;  // 是否滚动到元素位置
  fallbackStrategies?: string[] | undefined; // 备用定位策略
}
```

### ElementLocatorResult 接口

```typescript
interface ElementLocatorResult {
  success: boolean;                      // 是否成功
  selector?: string;                     // 使用的选择器
  element?: ElementHandle<Element>;      // 找到的元素
  error?: string;                        // 错误信息
  matchedCount?: number;                 // 匹配的元素数量
}
```

## 错误处理

```typescript
const result = await ElementLocator.locateElement(page, {
  expression: "#non-existent-element",
  timeout: 3000
});

if (!result.success) {
  console.log(`定位失败: ${result.error}`);
  
  // 尝试备用策略
  const fallbackResult = await ElementLocator.locateElement(page, {
    expression: "button",
    fallbackStrategies: ["a", "input"],
    index: 0
  });
  
  if (fallbackResult.success && fallbackResult.element) {
    console.log("备用策略成功");
    await fallbackResult.element.click();
  }
}
```

## 最佳实践

### 1. 使用有意义的表达式
```typescript
// ✅ 好的做法
"#login-button"                    // 明确的 ID
"button[type='submit']"            // 明确的属性
"//button[contains(text(), '登录')]" // 明确的文本

// ❌ 避免的做法
"button"                           // 太宽泛
"div"                             // 太宽泛
"*"                               // 太宽泛
```

### 2. 使用父选择器提高精度
```typescript
// ✅ 好的做法
{
  expression: "提交",
  parentSelector: ".form-container",
  index: 0
}

// ❌ 避免的做法
{
  expression: "提交",  // 可能在页面多个地方找到
  index: 0
}
```

### 3. 使用备用策略提高稳定性
```typescript
// ✅ 好的做法
{
  expression: "#submit-button",
  fallbackStrategies: [
    "button[type='submit']",
    "//button[contains(text(), '提交')]"
  ],
  index: 0
}
```

### 4. 合理设置超时时间
```typescript
// ✅ 好的做法
{
  expression: "#dynamic-content",
  timeout: 10000,  // 给动态内容足够时间加载
  waitForVisible: true
}
```

## 注意事项

1. **表达式识别**: 工具会根据表达式特征自动识别类型，但复杂表达式可能需要手动指定类型
2. **性能考虑**: XPath 查询通常比 CSS 选择器慢，优先使用 CSS 选择器
3. **元素可见性**: 使用 `waitForVisible: true` 确保元素真正可见
4. **滚动处理**: 使用 `scrollIntoView: true` 确保元素在视口内
5. **错误处理**: 始终检查 `result.success` 并处理错误情况

## 示例代码

完整的使用示例请参考 `element-locator-example.ts` 文件。
