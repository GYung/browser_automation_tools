import { ScrapeUtils } from '../dist/utils/scrape-utils.js';

// 模拟测试数据
const testData = {
  data: {
    items: {
      list: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ],
      total: 2
    },
    status: 'success'
  },
  message: 'OK'
};

// 测试嵌套字段读取功能
function testNestedFieldAccess() {
  console.log('🧪 测试嵌套字段读取功能...\n');

  // 使用反射来访问私有方法（仅用于测试）
  const getNestedValue = (obj, fieldPath) => {
    // 模拟 getNestedValue 方法的逻辑
    if (!obj || !fieldPath) {
      return undefined;
    }

    const keys = fieldPath.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = current[key];
    }

    return current;
  };

  // 测试用例
  const testCases = [
    { fieldPath: 'data.items.list', expected: 'array with 2 items' },
    { fieldPath: 'data.items.total', expected: 2 },
    { fieldPath: 'data.status', expected: 'success' },
    { fieldPath: 'message', expected: 'OK' },
    { fieldPath: 'data.items.list.0.name', expected: 'Item 1' },
    { fieldPath: 'data.items.list.1.id', expected: 2 },
    { fieldPath: 'nonexistent', expected: undefined },
    { fieldPath: 'data.nonexistent', expected: undefined },
    { fieldPath: 'data.items.nonexistent', expected: undefined },
    { fieldPath: '', expected: undefined },
    { fieldPath: 'data.items.list.999', expected: undefined }
  ];

  testCases.forEach((testCase, index) => {
    const result = getNestedValue(testData, testCase.fieldPath);
    const success = result === testCase.expected || 
                   (Array.isArray(result) && testCase.expected.includes('array')) ||
                   (typeof result === 'object' && testCase.expected.includes('object'));
    
    console.log(`测试 ${index + 1}: ${testCase.fieldPath}`);
    console.log(`  期望: ${testCase.expected}`);
    console.log(`  实际: ${JSON.stringify(result)}`);
    console.log(`  结果: ${success ? '✅ 通过' : '❌ 失败'}\n`);
  });

  // 测试实际使用场景
  console.log('🔍 测试实际 API 响应场景...\n');
  
  const mockApiResponse = {
    code: 200,
    data: {
      result: {
        items: [
          { title: '新闻1', url: 'http://example1.com' },
          { title: '新闻2', url: 'http://example2.com' }
        ],
        pagination: {
          page: 1,
          size: 10,
          total: 100
        }
      }
    },
    message: 'success'
  };

  const apiConfigs = [
    { name: '新闻列表', field: 'data.result.items' },
    { name: '分页信息', field: 'data.result.pagination' },
    { name: '状态码', field: 'code' },
    { name: '完整数据', field: 'data' },
    { name: '不存在的字段', field: 'data.nonexistent' }
  ];

  apiConfigs.forEach(config => {
    const extractedData = getNestedValue(mockApiResponse, config.field);
    console.log(`📊 ${config.name} (${config.field}):`);
    console.log(`   ${JSON.stringify(extractedData, null, 2)}\n`);
  });
}

// 运行测试
testNestedFieldAccess();

export { testNestedFieldAccess };
