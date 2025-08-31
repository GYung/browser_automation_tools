# Puppeteer 演示项目

这是一个基于 Puppeteer 的浏览器自动化项目。

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 运行测试

1. **截图测试**
```bash
npm run build && npm run basictest
```
- 启动浏览器
- 访问百度首页
- 截图保存
- 获取页面标题

2. **搜索测试**
```bash
npm run build && npm run searchtest
```
- 表单输入
- 点击操作
- 等待页面加载
- 结果截图

3. **网页爬取**
```bash
npm run build && npm run scrapetest
```
- 访问 GitHub 趋势页面
- 提取仓库信息
- 保存数据到 JSON 文件
- 页面截图

**注意**: 请遵守网站的 robots.txt 和使用条款，合理使用爬虫功能。