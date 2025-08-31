
/**
 * 数据类型枚举
 */
export enum DataType {
  IMAGE = "image",
  TEXT = "text"
}

/**
 * 操作类型枚举
 */
export enum OperationType {
  INPUT = "input",           // 输入操作
  KEYBOARD = "keyboard",     // 键盘操作
  CLICK = "click",           // 点击操作
  MOUSE_MOVE = "mouse-move", // 鼠标移动操作
  CONFIG = "config"          // 配置操作
}

/**
 * 基础任务接口
 */
export interface Task {
  url: string;              // 目标URL
  taskName?:string  // 任务名称 
  taskDesc?:string // 任务描述
  waitTime?: number;        // 等待时间
  operations?: Array<OperationConfig>; // 操作配置
  metadata?: Record<string, any>; // 元数据
}

/**
 * 操作配置接口
 */
export interface OperationConfig {
  type: OperationType;
  key?: string; // 按键名称，如 'Enter', 'Tab', 'Escape', Input'' 等
  selector?: string; // 输入框选择器
  value?: string; // 要输入的值
  waitTime?: number; // 输入后等待时间
  // 复杂点击配置
  parentSelector?: string; // 父元素选择器
  childIndex?: number; // 子元素索引（从0开始）
  childSelector?: string; // 子元素选择器
}

/**
 * 数据采集结果结构
 */
export interface AcquisitionResult {
  success: boolean;
  url?: string;
  dataType: DataType; // 数据类型标识
  data: Map<string, any>; // 数据 map，key 是数据标识，value 是数据
  metadata?: Record<string, any>; // 元数据（如路径、配置等）
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
 * 分析结果结构
 */
export interface AnalysisResult {
  success: boolean;
  url?: string;
  dataType: DataType; // 数据类型标识
  analysisData: Map<string, any>; // 分析数据 map，key 是分析标识，value 是分析结果
  metadata?: Record<string, any>; // 元数据（如分析配置、统计信息等）
  insights?: Array<{
    type: string; // 洞察类型
    title: string; // 洞察标题
    description: string; // 洞察描述
    confidence: number; // 置信度 (0-1)
    data?: any; // 相关数据
  }>; // 分析洞察
}

/**
 * 分析处理接口
 * 所有数据分析处理器必须继承此接口
 */
export interface AnalysisHandler {
  /**
   * 执行数据分析
   * @param {AcquisitionResult} input - 采集结果数据
   * @param {Object} context - 执行上下文
   * @returns {Promise<AnalysisResult>} 分析结果
   */
  execute(input: AcquisitionResult, context: any): Promise<AnalysisResult>;
}

/**
 * 输出处理器输入结构
 */
export interface OutputHandlerInput {
  data: Map<string, any>; // 数据 map，key 是数据标识，value 是数据
  metadata?: Record<string, any>; // 元数据（如路径、配置等）
  url?: string; // 源URL
  dataType: DataType; // 数据类型标识
  // 扩展字段，用于自定义转换
  [key: string]: any;
}

/**
 * 输出处理接口
 * 所有输出处理器必须继承此接口
 */
export interface OutputHandler {
  /**
   * 执行输出处理
   * @param {OutputHandlerInput} input - 输出处理器输入数据
   * @param {Object} context - 执行上下文
   * @returns {Promise<void>} 输出结果
   */
  execute(input: OutputHandlerInput, context: any): Promise<void>;
}

// ------------参数定义--------
