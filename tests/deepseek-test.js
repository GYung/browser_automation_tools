import { DeepSeekService } from '../dist/services/llm/deep-seek.js';

/**
 * DeepSeek 服务测试
 */
async function testDeepSeekService() {
  console.log('🤖 开始 DeepSeek 服务测试...');

  try {
    // 创建 DeepSeek 服务实例
    const deepSeekService = new DeepSeekService();

    // 测试1: 连接测试
    console.log('\n📡 测试1: API 连接测试');
    const isConnected = await deepSeekService.testConnection();
    console.log(`连接状态: ${isConnected ? '✅ 成功' : '❌ 失败'}`);

    if (!isConnected) {
      console.log('⚠️ 请确保已设置环境变量 DEEPSEEK_API_KEY');
      return;
    }

    // 测试2: 简单文本生成
    console.log('\n📝 测试2: 简单文本生成');
    try {
      const response1 = await deepSeekService.generateText('请用一句话介绍人工智能', {
        maxTokens: 100,
        temperature: 0.7
      });
      console.log('生成的文本:', response1);
    } catch (error) {
      console.error('文本生成失败:', error.message);
    }

    // 测试3: 带系统提示的聊天
    console.log('\n💬 测试3: 带系统提示的聊天');
    try {
      const response2 = await deepSeekService.chatWithSystem(
        '你是一个专业的编程助手，请用简洁的语言回答问题。',
        '什么是 TypeScript？',
        { maxTokens: 150, temperature: 0.5 }
      );
      console.log('AI 回答:', response2);
    } catch (error) {
      console.error('聊天失败:', error.message);
    }

    // 测试4: 多轮对话
    console.log('\n🔄 测试4: 多轮对话');
    try {
      const messages = [
        { role: 'system', content: '你是一个友好的助手。' },
        { role: 'user', content: '你好！' },
        { role: 'assistant', content: '你好！很高兴见到你！' },
        { role: 'user', content: '今天天气怎么样？' }
      ];

      const response3 = await deepSeekService.chat(messages, {
        maxTokens: 100,
        temperature: 0.8
      });
      console.log('多轮对话回复:', response3.choices[0].message.content);
    } catch (error) {
      console.error('多轮对话失败:', error.message);
    }



    console.log('\n✅ 所有测试完成');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}



/**
 * 主测试函数
 */
async function main() {
  console.log('🎯 DeepSeek 服务功能测试开始\n');

  // 基础功能测试
  await testDeepSeekService();

  console.log('\n🎉 所有测试完成');
}

// 运行测试
main().catch(console.error);
