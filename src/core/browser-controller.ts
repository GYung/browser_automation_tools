import { Page } from "puppeteer-core";
import { InputUtils } from "../utils/input-utils.js";
import { ClickUtils } from "../utils/click-utils.js";
import { OperationConfig, ScreenshotTask } from "../config/screenshot-config.js";
import { KeyboardUtils } from "../utils/keyboard-utils.js";
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

    async execute(page:Page, taksConfig:ScreenshotTask) : Promise<void> {
      const url = taksConfig.url;
      const operations = taksConfig.operations || [];
      for(const operation of operations){
        if(operation.type === 'config'){
          const metaConfigMap = getMetaConfig(url)
          const metaConfig = metaConfigMap.get(operation.key || "")
          if(!metaConfig){
            continue;
          }
          console.log('✅ 基于页面元配置执行');
          await this.batchExecute(page, metaConfig.operations || [])
        } else {
          await this.signleExecute(page,operation)
        }
      }
    }

    private async batchExecute(page:Page, operations:Array<OperationConfig>) : Promise<void> {
      if(operations.length == 0){
        return;
      }
      for(const operation of operations){
        await this.signleExecute(page,operation)
      }
    }

    private async signleExecute(page:Page, operation:OperationConfig) : Promise<void> {
      if(operation.type === 'input'){
        await this.handleInput(page, operation);
     }
     if(operation.type === 'keyboard'){
         await this.handleKeyboard(page, operation);
     }
     if(operation.type === 'click'){
         await this.handleClick(page, operation);
     }
     if(operation.type === 'click-child'){
         await this.handleClickChild(page, operation);
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

    const result = await KeyboardUtils.pressKey(page, {
      key: optration.key,
      waitTime: optration.waitTime || 0,
      timeout: 10000
    });

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

}