import Foundation
import React
import Metal
import MetalKit
import RealityKit
import ARKit
import SwiftUI


class RNObjectCaptureSessionManager: NSObject, ObservableObject {
    static let shared = RNObjectCaptureSessionManager()

    // ObjectCaptureSession is the main session for the object capture session.
    @Published var session: ObjectCaptureSession?
    // EventEmitter is the event emitter for the object capture session.
    @Published var eventEmitter: RCTEventEmitter?
    // Configuration is the configuration for the object capture session.
    private var configuration: ObjectCaptureSession.Configuration?
    // EventBuffer is the buffer for the object capture session.
    private var eventBuffer: [(String, [String: Any])] = []
    // ViewManager is the view manager for the object capture session.
    private weak var viewManager: RNObjectCaptureView?
    // PointCloudViewManager is the point cloud view manager for the object capture session.
    private weak var pointCloudViewManager: RNObjectCapturePointCloudView?
    // Number of scan pass' completed
    private var numberOfScanPassCompleted: Int = 0
    // Checkpoint directory file path
    private var checkpointDirectory: String = "Snapshots/"
    // Images directory file path
    private var imagesDirectory: String = "Images/"

    private override init() {
        super.init()
    }
    
    func setViewManager(_ viewManager: RNObjectCaptureView) {
        self.viewManager = viewManager
    }

    func setPointCloudViewManager(_ viewManager: RNObjectCapturePointCloudView) {
        self.pointCloudViewManager = viewManager
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

    func setCheckpointDirectory(_ directory: String) {
        self.checkpointDirectory = directory
    }

    func setImagesDirectory(_ directory: String) {
        self.imagesDirectory = directory
    }

    func sendEvent(name: String, body: [String: Any]) {
        if let emitter = eventEmitter {
            emitter.sendEvent(withName: name, body: body)
        } else {
            // Buffer the event until the emitter is set
            eventBuffer.append((name, body))
        }
    }

    @objc
    func onScanPassCompleted(_ node: NSNumber, completed: Bool) {
        self.viewManager?.onScanPassCompleted(node, completed: completed)
        self.eventEmitter?.sendEvent(withName: "onScanPassCompleted", body: [
            "completed": completed
        ])
        numberOfScanPassCompleted += 1
    }

    @objc
    func onCaptureComplete(_ node: NSNumber, completed: Bool) {
        self.viewManager?.onCaptureComplete(node, completed: completed)
        self.eventEmitter?.sendEvent(withName: "onCaptureComplete", body: [
            "completed": completed
        ])
    }

    @objc
    func onFeedbackStateChange(_ node: NSNumber, feedback: [String]) {
        self.viewManager?.onFeedbackStateChange(node, feedback: feedback)
        self.eventEmitter?.sendEvent(withName: "onFeedbackStateChange", body: [
            "feedback": feedback
        ])
    }

    @objc
    func onTrackingStateChange(_ node: NSNumber, tracking: String) {
        self.viewManager?.onTrackingStateChange(node, tracking: tracking)
        self.eventEmitter?.sendEvent(withName: "onTrackingStateChange", body: [
            "tracking": tracking
        ])
    }

    @objc
    func onSessionStateChange(_ node: NSNumber, state: String) {
        self.viewManager?.onSessionStateChange(node, state: state)
        self.eventEmitter?.sendEvent(withName: "onSessionStateChange", body: [
            "state": state
        ])
    }

    @objc
    func onError(_ node: NSNumber, error: String) {
      self.viewManager?.onError(node, error: error)
      self.eventEmitter?.sendEvent(withName: "onError", body: [
        "error": error
      ])
    }

    @objc
    func onCloudPointViewAppear(_ node: NSNumber) {
        self.pointCloudViewManager?.onCloudPointViewAppear(node)
    }

    @objc
    func onAppear(_ node: NSNumber) {
        self.pointCloudViewManager?.onAppear(node)
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
            
            guard (metalDevice.makeCommandQueue()) != nil else {
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
        let appendedCheckpointDir = self.getCheckpointDirectory()
        
        // Create checkpoint directory if it doesn't exist
        if !FileManager.default.fileExists(atPath: appendedCheckpointDir.path) {
            do {
                try FileManager.default.createDirectory(at: appendedCheckpointDir, withIntermediateDirectories: true)
            } catch {
                print("Failed to create checkpoint directory: \(error)")
                completion(false, "Failed to create checkpoint directory")
                return
            }
        } else {
            // Clear existing checkpoint directory
            do {
                try? FileManager.default.removeItem(at: appendedCheckpointDir)
                try? FileManager.default.createDirectory(at: appendedCheckpointDir, withIntermediateDirectories: true)
            } catch {
                print("Failed to clear checkpoint directory: \(error)")
                completion(false, "Failed to clear checkpoint directory")
                return
            }
        }
        
        var config = ObjectCaptureSession.Configuration()
        config.checkpointDirectory = self.getCheckpointDirectory()

        // Create directories if they don't exist
        let appendedImagesDirectory = self.getImagesDirectory()
        
        // Create directory if it doesn't exist
        if !FileManager.default.fileExists(atPath: appendedImagesDirectory.path) {
            do {
                try FileManager.default.createDirectory(at: appendedImagesDirectory, withIntermediateDirectories: true)
            } catch {
                print("Failed to create images directory: \(error)")
                completion(false, "Failed to create images directory")
                return
            }
        } else {
            // Clear existing directory
            do {
                try? FileManager.default.removeItem(at: appendedImagesDirectory)
                try? FileManager.default.createDirectory(at: appendedImagesDirectory, withIntermediateDirectories: true)
            } catch {
                print("Failed to clear images directory: \(error)")
                completion(false, "Failed to clear images directory")
                return
            }
        }

        // Create and configure new session
        let newSession = ObjectCaptureSession()
        
        // Start the session
        newSession.start(imagesDirectory: self.getImagesDirectory(), configuration: config)
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
    func cancelSession() async {
        print("Cancelling session") // Debug log
        if let existingSession = session {
            existingSession.cancel()
            session = nil
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
        print("Starting detection [RNObjectCaptureSessionManager]") // Debug log
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

            // Add a small delay to allow files to be written
            try? await Task.sleep(nanoseconds: 1_000_000_000) // 1 second
            
            // Verify the files
            let filesValid = verifyImageFiles()
            if !filesValid {
                print("Warning: Some image files are empty or invalid")
                eventEmitter?.sendEvent(withName: "onError", body: [
                    "error": "Some image files were not properly written"
                ])
            }
            
            session = nil
        }
    }

    @MainActor
    private func verifyImageFiles() -> Bool {
        let fileManager = FileManager.default
        let imagesDir = getImagesDirectory()
        
        do {
            let contents = try fileManager.contentsOfDirectory(at: imagesDir, includingPropertiesForKeys: [.fileSizeKey])
            for url in contents {
                let attributes = try fileManager.attributesOfItem(atPath: url.path)
                let fileSize = attributes[.size] as? UInt64 ?? 0
                print("File: \(url.lastPathComponent), Size: \(fileSize) bytes")
                
                if fileSize == 0 {
                    print("Warning: Empty file detected: \(url.lastPathComponent)")
                    return false
                }
            }
            return true
        } catch {
            print("Error verifying image files: \(error)")
            return false
        }
    }

    @MainActor
    func getSessionState() -> String {
        return session?.state.stringValue ?? "unknown"
    }

    @MainActor
    func getTrackingState() -> String {
      return session?.cameraTracking.stringValue ?? "unknown"
    }

    @MainActor
    func getFeedbackState() -> [String] {
      return session?.feedback.stringValues ?? ["unknown"]
    }

    @MainActor
    func getNumberOfShotsTaken() -> Int {
        return session?.numberOfShotsTaken ?? 0
    }

    @MainActor
    func getUserCompletedScanState() -> Bool {
        return session?.userCompletedScanPass ?? false
    }

    @MainActor
    func getNumberOfScanPassUpdates() -> Int {
        return numberOfScanPassCompleted
    }

    @MainActor
    func isDeviceSupported() -> Bool {
        return ObjectCaptureSession.isSupported
    }

    private func getCheckpointDirectory() -> URL {
        print("Getting checkpoint directory", self.checkpointDirectory) // Debug log
      return getDocumentsDirectory().appendingPathComponent(self.checkpointDirectory)
    }

    private func getImagesDirectory() -> URL {
        print("Getting images directory", self.imagesDirectory) // Debug log
      return getDocumentsDirectory().appendingPathComponent(self.imagesDirectory)
    }

    private func getDocumentsDirectory() -> URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }
}
