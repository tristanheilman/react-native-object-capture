package com.objectcapture

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

@ReactModule(name = PhotogrammetrySessionModule.NAME)
class PhotogrammetrySessionModule(reactContext: ReactApplicationContext) : 
    NativePhotogrammetrySessionSpec(reactContext) {

    override fun getName(): String = NAME

    override fun startReconstruction(
        inputPath: String,
        checkpointPath: String,
        outputPath: String,
        promise: Promise
    ) {
        promise.reject("NOT_IMPLEMENTED", "Photogrammetry is not implemented on Android")
    }

    override fun cancelReconstruction(promise: Promise) {
        promise.reject("NOT_IMPLEMENTED", "Photogrammetry is not implemented on Android")
    }

    companion object {
        const val NAME = "RNPhotogrammetrySession"
    }
}