import type { Page } from "puppeteer-core";

/**
 * 文本元素配置接口
 */
export interface TextElementConfig {
  selector: string;
  name: string;
  attributes?: string[]; // 需要获取的属性，如 ['textContent', 'className', 'id']
}

/**
 * 抓取配置接口
 */
export interface ScrapeConfig {
  url: string;
  waitTime?: number;
  textElements?: TextElementConfig[];
}

/**
 * 抓取结果接口
 */
export interface ScrapeResult {
  success: boolean;
  title: string;
  description: string;
  textElements: Record<string, any[]>;
  error?: string;
}

/**
 * 页面数据抓取工具类
 * 封装页面访问到数据抓取的逻辑
 */
export class ScrapeUtils {
  /**
   * 执行页面数据抓取
   * @param page Puppeteer页面实例
   * @param config 抓取配置
   * @returns 抓取结果
   */
  static async scrapePageData(page: Page, config: ScrapeConfig): Promise<ScrapeResult> {
    console.log(`📊 开始页面数据抓取`);
    console.log(`🌐 目标页面: ${config.url}`);

    try {
      // 访问页面
      console.log(`🔗 正在访问页面...`);
      await page.goto(config.url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });
      console.log(`✅ 页面加载完成`);

      // 等待指定时间
      if (config.waitTime && config.waitTime > 0) {
        console.log(`⏳ 等待 ${config.waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, config.waitTime));
      }

      // 抓取页面数据
      const pageData = await page.evaluate((scrapeConfig) => {
        const result: any = {
          title: "",
          description: "",
          textElements: {},
        };

        // 获取页面标题
        try {
          result.title = document.title || "";
        } catch (e) {
          result.title = "";
        }

        // 获取页面描述
        try {
          const metaDescription = document.querySelector('meta[name="description"]');
          result.description = metaDescription?.getAttribute('content') || "";
        } catch (e) {
          result.description = "";
        }



        // 抓取指定的文本元素
        if (scrapeConfig.textElements && scrapeConfig.textElements.length > 0) {
          scrapeConfig.textElements.forEach((elementConfig) => {
            try {
              const elements = document.querySelectorAll(elementConfig.selector);
              const data = Array.from(elements)
                .map((el: any) => {
                  const item: any = {
                    text: el.textContent?.trim() || "",
                    tag: el.tagName.toLowerCase(),
                  };

                  // 添加指定的属性
                  if (elementConfig.attributes) {
                    elementConfig.attributes.forEach((attr) => {
                      if (attr === 'textContent') {
                        item[attr] = el.textContent?.trim() || "";
                      } else if (attr === 'innerHTML') {
                        item[attr] = el.innerHTML || "";
                      } else if (attr === 'outerHTML') {
                        item[attr] = el.outerHTML || "";
                      } else {
                        item[attr] = el.getAttribute(attr) || el[attr] || "";
                      }
                    });
                  }

                  return item;
                })
                .filter((item) => {
                  // 过滤条件：文本长度大于3个字符，且不是纯空白字符
                  const text = item.text;
                  return text.length > 3 && 
                         text.trim().length > 0 && 
                         !/^\s*$/.test(text);
                })
                .slice(0, 50); // 每个选择器最多取50个元素

              result.textElements[elementConfig.name] = data;
            } catch (e) {
              result.textElements[elementConfig.name] = [];
            }
          });
        }

        return result;
      }, config);

      console.log(`✅ 页面数据抓取完成`);

      return {
        success: true,
        title: pageData.title,
        description: pageData.description,
        textElements: pageData.textElements,
      };
    } catch (error) {
      console.error(`❌ 页面数据抓取失败:`, error);
      return {
        success: false,
        title: "",
        description: "",
        textElements: {},
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
