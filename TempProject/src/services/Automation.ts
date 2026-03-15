import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { AutomationModule } = NativeModules;

export interface AutomationService {
  isServiceEnabled(): Promise<boolean>;
  openAccessibilitySettings(): void;
  clickText(text: string): Promise<boolean>;
  clickDescription(description: string): Promise<boolean>;
  inputText(findText: string, inputText: string): Promise<boolean>;
  scrollDown(): Promise<boolean>;
  scrollUp(): Promise<boolean>;
  goBack(): Promise<boolean>;
  clickPosition(x: number, y: number): Promise<boolean>;
  swipeUp(duration: number): Promise<boolean>;
  swipeDown(duration: number): Promise<boolean>;
  waitForElement(text: string, timeoutSeconds: number): Promise<boolean>;
  getCurrentPackage(): Promise<string>;
  addListener(event: string, callback: (data: string) => void): void;
  removeListeners(): void;
}

const eventEmitter = AutomationModule ? new NativeEventEmitter(AutomationModule) : null;

export const Automation: AutomationService = {
  isServiceEnabled: async () => {
    if (!AutomationModule) return false;
    try {
      return await AutomationModule.isServiceEnabled();
    } catch {
      return false;
    }
  },

  openAccessibilitySettings: () => {
    if (AutomationModule) {
      AutomationModule.openAccessibilitySettings();
    }
  },

  clickText: async (text: string) => {
    if (!AutomationModule) return false;
    return await AutomationModule.clickText(text);
  },

  clickDescription: async (description: string) => {
    if (!AutomationModule) return false;
    return await AutomationModule.clickDescription(description);
  },

  inputText: async (findText: string, inputText: string) => {
    if (!AutomationModule) return false;
    return await AutomationModule.inputText(findText, inputText);
  },

  scrollDown: async () => {
    if (!AutomationModule) return false;
    return await AutomationModule.scrollDown();
  },

  scrollUp: async () => {
    if (!AutomationModule) return false;
    return await AutomationModule.scrollUp();
  },

  goBack: async () => {
    if (!AutomationModule) return false;
    return await AutomationModule.goBack();
  },

  clickPosition: async (x: number, y: number) => {
    if (!AutomationModule) return false;
    return await AutomationModule.clickPosition(x, y);
  },

  swipeUp: async (duration: number) => {
    if (!AutomationModule) return false;
    return await AutomationModule.swipeUp(duration);
  },

  swipeDown: async (duration: number) => {
    if (!AutomationModule) return false;
    return await AutomationModule.swipeDown(duration);
  },

  waitForElement: async (text: string, timeoutSeconds: number) => {
    if (!AutomationModule) return false;
    return await AutomationModule.waitForElement(text, timeoutSeconds);
  },

  getCurrentPackage: async () => {
    if (!AutomationModule) return '';
    return await AutomationModule.getCurrentPackage();
  },

  addListener: (event: string, callback: (data: string) => void) => {
    if (eventEmitter) {
      eventEmitter.addListener(event, callback);
    }
  },

  removeListeners: () => {
    if (eventEmitter) {
      eventEmitter.removeAllListeners('onAutomationEvent');
      eventEmitter.removeAllListeners('onAutomationError');
    }
  },
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
