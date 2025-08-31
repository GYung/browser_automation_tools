import puppeteer from 'puppeteer-core';

async function searchTest() {
  // 启动浏览器，使用本地 Chrome
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
  });
  
  // 打开新页面
  const page = await browser.newPage();
  
  // 访问百度首页
  await page.goto("https://www.baidu.com", { waitUntil: "networkidle2" });
  
  // 输入搜索关键词
  await page.waitForSelector("#kw", { timeout: 2000 });
  const keyword = "当前时间";
  await page.type("#kw", keyword);

  // 点击搜索按钮
  await page.keyboard.press("Enter");
  await page.waitForSelector("#content_left");

  // 等待页面渲染
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 截图保存
  await page.screenshot({ path: "output/baidu_search.png", fullPage: true });
  
  // 统计搜索结果
  const resultTotals = await page.evaluate(() => {
    const results = document.querySelectorAll("#content_left .result");
    return results.length;
  });
  console.log("搜索结果数量为:", resultTotals);
  
  // 关闭浏览器
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await browser.close();
}

searchTest().catch(console.error);
