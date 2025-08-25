import puppeteer from 'puppeteer-core';
import { CookieManager } from './cookie-manager.js';
import { appConfig } from '../config/index.js';

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
            console.log('🌐 浏览器已经初始化');
            return;
        }

        console.log('🚀 初始化浏览器...');
        
        console.log(`🔍 使用系统 Chrome: ${appConfig.chromePath}`);
        
        this.browser = await puppeteer.launch({
            executablePath: appConfig.chromePath,
            headless: appConfig.headless,
            defaultViewport: appConfig.viewport,
        });

        // 初始化时处理登录
        await this.initializeLogin();

        this.isInitialized = true;
        console.log('✅ 浏览器初始化完成');
    }

    /**
     * 初始化登录状态
     */
    private async initializeLogin() {
        console.log('🔐 初始化登录状态...');
        
        // 只处理百度登录
        const loginConfig = appConfig.login;
        console.log(`🔐 初始化 ${loginConfig.name} 登录状态...`);
        
        // 检查本地是否有 cookies
        const hasLocalCookies = await CookieManager.hasValidCookies(loginConfig.domain);
        
        if (hasLocalCookies) {
            // 本地有 cookies，注入到浏览器
            console.log(`🍪 发现本地 ${loginConfig.name} cookies，注入到浏览器...`);
            await CookieManager.loadCookiesToBrowser(this.browser, loginConfig.domain);
            console.log(`✅ ${loginConfig.name} 登录状态初始化完成`);
        } else {
            // 本地没有 cookies，跳转到登录页面
            console.log(`🔐 本地没有 ${loginConfig.name} cookies，跳转到登录页面...`);
            const page = await this.browser.newPage();
            await page.goto(loginConfig.loginUrl, {
                waitUntil: 'networkidle2',
                timeout: appConfig.pageLoadTimeout,
            });
            
            // 等待用户登录
            console.log(`⏳ 等待 ${appConfig.loginWaitTimeout / 1000} 秒让用户登录...`);
            await new Promise(resolve => setTimeout(resolve, appConfig.loginWaitTimeout));
            
            // 保存当前页面的 cookies 到本地
            console.log(`💾 保存登录后的 cookies 到本地...`);
            await CookieManager.saveCookies(page, loginConfig.domain);
            
            // 关闭登录页面
            await page.close();
            console.log(`✅ ${loginConfig.name} 登录状态初始化完成`);
        }
    }

    /**
     * 获取浏览器实例
     */
    getBrowser() {
        if (!this.isInitialized || !this.browser) {
            throw new Error('浏览器未初始化，请先调用 initialize() 方法');
        }
        return this.browser;
    }

    /**
     * 关闭浏览器
     */
    async close() {
        if (this.browser) {
            console.log('🔒 关闭浏览器...');
            await this.browser.close();
            this.browser = null;
            this.isInitialized = false;
            console.log('✅ 浏览器已关闭');
        }
    }

    /**
     * 创建新页面
     */
    async newPage() {
        const browser = this.getBrowser();
        const page = await browser.newPage();
        return page;
    }

    /**
     * 创建新页面并导航到指定 URL
     * @param url 目标 URL
     * @returns 页面实例
     */
    async newPageWithUrl(url: string) {
        const page = await this.newPage();
        
        // 直接导航到目标页面（登录状态已在初始化时处理）
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: appConfig.pageLoadTimeout,
        });
        
        return page;
    }




}
