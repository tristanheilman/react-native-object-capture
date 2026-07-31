import SwiftUI
import QuickLook
import UIKit

@objc(RNQuickLookViewFabricContainer) class RNQuickLookViewFabricContainer: UIView {
    private var hostingController: UIHostingController<RNQuickLookViewWrapper>?
    private var previewController: QLPreviewController?
    private var dataSource: PreviewControllerDataSource?

    override init(frame: CGRect) {
        super.init(frame: frame)

        let pc = QLPreviewController()
        previewController = pc

        let wrapper = RNQuickLookViewWrapper(previewController: pc)
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

    @objc func setPath(_ path: String) {
        let url = URL(fileURLWithPath: path)
        dataSource = PreviewControllerDataSource(url: url)
        previewController?.dataSource = dataSource
        previewController?.reloadData()
    }
}
