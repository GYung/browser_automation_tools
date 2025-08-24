const launch = require("puppeteer").launch;
const fs = require("fs").promises;

async function scrapeTest() {
  const browser = await launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
  });

  const page = await browser.newPage();

  // 访问 GitHub 趋势页面
  console.log("🌐 访问 GitHub 趋势页面...");
  await page.goto("https://github.com/trending", { waitUntil: "networkidle2" });

  // 等待页面加载
  console.log("⏳ 等待页面加载...");
  await page.waitForSelector("article.Box-row", { timeout: 15000 });

  // 等待一下让页面完全加载
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // 截图保存页面
  console.log("📸 截图保存页面...");
  await page.screenshot({
    path: "github-trending.png",
    fullPage: true,
  });

  // 提取仓库数据
  console.log("📊 提取仓库数据...");
  const repositories = await page.evaluate(() => {
    const repoElements = document.querySelectorAll("article.Box-row");
    const repos = [];

    repoElements.forEach((element, index) => {
      if (index >= 10) return; // 只取前10个

      try {
        // 获取仓库名称和链接
        const repoLink = element.querySelector("h2.h3 a");
        const repoName = repoLink
          ? repoLink.textContent.trim().replace(/\s+/g, "")
          : "";
        const repoUrl = repoLink
          ? "https://github.com" + repoLink.getAttribute("href")
          : "";

        // 获取描述
        const description = element.querySelector("p");
        const repoDescription = description
          ? description.textContent.trim()
          : "";

        // 获取编程语言
        const languageElement = element.querySelector(
          '[itemprop="programmingLanguage"]',
        );
        const language = languageElement
          ? languageElement.textContent.trim()
          : "";

        // 获取星标数
        const starsElement = element.querySelector('a[href*="/stargazers"]');
        const stars = starsElement ? starsElement.textContent.trim() : "0";

        // 获取 fork 数
        const forksElement = element.querySelector('a[href*="/forks"]');
        const forks = forksElement ? forksElement.textContent.trim() : "0";

        // 获取今日星标数
        const todayStarsElement = element.querySelector(
          "span.d-inline-block.float-sm-right",
        );
        const todayStars = todayStarsElement
          ? todayStarsElement.textContent.trim()
          : "0";

        if (repoName) {
          repos.push({
            rank: index + 1,
            name: repoName,
            url: repoUrl,
            description: repoDescription,
            language: language,
            stars: stars,
            forks: forks,
            todayStars: todayStars,
          });
        }
      } catch (error) {
        console.log(`提取第 ${index + 1} 个仓库时出错:`, error.message);
      }
    });

    return repos;
  });

  console.log(`📈 成功提取 ${repositories.length} 个热门仓库`);

  // 保存数据到 JSON 文件
  const dataToSave = {
    scrapedAt: new Date().toISOString(),
    totalRepositories: repositories.length,
    repositories: repositories,
  };

  console.log("💾 保存数据到 JSON 文件...");
  await fs.writeFile(
    "output/github-trending.json",
    JSON.stringify(dataToSave, null, 2),
    "utf8",
  );

  // 打印前几个仓库信息
  console.log("\n🏆 热门仓库 TOP 5:");
  repositories.slice(0, 5).forEach((repo, index) => {
    console.log(`${index + 1}. ${repo.name}`);
    console.log(`   语言: ${repo.language || "未知"}`);
    console.log(
      `   星标: ${repo.stars} | Fork: ${repo.forks} | 今日: ${repo.todayStars}`,
    );
    console.log(
      `   描述: ${repo.description.substring(0, 100)}${repo.description.length > 100 ? "..." : ""}`,
    );
    console.log("");
  });

  // 等待 3 秒后关闭
  console.log("⏳ 等待 3 秒后关闭...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  await browser.close();
  console.log("✅ 网页爬取测试完成！");
}

scrapeTest().catch(console.error);
