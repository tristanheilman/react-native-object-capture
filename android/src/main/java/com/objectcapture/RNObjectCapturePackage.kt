package com.objectcapture

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * Object Capture is an Apple framework with no Android equivalent, so this
 * package exists only to keep the Android build of a cross-platform app green
 * and to give `PhotogrammetrySession` somewhere to reject from explicitly.
 *
 * There are deliberately no view managers here. Every view component in this
 * library returns `null` off iOS before it reaches the native component, so any
 * manager registered here would be unreachable — see `docs/android/`.
 */
class RNObjectCapturePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(PhotogrammetrySessionModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
