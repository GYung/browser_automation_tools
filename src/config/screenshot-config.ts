/**
 * 截图配置管理
 */


export interface OperationConfig {
  type: string;
  key?: string; // 按键名称，如 'Enter', 'Tab', 'Escape' 等
  selector?: string; // 输入框选择器
  value?: string; // 要输入的值
  waitTime?: number; // 输入后等待时间
  // 复杂点击配置
  parentSelector?: string; // 父元素选择器
  childIndex?: number; // 子元素索引（从0开始）
  childSelector?: string; // 子元素选择器
}

/**
 * 截图任务配置
 */
export interface ScreenshotTask {
  url: string;
  filename: string;
  waitTime: number;
  operations?: Array<OperationConfig>;
}

/**
 * 截图配置 - 配置名对应任务列表
 */
export interface ScreenshotConfig {
  [configName: string]: ScreenshotTask[];
}

/**
 * 预定义的截图配置
 */
export const screenshotConfigs: ScreenshotConfig = {
  // 百度相关截图
  baidu: [
    {
      url: 'https://www.baidu.com',
      filename: 'baidu_search_click.png',
      waitTime: 2000,
      operations:[
        {
          type:'config',
          key: 'search', 
        }
      ]
    },
  ],

  // 快速测试截图
  quick: [
    {
      url: 'https://www.baidu.com',
      filename: 'quick_test.png',
      waitTime: 500,
    },
  ],

  // 复杂点击示例配置
  'click-example': [
    {
      url: 'https://example.com/table',
      filename: 'table_click_example.png',
      waitTime: 2000,
      operations: [
        {
          type: 'click-child',
          parentSelector: 'tr', // 选择tr元素
          childIndex: 1, // 点击第二个td元素（索引从0开始）
          waitTime: 1000,
        },
        {
          type: 'click-child',
          parentSelector: 'tr.button-row', // 选择特定的tr
          childSelector: 'td.action-button', // 点击包含action-button类的td
          waitTime: 1000,
        }
      ]
    },
  ],

  // 多页面截图
  multi: [
    {
      url: 'https://www.baidu.com',
      filename: 'page1.png',
      waitTime: 2000,
    },
    {
      url: 'https://www.google.com',
      filename: 'page2.png',
      waitTime: 2000,
    },
  ],
};

/**
 * 获取截图配置
 * @param configName 配置名称
 * @returns 截图任务列表
 */
export function getScreenshotConfig(configName: string): ScreenshotTask[] {
  return screenshotConfigs[configName] || [];
}

/**
 * 生成截图文件路径
 * @param filename 文件名
 * @param baseDir 基础目录
 * @returns 文件路径
 */
export function generateScreenshotPath(filename: string, baseDir: string = './output'): string {
  return `${baseDir}/${filename}`;
}
