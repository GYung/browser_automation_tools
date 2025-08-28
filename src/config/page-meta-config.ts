/**
 * 页面元信息配置
 */

import { OperationType,OperationConfig } from "../types/index.js";


/**
 * 元配置
 */
export interface MetaConfig {
  desc: string;
  operations?: Array<OperationConfig>;
}

/**
 * 页面元配置
 */
export interface PageMetaConfig {
  [configName: string]: Map<string , MetaConfig>;
}

/**
 * 预定义页面配置
 */
export const pageMetaConfigs: PageMetaConfig = {
  // 百度相关
  "https://www.baidu.com":new Map<string , MetaConfig>(
    [["search",{
      desc: '搜索',
    operations:[
      {
        type: OperationType.INPUT,
        selector: '#chat-textarea', // 百度搜索框
        value: 'AI写作',
        waitTime: 1000, // 输入后等待1秒
      },{
        type: OperationType.KEYBOARD,
        key: 'Enter', // 按回车键提交搜索
        waitTime: 2000, // 按键后等待2秒
      }
    ]
    }]]
  )
  
  
};

/**
 * 获取截图配置
 * @param configName 配置名称
 * @returns 截图任务列表
 */
export function getMetaConfig(configName: string): Map<string, MetaConfig> {
  return pageMetaConfigs[configName] || new Map();
}
