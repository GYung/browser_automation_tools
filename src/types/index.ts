/**
 * 页面信息结构
 */
export interface PageInfo {
  title: string;
  url: string;
}

/**
 * 数据采集结果结构
 */
export interface AcquisitionResult {
  success: boolean;
  url?: string;
  screenshotPath?: string;
  pageInfo?: PageInfo;
  screenshot?: Buffer;
  timestamp: string;
  [key: string]: any; // 允许其他属性
}

/**
 * 数据采集接口
 * 所有数据采集处理器必须继承此接口
 */
export interface AcquisitionHandler {
  /**
   * 执行数据采集
   * @param {Object} input - 输入参数
   * @param {Object} context - 执行上下文
   * @returns {Promise<AcquisitionResult>} 采集结果
   */
  execute(input: any, context: any): Promise<AcquisitionResult>;
}

/**
 * 输出处理接口
 * 所有输出处理器必须继承此接口
 */
export interface OutputHandler {
  /**
   * 执行输出处理
   * @param {Object} input - 输入参数（包含采集结果）
   * @param {Object} context - 执行上下文
   * @returns {Promise<void>} 输出结果
   */
  execute(input: any, context: any): Promise<void>;
}

// ------------参数定义--------
