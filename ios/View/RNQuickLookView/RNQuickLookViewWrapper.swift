import SwiftUI
import RealityKit
import ARKit
import Metal
import MetalKit
import QuickLook

// RNQuickLookViewWrapper is the wrapper for the RNQuickLookView.
// It is responsible for displaying the quick look view.
struct RNQuickLookViewWrapper: View {
    let previewController: QLPreviewController

    var body: some View {
        QuickLookView(previewController: previewController)
    }
}
