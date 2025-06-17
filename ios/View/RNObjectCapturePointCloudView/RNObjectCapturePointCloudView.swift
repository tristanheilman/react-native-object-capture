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
    // Session manager that is shared between "ObjectCapture" views
    private var _sharedSessionManager: RNObjectCaptureSessionManager
    // Hosting controller for the point cloud view
    private var hostingController: UIHostingController<RNObjectCapturePointCloudViewWrapper>?
    // View manager for the point cloud view
    private var viewManager: RNObjectCapturePointCloudViewContainer?
    // Callback for when the point cloud view appears
    private var _onAppear: RCTDirectEventBlock?
    // Callback for when the point cloud view appears
    private var _onCloudPointViewAppear: RCTDirectEventBlock?

    override init() {
        _sharedSessionManager = RNObjectCaptureSessionManager.shared
        super.init() // must be called before setting the view manager
        _sharedSessionManager.setPointCloudViewManager(self)
    }

    override func view() -> UIView! {
        let view = RNObjectCapturePointCloudViewContainer()
        let hostingController = UIHostingController(rootView: RNObjectCapturePointCloudViewWrapper(
            sessionManager: _sharedSessionManager
        ))
        view.hostingController = hostingController
        view.manager = self
        return view
    }

    // Method to get the user completed scan pass
    @objc
    func getUserCompletedScanPass(_ node: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task {
            let completed = await _sharedSessionManager.getUserCompletedScanState()
            resolve(completed)
        }
    }

    // Method to get the session state
    @objc
    func getSessionState(_ node: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task {
            let state = await _sharedSessionManager.getSessionState()
            resolve(state)
        }
    }

    // Callback method when the point cloud view appears
    @objc
    func onAppear(_ node: NSNumber) {
        _onAppear?([:])
    }

    // Callback method when the point cloud view appears
    @objc
    func onCloudPointViewAppear(_ node: NSNumber) {
        _onCloudPointViewAppear?([:])
    }

    // Setter method for the point cloud view appear callback
    @objc
    func setOnAppear(_ onAppear: @escaping RCTDirectEventBlock) {
        _onAppear = onAppear
    }

    // Setter method for the point cloud view appear callback
    @objc
    func setOnCloudPointViewAppear(_ onCloudPointViewAppear: @escaping RCTDirectEventBlock) {
        _onCloudPointViewAppear = onCloudPointViewAppear
    }

    @objc
    func setCheckpointDirectory(_ checkpointDirectory: String) {
        _sharedSessionManager.setCheckpointDirectory(checkpointDirectory)
    }

    @objc
    func setImagesDirectory(_ imagesDirectory: String) {
        _sharedSessionManager.setImagesDirectory(imagesDirectory)
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

    override func didMoveToWindow() {
        super.didMoveToWindow()
        if window == nil {
            // Clean up when view is removed from window
            hostingController?.removeFromParent()
            hostingController = nil
        }
    }

    // Setter method for the point cloud view appear callback
    @objc
    func setOnAppear(_ onAppear: @escaping RCTDirectEventBlock) {
        if let viewManager = self.findViewManager() {
            viewManager.setOnAppear(onAppear)
        }
    }

    // Setter method for the point cloud view appear callback
    @objc
    func setOnCloudPointViewAppear(_ onCloudPointViewAppear: @escaping RCTDirectEventBlock) {
        if let viewManager = self.findViewManager() {
            viewManager.setOnCloudPointViewAppear(onCloudPointViewAppear)
        }
    }

    @objc
    func setCheckpointDirectory(_ checkpointDirectory: String) {
        if let viewManager = self.findViewManager() {
            viewManager.setCheckpointDirectory(checkpointDirectory)
        }
    }
    
    @objc
    func setImagesDirectory(_ imagesDirectory: String) {
        if let viewManager = self.findViewManager() {
            viewManager.setImagesDirectory(imagesDirectory)
        }
    }

    private func findViewManager() -> RNObjectCapturePointCloudView? {
        if manager != nil {
          return manager
        }
        return nil
    }
}
