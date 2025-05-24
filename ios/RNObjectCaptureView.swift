import Foundation
import React
import RealityKit
import SwiftUI
import ARKit

@objc(RNObjectCaptureView)
class RNObjectCaptureView: RCTViewManager {
    override func view() -> UIView! {
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
    private var configuration: ObjectCaptureSession.Configuration?
    private var eventEmitter: RCTEventEmitter?
    
    override init() {
        super.init()
        Task {
            await setupSession()
        }
    }
    
    func setEventEmitter(_ emitter: RCTEventEmitter) {
        self.eventEmitter = emitter
    }
    
    private func getDocumentsDirectory() -> URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }
    
    private func setupSession() async {
        // Clean up any existing session
        await cleanupSession()
        
        // Create new configuration
        var config = ObjectCaptureSession.Configuration()
        config.checkpointDirectory = getDocumentsDirectory().appendingPathComponent("Snapshots")
        
        // Create directories if they don't exist
        let fileManager = FileManager.default
        let imagesDirectory = getDocumentsDirectory().appendingPathComponent("Images")
        let snapshotsDirectory = getDocumentsDirectory().appendingPathComponent("Snapshots")
        
        try? fileManager.createDirectory(at: imagesDirectory, withIntermediateDirectories: true)
        try? fileManager.createDirectory(at: snapshotsDirectory, withIntermediateDirectories: true)
        
        // Create and configure new session
        let newSession = ObjectCaptureSession()
        newSession.start(imagesDirectory: imagesDirectory, configuration: config)
        
        self.session = newSession
        self.configuration = config

        // Start observing session state
        observeSessionState()
    }

    private func observeSessionState() {
        guard let session = session else { return }
        
        // Observe session state changes
        Task {
            for await state in session.stateUpdates {
                eventEmitter?.sendEvent(withName: "onSessionStateChange", body: [
                    "state": String(describing: state)
                ])
            }
        }
    }
    
    func cleanupSession() async {
        if let existingSession = session {
            existingSession.cancel()
            session = nil
        }
    }
}

struct RNObjectCaptureViewWrapper: View {
    @StateObject private var sessionManager = ObjectCaptureSessionManager()
    
    var body: some View {
        ZStack {
            if let session = sessionManager.session {
                ObjectCaptureView(session: session)
                    .onDisappear {
                        Task {
                            await sessionManager.cleanupSession()
                        }
                    }
            }
        }
    }
}