import { Task,  OperationType } from "../types/index.js";

/**
 * 接口抓取配置
 */
export interface ScrapeApiConfig {
  url: string; // 接口URL（支持部分匹配）
  name: string; // 接口名称，用于输出展示
  field?: string; // 要读取的返回字段名（如 'data', 'result', 'items' 等）
}

/**
 * 抓取元素配置
 */
export interface ScrapeElementConfig {
  selector: string; // 元素选择器
  name: string; // 自定义名称，用于输出展示
  attributes?: string[]; // 需要获取的属性，如 ['textContent', 'className', 'id']
  index?: number; // 如果有多个匹配元素，选择第几个（从0开始）
  parentSelector?: string; // 父元素选择器，用于缩小搜索范围
  waitTime?: number; // 等待时间
}

/**
 * 抓取任务配置
 */
export interface ScrapeTask extends Task {
  filename?: string; // 输出文件名
  elements?: ScrapeElementConfig[]; // 要抓取的元素配置
  apis?: ScrapeApiConfig[]; // 要监听的接口配置
}

/**
 * 抓取配置 - 配置名对应任务列表
 */
export interface ScrapeConfig {
  [configName: string]: ScrapeTask[];
}

/**
 * 预定义的抓取配置
 */
export const scrapeConfigs: ScrapeConfig = {
  debug:[

  ],
  // 新闻网站抓取
  news: [
    {
      url: 'https://news.baidu.com',
      taskName: 'baidu-news',
      filename: 'baidu-news-data.txt',
      waitTime: 3000,
      elements: [
        {
          selector: '.news-title, .title, h1, h2, h3',
          name: '新闻标题',
          attributes: ['textContent', 'href'],
        },
        {
          selector: '.news-summary, .summary, p',
          name: '新闻摘要',
          attributes: ['textContent'],
        },
        {
          selector: '.news-time, .time, .date',
          name: '发布时间',
          attributes: ['textContent', 'datetime'],
        }
      ]
    },
  ],

};

/**
 * 获取抓取配置
 * @param configName 配置名称
 * @returns 抓取任务列表
 */
export function getScrapeConfig(configName: string): ScrapeTask[] {
  return scrapeConfigs[configName] || [];
}