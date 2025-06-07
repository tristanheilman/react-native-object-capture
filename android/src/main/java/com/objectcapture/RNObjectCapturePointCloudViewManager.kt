package com.objectcapture

import android.view.View
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class RNObjectCapturePointCloudViewManager : SimpleViewManager<View>() {
    override fun getName() = "RNObjectCapturePointCloudView"

    override fun createViewInstance(reactContext: ThemedReactContext): View {
        return View(reactContext)
    }

    // Add empty prop setters for all the events
    @ReactProp(name = "onAppear")
    fun setOnAppear(view: View, onAppear: Boolean) {}

    @ReactProp(name = "onCloudPointViewAppear")
    fun setOnCloudPointViewAppear(view: View, onCloudPointViewAppear: Boolean) {}
}