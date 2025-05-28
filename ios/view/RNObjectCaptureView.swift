import Foundation
import React
import Metal
import MetalKit
import RealityKit
import SwiftUI
import ARKit

@objc(RNObjectCaptureView)
class RNObjectCaptureView: RCTViewManager {
    private var _sharedSessionManager: ObjectCaptureSessionManager
    private var _onCaptureComplete: RCTDirectEventBlock?
    private var _onFeedbackStateChange: RCTDirectEventBlock?
    private var _onTrackingStateChange: RCTDirectEventBlock?
    private var _onSessionStateChange: RCTDirectEventBlock?
    private var _onError: RCTDirectEventBlock?

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

    // REACT NATIVE EVENT HANDLERS
    @objc
    func onCaptureComplete(_ node: NSNumber, completed: Bool) {
        _onCaptureComplete?(["completed": completed])
    }

    @objc
    func onFeedbackStateChange(_ node: NSNumber, feedback: [String]) {
        _onFeedbackStateChange?(["feedback": feedback])
    }

    @objc
    func onTrackingStateChange(_ node: NSNumber, tracking: String) {
        _onTrackingStateChange?(["tracking": tracking])
    }

    @objc
    func onSessionStateChange(_ node: NSNumber, state: String) {
        _onSessionStateChange?(["state": state])
    }
  
    @objc
    func onError(_ node: NSNumber, error: String) {
        _onError?(["error": error])
    }

    // REACT NATIVE PROPERTY SETTING METHODS
    @objc
    func setOnCaptureComplete(_ onCaptureComplete: @escaping RCTDirectEventBlock) {
        _onCaptureComplete = onCaptureComplete
    }

    @objc
    func setOnFeedbackStateChange(_ onFeedbackStateChange: @escaping RCTDirectEventBlock) {
        _onFeedbackStateChange = onFeedbackStateChange
    }

    @objc
    func setOnTrackingStateChange(_ onTrackingStateChange: @escaping RCTDirectEventBlock) {
        _onTrackingStateChange = onTrackingStateChange
    }

    @objc
    func setOnSessionStateChange(_ onSessionStateChange: @escaping RCTDirectEventBlock) {
        _onSessionStateChange = onSessionStateChange
    }
  
    @objc
    func setOnError(_ onError: @escaping RCTDirectEventBlock) {
        _onError = onError
    }

    // REACT NATIVE REF METHODS
    @objc
    func resumeSession(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
          await _sharedSessionManager.resumeSession()
        }
    }
    
    @objc
    func pauseSession(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.pauseSession()
        }
    }
    
    @objc
    func startDetection(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.startDetection()
        }
    }
    
    @objc
    func resetDetection(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.resetDetection()
        }
    }
    
    @objc
    func startCapturing(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.startCapturing()
        }
    }
    
    @objc
    func finishSession(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.finishSession()
        }
    }

    @objc
    func cancelSession(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.cancelSession()
        }
    }

    @objc
    func beginNewScanAfterFlip(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.beginNewScanAfterFlip()
        }
    }

    @objc
    func beginNewScan(_ node: NSNumber) {
        Task { [weak self] in
            guard let self = self else { return }
            await _sharedSessionManager.beginNewScan()
        }
    }

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
