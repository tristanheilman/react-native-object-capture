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

    @objc func setPath(_ path: String) {
        let url = URL(fileURLWithPath: path)
        dataSource = PreviewControllerDataSource(url: url)
        previewController?.dataSource = dataSource
        previewController?.reloadData()
    }
}
