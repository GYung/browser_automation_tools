import type { AnalysisHandler, AnalysisResult, AcquisitionResult } from "../types/index.js";
import type { LLMService, LLMChatOptions } from "../services/LLM/llm-service.js";


/**
 * LLM 分析处理器
 * 使用大语言模型对采集的数据进行分析
 */
export class LlmAnalysisHandler implements AnalysisHandler {
  private llmService: LLMService;
  private analysisConfig: {
    systemPrompt?: string;
    chatPrompt?: string;
  };

  constructor(llmService: LLMService, config?: {
    systemPrompt?: string;
    chatPrompt?: string;
  }) {
    this.llmService = llmService;
    this.analysisConfig = {
      systemPrompt: config?.systemPrompt || '你是一个专业的数据分析师，请对提供的数据进行分析并给出有价值的洞察。',
      chatPrompt: config?.systemPrompt || '请对提供的数据进行专业分析',
    };
  }

  /**
   * 执行 LLM 数据分析
   */
  async execute(input: AcquisitionResult, context: any): Promise<AnalysisResult> {
    console.log('🤖 LLM 分析处理器开始执行');

    const startTime = Date.now();
    const analysisData = new Map<string, any>();

    try {
      if (!input.success || !input.data || input.data.size === 0) {
        throw new Error('输入数据无效或为空');
      }

      // 准备分析数据
      const dataForAnalysis = this.prepareDataForAnalysis(input);
      const analysisPrompt = this.generateAnalysisPrompt(dataForAnalysis, input.dataType);
    
      // 执行分析
      const llmResponse = await this.llmService.chatWithSystem(
        this.analysisConfig.systemPrompt!,
        analysisPrompt
      );

      if (!llmResponse) {
        throw new Error('LLM 分析失败: 无响应');
      }

      // 解析分析结果
      const analysisResult = this.parseAnalysisResult(llmResponse, input.dataType);
      
      // 存储分析数据
      analysisData.set('llm_analysis', analysisResult);
      analysisData.set('raw_response', llmResponse);

      console.log('✅ LLM 分析完成');

      return {
        success: true,
        url: input.url || '',
        dataType: input.dataType,
        analysisData,
        metadata: {
          analysisType: 'llm',
          processingTime: Date.now() - startTime,
        },
      };

    } catch (error) {
      console.error('❌ LLM 分析失败:', error);
      
      return {
        success: false,
        url: input.url || '',
        dataType: input.dataType,
        analysisData,
        metadata: {
          analysisType: 'llm',
          error: error instanceof Error ? error.message : String(error),
          processingTime: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * 准备分析数据
   */
  private prepareDataForAnalysis(input: AcquisitionResult): any {
    const preparedData: any = {
      url: input.url,
      dataType: input.dataType,
      data: {},
      metadata: input.metadata,
    };

    if (input.data) {
      input.data.forEach((value, key) => {
        preparedData.data[key] = value;
      });
    }

    return preparedData;
  }

  /**
   * 生成分析提示
   */
  private generateAnalysisPrompt(data: any, dataType: string): string {
    let prompt = `请对以下${dataType === 'image' ? '图片' : '文本'}数据进行分析：\n\n`;
    
    prompt += `数据来源: ${data.url || '未知'}\n`;
    prompt += `数据类型: ${dataType}\n\n`;
    
    if (dataType === 'text') {
      prompt += '数据内容:\n';
      Object.entries(data.data).forEach(([key, value]) => {
        prompt += `- ${key}: ${JSON.stringify(value, null, 2)}\n`;
      });
    } else if (dataType === 'image') {
      prompt += '图片信息:\n';
      Object.entries(data.data).forEach(([key, value]) => {
        prompt += `- ${key}: ${value}\n`;
      });
    }

    prompt = `'\n${this.analysisConfig.chatPrompt}\n'`
    prompt += '请以结构化的方式回答，使用清晰的标题和要点。';

    return prompt;
  }

  /**
   * 解析分析结果
   */
  private parseAnalysisResult(llmResponse: string, dataType: string): any {
    return {
      summary: llmResponse,
      analysisType: 'llm_generated',
      dataType,
    };
  }
}
