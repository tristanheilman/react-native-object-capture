import SwiftUI
import UIKit

@objc(RNObjectCaptureViewFabricContainer) class RNObjectCaptureViewFabricContainer: UIView {
    private var _onSessionStateChange: ((NSString) -> Void)?
    private var _onTrackingStateChange: ((NSString) -> Void)?
    private var _onFeedbackStateChange: ((NSArray) -> Void)?
    private var _onCaptureComplete: ((Bool) -> Void)?
    private var _onScanPassCompleted: ((Bool) -> Void)?
    private var _onError: ((NSString) -> Void)?

    private var hostingController: UIHostingController<RNObjectCaptureViewWrapper>?
    private let sessionManager = RNObjectCaptureSessionManager.shared

    override init(frame: CGRect) {
        super.init(frame: frame)

        sessionManager.fabricCaptureOnSessionStateChange = { [weak self] state in
            DispatchQueue.main.async { self?._onSessionStateChange?(state as NSString) }
        }
        sessionManager.fabricCaptureOnTrackingStateChange = { [weak self] tracking in
            DispatchQueue.main.async { self?._onTrackingStateChange?(tracking as NSString) }
        }
        sessionManager.fabricCaptureOnFeedbackStateChange = { [weak self] feedback in
            DispatchQueue.main.async { self?._onFeedbackStateChange?(feedback as NSArray) }
        }
        sessionManager.fabricCaptureOnCaptureComplete = { [weak self] completed in
            DispatchQueue.main.async { self?._onCaptureComplete?(completed) }
        }
        sessionManager.fabricCaptureOnScanPassCompleted = { [weak self] completed in
            DispatchQueue.main.async { self?._onScanPassCompleted?(completed) }
        }
        sessionManager.fabricCaptureOnError = { [weak self] error in
            DispatchQueue.main.async { self?._onError?(error as NSString) }
        }

        let wrapper = RNObjectCaptureViewWrapper(sessionManager: sessionManager)
        let hc = UIHostingController(rootView: wrapper)
        hc.view.backgroundColor = .clear
        hostingController = hc
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) not supported") }

    override func didMoveToWindow() {
        super.didMoveToWindow()
        guard let hc = hostingController else { return }
        if window != nil {
            if hc.parent == nil, let parentVC = parentViewController() {
                parentVC.addChild(hc)
                hc.view.frame = bounds
                hc.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
                addSubview(hc.view)
                hc.didMove(toParent: parentVC)
            }
        } else {
            if hc.parent != nil {
                hc.willMove(toParent: nil)
                hc.view.removeFromSuperview()
                hc.removeFromParent()
            }
        }
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        hostingController?.view.frame = bounds
    }

    private func parentViewController() -> UIViewController? {
        var responder: UIResponder? = next
        while let r = responder {
            if let vc = r as? UIViewController { return vc }
            responder = r.next
        }
        return nil
    }

    @objc func registerOnSessionStateChange(_ block: @escaping (NSString) -> Void) {
        _onSessionStateChange = block
    }
    @objc func registerOnTrackingStateChange(_ block: @escaping (NSString) -> Void) {
        _onTrackingStateChange = block
    }
    @objc func registerOnFeedbackStateChange(_ block: @escaping (NSArray) -> Void) {
        _onFeedbackStateChange = block
    }
    @objc func registerOnCaptureComplete(_ block: @escaping (Bool) -> Void) {
        _onCaptureComplete = block
    }
    @objc func registerOnScanPassCompleted(_ block: @escaping (Bool) -> Void) {
        _onScanPassCompleted = block
    }
    @objc func registerOnError(_ block: @escaping (NSString) -> Void) {
        _onError = block
    }

    @objc func setCheckpointDirectory(_ directory: String) {
        sessionManager.setCheckpointDirectory(directory)
    }
    @objc func setImagesDirectory(_ directory: String) {
        sessionManager.setImagesDirectory(directory)
    }

    deinit {
        sessionManager.fabricCaptureOnSessionStateChange = nil
        sessionManager.fabricCaptureOnTrackingStateChange = nil
        sessionManager.fabricCaptureOnFeedbackStateChange = nil
        sessionManager.fabricCaptureOnCaptureComplete = nil
        sessionManager.fabricCaptureOnScanPassCompleted = nil
        sessionManager.fabricCaptureOnError = nil
    }
}
