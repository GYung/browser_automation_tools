import type { OutputHandler } from "../types";

/**
 * 页面截图数据采集器
 * 负责从网页收集数据
 */
export class HtmlOutputHandler implements OutputHandler {


    /**
     * 实现接口方法 - 执行数据采集
     * @param input - 输入参数
     * @param context - 执行上下文
     * @returns 采集结果
     */
    async execute(input: any, context: any) {
        console.log(`HtmlOutputHandler输出`);

    }
}