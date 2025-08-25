/**
 * 浏览器自动化工具全局配置
 */
export const appConfig = {
  // 浏览器配置
  chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  viewport: { width: 1280, height: 720 },
  headless: false,
  
  // 登录配置
  baidu: {
    domain: 'www.baidu.com',
    loginUrl: 'https://passport.baidu.com/v2/?login',
    name: '百度',
  },
  
  // 超时配置
  pageLoadTimeout: 30000, // 30秒
  loginWaitTimeout: 120000, // 2分钟
};
