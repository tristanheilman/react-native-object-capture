#import <React/RCTViewManager.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNObjectCapturePointCloudView, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(onAppear, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onCloudPointViewAppear, RCTDirectEventBlock)

RCT_EXTERN_METHOD(getUserCompletedScanPass:(nonnull NSNumber *)node
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getSessionState:(nonnull NSNumber *)node
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
