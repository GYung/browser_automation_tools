import puppeteer from "puppeteer";

/**
 * 浏览器管理器
 * 负责管理浏览器实例的生命周期，提供全局访问点
 */
export class BrowserManager {
  private static instance: BrowserManager;
  private browser: any = null;
  private isInitialized: boolean = false;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  /**
   * 初始化浏览器
   */
  async initialize() {
    if (this.isInitialized) {
      console.log("🌐 浏览器已经初始化");
      return;
    }

    console.log("🚀 初始化浏览器...");

    this.browser = await puppeteer.launch({
      headless: false, // 使用有头模式
      defaultViewport: { width: 1920, height: 1080 },
    });

    this.isInitialized = true;
    console.log("✅ 浏览器初始化完成");
  }

  /**
   * 获取浏览器实例
   */
  getBrowser() {
    if (!this.isInitialized || !this.browser) {
      throw new Error("浏览器未初始化，请先调用 initialize() 方法");
    }
    return this.browser;
  }

  /**
   * 关闭浏览器
   */
  async close() {
    if (this.browser) {
      console.log("🔒 关闭浏览器...");
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
      console.log("✅ 浏览器已关闭");
    }
  }

  /**
   * 创建新页面
   */
  async newPage() {
    const browser = this.getBrowser();
    return await browser.newPage();
  }
}
