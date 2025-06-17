import SwiftUI
import RealityKit
import ARKit

// LoadingView is the view that is displayed when the session is loading.
// It is responsible for displaying a progress view and a text label.
struct LoadingView: View {
    let sessionManager: RNObjectCaptureSessionManager

    var body: some View {
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