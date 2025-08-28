import type { AcquisitionHandler, OutputHandler } from "../types";
import { PageScrapeAcquisitionHandler } from "../data-acquisition/page-scrape-acquisition.js";
import { BaseTask } from "./base-task.js";
import { TextOutputHandler } from "../data-output/text-output.js";
import dayjs from "dayjs";

/**
 * 数据抓取任务 - 负责从网页抓取数据
 */
export class DataScrapeTask extends BaseTask {

  private nowDate = "2025-08-27 21:00:01";

  /**
   * 生成指定时间前后15分钟的时间范围
   * @param baseDate 基准时间字符串 (格式: "YYYY-MM-DD HH:mm:ss")
   * @returns 包含前后15分钟时间范围的对象
   */
  public generateTimeRange(baseDate: string = this.nowDate): {
    before15min: string;
    after15min: string;
    before15minMs: number;
    after15minMs: number;
  } {
    try {
      // 使用 dayjs 解析基准时间
      const baseTime = dayjs(baseDate);
      
      // 验证时间是否有效
      if (!baseTime.isValid()) {
        throw new Error('无效的时间格式');
      }
      
      // 计算前后15分钟
      const before15min = baseTime.subtract(15, 'minute');
      const after15min = baseTime.add(15, 'minute');
      
      return {
        before15min: before15min.format('YYYY-MM-DD HH:mm:ss'),
        after15min: after15min.format('YYYY-MM-DD HH:mm:ss'),
        before15minMs: before15min.valueOf(),
        after15minMs: after15min.valueOf()
      };
        } catch (error) {
      console.error('时间范围生成失败:', error);
      // 返回默认值而不是抛出异常
      const defaultTime = dayjs();
      const before15min = defaultTime.subtract(15, 'minute');
      const after15min = defaultTime.add(15, 'minute');
      
      return {
        before15min: before15min.format('YYYY-MM-DD HH:mm:ss'),
        after15min: after15min.format('YYYY-MM-DD HH:mm:ss'),
        before15minMs: before15min.valueOf(),
        after15minMs: after15min.valueOf()
      };
    }
  }

  /**
   * 获取当前时间字符串
   * @returns 当前时间字符串 (格式: "YYYY-MM-DD HH:mm:ss")
   */
  public getCurrentTimeString(): string {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
  }

  /**
   * 解析时间字符串为 dayjs 对象
   * @param timeString 时间字符串 (格式: "YYYY-MM-DD HH:mm:ss")
   * @returns dayjs 对象
   */
  public parseTimeString(timeString: string): dayjs.Dayjs {
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
  public formatDateToString(date: dayjs.Dayjs): string {
    return date.format('YYYY-MM-DD HH:mm:ss');
  }

  /**
   * 格式化 Date 对象为字符串
   * @param date Date 对象
   * @returns 格式化的时间字符串
   */
  public formatDateToStringFromDate(date: Date): string {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  }

  /**
   * 修改 URL 查询参数
   * @param url 原始 URL
   * @param params 要新增的参数对象
   * @returns 修改后的 URL
   */
  public modifyUrlParams(url: string, params: Record<string, string>): string {
    try {
      const urlObj = new URL(url);
      
      // 只新增不存在的参数
      Object.entries(params).forEach(([key, value]) => {
        if (!urlObj.searchParams.has(key)) {
          urlObj.searchParams.set(key, value);
        }
      });
      
      return urlObj.toString();
    } catch (error) {
      console.error('URL 参数修改失败:', error);
      return url; // 如果解析失败，返回原始 URL
    }
  }

  /**
   * 获取数据处理处理器实例
   * @returns 数据处理处理器实例
   */
  protected getAcquisitionHandler(): AcquisitionHandler {
    return new PageScrapeAcquisitionHandler();
  }

  protected getOutputHandler(): OutputHandler {
    return new TextOutputHandler();
  }

  protected getTaskDescription(): string {
    return "抓取指定网页的数据（标题、链接、图片等），并输出为文本文件";
  }

  protected getUsage(): string {
    return "npm run task scrape [url] [outputPath] [waitTime]";
  }
}
