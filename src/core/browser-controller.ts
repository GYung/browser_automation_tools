import { Page } from "puppeteer-core";
import { InputUtils } from "../utils/input-utils.js";
import { ClickUtils } from "../utils/click-utils.js";
import { ScreenshotTask } from "../config/screenshot-config.js";
import { KeyboardUtils } from "../utils/keyboard-utils.js";
import { MouseUtils } from "../utils/mouse-utils.js";
import { OperationType, OperationConfig } from "../types/index.js";
import { getMetaConfig } from "../config/page-meta-config.js";

export class BrowserController {

    private static instance: BrowserController;
     /**
     * 获取单例实例
     */
     public static getInstance(): BrowserController {
        if (!BrowserController.instance) {
            BrowserController.instance = new BrowserController();
        }
        return BrowserController.instance;
    }

    async execute(page:Page, taskConfig:ScreenshotTask) : Promise<void> {
      const url = taskConfig.url;
      const operations = taskConfig.operations || [];
      for(const operation of operations){
        if(operation.type === OperationType.CONFIG){
          const metaConfigMap = getMetaConfig(url)
          const metaConfig = metaConfigMap.get(operation.key || "")
          if(!metaConfig){
            console.warn(`⚠️ 未找到页面元配置: ${operation.key}`);
            continue;
          }
          console.log('✅ 基于页面元配置执行');
          await this.batchExecute(page, metaConfig.operations || [])
        } else {
          await this.singleExecute(page, operation)
        }
      }
    }

    private async batchExecute(page:Page, operations:Array<OperationConfig>) : Promise<void> {
      if(operations.length == 0){
        return;
      }
      for(const operation of operations){
        await this.singleExecute(page, operation)
      }
    }

    private async singleExecute(page:Page, operation:OperationConfig) : Promise<void> {
      if(operation.type === OperationType.INPUT){
        await this.handleInput(page, operation);
     }
     if(operation.type === OperationType.KEYBOARD){
         await this.handleKeyboard(page, operation);
     }
     if(operation.type === OperationType.CLICK){
         await this.handleClick(page, operation);
     }
     if(operation.type === OperationType.CLICK_CHILD){
         await this.handleClickChild(page, operation);
     }
     if(operation.type === OperationType.MOUSE_MOVE){
         await this.handleMouseMoveCenter(page, operation);
     }
     if(operation.type === OperationType.MOUSE_MOVE_CLICK){
         await this.handleMouseMoveCenter(page, operation);
     }
    }

   /**
   * 处理输入操作
   */
  private async handleInput(page: Page, optration: OperationConfig): Promise<void> {
    if (!optration.selector) return;

    const result = await InputUtils.inputText(page, {
      selector: optration.selector,
      value: optration.value || '',
      waitTime: optration.waitTime || 0,
      timeout: 10000
    });

    if (!result.success) {
      console.warn(`⚠️ 输入失败，继续执行: ${result.error}`);
    }
  }

  /**
   * 处理按键操作
   */
  private async handleKeyboard(page: Page, optration: OperationConfig): Promise<void> {
    if (!optration.key) return;

    let result: any;

    // 特殊处理：当 key 为 'input' 时，使用文本输入方法
    if (optration.key === 'Input') {
      
      result = await KeyboardUtils.typeText(page, {
        key:optration.key,
        value: optration.value || '',
        waitTime: optration.waitTime || 0,
        timeout: 10000
      });
    } else {
      // 常规按键处理 
      result = await KeyboardUtils.pressKey(page, {
        key: optration.key,
        waitTime: optration.waitTime || 0,
        timeout: 10000
      });
    }

    if (!result.success) {
      console.warn(`⚠️ 按键失败，继续执行: ${result.error}`);
    }
  }

  /**
   * 处理点击操作
   */
  private async handleClick(page: Page, operation: OperationConfig): Promise<void> {
    const result = await ClickUtils.clickElement(page, {
      selector: operation.selector!,
      waitTime: operation.waitTime || 0,
      timeout: 10000
    });

    if (!result.success) {
      console.warn(`⚠️ 点击失败，继续截图: ${result.error}`);
    }
  }

  /**
   * 处理复杂点击操作（点击子元素）
   */
  private async handleClickChild(page: Page, operation: OperationConfig): Promise<void> {
    const config: any = {
      parentSelector: operation.parentSelector!,
      waitTime: operation.waitTime || 0,
      timeout: 10000
    };

    if (operation.childIndex !== undefined) {
      config.childIndex = operation.childIndex;
    }
    if (operation.childSelector) {
      config.childSelector = operation.childSelector;
    }

    const result = await ClickUtils.clickChildElement(page, config);

    if (!result.success) {
      console.warn(`⚠️ 点击子元素失败，继续执行: ${result.error}`);
    }
  }
  /**
   * 处理鼠标移动并点击操作
   */
  private async handleMouseMoveCenter(page: Page, operation: OperationConfig): Promise<void> {
    const mouseUtils = new MouseUtils(page);

    try {
      if (!operation.selector) {
        console.warn('⚠️ 鼠标移动点击操作需要指定 selector');
        return;
      }

      const element = await page.$(operation.selector);
      if (!element) {
        console.warn(`⚠️ 未找到元素: ${operation.selector}`);
        return;
      }

      // 先移动到元素中心
      await mouseUtils.moveToElementCenter(element, {
  
      });
      
    
    } catch (error) {
      console.warn(`⚠️ 鼠标移动点击失败，继续执行: ${error}`);
    }
  }

}