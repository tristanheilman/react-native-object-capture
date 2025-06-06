import SwiftUI
import RealityKit
import ARKit
import Metal
import MetalKit

struct RNObjectCapturePointCloudViewWrapper: View {
    @ObservedObject var sessionManager: ObjectCaptureSessionManager

    var body: some View {
        Group {
            if let session = sessionManager.session, session.userCompletedScanPass {
                ZStack {
                    CloudPointView(session: session, sessionManager: sessionManager)
                        .onAppear {
                            handleCloudPointViewAppear()
                        }
                }
            }
        }
        .onAppear {
            handleAppear()
        }
    }
    
    private func handleAppear() {
        print("RNObjectCapturePointCloudViewWrapper ZStack appear called")
        sessionManager.onAppear(NSNumber(value: 0))
    }

    private func handleCloudPointViewAppear() {
        print("RNObjectCapturePointCloudViewWrapper cloud point view appear called")
        sessionManager.onCloudPointViewAppear(NSNumber(value: 0))
    }
}