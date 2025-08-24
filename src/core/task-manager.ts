import type { BaseTask } from "../data-tasks/base-task.js";
import { DataScreenTask } from "../data-tasks/data-screen-task.js";
import { DataScrapeTask } from "../data-tasks/data-scrape-task.js";
import { DataActionTask } from "../data-tasks/data-action-task.js";

/**
 * 任务管理器
 * 负责管理所有任务的注册和获取
 */
export class TaskManager {
  private static instance: TaskManager;
  private tasks: Map<string, BaseTask> = new Map();
  private initialized: boolean = false;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager();
    }
    return TaskManager.instance;
  }

  /**
   * 初始化任务管理器
   */
  async initialize() {
    if (this.initialized) {
      console.log("📋 任务管理器已经初始化");
      return;
    }

    console.log("📋 初始化任务管理器...");

    // 注册默认任务
    this.registerTask("screen", new DataScreenTask());
    this.registerTask("scrape", new DataScrapeTask());
    this.registerTask("action", new DataActionTask());

    this.initialized = true;
    console.log("✅ 任务管理器初始化完成");
  }

  /**
   * 注册任务
   */
  registerTask(name: string, task: BaseTask) {
    this.tasks.set(name, task);
    console.log(`📝 注册任务: ${name}`);
  }

  /**
   * 获取任务
   */
  getTask(name: string): BaseTask | undefined {
    return this.tasks.get(name);
  }

  /**
   * 获取所有任务名称
   */
  getAllTaskNames(): string[] {
    return Array.from(this.tasks.keys());
  }

  /**
   * 检查任务是否存在
   */
  hasTask(name: string): boolean {
    return this.tasks.has(name);
  }

  /**
   * 获取任务列表信息
   */
  getTaskList(): Array<{ name: string; description: string }> {
    const taskList = [
      { name: "screen", description: "页面截图任务" },
      { name: "scrape", description: "页面数据抓取任务" },
      { name: "action", description: "页面操作任务" },
    ];

    // 只返回已注册的任务
    return taskList.filter((task) => this.tasks.has(task.name));
  }

  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}
