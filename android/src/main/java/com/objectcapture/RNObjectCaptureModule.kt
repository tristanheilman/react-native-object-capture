package com.objectcapture

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = RNObjectCaptureModule.NAME)
class RNObjectCaptureModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = NAME

    companion object {
        const val NAME = "RNObjectCapture"
    }
}