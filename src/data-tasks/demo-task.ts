import type { AcquisitionHandler, AnalysisHandler, OutputHandler } from "../types";
import { PageActionAcquisitionHandler } from "../data-acquisition/page-action-acquisition.js";
import { BaseTask } from "./base-task.js";
import { ConsoleOutputHandler } from "../data-output/console-output.js";
import { PageScreenAcquisitionHandler } from "../data-acquisition/page-screen-acquisition.js";
import { UrlUtils } from "../utils/url-utils.js";
import { HtmlOutputHandler } from "../data-output/html-output.js";
import { PageScrapeAcquisitionHandler, TaskProgressListener } from "../data-acquisition/page-scrape-acquisition.js";
import { TextOutputHandler } from "../data-output/text-output.js";
import { LlmAnalysisHandler } from "../data-analysis/llm-analysis.js";
import { DeepSeekService } from "../services/llm/deep-seek.js";

/**
 * demo任务
 */
export class DemoTask extends BaseTask {

  /**
   * 获取采集处理器
   * @returns 采集处理器实例
   */
  protected getAcquisitionHandler(): AcquisitionHandler {
    // 采集任务监听器
    const progressListener: TaskProgressListener = {
      // 单个采集任务开始前回调
      onTaskStart: (taskIndex, task) => {
        if (!task || task.url == null) {
          return;
        }

        let targetUrl = task.url;
        targetUrl = UrlUtils.updateUrlParams(targetUrl, {
          "search": "test",
        })
        task.url = targetUrl;
      },
    };
    return new PageActionAcquisitionHandler(progressListener);
  }

  /**
  * 获取分析处理器
  * @returns 分析处理器实例（可选）
  */
  // protected getAnalysisHandler(): AnalysisHandler {
  //   const systemPrompt = '你是资深的新闻工作者，对热点新闻有深刻的洞察力';
  //   let chatPrompt = "你需要根据提供的数据完成以下的工作:\n";
  //   chatPrompt += '1.对提供的新闻进行分析总结并给出独到的见解\n';
  //   chatPrompt += '请以易于阅读的形式返回分析结果。';

  //   return new LlmAnalysisHandler(new DeepSeekService(), { systemPrompt: systemPrompt, chatPrompt: chatPrompt });
  // }

  /**
  * 获取输出处理器
  * @returns 输出处理器实例（可选）
  */
  protected getOutputHandler(): OutputHandler {
    return new ConsoleOutputHandler();
  }

  /**
   * 任务描述
   * @returns 
   */
  protected getTaskDescription(): string {
    return "这是一个demo任务";
  }

  /**
   * 使用方式
   * @returns 
   */
  protected getUsage(): string {
    return "npm run task demo <confignName>";
  }
}
