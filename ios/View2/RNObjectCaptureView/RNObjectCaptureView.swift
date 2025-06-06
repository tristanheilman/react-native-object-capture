import Foundation
import React
import Metal
import MetalKit
import RealityKit
import SwiftUI
import ARKit

@objc(RNObjectCaptureView)
class RNObjectCaptureView: RCTViewManager {
    // Session manager that is shared between "ObjectCapture" views
    private var _sharedSessionManager: ObjectCaptureSessionManager
    // Callback for when the capture is complete
    private var _onCaptureComplete: RCTDirectEventBlock?
    // Callback for when the feedback state changes
    private var _onFeedbackStateChange: RCTDirectEventBlock?
    // Callback for when the tracking state changes
    private var _onTrackingStateChange: RCTDirectEventBlock?
    // Callback for when the session state changes
    private var _onSessionStateChange: RCTDirectEventBlock?
    // Callback for when an error occurs
    private var _onError: RCTDirectEventBlock?
    // Callback for when the scan pass is completed
    private var _onScanPassCompleted: RCTDirectEventBlock?

    override init() {
        _sharedSessionManager = ObjectCaptureSessionManager.shared
        super.init()
        _sharedSessionManager.setViewManager(self)
    }
    
    override func view() -> UIView! {
        let view = RNObjectCaptureViewContainer()
        let hostingController = UIHostingController(rootView: RNObjectCaptureViewWrapper(sessionManager: _sharedSessionManager))
        view.hostingController = hostingController
        view.manager = self
        return view
    }

    // Callback method when the capture is complete
    @objc
    func onCaptureComplete(_ node: NSNumber, completed: Bool) {
        _onCaptureComplete?(["completed": completed])
    }

    // Callback method when the feedback state changes
    @objc
    func onFeedbackStateChange(_ node: NSNumber, feedback: [String]) {
        _onFeedbackStateChange?(["feedback": feedback])
    }

    // Callback method when the tracking state changes
    @objc
    func onTrackingStateChange(_ node: NSNumber, tracking: String) {
        _onTrackingStateChange?(["tracking": tracking])
    }

    // Callback method when the session state changes
    @objc
    func onSessionStateChange(_ node: NSNumber, state: String) {
        _onSessionStateChange?(["state": state])
    }
  
    // Callback method when an error occurs
    @objc
    func onError(_ node: NSNumber, error: String) {
        _onError?(["error": error])
    }

    // Callback method when the scan pass is completed
    @objc
    func onScanPassCompleted(_ node: NSNumber, completed: Bool) {
        _onScanPassCompleted?(["completed": completed])
    }

    // Setter method for the capture complete callback
    @objc
    func setOnCaptureComplete(_ onCaptureComplete: @escaping RCTDirectEventBlock) {
        _onCaptureComplete = onCaptureComplete
    }

    // Setter method for the feedback state change callback
    @objc
    func setOnFeedbackStateChange(_ onFeedbackStateChange: @escaping RCTDirectEventBlock) {
        _onFeedbackStateChange = onFeedbackStateChange
    }

    // Setter method for the tracking state change callback
    @objc
    func setOnTrackingStateChange(_ onTrackingStateChange: @escaping RCTDirectEventBlock) {
        _onTrackingStateChange = onTrackingStateChange
    }

    // Setter method for the session state change callback
    @objc
    func setOnSessionStateChange(_ onSessionStateChange: @escaping RCTDirectEventBlock) {
        _onSessionStateChange = onSessionStateChange
    }
  
    // Setter method for the error callback
    @objc
    func setOnError(_ onError: @escaping RCTDirectEventBlock) {
        _onError = onError
    }

    // Will resume the object capture session
    @objc
    func resumeSession(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
          await _sharedSessionManager.resumeSession()
        }
    }
    
    // Will pause the object capture session
    @objc
    func pauseSession(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.pauseSession()
        }
    }
    
    // Will start the detection process
    @objc
    func startDetection(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.startDetection()
        }
    }
    
    // Will reset the detection process
    @objc
    func resetDetection(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.resetDetection()
        }
    }
    
    // Will start the capturing process
    @objc
    func startCapturing(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.startCapturing()
        }
    }
    
    // Will finish the object capture session
    @objc
    func finishSession(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.finishSession()
        }
    }

    // Will cancel the object capture session
    @objc
    func cancelSession(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.cancelSession()
        }
    }

    // Will begin a new scan after a flip
    @objc
    func beginNewScanAfterFlip(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.beginNewScanAfterFlip()
        }
    }

    // Will begin a new scan
    @objc
    func beginNewScan(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.beginNewScan()
        }
    }

    // Will get the session state
    @objc
    func getSessionState(_ node: NSNumber) async -> String {
        return await _sharedSessionManager.getSessionState()
    }

    @objc
    func isDeviceSupported(_ node: NSNumber) async -> Bool {
        return await _sharedSessionManager.isDeviceSupported()
    }

    @objc
    func getTrackingState(_ node: NSNumber) async -> String {
        return await _sharedSessionManager.getTrackingState()
    }

    @objc
    func getFeedbackState(_ node: NSNumber) async -> [String] {
        return await _sharedSessionManager.getFeedbackState()
    }

    @objc
    func getNumberOfShotsTaken(_ node: NSNumber) async -> Int {
        return await _sharedSessionManager.getNumberOfShotsTaken()
    }

    @objc
    func getUserCompletedScanState(_ node: NSNumber) async -> Bool {
        return await _sharedSessionManager.getUserCompletedScanState()
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override static func moduleName() -> String! {
        return "RNObjectCaptureView"
    }
}

class RNObjectCaptureViewContainer: UIView {
    var hostingController: UIHostingController<RNObjectCaptureViewWrapper>?
    var manager: RNObjectCaptureView?
    
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
    func setOnCaptureComplete(_ onCaptureComplete: @escaping RCTDirectEventBlock) {
        if let viewManager = self.findViewManager() {
            viewManager.setOnCaptureComplete(onCaptureComplete)
        }
    }

    @objc
    func setOnFeedbackStateChange(_ onFeedbackStateChange: @escaping RCTDirectEventBlock) {
        if let viewManager = self.findViewManager() {
            viewManager.setOnFeedbackStateChange(onFeedbackStateChange)
        }
    }

    @objc
    func setOnTrackingStateChange(_ onTrackingStateChange: @escaping RCTDirectEventBlock) {
        if let viewManager = self.findViewManager() {
            viewManager.setOnTrackingStateChange(onTrackingStateChange)
        }
    }

    @objc
    func setOnSessionStateChange(_ onSessionStateChange: @escaping RCTDirectEventBlock) {
        if let viewManager = self.findViewManager() {
            viewManager.setOnSessionStateChange(onSessionStateChange)
        }
    }

    @objc
    func setOnError(_ onError: @escaping RCTDirectEventBlock) {
        if let viewManager = self.findViewManager() {
            viewManager.setOnError(onError)
        }
    }

    private func findViewManager() -> RNObjectCaptureView? {
        if manager != nil {
          return manager
        }
        return nil
    }
}
