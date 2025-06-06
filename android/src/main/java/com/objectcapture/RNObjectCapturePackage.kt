package com.objectcapture

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class RNObjectCapturePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(
            RNObjectCaptureModule(reactContext),
            PhotogrammetrySessionModule(reactContext)
        )
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return listOf(
            RNObjectCaptureViewManager(),
            RNObjectCapturePointCloudViewManager()
        )
    }
}