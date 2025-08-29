import { UrlUtils } from '../dist/utils/url-utils.js';

// 测试 UrlUtils 的各种功能
function testUrlUtils() {
  console.log('=== UrlUtils 测试开始 ===\n');

  // 测试数据
  const testUrl = 'https://example.com/path?existing=value&param=test';
  const testUrlNoParams = 'https://example.com/path';
  const invalidUrl = 'invalid-url';

  // 1. 测试 getUrlParams
  console.log('3. 测试 getUrlParams:');
  const params = UrlUtils.getUrlParams(testUrl);
  console.log(`   URL: ${testUrl}`);
  console.log(`   解析的参数: ${JSON.stringify(params)}`);
  console.log(`   测试结果: ${params.existing === 'value' && params.param === 'test' ? '✅ 通过' : '❌ 失败'}\n`);

  // 2. 测试 removeUrlParams
  console.log('4. 测试 removeUrlParams:');
  const removedUrl = UrlUtils.removeUrlParams(testUrl, ['existing', 'param']);
  console.log(`   原始URL: ${testUrl}`);
  console.log(`   移除参数: ['existing', 'param']`);
  console.log(`   移除后URL: ${removedUrl}`);
  console.log(`   测试结果: ${!removedUrl.includes('existing=') && !removedUrl.includes('param=') ? '✅ 通过' : '❌ 失败'}\n`);

  // 3. 测试 updateUrlParams - 更新现有参数
  console.log('5. 测试 updateUrlParams:');
  const updateParams = { existing: 'updated', param: 'updated' };
  const updatedUrl = UrlUtils.updateUrlParams(testUrl, updateParams);
  console.log(`   原始URL: ${testUrl}`);
  console.log(`   更新参数: ${JSON.stringify(updateParams)}`);
  console.log(`   更新后URL: ${updatedUrl}`);
  console.log(`   测试结果: ${updatedUrl.includes('existing=updated') && updatedUrl.includes('param=updated') ? '✅ 通过' : '❌ 失败'}\n`);

  // 4 测试 isValidUrl
  console.log('6. 测试 isValidUrl:');
  console.log(`   有效URL "${testUrl}": ${UrlUtils.isValidUrl(testUrl) ? '✅ 通过' : '❌ 失败'}`);
  console.log(`   无效URL "${invalidUrl}": ${!UrlUtils.isValidUrl(invalidUrl) ? '✅ 通过' : '❌ 失败'}\n`);

  // 5. 测试 getBaseUrl
  console.log('7. 测试 getBaseUrl:');
  const baseUrl = UrlUtils.getBaseUrl(testUrl);
  console.log(`   原始URL: ${testUrl}`);
  console.log(`   基础URL: ${baseUrl}`);
  console.log(`   测试结果: ${baseUrl === 'https://example.com/path' ? '✅ 通过' : '❌ 失败'}\n`);

  console.log('=== UrlUtils 测试完成 ===');
}

// 运行测试
testUrlUtils();
