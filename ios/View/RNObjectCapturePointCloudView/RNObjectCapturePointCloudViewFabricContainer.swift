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

    override func didMoveToSuperview() {
        super.didMoveToSuperview()
        if let hcView = hostingController?.view, hcView.superview == nil {
            hcView.frame = bounds
            hcView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            addSubview(hcView)
        }
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        hostingController?.view.frame = bounds
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
