import { DeepSeekService } from '../dist/services/llm/deep-seek.js';

// 测试 LLM 服务接口
async function testLLMService() {
  console.log('=== LLM 服务接口测试开始 ===\n');

  const llmService = new DeepSeekService();

  // 1. 测试连接
  console.log('1. 测试服务连接:');
  try {
    const isConnected = await llmService.testConnection();
    console.log(`   连接状态: ${isConnected ? '✅ 成功' : '❌ 失败'}`);
  } catch (error) {
    console.log(`   连接测试失败: ${error.message}`);
  }
  console.log('');

  // 2. 测试简单文本生成
  console.log('2. 测试简单文本生成:');
  try {
    const response = await llmService.generateText('你好，请简单介绍一下自己', {
      maxTokens: 50,
      temperature: 0.7
    });
    console.log(`   生成结果: ${response.substring(0, 100)}...`);
    console.log(`   测试结果: ${response.length > 0 ? '✅ 成功' : '❌ 失败'}`);
  } catch (error) {
    console.log(`   文本生成失败: ${error.message}`);
  }
  console.log('');

  // 3. 测试聊天功能
  console.log('3. 测试聊天功能:');
  try {
    const chatResponse = await llmService.chat([
      { role: 'system', content: '你是一个友好的助手' },
      { role: 'user', content: '请用一句话介绍自己' }
    ], {
      maxTokens: 30,
      temperature: 0.5
    });
    
    console.log(`   聊天响应: ${JSON.stringify(chatResponse, null, 2)}`);
    console.log(`   测试结果: ${chatResponse.success ? '✅ 成功' : '❌ 失败'}`);
    
    if (chatResponse.success && chatResponse.content) {
      console.log(`   响应内容: ${chatResponse.content}`);
    }
  } catch (error) {
    console.log(`   聊天功能失败: ${error.message}`);
  }
  console.log('');

  // 4. 测试带系统提示的聊天
  console.log('4. 测试带系统提示的聊天:');
  try {
    const systemResponse = await llmService.chatWithSystem(
      '你是一个数据分析专家',
      '请分析一下这个数据：用户访问量在周末明显增加',
      {
        maxTokens: 100,
        temperature: 0.3
      }
    );
    
    console.log(`   系统聊天响应: ${systemResponse.substring(0, 150)}...`);
    console.log(`   测试结果: ${systemResponse.length > 0 ? '✅ 成功' : '❌ 失败'}`);
  } catch (error) {
    console.log(`   系统聊天失败: ${error.message}`);
  }
  console.log('');

  // 5. 测试错误处理
  console.log('5. 测试错误处理:');
  try {
    const errorResponse = await llmService.chat([
      { role: 'user', content: 'test' }
    ], {
      maxTokens: -1, // 无效参数
      temperature: 2.0 // 无效参数
    });
    
    console.log(`   错误处理: ${errorResponse.success ? '❌ 应该失败' : '✅ 正确处理错误'}`);
    if (!errorResponse.success) {
      console.log(`   错误信息: ${errorResponse.error}`);
    }
  } catch (error) {
    console.log(`   异常处理: ${error.message}`);
  }
  console.log('');

  console.log('=== LLM 服务接口测试完成 ===');
}

// 运行测试
testLLMService().catch(console.error);
