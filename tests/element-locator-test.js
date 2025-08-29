import { ElementLocator, ExpressionType } from '../dist/utils/locator-uitils.js';

// 模拟 Page 对象
class MockPage {
  constructor() {
    this.elements = new Map();
    this.setupMockElements();
  }

  setupMockElements() {
    // 模拟页面元素
    this.elements.set('#login-button', { id: 'login-button', text: '登录', click: () => console.log('点击登录按钮') });
    this.elements.set('button.btn-primary', { class: 'btn-primary', text: '提交', click: () => console.log('点击提交按钮') });
    this.elements.set('//button[contains(text(), "登录")]', { text: '登录', click: () => console.log('点击登录按钮') });
    this.elements.set('//input[@type="text"]', { type: 'text', value: '', type: (text) => console.log(`输入文本: ${text}`) });
    this.elements.set('搜索', { text: '搜索', click: () => console.log('点击搜索按钮') });
    this.elements.set('button', { tagName: 'BUTTON', text: '按钮1', click: () => console.log('点击按钮1') });
    this.elements.set('button2', { tagName: 'BUTTON', text: '按钮2', click: () => console.log('点击按钮2') });
    this.elements.set('button3', { tagName: 'BUTTON', text: '按钮3', click: () => console.log('点击按钮3') });
  }

  async waitForSelector(selector, options = {}) {
    // 模拟等待选择器
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.elements.has(selector) ? this.elements.get(selector) : null;
  }

  async $x(xpath) {
    // 模拟 XPath 查询
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.elements.has(xpath) ? [this.elements.get(xpath)] : [];
  }

  async evaluate(fn, ...args) {
    // 模拟页面评估
    await new Promise(resolve => setTimeout(resolve, 100));
    return fn(this.elements, ...args);
  }
}

// 测试 ElementLocator 的各种功能
async function testElementLocator() {
  console.log('=== ElementLocator 测试开始 ===\n');

  const mockPage = new MockPage();

  // 1. 测试表达式类型检测
  console.log('1. 测试表达式类型检测:');
  
  const cssType = ElementLocator.detectExpressionType('#login-button');
  console.log(`   CSS选择器 "#login-button": ${cssType === ExpressionType.CSS_SELECTOR ? '✅ 通过' : '❌ 失败'}`);
  
  const xpathType = ElementLocator.detectExpressionType('//button[contains(text(), "登录")]');
  console.log(`   XPath "//button[contains(text(), "登录")]": ${xpathType === ExpressionType.XPATH ? '✅ 通过' : '❌ 失败'}`);
  
  const textType = ElementLocator.detectExpressionType('搜索');
  console.log(`   文本内容 "搜索": ${textType === ExpressionType.TEXT_CONTENT ? '✅ 通过' : '❌ 失败'}\n`);

  // 2. 测试 CSS 选择器定位
  console.log('2. 测试 CSS 选择器定位:');
  try {
    const result = await ElementLocator.locateByCSSSelector(mockPage, '#login-button', { index: 0 });
    console.log(`   定位结果: ${result.success ? '✅ 成功' : '❌ 失败'}`);
    if (result.success && result.element) {
      console.log(`   找到元素: ${result.element.text}`);
    }
  } catch (error) {
    console.log(`   ❌ 定位失败: ${error.message}`);
  }
  console.log('');

  // 3. 测试 XPath 定位
  console.log('3. 测试 XPath 定位:');
  try {
    const result = await ElementLocator.locateByXPath(mockPage, '//button[contains(text(), "登录")]', { index: 0 });
    console.log(`   定位结果: ${result.success ? '✅ 成功' : '❌ 失败'}`);
    if (result.success && result.element) {
      console.log(`   找到元素: ${result.element.text}`);
    }
  } catch (error) {
    console.log(`   ❌ 定位失败: ${error.message}`);
  }
  console.log('');

  // 4. 测试文本内容定位
  console.log('4. 测试文本内容定位:');
  try {
    const result = await ElementLocator.locateByTextContent(mockPage, '搜索', { index: 0 });
    console.log(`   定位结果: ${result.success ? '✅ 成功' : '❌ 失败'}`);
    if (result.success && result.element) {
      console.log(`   找到元素: ${result.element.text}`);
    }
  } catch (error) {
    console.log(`   ❌ 定位失败: ${error.message}`);
  }
  console.log('');

  // 5. 测试便捷方法
  console.log('5. 测试便捷方法:');
  
  // 测试 locateByText
  try {
    const textResult = await ElementLocator.locateByText(mockPage, '登录', { exact: false, index: 0 });
    console.log(`   locateByText: ${textResult.success ? '✅ 成功' : '❌ 失败'}`);
  } catch (error) {
    console.log(`   locateByText: ❌ 失败 - ${error.message}`);
  }

  // 测试 locateByAttribute
  try {
    const attrResult = await ElementLocator.locateByAttribute(mockPage, 'login', { index: 0 });
    console.log(`   locateByAttribute: ${attrResult.success ? '✅ 成功' : '❌ 失败'}`);
  } catch (error) {
    console.log(`   locateByAttribute: ❌ 失败 - ${error.message}`);
  }

  // 测试 locateByXPathText
  try {
    const xpathResult = await ElementLocator.locateByXPathText(mockPage, '搜索', { index: 0 });
    console.log(`   locateByXPathText: ${xpathResult.success ? '✅ 成功' : '❌ 失败'}`);
  } catch (error) {
    console.log(`   locateByXPathText: ❌ 失败 - ${error.message}`);
  }
  console.log('');

  // 6. 测试自动识别定位
  console.log('6. 测试自动识别定位:');
  try {
    const result = await ElementLocator.locateElement(mockPage, {
      expression: '#login-button',
      index: 0,
      timeout: 5000
    });
    console.log(`   自动识别CSS选择器: ${result.success ? '✅ 成功' : '❌ 失败'}`);
  } catch (error) {
    console.log(`   自动识别CSS选择器: ❌ 失败 - ${error.message}`);
  }

  try {
    const result = await ElementLocator.locateElement(mockPage, {
      expression: '//button[contains(text(), "登录")]',
      index: 0
    });
    console.log(`   自动识别XPath: ${result.success ? '✅ 成功' : '❌ 失败'}`);
  } catch (error) {
    console.log(`   自动识别XPath: ❌ 失败 - ${error.message}`);
  }

  try {
    const result = await ElementLocator.locateElement(mockPage, {
      expression: '搜索',
      index: 0
    });
    console.log(`   自动识别文本内容: ${result.success ? '✅ 成功' : '❌ 失败'}`);
  } catch (error) {
    console.log(`   自动识别文本内容: ❌ 失败 - ${error.message}`);
  }
  console.log('');

  // 7. 测试指定表达式类型
  console.log('7. 测试指定表达式类型:');
  try {
    const result = await ElementLocator.locateElement(mockPage, {
      expression: 'button.btn-primary',
      expressionType: ExpressionType.CSS_SELECTOR,
      index: 0
    });
    console.log(`   指定CSS选择器类型: ${result.success ? '✅ 成功' : '❌ 失败'}`);
  } catch (error) {
    console.log(`   指定CSS选择器类型: ❌ 失败 - ${error.message}`);
  }

  try {
    const result = await ElementLocator.locateElement(mockPage, {
      expression: '//input[@type="text"]',
      expressionType: ExpressionType.XPATH,
      index: 0
    });
    console.log(`   指定XPath类型: ${result.success ? '✅ 成功' : '❌ 失败'}`);
  } catch (error) {
    console.log(`   指定XPath类型: ❌ 失败 - ${error.message}`);
  }
  console.log('');

  // 8. 测试错误处理
  console.log('8. 测试错误处理:');
  try {
    const result = await ElementLocator.locateElement(mockPage, {
      expression: '#non-existent-element',
      timeout: 1000
    });
    console.log(`   不存在的元素: ${!result.success ? '✅ 正确处理' : '❌ 应该失败'}`);
    if (!result.success) {
      console.log(`   错误信息: ${result.error}`);
    }
  } catch (error) {
    console.log(`   不存在的元素: ❌ 异常 - ${error.message}`);
  }
  console.log('');

  console.log('=== ElementLocator 测试完成 ===');
}

// 运行测试
testElementLocator().catch(console.error);
