/**
 * 页面操作配置管理
 */

import { Task, OperationType } from "../types/index.js";

/**
 * 页面操作任务配置
 */
export interface ActionTask extends Task {
  description?: string; // 任务描述
}

/**
 * 页面操作配置 - 配置名对应任务列表
 */
export interface ActionConfig {
  [configName: string]: ActionTask[];
}

/**
 * 预定义的页面操作配置
 */
export const actionConfigs: ActionConfig = {
  // 百度搜索操作
  baidu_search: [
    {
      url: 'https://www.baidu.com',
      taskName: '百度搜索操作',
      description: '在百度首页进行搜索操作',
      waitTime: 2000,
      operations: [
        {
          type: OperationType.CLICK,
          selector: '#kw',
        },
        {
          type: OperationType.KEYBOARD,
          key: 'Input',
          value: '人工智能',
        },
        {
          type: OperationType.CLICK,
          selector: '#su',
        }
      ]
    },
  ],

};

/**
 * 获取页面操作配置
 * @param configName 配置名称
 * @returns 页面操作任务列表
 */
export function getActionConfig(configName: string): ActionTask[] {
  return actionConfigs[configName] || [];
}
