import Foundation
import React
import Metal
import MetalKit
import RealityKit
import SwiftUI
import ARKit

@objc(RNObjectCaptureView)
class RNObjectCaptureView: RCTViewManager {
    private var _sharedSessionManager: ObjectCaptureSessionManager

    override init() {
        _sharedSessionManager = ObjectCaptureSessionManager()
    }
    
    override func view() -> UIView! {
        let hostingController = UIHostingController(rootView: RNObjectCaptureViewWrapper(sessionManager: _sharedSessionManager))
        return hostingController.view
    }
    
    @objc
    func resumeSession(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
          await _sharedSessionManager.resumeSession()
        }
    }
    
    @objc
    func pauseSession(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.pauseSession()
        }
    }
    
    @objc
    func startDetection(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.startDetection()
        }
    }
    
    @objc
    func resetDetection(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.resetDetection()
        }
    }
    
    @objc
    func startCapturing(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.startCapturing()
        }
    }
    
    @objc
    func finishSession(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.finishSession()
        }
    }

    @objc
    func beginNewScanAfterFlip(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.beginNewScanAfterFlip()
        }
    }

    @objc
    func beginNewScan(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.beginNewScan()
        }
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override static func moduleName() -> String! {
        return "RNObjectCaptureView"
    }
}

class ObjectCaptureSessionManager: NSObject, ObservableObject {
    @Published var session: ObjectCaptureSession?
    @Published var eventEmitter: RCTEventEmitter?
    private var configuration: ObjectCaptureSession.Configuration?
    private var eventBuffer: [(String, [String: Any])] = []

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

    @MainActor
    func setupSession(completion: @escaping (Bool, String?) -> Void) {
        print("Setting up session") // Debug log
        
        // Clean up any existing session
        cleanupSession { [weak self] success, error in
            guard let self = self else { return }
            
            // Check if device supports Object Capture
            if !ObjectCaptureSession.isSupported {
                print("Object Capture is not supported on this device")
                self.eventEmitter?.sendEvent(withName: "onError", body: [
                    "message": "Object Capture is not supported on this device"
                ])
                completion(false, "Object Capture is not supported on this device")
                return
            }
            
            // Check if Metal is available and properly configured
            guard let metalDevice = MTLCreateSystemDefaultDevice() else {
                print("Failed to create Metal device")
                self.eventEmitter?.sendEvent(withName: "onError", body: [
                    "message": "Failed to create Metal device"
                ])
                completion(false, "Failed to create Metal device")
                return
            }
            
            print("Metal device: \(metalDevice.name)")
            
            guard let commandQueue = metalDevice.makeCommandQueue() else {
                print("Failed to create Metal command queue")
                self.eventEmitter?.sendEvent(withName: "onError", body: [
                    "message": "Failed to create Metal command queue"
                ])
                completion(false, "Failed to create Metal command queue")
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
                    self.eventEmitter?.sendEvent(withName: "onError", body: [
                        "message": "Device does not support required Metal GPU family: \(family)"
                    ])
                    completion(false, "Device does not support required Metal GPU family: \(family)")
                    return
                }
            }
            
            // Check camera permissions
            let cameraAuthStatus = AVCaptureDevice.authorizationStatus(for: .video)
            if cameraAuthStatus != .authorized {
                AVCaptureDevice.requestAccess(for: .video) { granted in
                    if !granted {
                        self.eventEmitter?.sendEvent(withName: "onError", body: [
                            "message": "Camera permission not granted"
                        ])
                        completion(false, "Camera permission not granted")
                        return
                    }
                    self.finishSetup(completion: completion)
                }
            } else {
                self.finishSetup(completion: completion)
            }
        }
    }
    
    @MainActor
    private func finishSetup(completion: @escaping (Bool, String?) -> Void) {
        // Create new configuration
        let checkpointDirectory = getDocumentsDirectory().appendingPathComponent("Snapshots/")
        
        // Create checkpoint directory if it doesn't exist
        if !FileManager.default.fileExists(atPath: checkpointDirectory.path) {
            do {
                try FileManager.default.createDirectory(at: checkpointDirectory, withIntermediateDirectories: true)
            } catch {
                print("Failed to create checkpoint directory: \(error)")
                completion(false, "Failed to create checkpoint directory")
                return
            }
        } else {
            // Clear existing checkpoint directory
            do {
                let contents = try FileManager.default.contentsOfDirectory(at: checkpointDirectory, includingPropertiesForKeys: nil)
                for file in contents {
                    try FileManager.default.removeItem(at: file)
                }
            } catch {
                print("Failed to clear checkpoint directory: \(error)")
                completion(false, "Failed to clear checkpoint directory")
                return
            }
        }
        
        var config = ObjectCaptureSession.Configuration()
        config.checkpointDirectory = checkpointDirectory

        // Create directories if they don't exist
        let imagesDirectory = getDocumentsDirectory().appendingPathComponent("Images/")
        
        // Create directory if it doesn't exist
        if !FileManager.default.fileExists(atPath: imagesDirectory.path) {
            do {
                try FileManager.default.createDirectory(at: imagesDirectory, withIntermediateDirectories: true)
            } catch {
                print("Failed to create images directory: \(error)")
                completion(false, "Failed to create images directory")
                return
            }
        } else {
            // Clear existing directory
            do {
                let contents = try FileManager.default.contentsOfDirectory(at: imagesDirectory, includingPropertiesForKeys: nil)
                for file in contents {
                    try FileManager.default.removeItem(at: file)
                }
            } catch {
                print("Failed to clear images directory: \(error)")
                completion(false, "Failed to clear images directory")
                return
            }
        }

        // Create and configure new session
        let newSession = ObjectCaptureSession()
        
        // Start the session
        newSession.start(imagesDirectory: imagesDirectory, configuration: config)
        self.session = newSession
        self.configuration = config
        
        print("Session started successfully") // Debug log
        completion(true, nil)
    }
    
    @MainActor
    func cleanupSession(completion: @escaping (Bool, String?) -> Void) {
        if let session = self.session {
            session.cancel()
            self.session = nil
        }
        completion(true, nil)
    }

    @MainActor
    func resumeSession() async {
        print("Resuming session") // Debug log
        if let existingSession = session {
            existingSession.resume()
        }
    }

    @MainActor
    func pauseSession() async {
        print("Pausing session") // Debug log
        if let existingSession = session {
            existingSession.pause()
        }
    }

    @MainActor
    func startDetection() async {
        print("Starting detection [ObjectCaptureSessionManager]") // Debug log
        if let existingSession = session {
            existingSession.startDetecting()
        }
    }

    @MainActor
    func resetDetection() async {
        print("Resetting detection") // Debug log
        if let existingSession = session {
            existingSession.resetDetection()
        }
    }

    @MainActor
    func startCapturing() async {
        print("Starting capture") // Debug log
        if let existingSession = session {
            existingSession.startCapturing()
        }
    }

    @MainActor
    func beginNewScanAfterFlip() async {
        print("Beginning new scan after flip") // Debug log
        if let existingSession = session {
            existingSession.beginNewScanPassAfterFlip()
        }
    }

    @MainActor
    func beginNewScan() async {
        print("Beginning new scan") // Debug log
        if let existingSession = session {
            existingSession.beginNewScanPass()
        }
    }

    @MainActor
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
    @ObservedObject var sessionManager: ObjectCaptureSessionManager
    
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
                        sessionManager.cleanupSession { success, error in
                            if !success {
                                print("Failed to cleanup session: \(error ?? "Unknown error")")
                            } else {
                                print("Session cleanup completed successfully")
                            }
                        }
                    }
                }
            } else {
                // Show loading or error state
                VStack {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                        .onAppear {
                            sessionManager.setupSession { success, error in
                                if !success {
                                    print("Failed to setup session: \(error ?? "Unknown error")")
                                }
                            }
                        }
                    Text("Initializing...")
                        .padding()
                        
                }
            }
        }
    }
}
