import type { Page } from "puppeteer-core";

/**
 * 文本元素配置接口
 */
export interface TextElementConfig {
  selector: string;
  name: string;
  attributes?: string[]; // 需要获取的属性，如 ['textContent', 'className', 'id']
}

export interface apiConfig {
  url: string; // 接口URL（支持部分匹配）
  name: string; // 接口名称，用于输出展示
  method?: string; // HTTP方法（GET, POST等）
  fieldName?: string; // 要读取的返回字段名（如 'data', 'result', 'items' 等）
}

/**
 * 抓取配置接口
 */
export interface ScrapeConfig {
  waitTime?: number;
  textElements?: TextElementConfig[];
  apis?: apiConfig[];

}

/**
 * 抓取结果接口
 */
export interface ScrapeResult {
  success: boolean;
  title?: string;
  description?: string;
  textElements?: Record<string, any[]>;
  apiData?: any[],
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
    const {textElements, waitTime} = config;
    if (!textElements || textElements.length === 0) {
      return {
        success: true,
        textElements: {}
      };
    }
    
    try {
      // 等待指定时间
      if (waitTime && waitTime > 0) {
        console.log(`⏳ 等待 ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve,waitTime));
      }

      // 抓取页面数据
      const pageData = await page.evaluate((textElements) => {
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
        if (textElements && textElements.length > 0) {
          textElements.forEach((elementConfig) => {
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
      }, textElements);

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

  /**
   * 抓取 API 数据
   * @param page 页面实例
   * @param config 抓取配置
   * @returns API 数据抓取结果
   */
  static async scrapeApiData(page: any, config: ScrapeConfig): Promise<ScrapeResult> {
    const {apis ,waitTime = 3000} = config;
    const apiData: any[] = [];
    // 如果没有配置 API，直接返回成功状态
    if (!apis || apis.length === 0) {
      return {
        success: true,
        apiData: apiData
      };
    }
    
    console.log(`🔍 开始监听接口请求...`);
    
    // 创建 Promise 来等待数据收集完成
    return new Promise((resolve) => {
      const responseHandler = async (response: any) => {
        const url = response.url();
        
        // 检查是否匹配要监听的接口
        const matchedEndpoint = apis?.find(endpoint => url.startsWith(endpoint.url));
        
        if (matchedEndpoint) {
          try {
            console.log(`📡 捕获接口请求: ${url}`);
            
            // 获取响应数据
            const responseData = await response.json().catch(() => null);
            
            if (responseData) {
              // 读取指定字段的数据
              let extractedData = responseData;
              if (matchedEndpoint.fieldName && responseData[matchedEndpoint.fieldName]) {
                extractedData = responseData[matchedEndpoint.fieldName];
                console.log(`📊 提取字段 '${matchedEndpoint.fieldName}' 的数据`);
              }
              
              apiData.push({
                url: url,
                status: response.status(),
                data: extractedData, // 指定字段数据
              });
              
              console.log(`✅ 接口数据已捕获: ${matchedEndpoint.name || 'unknown'}`);
            }
          } catch (error) {
            console.warn(`⚠️ 解析接口响应失败: ${url}`, error);
          }
        }
      };
      
      // 设置监听器
      page.on('response', responseHandler);
      
      // 等待指定时间让接口请求发生
      console.log(`⏳ 等待 ${waitTime}ms 收集接口数据...`);
      
      setTimeout(() => {
        // 移除监听器避免内存泄漏
        page.off('response', responseHandler);
        
        console.log(`✅ 接口数据监听完成，共捕获 ${apiData.length} 个接口`);
        
        resolve({
          success: true,
          apiData: apiData
        });
      }, waitTime);
    });
  }

}
