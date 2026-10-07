import SwiftUI
import QuickLook
import UIKit

@objc(RNQuickLookViewFabricContainer) class RNQuickLookViewFabricContainer: UIView {
    private var hostingController: UIHostingController<RNQuickLookViewWrapper>?
    private var previewController: QLPreviewController?
    private var dataSource: PreviewControllerDataSource?
    private var currentPath: String?

    override init(frame: CGRect) {
        super.init(frame: frame)
        makePreviewController()
    }

    private func makePreviewController() {
        let pc = QLPreviewController()
        previewController = pc

        let wrapper = RNQuickLookViewWrapper(previewController: pc)
        let hc = UIHostingController(rootView: wrapper)
        hc.view.backgroundColor = .clear
        hostingController = hc
    }

    private func attachHostingController() {
        guard let hc = hostingController, hc.parent == nil,
              let parentVC = parentViewController() else { return }
        parentVC.addChild(hc)
        hc.view.frame = bounds
        hc.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        addSubview(hc.view)
        hc.didMove(toParent: parentVC)
    }

    private func detachHostingController() {
        guard let hc = hostingController, hc.parent != nil else { return }
        hc.willMove(toParent: nil)
        hc.view.removeFromSuperview()
        hc.removeFromParent()
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) not supported") }

    override func didMoveToWindow() {
        super.didMoveToWindow()
        if window != nil {
            attachHostingController()
        } else {
            detachHostingController()
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
        // updateProps runs on every prop change, not only path changes.
        guard path != currentPath else { return }
        // Fabric recycles this container, so opening a second model hands the
        // first one's QLPreviewController a new path. reloadData() on it keeps
        // showing the item already loaded at index 0, so start from a fresh
        // controller whenever the path actually changes.
        if currentPath != nil {
            let wasAttached = hostingController?.parent != nil
            detachHostingController()
            makePreviewController()
            if wasAttached || window != nil { attachHostingController() }
        }
        currentPath = path
        dataSource = PreviewControllerDataSource(url: URL(fileURLWithPath: path))
        previewController?.dataSource = dataSource
        previewController?.reloadData()
    }
}
