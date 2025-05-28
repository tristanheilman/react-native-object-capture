import Foundation
import React
import SwiftUI
import RealityKit
import ARKit
import Metal
import MetalKit

// RNObjectCapturePointCloudView is the view that displays the point cloud.
// It is responsible for displaying the point cloud and the session state.
@objc(RNObjectCapturePointCloudView)
class RNObjectCapturePointCloudView: RCTViewManager {
    private var _sharedSessionManager: ObjectCaptureSessionManager

    override init() {
        _sharedSessionManager = ObjectCaptureSessionManager.shared
        super.init()
        _sharedSessionManager.setPointCloudViewManager(self)
    }
    
    override func view() -> UIView! {
        let view = RNObjectCapturePointCloudViewContainer()
        let hostingController = UIHostingController(rootView: RNObjectCapturePointCloudViewWrapper(sessionManager: _sharedSessionManager))
        view.hostingController = hostingController
        view.manager = self
        print("RNObjectCapturePointCloudView view() called")
        return view
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override static func moduleName() -> String! {
        return "RNObjectCapturePointCloudView"
    }
}

class RNObjectCapturePointCloudViewContainer: UIView {
    var hostingController: UIHostingController<RNObjectCapturePointCloudViewWrapper>?
    var manager: RNObjectCapturePointCloudView?
    
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

    private func findViewManager() -> RNObjectCapturePointCloudView? {
        if manager != nil {
          return manager
        }
        return nil
    }
}
