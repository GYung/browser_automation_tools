/**
 * LLM 消息接口
 */
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * LLM 聊天选项
 */
export interface LLMChatOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

/**
 * LLM 聊天响应
 */
export interface LLMChatResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * LLM 服务接口
 * 定义所有 LLM 服务必须实现的方法
 */
export interface LLMService {
  /**
   * 发送聊天请求
   * @param messages 消息数组
   * @param options 聊天选项
   * @returns 聊天响应
   */
  chat(messages: LLMMessage[], options?: LLMChatOptions): Promise<LLMChatResponse>;

  /**
   * 简单的文本生成
   * @param prompt 提示文本
   * @param options 生成选项
   * @returns 生成的文本
   */
  generateText(prompt: string, options?: LLMChatOptions): Promise<string>;

  /**
   * 带系统提示的聊天
   * @param systemPrompt 系统提示
   * @param userMessage 用户消息
   * @param options 聊天选项
   * @returns 生成的文本
   */
  chatWithSystem(systemPrompt: string, userMessage: string, options?: LLMChatOptions): Promise<string>;

  /**
   * 测试服务连接
   * @returns 是否连接成功
   */
  testConnection(): Promise<boolean>;
}
