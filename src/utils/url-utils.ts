/**
 * URL 工具类
 * 提供 URL 解析、参数修改等功能
 */
export class UrlUtils {

  /**
   * 获取 URL 查询参数
   * @param url URL 字符串
   * @returns 查询参数对象
   */
  public static getUrlParams(url: string): Record<string, string> {
    try {
      const urlObj = new URL(url);
      const params: Record<string, string> = {};
      
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      return params;
    } catch (error) {
      console.error('获取 URL 参数失败:', error);
      return {};
    }
  }

  /**
   * 更新 URL 查询参数（如果存在则更新，不存在则新增）
   * @param url 原始 URL
   * @param params 要更新的参数对象
   * @returns 修改后的 URL
   */
  public static updateUrlParams(url: string, params: Record<string, string>): string {
    try {
      const urlObj = new URL(url);
      
      Object.entries(params).forEach(([key, value]) => {
        urlObj.searchParams.set(key, value);
      });
      
      return urlObj.toString();
    } catch (error) {
      console.error('更新 URL 参数失败:', error);
      return url;
    }
  }

  /**
   * 移除 URL 查询参数
   * @param url 原始 URL
   * @param paramNames 要移除的参数名数组
   * @returns 修改后的 URL
   */
  public static removeUrlParams(url: string, paramNames: string[]): string {
    try {
      const urlObj = new URL(url);
      
      paramNames.forEach(paramName => {
        urlObj.searchParams.delete(paramName);
      });
      
      return urlObj.toString();
    } catch (error) {
      console.error('移除 URL 参数失败:', error);
      return url;
    }
  }

  /**
   * 检查 URL 是否有效
   * @param url URL 字符串
   * @returns 是否有效
   */
  public static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取 URL 的基础部分（不包含查询参数）
   * @param url URL 字符串
   * @returns 基础 URL
   */
  public static getBaseUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch (error) {
      console.error('获取基础 URL 失败:', error);
      return url;
    }
  }
}
