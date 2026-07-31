#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>
#import <react/renderer/components/ObjectCaptureSpec/ComponentDescriptors.h>
#import <react/renderer/components/ObjectCaptureSpec/EventEmitters.h>
#import <react/renderer/components/ObjectCaptureSpec/Props.h>
#import "RNObjectCaptureContainers.h"

using namespace facebook::react;

@interface RNObjectCaptureViewComponentView : RCTViewComponentView
@end

@implementation RNObjectCaptureViewComponentView {
    RNObjectCaptureViewFabricContainer *_fabricContainer;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<RNObjectCaptureViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const RNObjectCaptureViewProps>();
        _props = defaultProps;

        _fabricContainer = [[RNObjectCaptureViewFabricContainer alloc] initWithFrame:self.bounds];
        self.contentView = _fabricContainer;
        [self setupEventHandlers];
    }
    return self;
}

- (void)setupEventHandlers
{
    __weak RNObjectCaptureViewComponentView *weakSelf = self;

    [_fabricContainer registerOnSessionStateChange:^(NSString *state) {
        RNObjectCaptureViewComponentView *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf->_eventEmitter) return;
        auto emitter = std::dynamic_pointer_cast<const RNObjectCaptureViewEventEmitter>(strongSelf->_eventEmitter);
        if (emitter) emitter->onSessionStateChange({.state = std::string(state.UTF8String)});
    }];

    [_fabricContainer registerOnTrackingStateChange:^(NSString *tracking) {
        RNObjectCaptureViewComponentView *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf->_eventEmitter) return;
        auto emitter = std::dynamic_pointer_cast<const RNObjectCaptureViewEventEmitter>(strongSelf->_eventEmitter);
        if (emitter) emitter->onTrackingStateChange({.tracking = std::string(tracking.UTF8String)});
    }];

    [_fabricContainer registerOnFeedbackStateChange:^(NSArray<NSString *> *feedback) {
        RNObjectCaptureViewComponentView *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf->_eventEmitter) return;
        auto emitter = std::dynamic_pointer_cast<const RNObjectCaptureViewEventEmitter>(strongSelf->_eventEmitter);
        if (emitter) {
            std::vector<std::string> vec;
            vec.reserve(feedback.count);
            for (NSString *item in feedback) {
                vec.push_back(std::string(item.UTF8String));
            }
            emitter->onFeedbackStateChange({.feedback = vec});
        }
    }];

    [_fabricContainer registerOnCaptureComplete:^(BOOL completed) {
        RNObjectCaptureViewComponentView *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf->_eventEmitter) return;
        auto emitter = std::dynamic_pointer_cast<const RNObjectCaptureViewEventEmitter>(strongSelf->_eventEmitter);
        if (emitter) emitter->onCaptureComplete({.completed = static_cast<bool>(completed)});
    }];

    [_fabricContainer registerOnScanPassCompleted:^(BOOL completed) {
        RNObjectCaptureViewComponentView *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf->_eventEmitter) return;
        auto emitter = std::dynamic_pointer_cast<const RNObjectCaptureViewEventEmitter>(strongSelf->_eventEmitter);
        if (emitter) emitter->onScanPassCompleted({.completed = static_cast<bool>(completed)});
    }];

    [_fabricContainer registerOnError:^(NSString *error) {
        RNObjectCaptureViewComponentView *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf->_eventEmitter) return;
        auto emitter = std::dynamic_pointer_cast<const RNObjectCaptureViewEventEmitter>(strongSelf->_eventEmitter);
        if (emitter) emitter->onError({.error = std::string(error.UTF8String)});
    }];
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &newProps = *std::static_pointer_cast<const RNObjectCaptureViewProps>(props);
    [_fabricContainer setCheckpointDirectory:[NSString stringWithUTF8String:newProps.checkpointDirectory.c_str()]];
    [_fabricContainer setImagesDirectory:[NSString stringWithUTF8String:newProps.imagesDirectory.c_str()]];
    [_fabricContainer setOverCaptureEnabled:newProps.overCaptureEnabled];
    [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle
{
    [super prepareForRecycle];
    static const auto defaultProps = std::make_shared<const RNObjectCaptureViewProps>();
    _props = defaultProps;
}

@end
