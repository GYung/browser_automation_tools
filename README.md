# Puppeteer 演示项目

这是一个 Puppeteer 自动化测试演示项目，展示了如何使用 Puppeteer 进行网页自动化操作。

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 运行测试

1. **基础测试** - 打开浏览器并截图
```bash
npm run test
```

2. **搜索测试** - 演示表单交互和搜索功能
```bash
npm run search
```

3. **网页爬取** - 提取 GitHub 趋势页面数据
```bash
npm run scrape
```

4. **运行所有测试**
```bash
npm run all
```

## 📁 项目结构

```
puppeteer-demo/
├── basic-test.js      # 基础浏览器操作测试
├── search-test.js     # 搜索功能测试
├── web-scraping.js    # 网页数据爬取示例
├── package.json       # 项目配置
└── README.md         # 项目说明
```

## 🎯 功能演示

### 1. 基础测试 (basic-test.js)
- 启动浏览器
- 访问百度首页
- 截图保存
- 获取页面标题

### 2. 搜索测试 (search-test.js)
- 表单输入
- 点击操作
- 等待页面加载
- 结果截图

### 3. 网页爬取 (web-scraping.js)
- 访问 GitHub 趋势页面
- 提取仓库信息
- 保存数据到 JSON 文件
- 页面截图

## 📸 输出文件

运行测试后会生成以下文件：
- `baidu-screenshot.png` - 百度首页截图
- `search-results.png` - 搜索结果截图
- `github-trending.png` - GitHub 趋势页面截图
- `github-trending.json` - 爬取的仓库数据

## 🔧 配置选项

### 浏览器启动选项
```javascript
const browser = await puppeteer.launch({
  headless: false,        // 显示浏览器窗口
  defaultViewport: {      // 设置视窗大小
    width: 1280, 
    height: 720 
  }
});
```

### 页面导航选项
```javascript
await page.goto(url, {
  waitUntil: 'networkidle2'  // 等待网络空闲
});
```

## 📚 学习资源

- [Puppeteer 官方文档](https://pptr.dev/)
- [Puppeteer API 参考](https://pptr.dev/api/)
- [GitHub 仓库](https://github.com/puppeteer/puppeteer)

## 🛠️ 常见问题

### 1. 安装失败
如果安装 Puppeteer 时遇到问题，可以尝试：
```bash
npm install puppeteer --unsafe-perm=true
```

### 2. 浏览器启动失败
确保系统有足够的权限和内存来启动 Chromium。

### 3. 网络超时
可以调整页面加载超时时间：
```javascript
await page.goto(url, { 
  timeout: 30000,
  waitUntil: 'networkidle2' 
});
```

## 📝 扩展功能

你可以基于这个项目添加更多功能：
- 自动化测试
- 性能监控
- 网页截图服务
- 数据采集
- 表单自动填写

---

**注意**: 请遵守网站的 robots.txt 和使用条款，合理使用爬虫功能。
ai 优化， 定位优化， 执行配置