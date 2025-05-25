import Foundation
import React
import Metal
import MetalKit
import RealityKit
import SwiftUI
import ARKit

@objc(RNObjectCaptureView)
class RNObjectCaptureView: RCTViewManager {
    //private var sessionManager: ObjectCaptureSessionManager?
    
    override func view() -> UIView! {
        // Get the session manager from the RNObjectCapture module
        // if let bridge = RCTBridge.current(),
        //    let module = bridge.module(for: RNObjectCapture.self) as? RNObjectCapture {
        //     sessionManager = module.getSessionManager()
        // }
        
        let hostingController = UIHostingController(rootView: RNObjectCaptureViewWrapper())
        return hostingController.view
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override static func moduleName() -> String! {
        return "RNObjectCaptureView"
    }
}

@MainActor
class ObjectCaptureSessionManager: NSObject, ObservableObject {
    @Published var session: ObjectCaptureSession?
    @Published var eventEmitter: RCTEventEmitter?
    private var configuration: ObjectCaptureSession.Configuration?
    private var eventBuffer: [(String, [String: Any])] = []

    override init() {
        super.init()
      print("ObjectCaptureSessionManager initializing") // Debug log
        Task {
            await setupSession()
            print("ObjectCaptureSessionManager initialized") // Debug log
        }
    }
    
    func setEventEmitter(_ emitter: RCTEventEmitter) {
        self.eventEmitter = emitter
        print("Event emitter set")
        // Flush buffered events
        for (name, body) in eventBuffer {
            emitter.sendEvent(withName: name, body: body)
        }
        eventBuffer.removeAll()
    }

    func sendEvent(name: String, body: [String: Any]) {
        if let emitter = eventEmitter {
            emitter.sendEvent(withName: name, body: body)
        } else {
            // Buffer the event until the emitter is set
            eventBuffer.append((name, body))
        }
    }
    
    func setupSession() async {
        print("Setting up session") // Debug log
        
        // Clean up any existing session
        await cleanupSession()

        // Check if device supports Object Capture
        if !ObjectCaptureSession.isSupported {
            print("Object Capture is not supported on this device")
            eventEmitter?.sendEvent(withName: "onError", body: [
                "message": "Object Capture is not supported on this device"
            ])
            return
        }
        
        // Check if Metal is available and properly configured
        guard let metalDevice = MTLCreateSystemDefaultDevice() else {
            print("Failed to create Metal device")
            eventEmitter?.sendEvent(withName: "onError", body: [
                "message": "Failed to create Metal device"
            ])
            return
        }
        
        print("Metal device: \(metalDevice.name)")
        
        guard let commandQueue = metalDevice.makeCommandQueue() else {
            print("Failed to create Metal command queue")
            eventEmitter?.sendEvent(withName: "onError", body: [
                "message": "Failed to create Metal command queue"
            ])
            return
        }
        print("Metal command queue created successfully")

        // Check for required Metal GPU families
        let requiredFamilies: [MTLGPUFamily] = [
            .apple4,  // iOS GPU Family 4
            .apple5   // iOS GPU Family 5
        ]
        
        for family in requiredFamilies {
            if !metalDevice.supportsFamily(family) {
                print("Device does not support required Metal GPU family: \(family)")
                eventEmitter?.sendEvent(withName: "onError", body: [
                    "message": "Device does not support required Metal GPU family: \(family)"
                ])
                return
            }
        }
        
        // Check camera permissions first
        let cameraAuthStatus = AVCaptureDevice.authorizationStatus(for: .video)
        if cameraAuthStatus != .authorized {
            // Request camera permission
            let granted = await AVCaptureDevice.requestAccess(for: .video)
            if !granted {
                eventEmitter?.sendEvent(withName: "onError", body: [
                    "message": "Camera permission not granted"
                ])
                return
            }
        }
        
        // Create new configuration
        var config = ObjectCaptureSession.Configuration()
        config.checkpointDirectory = getDocumentsDirectory().appendingPathComponent("Snapshots/")
        
        // Create directories if they don't exist
        let imagesDirectory = getDocumentsDirectory().appendingPathComponent("Images/")
        
        // Create and configure new session
        let newSession = ObjectCaptureSession()
        
        // Start the session
        newSession.start(imagesDirectory: imagesDirectory, configuration: config)
        self.session = newSession
        self.configuration = config
        
        print("Session started successfully") // Debug log
    }

    func cleanupSession() async {
        print("Cleaning up session") // Debug log
        
        if let existingSession = session {
            existingSession.cancel()
            session = nil
        }
    }

    func resumeSession() async {
        print("Resuming session") // Debug log
        if let existingSession = session {
            existingSession.resume()
        }
    }

    func pauseSession() async {
        print("Pausing session") // Debug log
        if let existingSession = session {
            existingSession.pause()
        }
    }

    func startDetection() async {
        print("Starting detection") // Debug log
        if let existingSession = session {
            existingSession.startDetecting()
        }
    }

    func resetDetection() async {
        print("Resetting detection") // Debug log
        if let existingSession = session {
            existingSession.resetDetection()
        }
    }

    func startCapturing() async {
        print("Starting capture") // Debug log
        if let existingSession = session {
            existingSession.startCapturing()
        }
    }

    func beginNewScanAfterFlip() async {
        print("Beginning new scan after flip") // Debug log
        if let existingSession = session {
            existingSession.beginNewScanPassAfterFlip()
        }
    }

    func beginNewScan() async {
        print("Beginning new scan") // Debug log
        if let existingSession = session {
            existingSession.beginNewScanPass()
        }
    }

    func finishSession() async {
        print("Finishing session") // Debug log
        if let existingSession = session {
            existingSession.finish()
            session = nil
        }
    }

    private func getDocumentsDirectory() -> URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }
}

extension ObjectCaptureSession.CaptureState {
    var stringValue: String {
        switch self {
        case .initializing:
            return "initializing"
        case .ready:
            return "ready"
        case .capturing:
            return "capturing"
        case .completed:
            return "completed"
        case .failed:
            return "failed"
        case .detecting:
            return "detecting"
        case .finishing:
            return "finishing"
        @unknown default:
            return "unknown"
        }
    }
}

struct RNObjectCaptureViewWrapper: View {
    @StateObject private var sessionManager = ObjectCaptureSessionManager()
    
    var body: some View {
        ZStack {
            if let session = sessionManager.session {
                VStack {
                    ObjectCaptureView(session: session)
                    .onChange(of: session.state) { _, newState in
                        print("Session state changed to \(newState)")
                        let stateString = newState.stringValue
                        print("Converted state to string: \(stateString)") // Debug log
                        sessionManager.sendEvent(name: "onSessionStateChange", body: [
                            "state": stateString
                        ])
                    }
                    .onAppear {
                        print("ObjectCaptureView appeared") // Debug log
                        // Set the event emitter when the view appears
                        if let bridge = RCTBridge.current() {
                            if let module = bridge.module(for: RNObjectCapture.self) as? RCTEventEmitter {
                                print("Setting event emitter from SwiftUI .onAppear")
                                sessionManager.setEventEmitter(module)
                            } else {
                                print("Failed to get RCTEventEmitter module")
                            }
                        } else {
                            print("No RCTBridge available")
                        }
                    }
                    .onDisappear {
                        print("ObjectCaptureView disappeared") // Debug log
                        Task {
                            await sessionManager.cleanupSession()
                        }
                    }
                }
            } else {
                // Show loading or error state
                VStack {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                    Text("Initializing...")
                        .padding()
                }
            }
        }
    }
}
