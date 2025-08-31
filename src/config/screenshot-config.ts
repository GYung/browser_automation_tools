/**
 * 截图配置管理
 */

import { Task,  OperationType } from "../types/index.js";
import { appConfig } from "./index.js";

/**
 * 截图任务配置
 */
export interface ScreenshotTask extends Task {
  filename: string; // 截图文件名
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
  debug:[
    
  ],
  // 百度相关截图
  baidu: [
    {
      url: 'https://www.baidu.com',
      filename: 'baidu_search_click.png',
      waitTime: 2000,
      operations:[
        {
          type: OperationType.CONFIG,
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
 * @param baseDir 基础目录（可选，默认使用 appConfig.outputDir）
 * @returns 文件路径
 */
export function generateScreenshotPath(filename: string, baseDir?: string): string {
  const outputDir = baseDir || appConfig.outputDir;
  return `${outputDir}/${filename}`;
} 
