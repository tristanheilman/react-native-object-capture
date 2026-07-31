import SwiftUI
import UIKit

@objc(RNObjectCapturePointCloudViewFabricContainer) class RNObjectCapturePointCloudViewFabricContainer: UIView {
    private var _onPointCloudAppear: (() -> Void)?
    private var _onCloudPointViewAppear: (() -> Void)?

    private var hostingController: UIHostingController<RNObjectCapturePointCloudViewWrapper>?
    private let sessionManager = RNObjectCaptureSessionManager.shared

    override init(frame: CGRect) {
        super.init(frame: frame)

        sessionManager.fabricPointCloudOnAppear = { [weak self] in
            DispatchQueue.main.async { self?._onPointCloudAppear?() }
        }
        sessionManager.fabricPointCloudOnCloudPointViewAppear = { [weak self] in
            DispatchQueue.main.async { self?._onCloudPointViewAppear?() }
        }

        let wrapper = RNObjectCapturePointCloudViewWrapper(sessionManager: sessionManager)
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

    @objc func registerOnPointCloudAppear(_ block: @escaping () -> Void) {
        _onPointCloudAppear = block
    }
    @objc func registerOnCloudPointViewAppear(_ block: @escaping () -> Void) {
        _onCloudPointViewAppear = block
    }

    deinit {
        sessionManager.fabricPointCloudOnAppear = nil
        sessionManager.fabricPointCloudOnCloudPointViewAppear = nil
    }
}
