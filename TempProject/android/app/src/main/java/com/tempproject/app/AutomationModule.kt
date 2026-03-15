package com.tempproject.app

import com.tempproject.app.accessibility.FacebookAccessibilityService
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class AutomationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "AutomationModule"
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun isServiceEnabled(promise: Promise) {
        try {
            val enabled = FacebookAccessibilityService.instance?.isServiceEnabled() ?: false
            promise.resolve(enabled)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        try {
            FacebookAccessibilityService.instance?.openAccessibilitySettings()
        } catch (e: Exception) {
            val intent = android.content.Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactApplicationContext.startActivity(intent)
        }
    }

    @ReactMethod
    fun clickText(text: String, promise: Promise) {
        try {
            val result = FacebookAccessibilityService.instance?.findAndClickText(text) ?: false
            promise.resolve(result)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun clickDescription(description: String, promise: Promise) {
        try {
            val result = FacebookAccessibilityService.instance?.findAndClickDescription(description) ?: false
            promise.resolve(result)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun inputText(findText: String, inputText: String, promise: Promise) {
        try {
            val result = FacebookAccessibilityService.instance?.findAndInputText(findText, inputText) ?: false
            promise.resolve(result)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun scrollDown(promise: Promise) {
        try {
            val result = FacebookAccessibilityService.instance?.scrollDown() ?: false
            promise.resolve(result)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun scrollUp(promise: Promise) {
        try {
            val result = FacebookAccessibilityService.instance?.scrollUp() ?: false
            promise.resolve(result)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun goBack(promise: Promise) {
        try {
            val result = FacebookAccessibilityService.instance?.goBack() ?: false
            promise.resolve(result)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun clickPosition(x: Int, y: Int, promise: Promise) {
        promise.resolve(false)
    }

    @ReactMethod
    fun swipeUp(duration: Int, promise: Promise) {
        try {
            val result = FacebookAccessibilityService.instance?.swipeUp(duration) ?: false
            promise.resolve(result)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun swipeDown(duration: Int, promise: Promise) {
        try {
            val result = FacebookAccessibilityService.instance?.swipeDown(duration) ?: false
            promise.resolve(result)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun waitForElement(text: String, timeoutSeconds: Int, promise: Promise) {
        try {
            val result = FacebookAccessibilityService.instance?.waitForElement(text, timeoutSeconds) ?: false
            promise.resolve(result)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun getCurrentPackage(promise: Promise) {
        try {
            val packageName = FacebookAccessibilityService.instance?.getCurrentPackage() ?: ""
            promise.resolve(packageName)
        } catch (e: Exception) {
            promise.resolve("")
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN event emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN event emitter
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
