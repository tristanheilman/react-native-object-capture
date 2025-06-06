import Foundation
import React
import Metal
import MetalKit
import RealityKit
import SwiftUI
import ARKit

// SessionView is the main view for the object capture session.
// It is responsible for displaying the session state, feedback, and tracking state.
// It also handles the appearance and disappearance of the view.
struct SessionView: View {
    let session: ObjectCaptureSession
    let sessionManager: ObjectCaptureSessionManager

    var body: some View {
        ObjectCaptureView(session: session)
            .onChange(of: session.state) { _, newState in
                handleStateChange(newState)
            }
            .onChange(of: session.feedback) { _, newState in
                handleFeedbackChange(newState)
            }
            .onChange(of: session.cameraTracking) { _, newState in
                handleTrackingChange(newState)
            }
            .onChange(of: session.userCompletedScanPass) { _, newState in
                handleScanPassCompleted(newState)
            }
            .onAppear {
                handleAppear()
            }
            .onDisappear {
                handleDisappear()
            }
    }

    private func handleStateChange(_ newState: ObjectCaptureSession.CaptureState) {
        print("Session state changed to \(newState)")
        let stateString = newState.stringValue
        print("Converted state to string: \(stateString)")
        sessionManager.onSessionStateChange(NSNumber(value: 0), state: stateString)
        if stateString == "completed" {
            handleCaptureComplete(true)
        }
    }

    private func handleFeedbackChange(_ newState: Set<ObjectCaptureSession.Feedback>) {
        print("Feedback state changed to \(newState)")
        let feedbackString = newState.stringValues
        print("Converted feedback to string: \(feedbackString)")
        sessionManager.onFeedbackStateChange(NSNumber(value: 0), feedback: feedbackString)
    }

    private func handleTrackingChange(_ newState: ObjectCaptureSession.Tracking) {
        print("Tracking state changed to \(newState)")
        let trackingString = newState.stringValue
        print("Converted tracking to string: \(trackingString)")
        sessionManager.onTrackingStateChange(NSNumber(value: 0), tracking: trackingString)
    }

    private func handleCaptureComplete(_ newState: Bool) {
        print("User completed scan pass changed to \(newState)")
        sessionManager.onCaptureComplete(NSNumber(value: 0), completed: newState)
    }

    private func handleScanPassCompleted(_ newState: Bool) {
        print("User completed scan pass changed to \(newState)")
        sessionManager.onScanPassCompleted(NSNumber(value: 0), completed: newState)
    }

    private func handleAppear() {
        print("ObjectCaptureView appeared")
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

    @MainActor
    private func handleDisappear() {
        print("ObjectCaptureView disappeared")
        sessionManager.cleanupSession { success, error in
            if !success {
                print("Failed to cleanup session: \(error ?? "Unknown error")")
            } else {
                print("Session cleanup completed successfully")
            }
        }
    }
}
