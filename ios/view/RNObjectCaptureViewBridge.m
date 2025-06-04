#import <React/RCTViewManager.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNObjectCaptureView, RCTViewManager)

RCT_EXTERN_METHOD(resumeSession:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(pauseSession:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(startDetection:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(resetDetection:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(startCapturing:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(beginNewScanAfterFlip:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(beginNewScan:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(finishSession:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(cancelSession:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(getSessionState:(nonnull NSNumber *)node)

// Fix the property exports
RCT_EXPORT_VIEW_PROPERTY(onCaptureComplete, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onFeedbackStateChange, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onTrackingStateChange, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onSessionStateChange, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onError, RCTDirectEventBlock)

@end
