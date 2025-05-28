import SwiftUI
import RealityKit
import ARKit
import Metal
import MetalKit

// RNObjectCapturePointCloudViewWrapper is the wrapper for the RNObjectCapturePointCloudView.
// It is responsible for displaying the point cloud view.
struct RNObjectCapturePointCloudViewWrapper: View {
    @ObservedObject var sessionManager: ObjectCaptureSessionManager

    var body: some View {
        ZStack {
            if let session = sessionManager.session {
                if (session.userCompletedScanPass) {
                    VStack {
                        Text("Current Scan Pass")
                        .foregroundColor(.black)
                        CloudPointView(session: session, sessionManager: sessionManager)
                    }
                } else {
                    Text("No session")
                    .foregroundColor(.black)
                }
            } else {
                Text("No session")
                .foregroundColor(.black)
            }
        }
    }
}