const EventEmitter = require('events');

/**
 * 数据管道 - 负责协调各层之间的数据流转
 */
class DataPipeline {
  constructor() {
    this.steps = [];
    this.eventBus = new EventEmitter();
    this.context = {};
  }

  /**
   * 添加处理步骤
   * @param {Object} step - 处理步骤
   * @param {string} step.name - 步骤名称
   * @param {Function} step.process - 处理函数
   * @returns {DataPipeline} 管道实例
   */
  addStep(step) {
    this.steps.push(step);
    return this;
  }

  /**
   * 执行数据管道
   * @param {Object} input - 输入数据
   * @param {Object} options - 执行选项
   * @returns {Promise<Object>} 处理结果
   */
  async execute(input, options = {}) {
    console.log('🚀 开始执行数据管道...');
    
    let data = input;
    this.context = { startTime: new Date(), options };

    for (const [index, step] of this.steps.entries()) {
      try {
        console.log(`📋 执行步骤 ${index + 1}: ${step.name}`);
        
        const stepStartTime = new Date();
        data = await step.process(data, this.context);
        const stepEndTime = new Date();
        
        // 记录步骤执行信息
        this.context[`step_${index + 1}`] = {
          name: step.name,
          startTime: stepStartTime,
          endTime: stepEndTime,
          duration: stepEndTime - stepStartTime,
          dataSize: this.getDataSize(data)
        };
        
        this.eventBus.emit('step:completed', {
          stepIndex: index,
          stepName: step.name,
          data: data,
          duration: stepEndTime - stepStartTime
        });
        
      } catch (error) {
        console.error(`❌ 步骤 ${index + 1} 执行失败:`, error.message);
        
        this.eventBus.emit('step:failed', {
          stepIndex: index,
          stepName: step.name,
          error: error,
          data: data
        });
        
        if (options.continueOnError) {
          console.warn('⚠️ 继续执行后续步骤...');
          continue;
        } else {
          throw error;
        }
      }
    }
    
    this.context.endTime = new Date();
    this.context.totalDuration = this.context.endTime - this.context.startTime;
    
    console.log('✅ 数据管道执行完成');
    this.eventBus.emit('pipeline:completed', {
      data: data,
      context: this.context
    });
    
    return data;
  }

  /**
   * 获取数据大小
   * @param {any} data - 数据
   * @returns {number} 数据大小
   */
  getDataSize(data) {
    if (Array.isArray(data)) {
      return data.length;
    } else if (typeof data === 'object') {
      return Object.keys(data).length;
    } else if (typeof data === 'string') {
      return data.length;
    }
    return 1;
  }

  /**
   * 监听事件
   * @param {string} event - 事件名称
   * @param {Function} listener - 监听器函数
   */
  on(event, listener) {
    this.eventBus.on(event, listener);
    return this;
  }

  /**
   * 获取执行上下文
   * @returns {Object} 执行上下文
   */
  getContext() {
    return this.context;
  }
}

module.exports = DataPipeline;
