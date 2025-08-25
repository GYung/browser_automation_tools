import { BrowserManager } from "./core/browser-manager.js";
import { TaskManager } from "./core/task-manager.js";

class App {
  private browserManager: BrowserManager;
  private taskManager: TaskManager;
  private initialized: boolean = false;

  constructor() {
    this.browserManager = BrowserManager.getInstance();
    this.taskManager = TaskManager.getInstance();
  }

  /**
   * 初始化任务运行器
   */
  async initialize() {
    if (this.initialized) return;

    console.log("🚀 初始化任务运行器...");

    // 初始化浏览器管理器
    await this.browserManager.initialize();

    // 初始化任务管理器
    await this.taskManager.initialize();

    this.initialized = true;
    console.log("✅ 任务运行器初始化完成");
  }

  /**
   * 关闭浏览器
   */
  async closeBrowser() {
    await this.browserManager.close();
  }

  /**
   * 执行单个任务
   */
  async executeTask(taskName: string, params = {}, context = {}) {
    const task = this.taskManager.getTask(taskName);

    if (!task) {
      throw new Error(`任务未找到: ${taskName}`);
    }

    console.log(`🚀 开始执行任务: ${taskName}`);
    try {
      // 执行任务
      const result = await task.execute(params, context);

      console.log(`✅ 任务执行完成: ${taskName}`);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`❌ 任务执行失败: ${taskName}`, errorMessage);
      throw error;
    }
  }

  /**
   * 运行单个任务
   */
  async runTask(taskName: string, params = {}) {
    await this.initialize();

    console.log(`🎯 运行任务: ${taskName}`);
    console.log(`📋 参数:`, params);

    const context = {};

    try {
      const result = await this.executeTask(taskName, params, context);
      console.log(`✅ 任务执行成功: ${taskName}`);

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`❌ 任务执行失败: ${taskName}`, errorMessage);

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

async function listTasks() {
  const taskManager = TaskManager.getInstance();
  await taskManager.initialize();
  const taskList = taskManager.getTaskList();

  console.log("可用的任务:");
  taskList.forEach((task) => {
    console.log(`\n📋 ${task.name}`);
    console.log(`   描述: ${task.description}`);
    console.log(`   用法: ${task.usage}`);
  });
 
}

const app = new App();

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const params = args[1];
  console.log(command, params);
  try {
    switch (command) {
      case "help":
        help();
        break;
      case "list":
        await listTasks();
        break;
      default:
        if (!command) {
          console.log("请指定任务名称 或者 help 查看用法");
          return;
        }
        await app.runTask(command, params);
        // 任务完成后退出，保持浏览器运行
        // process.exit(0);
        break;
    }
  } catch (err) {
    console.error("Error executing command:", err);
  }
}
// 直接执行主函数
main().catch(console.error);
