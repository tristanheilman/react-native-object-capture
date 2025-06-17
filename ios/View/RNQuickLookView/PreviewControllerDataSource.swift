import QuickLook

class PreviewControllerDataSource: NSObject, QLPreviewControllerDataSource {
    private var url: URL?
    
    init(url: URL?) {
        self.url = url
        super.init()
    }
    
    func numberOfPreviewItems(in controller: QLPreviewController) -> Int {
        return url != nil ? 1 : 0
    }
    
    func previewController(_ controller: QLPreviewController, previewItemAt index: Int) -> QLPreviewItem {
        return url! as QLPreviewItem
    }
}