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
export interface ScrapeTask {
  url: string; // 目标URL
  taskName: string; // 任务名称
  filename?: string; // 输出文件名
  waitTime?: number; // 页面加载后等待时间
  elements: ScrapeElementConfig[]; // 要抓取的元素配置
  operations?: Array<{
    type: string;
    key?: string;
    selector?: string;
    value?: string;
    waitTime?: number;
    parentSelector?: string;
    childIndex?: number;
    childSelector?: string;
  }>; // 页面操作配置
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
  // 快速测试抓取
  baidu: [
    {
      url: 'https://www.baidu.com',
      taskName: '快速测试抓取',
      filename: 'quick-test-data.txt',
      waitTime: 3000,
      elements: [
        {
          selector: 'title',
          name: '页面标题',
          attributes: ['textContent'],
        },
        {
          selector: 'h1, h2, h3, h4, h5, h6',
          name: '标题元素',
          attributes: ['textContent'],
        },
        {
          selector: 'p',
          name: '段落文本',
          attributes: ['textContent'],
        },
        {
          selector: 'a',
          name: '链接文本',
          attributes: ['textContent', 'href'],
        },
        {
          selector: 'input',
          name: '输入框',
          attributes: ['placeholder', 'value', 'type'],
        },
        {
          selector: 'button',
          name: '按钮',
          attributes: ['textContent', 'value'],
        }
      ]
    },
  ],
  // 新闻网站抓取
  news: [
    {
      url: 'https://news.baidu.com',
      taskName: '百度新闻抓取',
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

  // 热搜抓取
  hotsearch: [
    {
      url: 'https://www.baidu.com',
      taskName: '百度热搜抓取',
      filename: 'baidu-hotsearch-data.txt',
      waitTime: 3000,
      elements: [
        {
          selector: '#hotsearch-content-wrapper > li:nth-child(1) > a > span.title-content-title',
          name: '热搜第一',
          attributes: ['textContent'],
        },
        {
          selector: '#hotsearch-content-wrapper > li:nth-child(2) > a > span.title-content-title',
          name: '热搜第二',
          attributes: ['textContent'],
        },
        {
          selector: '#hotsearch-content-wrapper > li:nth-child(3) > a > span.title-content-title',
          name: '热搜第三',
          attributes: ['textContent'],
        },
        {
          selector: '#hotsearch-content-wrapper > li:nth-child(4) > a > span.title-content-title',
          name: '热搜第四',
          attributes: ['textContent'],
        },
        {
          selector: '#hotsearch-content-wrapper > li:nth-child(5) > a > span.title-content-title',
          name: '热搜第五',
          attributes: ['textContent'],
        },
        {
          selector: '#hotsearch-content-wrapper li a span.title-content-title',
          name: '所有热搜标题',
          attributes: ['textContent'],
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

/**
 * 获取单个抓取任务
 * @param configName 配置名称
 * @param taskIndex 任务索引
 * @returns 抓取任务
 */
export function getScrapeTask(configName: string, taskIndex: number = 0): ScrapeTask | null {
  const tasks = getScrapeConfig(configName);
  return tasks[taskIndex] || null;
}
