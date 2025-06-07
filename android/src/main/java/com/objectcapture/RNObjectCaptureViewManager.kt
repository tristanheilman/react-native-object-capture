package com.objectcapture

import android.view.View
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class RNObjectCaptureViewManager : SimpleViewManager<View>() {
    override fun getName() = "RNObjectCaptureView"

    override fun createViewInstance(reactContext: ThemedReactContext): View {
        return View(reactContext)
    }

    // Add empty prop setters for all the events
    @ReactProp(name = "onSessionStateChange")
    fun setOnSessionStateChange(view: View, onSessionStateChange: Boolean) {}

    @ReactProp(name = "onTrackingStateChange")
    fun setOnTrackingStateChange(view: View, onTrackingStateChange: Boolean) {}

    @ReactProp(name = "onFeedbackStateChange")
    fun setOnFeedbackStateChange(view: View, onFeedbackStateChange: Boolean) {}

    @ReactProp(name = "onCaptureComplete")
    fun setOnCaptureComplete(view: View, onCaptureComplete: Boolean) {}

    @ReactProp(name = "onScanPassCompleted")
    fun setOnScanPassCompleted(view: View, onScanPassCompleted: Boolean) {}

    @ReactProp(name = "onError")
    fun setOnError(view: View, onError: Boolean) {}
}