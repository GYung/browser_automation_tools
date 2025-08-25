/**
 * 截图配置管理
 */

/**
 * 截图任务配置
 */
export interface ScreenshotTask {
  url: string;
  filename: string;
  waitTime: number;
  selector?: string; // 要点击的元素选择器
  clickWaitTime?: number; // 点击后等待时间
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
      filename: 'baidu_homepage.png',
      waitTime: 2000,
    },
    {
      url: 'https://www.baidu.com',
      filename: 'baidu_click_search.png',
      waitTime: 2000,
      selector: '#chat-submit-button', // 百度一下按钮
      clickWaitTime: 3000, // 点击后等待3秒
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
