import Foundation
import React

@objc(RNObjectCapture)
class RNObjectCapture: RCTEventEmitter {
    override func supportedEvents() -> [String]! {
        return ["onSessionStateChange", "onCaptureComplete", "onError"]
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    // Instead of overriding constantsToExport, we can use a different method name
    @objc
    func getConstants() -> [String: Any]! {
        return [
            "SessionState": [
                "initializing": "initializing",
                "ready": "ready",
                "capturing": "capturing",
                "processing": "processing",
                "completed": "completed",
                "failed": "failed"
            ]
        ]
    }
}