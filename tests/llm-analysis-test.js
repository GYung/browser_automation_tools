import { LlmAnalysisHandler } from '../dist/data-analysis/llm-analysis.js';
import { DeepSeekService } from '../dist/services/llm/deep-seek.js';

// 测试 LLM 分析处理器
async function testLlmAnalysis() {
  console.log('=== LLM 分析处理器测试开始 ===\n');

  // 创建 LLM 服务
  const llmService = new DeepSeekService();
  
  // 创建分析处理器，注入 LLM 服务
  const analysisHandler = new LlmAnalysisHandler(llmService, {
    systemPrompt: '你是一个专业的数据分析师，请对提供的数据进行简洁的分析。',
  });

  // 模拟采集结果数据
  const mockAcquisitionResult = {
    success: true,
    url: 'https://example.com',
    dataType: 'text',
    data: new Map([
      ['title', '示例网页标题'],
      ['content', '这是一个示例网页的内容，包含了一些重要的信息。'],
      ['keywords', ['示例', '网页', '内容', '信息']],
      ['wordCount', 25],
    ]),
    metadata: {
      source: 'web_scraping',
      timestamp: new Date().toISOString(),
    },
  };

  console.log('1. 测试 LLM 分析处理器:');
  console.log('   输入数据:', {
    url: mockAcquisitionResult.url,
    dataType: mockAcquisitionResult.dataType,
    dataSize: mockAcquisitionResult.data.size,
  });

  try {
    // 执行分析
    const analysisResult = await analysisHandler.execute(mockAcquisitionResult, {});
    
    console.log('\n   分析结果:');
    console.log(`   成功: ${analysisResult.success ? '✅' : '❌'}`);
    console.log(`   分析类型: ${analysisResult.metadata?.analysisType}`);
    console.log(`   模型: ${analysisResult.metadata?.model}`);
    console.log(`   处理时间: ${analysisResult.metadata?.processingTime}ms`);
    
    if (analysisResult.success) {
      const llmAnalysis = analysisResult.analysisData.get('llm_analysis');
      console.log(`   分析摘要: ${llmAnalysis?.summary?.substring(0, 100)}...`);
      
      if (analysisResult.insights) {
        console.log(`   洞察数量: ${analysisResult.insights.length}`);
      }
      
      if (analysisResult.statistics) {
        console.log(`   统计信息: 处理了 ${analysisResult.statistics.processedItems} 个项目`);
      }
    } else {
      console.log(`   错误: ${analysisResult.metadata?.error}`);
    }
    
  } catch (error) {
    console.log(`   ❌ 分析失败: ${error.message}`);
  }

  console.log('\n2. 测试错误处理:');
  
  // 测试无效数据
  const invalidResult = {
    success: false,
    url: 'https://example.com',
    dataType: 'text',
    data: new Map(),
    metadata: {},
  };

  try {
    const errorResult = await analysisHandler.execute(invalidResult, {});
    console.log(`   无效数据处理: ${errorResult.success ? '❌ 应该失败' : '✅ 正确处理'}`);
    if (!errorResult.success) {
      console.log(`   错误信息: ${errorResult.metadata?.error}`);
    }
  } catch (error) {
    console.log(`   异常处理: ${error.message}`);
  }

  console.log('\n3. 测试不同 LLM 服务注入:');
  
  // 创建一个模拟的 LLM 服务
  const mockLlmService = {
    async chatWithSystem(systemPrompt, userMessage, options) {
      return `基于系统提示"${systemPrompt}"，对用户消息"${userMessage}"的分析结果：这是一个模拟的 LLM 响应。`;
    },
    async chat() { return { success: true, content: 'mock response' }; },
    async generateText() { return 'mock text'; },
    async testConnection() { return true; },
  };

  const mockAnalysisHandler = new LlmAnalysisHandler(mockLlmService, {
    systemPrompt: '你是一个模拟的分析师',
  });

  try {
    const mockResult = await mockAnalysisHandler.execute(mockAcquisitionResult, {});
    console.log(`   模拟服务测试: ${mockResult.success ? '✅ 成功' : '❌ 失败'}`);
    if (mockResult.success) {
      const mockAnalysis = mockResult.analysisData.get('llm_analysis');
      console.log(`   模拟响应: ${mockAnalysis?.summary?.substring(0, 50)}...`);
    }
  } catch (error) {
    console.log(`   模拟服务失败: ${error.message}`);
  }

  console.log('\n=== LLM 分析处理器测试完成 ===');
}

// 运行测试
testLlmAnalysis().catch(console.error);
