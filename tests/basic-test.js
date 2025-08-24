import { launch } from 'puppeteer';
async function basicTest() {
    // 启动浏览器
    const browser = await launch({
        headless: false, // 设置为 false 以便看到浏览器界面
        defaultViewport:{width:1280,height:720}
    });
    console.log("浏览器已启动");
    // 打开页面
    const page = await browser.newPage();
    // 访问网页
    console.log("正在访问百度首页...");
    await page.goto('https://www.baidu.com', { waitUntil: 'networkidle2' });
    // 截图保存
    console.log("正在截图...");
    await page.screenshot({ path: 'output/baidu.png' });
    // 获取页面标题
    const title = await page.title();
    console.log(`页面标题: ${title}`);
    // 关闭浏览器(等待几秒钟)
    await new Promise(resolve => setTimeout(resolve, 3000));
    await browser.close();
    console.log("浏览器已关闭");
  
}
// 运行测试(并输出错误的到控制台)
basicTest().catch(console.error);