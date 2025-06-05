import Foundation
import React
import Metal
import MetalKit
import RealityKit
import SwiftUI
import ARKit

// CloudPointView is the main view for the object capture session.
// It is responsible for displaying the session state, feedback, and tracking state.
// It also handles the appearance and disappearance of the view.
struct CloudPointView: View {
    let session: ObjectCaptureSession
    let sessionManager: ObjectCaptureSessionManager

    var body: some View {
        ObjectCapturePointCloudView(session: session)
    }
}
