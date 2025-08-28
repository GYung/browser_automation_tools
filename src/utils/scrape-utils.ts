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

    try {
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
          debug: [], // 添加调试信息
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
              result.debug.push(`🔍 选择器 ${elementConfig.selector} 找到 ${elements.length} 个元素`);
              
              const data = Array.from(elements)
                .map((el: any) => {
                  const item: any = {
                    text: el.textContent?.trim() || "",
                  };

                  // 添加指定的属性（除了textContent，因为已经有text了）
                  if (elementConfig.attributes) {
                    elementConfig.attributes.forEach((attr) => {
                      if (attr === 'textContent') {
                        // 跳过textContent，因为已经有text了
                        return;
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
                  // 过滤条件：文本不为空且不是纯空白字符
                  const text = item.text;
                  const isValid = text.trim().length > 0 && !/^\s*$/.test(text);
                  if (!isValid && text.trim().length > 0) {
                    result.debug.push(`⚠️ 过滤掉元素: ${item.tag} - "${text}"`);
                  }
                  return isValid;
                })
                .slice(0, 50); // 每个选择器最多取50个元素

              result.debug.push(`✅ ${elementConfig.name}: 找到 ${data.length} 个有效元素`);
              result.textElements[elementConfig.name] = data;
            } catch (e) {
              result.debug.push(`❌ ${elementConfig.name}: 抓取失败 - ${e instanceof Error ? e.message : String(e)}`);
              result.textElements[elementConfig.name] = [];
            }
          });
        }

        return result;
      }, config);

      console.log(`✅ 页面数据抓取完成`);

      // 输出调试信息
      if (pageData.debug && pageData.debug.length > 0) {
        console.log('🔍 调试信息:');
        pageData.debug.forEach((msg: string) => console.log(msg));
      }

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
