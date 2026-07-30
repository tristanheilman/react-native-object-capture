#pragma once

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

// Manual ObjC declarations for the Swift Fabric container classes.
// These must stay in sync with the @objc methods in the corresponding .swift files.

@interface RNObjectCaptureViewFabricContainer : UIView
- (instancetype)initWithFrame:(CGRect)frame;
- (void)registerOnSessionStateChange:(void (^)(NSString *state))block;
- (void)registerOnTrackingStateChange:(void (^)(NSString *tracking))block;
- (void)registerOnFeedbackStateChange:(void (^)(NSArray<NSString *> *feedback))block;
- (void)registerOnCaptureComplete:(void (^)(BOOL completed))block;
- (void)registerOnScanPassCompleted:(void (^)(BOOL completed))block;
- (void)registerOnError:(void (^)(NSString *error))block;
- (void)setCheckpointDirectory:(NSString *)directory;
- (void)setImagesDirectory:(NSString *)directory;
@end

@interface RNObjectCapturePointCloudViewFabricContainer : UIView
- (instancetype)initWithFrame:(CGRect)frame;
- (void)registerOnPointCloudAppear:(void (^)(void))block;
- (void)registerOnCloudPointViewAppear:(void (^)(void))block;
@end

@interface RNQuickLookViewFabricContainer : UIView
- (instancetype)initWithFrame:(CGRect)frame;
- (void)setPath:(NSString *)path;
@end

NS_ASSUME_NONNULL_END
