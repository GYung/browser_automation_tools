/**
 * 数据采集接口
 * 所有数据采集处理器必须继承此接口
 */
export interface AcquisitionHandler {
    /**
     * 执行数据采集
     * @param {Object} input - 输入参数
     * @param {Object} context - 执行上下文
     * @returns {Promise<Object>} 采集结果
     */
    execute(input: any, context: any): void;
  
  }

  export interface OutputHandler {
    /**
     * 执行数据采集
     * @param {Object} input - 输入参数
     * @param {Object} context - 执行上下文
     * @returns {Promise<Object>} 采集结果
     */
    execute(input: any, context: any): void;
  
  }
  // ------------参数定义--------