import * as fs from 'fs/promises';
import * as path from 'path';
import type { Page } from 'puppeteer-core';

/**
 * Cookie 数据结构
 */
export interface CookieData {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * 保存的 Cookie 配置
 */
export interface SavedCookieConfig {
  domain: string;
  cookies: CookieData[];
  savedAt: string;
  expiresAt?: string;
}

/**
 * Cookie 管理器
 * 负责保存和加载登录状态的 cookies
 */
export class CookieManager {
  private static readonly COOKIE_DIR = './cookies';
  private static readonly COOKIE_FILE_PREFIX = 'cookies_';

  /**
   * 保存当前页面的 cookies 到本地文件
   * @param page Puppeteer 页面实例
   * @param domain 域名标识（用于文件名）
   * @param expiresInDays 过期天数（默认30天）
   */
  static async saveCookies(page: Page, domain: string, expiresInDays: number = 30): Promise<void> {
    try {
      console.log(`🍪 开始保存 cookies 到本地...`);
      
      // 获取当前页面的所有 cookies
      const cookies = await page.cookies();
      
      if (cookies.length === 0) {
        console.log(`⚠️ 没有找到 cookies，跳过保存`);
        return;
      }

      // 确保 cookies 目录存在
      await fs.mkdir(this.COOKIE_DIR, { recursive: true });

      // 构建保存的 cookie 配置
      const cookieConfig: SavedCookieConfig = {
        domain: domain,
        cookies: cookies.map(cookie => ({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          expires: cookie.expires,
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          sameSite: cookie.sameSite as 'Strict' | 'Lax' | 'None',
        })),
        savedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString(),
      };

      // 保存到文件
      const fileName = `${this.COOKIE_FILE_PREFIX}${this.sanitizeDomain(domain)}.json`;
      const filePath = path.join(this.COOKIE_DIR, fileName);
      
      await fs.writeFile(filePath, JSON.stringify(cookieConfig, null, 2), 'utf8');
      
      console.log(`✅ Cookies 保存成功: ${filePath}`);
      console.log(`📊 保存了 ${cookies.length} 个 cookies`);
    } catch (error) {
      console.error(`❌ 保存 cookies 失败:`, error);
      throw error;
    }
  }

  /**
   * 从本地文件加载 cookies 并设置到浏览器
   * @param browser Puppeteer 浏览器实例
   * @param domain 域名标识
   * @returns 是否成功加载
   */
  static async loadCookiesToBrowser(browser: any, domain: string): Promise<boolean> {
    try {
      console.log(`🍪 尝试加载本地 cookies 到浏览器...`);
      
      const fileName = `${this.COOKIE_FILE_PREFIX}${this.sanitizeDomain(domain)}.json`;
      const filePath = path.join(this.COOKIE_DIR, fileName);
      
      // 检查文件是否存在
      try {
        await fs.access(filePath);
      } catch {
        console.log(`⚠️ Cookie 文件不存在: ${filePath}`);
        return false;
      }

      // 读取 cookie 配置
      const fileContent = await fs.readFile(filePath, 'utf8');
      const cookieConfig: SavedCookieConfig = JSON.parse(fileContent);

      // 检查是否过期
      if (cookieConfig.expiresAt && new Date(cookieConfig.expiresAt) < new Date()) {
        console.log(`⚠️ Cookies 已过期，删除过期文件`);
        await fs.unlink(filePath);
        return false;
      }

      // 使用新的 API 设置 cookies 到浏览器
      const cookies = cookieConfig.cookies.map(cookie => ({
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain || '',
        path: cookie.path || '/',
        expires: cookie.expires || Math.floor(Date.now() / 1000) + 86400, // 默认1天过期
        httpOnly: cookie.httpOnly || false,
        secure: cookie.secure || false,
        sameSite: cookie.sameSite || 'Lax'
      }));
      await browser.setCookie(...cookies);
      
      console.log(`✅ Cookies 加载成功: ${filePath}`);
      console.log(`📊 加载了 ${cookieConfig.cookies.length} 个 cookies`);
      console.log(`🕒 保存时间: ${cookieConfig.savedAt}`);
      
      return true;
    } catch (error) {
      console.error(`❌ 加载 cookies 失败:`, error);
      return false;
    }
  }



  /**
   * 检查是否有可用的 cookies
   * @param domain 域名标识
   * @returns 是否有可用的 cookies
   */
  static async hasValidCookies(domain: string): Promise<boolean> {
    try {
      const fileName = `${this.COOKIE_FILE_PREFIX}${this.sanitizeDomain(domain)}.json`;
      const filePath = path.join(this.COOKIE_DIR, fileName);
      
      await fs.access(filePath);
      
      const fileContent = await fs.readFile(filePath, 'utf8');
      const cookieConfig: SavedCookieConfig = JSON.parse(fileContent);

      // 检查是否过期
      if (cookieConfig.expiresAt && new Date(cookieConfig.expiresAt) < new Date()) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * 删除指定域名的 cookies 文件
   * @param domain 域名标识
   */
  static async deleteCookies(domain: string): Promise<void> {
    try {
      const fileName = `${this.COOKIE_FILE_PREFIX}${this.sanitizeDomain(domain)}.json`;
      const filePath = path.join(this.COOKIE_DIR, fileName);
      
      await fs.unlink(filePath);
      console.log(`🗑️ Cookies 文件已删除: ${filePath}`);
    } catch (error) {
      console.error(`❌ 删除 cookies 文件失败:`, error);
    }
  }

  /**
   * 清理过期的 cookies 文件
   */
  static async cleanupExpiredCookies(): Promise<void> {
    try {
      console.log(`🧹 开始清理过期的 cookies 文件...`);
      
      const files = await fs.readdir(this.COOKIE_DIR);
      let deletedCount = 0;

      for (const file of files) {
        if (file.startsWith(this.COOKIE_FILE_PREFIX) && file.endsWith('.json')) {
          const filePath = path.join(this.COOKIE_DIR, file);
          
          try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            const cookieConfig: SavedCookieConfig = JSON.parse(fileContent);

            if (cookieConfig.expiresAt && new Date(cookieConfig.expiresAt) < new Date()) {
              await fs.unlink(filePath);
              deletedCount++;
              console.log(`🗑️ 删除过期文件: ${file}`);
            }
          } catch (error) {
            console.error(`❌ 处理文件失败: ${file}`, error);
          }
        }
      }

      console.log(`✅ 清理完成，删除了 ${deletedCount} 个过期文件`);
    } catch (error) {
      console.error(`❌ 清理过期 cookies 失败:`, error);
    }
  }

  /**
   * 获取域名标识（用于文件名）
   * @param domain 域名
   * @returns 安全的文件名
   */
  private static sanitizeDomain(domain: string): string {
    return domain.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  /**
   * 从 URL 提取域名
   * @param url URL
   * @returns 域名
   */
  static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      // 如果不是有效的 URL，尝试提取域名
      const match = url.match(/^(?:https?:\/\/)?([^\/]+)/);
      return match && match[1] ? match[1] : url;
    }
  }
}
