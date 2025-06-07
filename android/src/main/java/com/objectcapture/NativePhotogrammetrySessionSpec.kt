package com.objectcapture

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

abstract class NativePhotogrammetrySessionSpec(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    abstract fun startReconstruction(
        inputPath: String,
        checkpointPath: String,
        outputPath: String,
        promise: Promise
    )

    abstract fun cancelReconstruction(promise: Promise)
}