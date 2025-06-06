import SwiftUI
import RealityKit
import ARKit
import Metal
import MetalKit

// RNObjectCaptureViewWrapper is the wrapper for the RNObjectCaptureView.
// It is responsible for displaying the session view or the loading view.
struct RNObjectCaptureViewWrapper: View {
    @ObservedObject var sessionManager: ObjectCaptureSessionManager

    var body: some View {
        ZStack {
            if let session = sessionManager.session {
                SessionView(session: session, sessionManager: sessionManager)
            } else {
                LoadingView(sessionManager: sessionManager)
            }
        }
    }
}