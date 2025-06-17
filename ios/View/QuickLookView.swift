import Foundation
import React
import QuickLook
import SwiftUI

struct QuickLookView: UIViewControllerRepresentable {
    let previewController: QLPreviewController

    func makeUIViewController(context: Context) -> QLPreviewController {
        return previewController
    }
    
    func updateUIViewController(_ uiViewController: QLPreviewController, context: Context) {
        // Update if needed
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }
    
    class Coordinator: NSObject, QLPreviewControllerDataSource {
        var previewURL: URL?
        
        func numberOfPreviewItems(in controller: QLPreviewController) -> Int {
            return previewURL != nil ? 1 : 0
        }
        
        func previewController(_ controller: QLPreviewController, previewItemAt index: Int) -> QLPreviewItem {
            return previewURL! as QLPreviewItem
        }
    }
}