// 确保环境变量在配置加载前被初始化
import dotenv from 'dotenv';
dotenv.config();

/**
 * 全局配置
 */
export const appConfig = {
  // 浏览器配置
  chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  viewport: { width: 1920, height: 1080 },
  headless: false,
  
  // 登录配置
  logins: [{
    domain: 'www.baidu.com',
    loginUrl: 'https://passport.baidu.com/v2/?login',
    name: '百度',
  }],
  
  // 超时配置
  pageLoadTimeout: 30000, // 30秒
  loginWaitTimeout: 120000, // 2分钟
  
  // DeepSeek API 配置
  deepSeek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '', // 从环境变量获取API密钥
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    maxTokens: 4096,
    temperature: 0.7,
    timeout: 60000, // 60秒超时
  },
};
