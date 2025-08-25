import type { Page } from 'puppeteer-core';

/**
 * 登录配置接口
 */
export interface LoginConfig {
  loginUrl: string;
  username: string;
  password: string;
  selectors: {
    usernameInput: string;
    passwordInput: string;
    submitButton: string;
    successIndicator?: string; // 登录成功的标识元素
  };
  waitTime?: number; // 登录后等待时间
  extraSteps?: LoginStep[]; // 额外的登录步骤（如验证码、二次验证等）
}

/**
 * 登录步骤接口
 */
export interface LoginStep {
  type: 'click' | 'type' | 'wait' | 'select' | 'custom';
  selector?: string;
  value?: string;
  waitTime?: number;
  customAction?: (page: Page) => Promise<void>;
}

/**
 * 登录结果接口
 */
export interface LoginResult {
  success: boolean;
  message: string;
  error?: string;
  cookies?: any[];
}

/**
 * 登录工具类
 * 处理各种网站的登录流程
 */
export class LoginUtils {
  /**
   * 执行登录操作
   * @param page Puppeteer页面实例
   * @param config 登录配置
   * @returns 登录结果
   */
  static async login(page: Page, config: LoginConfig): Promise<LoginResult> {
    console.log(`🔐 开始登录流程`);
    console.log(`🌐 登录页面: ${config.loginUrl}`);

    try {
      // 访问登录页面
      console.log(`🔗 正在访问登录页面...`);
      await page.goto(config.loginUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      console.log(`✅ 登录页面加载完成`);

      // 等待登录表单加载
      await page.waitForSelector(config.selectors.usernameInput, { timeout: 10000 });
      await page.waitForSelector(config.selectors.passwordInput, { timeout: 10000 });

      // 清空输入框并输入用户名
      console.log(`👤 输入用户名...`);
      await this.clearAndType(page, config.selectors.usernameInput, config.username);

      // 清空输入框并输入密码
      console.log(`🔒 输入密码...`);
      await this.clearAndType(page, config.selectors.passwordInput, config.password);

      // 执行额外的登录步骤（如验证码等）
      if (config.extraSteps && config.extraSteps.length > 0) {
        console.log(`🔄 执行额外登录步骤...`);
        for (const step of config.extraSteps) {
          await this.executeLoginStep(page, step);
        }
      }

      // 点击登录按钮
      console.log(`🚀 提交登录表单...`);
      await page.click(config.selectors.submitButton);

      // 等待登录结果
      if (config.waitTime && config.waitTime > 0) {
        console.log(`⏳ 等待登录处理...`);
        await new Promise(resolve => setTimeout(resolve, config.waitTime));
      }

      // 检查登录是否成功
      const loginSuccess = await this.checkLoginSuccess(page, config);

      if (loginSuccess) {
        console.log(`🎉 登录成功！`);
        const cookies = await page.cookies();
        return {
          success: true,
          message: '登录成功',
          cookies
        };
      } else {
        console.log(`❌ 登录失败`);
        return {
          success: false,
          message: '登录失败，请检查用户名和密码'
        };
      }

    } catch (error) {
      console.error(`❌ 登录过程中发生错误:`, error);
      return {
        success: false,
        message: '登录过程中发生错误',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 清空输入框并输入文本
   */
  private static async clearAndType(page: Page, selector: string, text: string): Promise<void> {
    await page.click(selector);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.type(selector, text);
  }

  /**
   * 执行登录步骤
   */
  private static async executeLoginStep(page: Page, step: LoginStep): Promise<void> {
    switch (step.type) {
      case 'click':
        if (step.selector) {
          await page.click(step.selector);
        }
        break;
      case 'type':
        if (step.selector && step.value) {
          await this.clearAndType(page, step.selector, step.value);
        }
        break;
      case 'wait':
        await new Promise(resolve => setTimeout(resolve, step.waitTime || 1000));
        break;
      case 'select':
        if (step.selector && step.value) {
          await page.select(step.selector, step.value);
        }
        break;
      case 'custom':
        if (step.customAction) {
          await step.customAction(page);
        }
        break;
    }
  }

  /**
   * 检查登录是否成功
   */
  private static async checkLoginSuccess(page: Page, config: LoginConfig): Promise<boolean> {
    // 检查成功标识
    if (config.selectors.successIndicator) {
      try {
        await page.waitForSelector(config.selectors.successIndicator, { timeout: 5000 });
        console.log(`✅ 登录成功标识已找到`);
        return true;
      } catch (error) {
        console.log(`⚠️  未找到登录成功标识，继续检查...`);
      }
    }

    // 检查URL变化
    const currentUrl = page.url();
    if (currentUrl !== config.loginUrl) {
      console.log(`✅ 页面已跳转，登录可能成功`);
      return true;
    }

    // 检查是否有错误信息
    const errorText = await page.evaluate(() => {
      const errorSelectors = [
        '.error', '.alert', '.message', '.login-error', '.error-message',
        '[class*="error"]', '[class*="alert"]', '[class*="message"]'
      ];
      
      for (const selector of errorSelectors) {
        const elements = document.querySelectorAll(selector);
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          if (element) {
            const text = element.textContent?.toLowerCase() || '';
            if (text.includes('error') || text.includes('失败') || text.includes('错误') || text.includes('invalid')) {
              return element.textContent?.trim();
            }
          }
        }
      }
      return null;
    });

    if (errorText) {
      console.log(`❌ 发现错误信息: ${errorText}`);
      return false;
    }

    return false;
  }

  /**
   * 检查是否已登录
   * @param page Puppeteer页面实例
   * @param indicators 登录状态检查的标识元素
   * @returns 是否已登录
   */
  static async isLoggedIn(page: Page, indicators: string[]): Promise<boolean> {
    try {
      for (const selector of indicators) {
        const element = await page.$(selector);
        if (element) {
          console.log(`✅ 找到登录状态标识: ${selector}`);
          return true;
        }
      }
      console.log(`❌ 未找到登录状态标识`);
      return false;
    } catch (error) {
      console.log(`⚠️  检查登录状态时出错:`, error);
      return false;
    }
  }

  /**
   * 保存登录状态（Cookies）
   */
  static async saveLoginState(page: Page, filePath: string): Promise<void> {
    const cookies = await page.cookies();
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, JSON.stringify(cookies, null, 2));
    console.log(`💾 登录状态已保存到: ${filePath}`);
  }

  /**
   * 恢复登录状态（Cookies）
   */
  static async restoreLoginState(page: Page, filePath: string): Promise<boolean> {
    try {
      const fs = await import('fs/promises');
      const cookiesData = await fs.readFile(filePath, 'utf8');
      const cookies = JSON.parse(cookiesData);
      await page.setCookie(...cookies);
      console.log(`🔄 登录状态已恢复`);
      return true;
    } catch (error) {
      console.log(`⚠️  恢复登录状态失败:`, error);
      return false;
    }
  }

  /**
   * 预定义的登录配置
   */
  static readonly LOGIN_CONFIGS = {
    // GitHub 登录配置
    github: {
      loginUrl: 'https://github.com/login',
      selectors: {
        usernameInput: '#login_field',
        passwordInput: '#password',
        submitButton: 'input[type="submit"]',
        successIndicator: '.avatar'
      },
      waitTime: 2000
    },
    
    // 百度登录配置
    baidu: {
      loginUrl: 'https://passport.baidu.com/v2/?login',
      selectors: {
        usernameInput: '#TANGRAM__PSP_3__userName',
        passwordInput: '#TANGRAM__PSP_3__password',
        submitButton: '#TANGRAM__PSP_3__submit',
        successIndicator: '.user-name'
      },
      waitTime: 3000
    },

    // 微博登录配置
    weibo: {
      loginUrl: 'https://weibo.com/login.php',
      selectors: {
        usernameInput: '#username',
        passwordInput: '#password',
        submitButton: '.btn_tip',
        successIndicator: '.gn_name'
      },
      waitTime: 2000
    },

    // 知乎登录配置
    zhihu: {
      loginUrl: 'https://www.zhihu.com/signin',
      selectors: {
        usernameInput: 'input[name="username"]',
        passwordInput: 'input[name="password"]',
        submitButton: 'button[type="submit"]',
        successIndicator: '.AppHeader-profileEntry'
      },
      waitTime: 2000
    },

    // 豆瓣登录配置
    douban: {
      loginUrl: 'https://accounts.douban.com/login',
      selectors: {
        usernameInput: '#email',
        passwordInput: '#password',
        submitButton: 'input[type="submit"]',
        successIndicator: '.nav-user-account'
      },
      waitTime: 2000
    }
  };

  /**
   * 创建自定义登录配置
   */
  static createLoginConfig(
    loginUrl: string,
    usernameSelector: string,
    passwordSelector: string,
    submitSelector: string,
    successSelector?: string
  ): Partial<LoginConfig> {
    const selectors: any = {
      usernameInput: usernameSelector,
      passwordInput: passwordSelector,
      submitButton: submitSelector
    };
    
    if (successSelector) {
      selectors.successIndicator = successSelector;
    }
    
    return {
      loginUrl,
      selectors
    };
  }
}
