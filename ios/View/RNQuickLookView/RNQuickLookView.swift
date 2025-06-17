import Foundation
import React
import QuickLook
import SwiftUI

@objc(RNQuickLookView)
class RNQuickLookView: RCTViewManager {
    var viewContainer: RNQuickLookViewContainer?
    var path: String?
    private var dataSource: PreviewControllerDataSource?
    private var previewController: QLPreviewController?

    override init() {
        super.init()
    }

    override func view() -> UIView! {
        viewContainer = RNQuickLookViewContainer()

        // Create and configure the preview controller
        previewController = QLPreviewController()
        previewController?.dataSource = dataSource

        if let previewController = previewController {
            let hostingController = UIHostingController(rootView: RNQuickLookViewWrapper(previewController: previewController))
            viewContainer?.hostingController = hostingController
            viewContainer?.manager = self
        }
        
        return viewContainer
    }

   @objc
    func setPath(_ path: String) {
        self.path = path
        
        // Construct the full URL
        let modelURL = URL(fileURLWithPath: path)
        
        // Create and store a new data source
        dataSource = PreviewControllerDataSource(url: modelURL)
        print("Preview controller data source created")
        // Update the preview URL in the coordinator
        previewController?.dataSource = dataSource
        previewController?.reloadData()
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}

// Container view for React Native
class RNQuickLookViewContainer: UIView {
    var hostingController: UIHostingController<RNQuickLookViewWrapper>?
    var manager: RNQuickLookView?

    override init(frame: CGRect) {
        super.init(frame: frame)
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
    }
    
    override func didMoveToSuperview() {
        super.didMoveToSuperview()
        if let hostingView = hostingController?.view {
            hostingView.frame = bounds
            hostingView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            addSubview(hostingView)
        }
    }
    
    @objc
    func setPath(_ path: String) {
        print("Setting path in container: \(path)")
        if let viewManager = self.findViewManager() {
            print("Found view manager")
            viewManager.setPath(path)
        } else {
            print("No view manager found")
        }
    }

    private func findViewManager() -> RNQuickLookView? {
        if manager != nil {
          return manager
        }
        return nil
    }
}
