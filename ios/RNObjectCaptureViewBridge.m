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

@end