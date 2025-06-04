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
    private var hostingController: UIHostingController<RNObjectCapturePointCloudViewWrapper>?
    private var viewManager: RNObjectCapturePointCloudViewContainer?
    private var _onAppear: RCTDirectEventBlock?
    private var _onCloudPointViewAppear: RCTDirectEventBlock?

    override init() {
        _sharedSessionManager = ObjectCaptureSessionManager.shared
        super.init()
        _sharedSessionManager.setPointCloudViewManager(self)
    }

    override func view() -> UIView! {
        let view = RNObjectCapturePointCloudViewContainer()
        let hostingController = UIHostingController(rootView: RNObjectCapturePointCloudViewWrapper(
            sessionManager: _sharedSessionManager
        ))
        self.hostingController = hostingController
        view.hostingController = hostingController
        view.manager = self
        self.viewManager = view

        print("RNObjectCapturePointCloudView view() called")
        return view
    }

    @objc
    func getUserCompletedScanPass(_ node: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task {
            let completed = await _sharedSessionManager.getUserCompletedScanState()
            resolve(completed)
        }
    }

    @objc
    func getSessionState(_ node: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task {
            let state = await _sharedSessionManager.getSessionState()
            resolve(state)
        }
    }

    @objc
    func onAppear(_ node: NSNumber) {
        _onAppear?([:])
    }

    @objc
    func onCloudPointViewAppear(_ node: NSNumber) {
        _onCloudPointViewAppear?([:])
    }

    @objc
    func setOnAppear(_ onAppear: @escaping RCTDirectEventBlock) {
        _onAppear = onAppear
    }

    @objc
    func setOnCloudPointViewAppear(_ onCloudPointViewAppear: @escaping RCTDirectEventBlock) {
        _onCloudPointViewAppear = onCloudPointViewAppear
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

    // Add these property setters
    @objc
    func setOnAppear(_ onAppear: @escaping RCTDirectEventBlock) {
        if let viewManager = self.findViewManager() {
            viewManager.setOnAppear(onAppear)
        }
    }

    @objc
    func setOnCloudPointViewAppear(_ onCloudPointViewAppear: @escaping RCTDirectEventBlock) {
        if let viewManager = self.findViewManager() {
            viewManager.setOnCloudPointViewAppear(onCloudPointViewAppear)
        }
    }

    private func findViewManager() -> RNObjectCapturePointCloudView? {
        if manager != nil {
          return manager
        }
        return nil
    }
}
