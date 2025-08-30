import { appConfig } from '../../config/index.js';
import type { LLMService, LLMMessage, LLMChatOptions, LLMChatResponse } from './llm-service.js';

/**
 * DeepSeek API 请求参数
 */
export interface DeepSeekRequest {
  model: string;
  messages: LLMMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

/**
 * DeepSeek API 响应
 */
export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * DeepSeek API 错误响应
 */
export interface DeepSeekError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

/**
 * DeepSeek 服务类
 * 提供与 DeepSeek OpenAPI 的交互功能
 */
export class DeepSeekService implements LLMService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;
  private timeout: number;

  constructor() {
    const config = appConfig.deepSeek;
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.model = config.model;
    this.maxTokens = config.maxTokens;
    this.temperature = config.temperature;
    this.timeout = config.timeout;
  }

  /**
   * 检查 API 配置是否有效
   */
  private validateConfig(): boolean {
    if (!this.apiKey) {
      console.error('❌ DeepSeek API Key 未配置，请设置环境变量 DEEPSEEK_API_KEY');
      return false;
    }
    return true;
  }

  /**
   * 发送聊天请求到 DeepSeek API
   * @param messages 消息数组
   * @param options 可选参数
   * @returns API 响应
   */
  async chat(messages: LLMMessage[], options: LLMChatOptions = {}): Promise<LLMChatResponse> {
    if (!this.validateConfig()) {
      throw new Error('DeepSeek API 配置无效');
    }

    const requestBody: DeepSeekRequest = {
      model: options.model || this.model,
      messages,
      max_tokens: options.maxTokens || this.maxTokens,
      temperature: options.temperature || this.temperature,
      stream: false,
    };

    try {
      console.log(`🤖 发送请求到 DeepSeek API...`);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorData: DeepSeekError = await response.json();
        throw new Error(`DeepSeek API 错误: ${errorData.error.message}`);
      }

      const data: DeepSeekResponse = await response.json();
      console.log(`✅ DeepSeek API 请求成功`);
      
      return {
        success: true,
        content: data.choices[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
      };
    } catch (error) {
      console.error(`❌ DeepSeek API 请求失败:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 带系统提示的聊天
   * @param systemPrompt 系统提示
   * @param userMessage 用户消息
   * @param options 可选参数
   * @returns 生成的文本
   */
  async chatWithSystem(systemPrompt: string, userMessage: string, options: LLMChatOptions = {}): Promise<string> {
    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];
    
    const response = await this.chat(messages, options);
    return response.content || '';
  }

  /**
   * 测试 API 连接
   * @returns 是否连接成功
   */
  async testConnection(): Promise<boolean> {
    try {
      const messages: LLMMessage[] = [
        { role: 'user', content: 'Hello' }
      ];
      const response = await this.chat(messages,  { maxTokens: 10 });
      const content =  response.content || '';
      return content.length > 0;
    } catch (error) {
      console.error(`❌ DeepSeek API 连接测试失败:`, error);
      return false;
    }
  }
}