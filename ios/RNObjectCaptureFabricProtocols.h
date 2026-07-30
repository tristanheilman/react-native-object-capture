#pragma once

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@protocol RNObjectCaptureViewFabricDelegate <NSObject>
- (void)onSessionStateChange:(NSString *)state;
- (void)onTrackingStateChange:(NSString *)tracking;
- (void)onFeedbackStateChange:(NSArray<NSString *> *)feedback;
- (void)onCaptureComplete:(BOOL)completed;
- (void)onScanPassCompleted:(BOOL)completed;
- (void)onError:(NSString *)error;
@end

@protocol RNObjectCapturePointCloudViewFabricDelegate <NSObject>
- (void)onPointCloudAppear;
- (void)onCloudPointViewAppear;
@end

NS_ASSUME_NONNULL_END
