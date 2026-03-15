package com.tempproject.app.accessibility

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Rect
import android.os.Build
import android.os.Bundle
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class FacebookAccessibilityService : AccessibilityService() {

    companion object {
        var instance: FacebookAccessibilityService? = null
            private set

        var eventListener: ((String) -> Unit)? = null
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        
        val info = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS or 
                    AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or 
                    AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
            notificationTimeout = 100
        }
        
        serviceInfo = info
        sendEvent("SERVICE_CONNECTED")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        event?.let {
            sendEvent("EVENT: ${it.eventType} - ${it.text}")
        }
    }

    override fun onInterrupt() {
        sendEvent("SERVICE_INTERRUPTED")
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }

    override fun onUnbind(intent: Intent?): Boolean {
        instance = null
        return super.onUnbind(intent)
    }

    private fun sendEvent(message: String) {
        eventListener?.invoke(message)
    }

    fun isServiceEnabled(): Boolean {
        return instance != null
    }

    fun openAccessibilitySettings() {
        val intent = Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        startActivity(intent)
    }

    fun findAndClickText(text: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val result = findAndClickTextRecursive(rootNode, text)
        rootNode.recycle()
        return result
    }

    private fun findAndClickTextRecursive(node: AccessibilityNodeInfo, text: String): Boolean {
        val nodeText = node.text?.toString() ?: ""
        val nodeContentDesc = node.contentDescription?.toString() ?: ""
        
        if (nodeText.equals(text, ignoreCase = true) || nodeContentDesc.equals(text, ignoreCase = true)) {
            if (node.isClickable) {
                node.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                return true
            } else {
                val parent = node.parent
                if (parent != null) {
                    val clicked = parent.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                    parent.recycle()
                    if (clicked) return true
                }
            }
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            if (findAndClickTextRecursive(child, text)) {
                child.recycle()
                return true
            }
            child.recycle()
        }
        
        return false
    }

    fun findAndClickDescription(description: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val result = findAndClickDescriptionRecursive(rootNode, description)
        rootNode.recycle()
        return result
    }

    private fun findAndClickDescriptionRecursive(node: AccessibilityNodeInfo, description: String): Boolean {
        val nodeContentDesc = node.contentDescription?.toString() ?: ""
        
        if (nodeContentDesc.contains(description, ignoreCase = true)) {
            if (node.isClickable) {
                node.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                return true
            } else {
                val parent = node.parent
                if (parent != null) {
                    val clicked = parent.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                    parent.recycle()
                    if (clicked) return true
                }
            }
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            if (findAndClickDescriptionRecursive(child, description)) {
                child.recycle()
                return true
            }
            child.recycle()
        }
        
        return false
    }

    fun findAndInputText(findText: String, inputText: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val result = findAndInputTextRecursive(rootNode, findText, inputText)
        rootNode.recycle()
        return result
    }

    private fun findAndInputTextRecursive(node: AccessibilityNodeInfo, findText: String, inputText: String): Boolean {
        val nodeText = node.text?.toString() ?: ""
        
        if (nodeText.contains(findText, ignoreCase = true) || 
            node.hintText?.toString()?.contains(findText, ignoreCase = true) == true) {
            
            if (node.isEditable) {
                val arguments = Bundle()
                arguments.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, inputText)
                node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments)
                return true
            }
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            if (findAndInputTextRecursive(child, findText, inputText)) {
                child.recycle()
                return true
            }
            child.recycle()
        }
        
        return false
    }

    fun scrollDown(): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val result = rootNode.performAction(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD)
        rootNode.recycle()
        return result
    }

    fun scrollUp(): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val result = rootNode.performAction(AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD)
        rootNode.recycle()
        return result
    }

    fun goBack(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_BACK)
    }

    fun clickPosition(x: Int, y: Int): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            return false
        }
        return false
    }

    fun swipeUp(duration: Int): Boolean {
        return scrollDown()
    }

    fun swipeDown(duration: Int): Boolean {
        return scrollUp()
    }

    fun waitForElement(text: String, timeoutSeconds: Int): Boolean {
        val startTime = System.currentTimeMillis()
        val timeout = timeoutSeconds * 1000L
        
        while (System.currentTimeMillis() - startTime < timeout) {
            val rootNode = rootInActiveWindow
            if (rootNode != null) {
                if (findElement(rootNode, text)) {
                    rootNode.recycle()
                    return true
                }
                rootNode.recycle()
            }
            Thread.sleep(500)
        }
        return false
    }

    private fun findElement(node: AccessibilityNodeInfo, text: String): Boolean {
        val nodeText = node.text?.toString() ?: ""
        val nodeContentDesc = node.contentDescription?.toString() ?: ""
        
        if (nodeText.contains(text, ignoreCase = true) || nodeContentDesc.contains(text, ignoreCase = true)) {
            return true
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            if (findElement(child, text)) {
                child.recycle()
                return true
            }
            child.recycle()
        }
        
        return false
    }

    fun getCurrentPackage(): String {
        return rootInActiveWindow?.packageName?.toString() ?: ""
    }
}
