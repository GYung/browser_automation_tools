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
  baidu_search: [
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

  // 测试截图
  screen: [
    {
      url: 'https://www.baidu.com',
      filename: 'screen_demo.png',
      waitTime: 500,
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
