import * as console from 'console';
import { DataScreenTask } from './data-tasks/data-screen-task.js';
class App {
    private tasks: Map<string, any> = new Map();
    constructor() {

    }

    /**
    * 初始化任务运行器
    */
    async initialize() {
        // if (this.initialized) return;

        console.log('🚀 初始化任务运行器...');
        this.tasks.set("screenTask", new DataScreenTask())
        // 初始化应用
        // this.app = new DataAnalysisApp({
        //     headless: false,
        //     outputDir: './reports'
        // });

        // await this.app.initialize();

        // 注册所有任务
        // this.registerAllTasks();

        // this.initialized = true;
        console.log('✅ 任务运行器初始化完成');
    }

    /**
     * 执行单个任务
     */
    async executeTask(taskName: string, context = {}) {
        const task = this.tasks.get(taskName);

        if (!task) {
            throw new Error(`任务未找到: ${taskName}`);
        }

        console.log(`🚀 开始执行任务: ${taskName}`);
        try {
            // 验证任务配置
            // task.validateConfig();

            // 检查任务依赖
            // if (!task.canExecute(this.executionContext)) {
            //     throw new Error(`任务依赖不满足: ${taskName}`);
            // }

            // 合并上下文
            // const mergedContext = {
            //     ...this.executionContext,
            //     ...context,
            //     previousTaskResults: Array.from(this.taskResults.values())
            // };

            // 执行任务
            const result = await task.execute(context);

            // 保存结果
            // this.taskResults.set(taskName, result);
            // this.executionContext.completedTasks = this.executionContext.completedTasks || [];
            // this.executionContext.completedTasks.push(taskName);

            console.log(`✅ 任务执行完成: ${taskName}`);
            return result;

        } catch (error) {
            console.error(`❌ 任务执行失败: ${taskName}`, error.message);
            throw error;
        }
    }


    /**
      * 运行单个任务
      */
    async runTask(taskName: string, params = {}) {
        // await this.initialize();

        console.log(`🎯 运行任务: ${taskName}`);
        console.log(`📋 参数:`, params);

        const context = {};

        try {
            const result = await this.executeTask(taskName, context);
            console.log(`✅ 任务执行成功: ${taskName}`);
            return result;
        } catch (error) {
            console.error(`❌ 任务执行失败: ${taskName}`, error.message);
            throw error;
        }
    }

}

function help() {
    console.log("Usage: npm run task <command|taskName> [params]");
    console.log("commond:");
    console.log("list: 显示所有任务");
    console.log("help: 帮助指南");
}


function listTasks() {
    console.log("task1");
    console.log("task2");
}

const app = new App();

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const taskName = args[1];
    const params = args[2];

    try {
        switch (command) {
            case "help":
                help();
                break;
            case "list":
                listTasks()
                break;
            default:
                if (!taskName) {
                    console.log('请指定任务名称 或者 help 查看用法');
                    return;
                }
                app.runTask(taskName, params)
                break;
        }

    } catch (err) {
        console.error("Error executing command:", err);
    }
}
// 如果直接运行此文件，则执行主函数
if (require.main === module) {
    main().catch(console.error);
}

export default App;