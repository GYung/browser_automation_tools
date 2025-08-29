import dayjs from "dayjs";

/**
 * 时间范围结果接口
 */
export interface TimeRange {
  beforeMin: string;
  afterMin: string;
  beforeMinMs: number;
  afterMinMs: number;
}

/**
 * 日期时间工具类
 * 提供时间格式化、解析、范围生成等功能
 */
export class DateTimeUtils {

  /**
   * 生成指定时间前后指定分钟的时间范围
   * @param baseDate 基准时间字符串 (格式: "YYYY-MM-DD HH:mm:ss")
   * @param minutes 前后分钟数，默认为15分钟
   * @returns 包含前后指定分钟时间范围的对象
   */
  public static generateTimeRange(baseDate: string, minutes: number = 15): TimeRange {
    try {
      // 使用 dayjs 解析基准时间
      const baseTime = dayjs(baseDate);
      
      // 验证时间是否有效
      if (!baseTime.isValid()) {
        throw new Error('无效的时间格式');
      }
      
      // 计算前后指定分钟数
      const beforeTime = baseTime.subtract(minutes, 'minute');
      const afterTime = baseTime.add(minutes, 'minute');
      
      return {
        beforeMin: beforeTime.format('YYYY-MM-DD HH:mm:ss'),
        afterMin: afterTime.format('YYYY-MM-DD HH:mm:ss'),
        beforeMinMs: beforeTime.valueOf(),
        afterMinMs: afterTime.valueOf()
      };
    } catch (error) {
      console.error('时间范围生成失败:', error);
      // 返回默认值而不是抛出异常
      const defaultTime = dayjs();
      const beforeTime = defaultTime.subtract(minutes, 'minute');
      const afterTime = defaultTime.add(minutes, 'minute');
      
      return {
        beforeMin: beforeTime.format('YYYY-MM-DD HH:mm:ss'),
        afterMin: afterTime.format('YYYY-MM-DD HH:mm:ss'),
        beforeMinMs: beforeTime.valueOf(),
        afterMinMs: afterTime.valueOf()
      };
    }
  }

  /**
   * 解析时间字符串为 dayjs 对象
   * @param timeString 时间字符串 (格式: "YYYY-MM-DD HH:mm:ss")
   * @returns dayjs 对象
   */
  public static parseTimeString(timeString: string): dayjs.Dayjs {
    const date = dayjs(timeString);
    if (!date.isValid()) {
      throw new Error(`无效的时间格式: ${timeString}`);
    }
    return date;
  }

  /**
   * 格式化 dayjs 对象为字符串
   * @param date dayjs 对象
   * @returns 格式化的时间字符串
   */
  public static formatDateToString(date: dayjs.Dayjs): string {
    return date.format('YYYY-MM-DD HH:mm:ss');
  }

  /**
   * 格式化 Date 对象为字符串
   * @param date Date 对象
   * @returns 格式化的时间字符串
   */
  public static formatDateToStringFromDate(date: Date): string {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  }

  /**
   * 检查时间字符串是否有效
   * @param timeString 时间字符串
   * @returns 是否有效
   */
  public static isValidTimeString(timeString: string): boolean {
    return dayjs(timeString).isValid();
  }

  /**
   * 添加时间间隔
   * @param baseTime 基准时间
   * @param amount 数量
   * @param unit 单位 ('year', 'month', 'day', 'hour', 'minute', 'second')
   * @returns 新的时间字符串
   */
  public static addTime(baseTime: string, amount: number, unit: dayjs.ManipulateType): string {
    const date = dayjs(baseTime);
    if (!date.isValid()) {
      throw new Error('无效的时间格式');
    }
    
    return date.add(amount, unit).format('YYYY-MM-DD HH:mm:ss');
  }

  /**
   * 减去时间间隔
   * @param baseTime 基准时间
   * @param amount 数量
   * @param unit 单位 ('year', 'month', 'day', 'hour', 'minute', 'second')
   * @returns 新的时间字符串
   */
  public static subtractTime(baseTime: string, amount: number, unit: dayjs.ManipulateType): string {
    const date = dayjs(baseTime);
    if (!date.isValid()) {
      throw new Error('无效的时间格式');
    }
    
    return date.subtract(amount, unit).format('YYYY-MM-DD HH:mm:ss');
  }
}
