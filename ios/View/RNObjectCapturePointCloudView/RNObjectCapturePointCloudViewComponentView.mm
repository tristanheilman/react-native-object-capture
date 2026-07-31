#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>
#import <react/renderer/components/ObjectCaptureSpec/ComponentDescriptors.h>
#import <react/renderer/components/ObjectCaptureSpec/EventEmitters.h>
#import <react/renderer/components/ObjectCaptureSpec/Props.h>
#import "RNObjectCaptureContainers.h"

using namespace facebook::react;

@interface RNObjectCapturePointCloudViewComponentView : RCTViewComponentView
@end

@implementation RNObjectCapturePointCloudViewComponentView {
    RNObjectCapturePointCloudViewFabricContainer *_fabricContainer;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<RNObjectCapturePointCloudViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const RNObjectCapturePointCloudViewProps>();
        _props = defaultProps;

        _fabricContainer = [[RNObjectCapturePointCloudViewFabricContainer alloc] initWithFrame:self.bounds];
        self.contentView = _fabricContainer;
        [self setupEventHandlers];
    }
    return self;
}

- (void)setupEventHandlers
{
    __weak RNObjectCapturePointCloudViewComponentView *weakSelf = self;

    [_fabricContainer registerOnPointCloudAppear:^{
        RNObjectCapturePointCloudViewComponentView *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf->_eventEmitter) return;
        auto emitter = std::dynamic_pointer_cast<const RNObjectCapturePointCloudViewEventEmitter>(strongSelf->_eventEmitter);
        if (emitter) emitter->onAppear({.scanPassCompleted = false});
    }];

    [_fabricContainer registerOnCloudPointViewAppear:^{
        RNObjectCapturePointCloudViewComponentView *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf->_eventEmitter) return;
        auto emitter = std::dynamic_pointer_cast<const RNObjectCapturePointCloudViewEventEmitter>(strongSelf->_eventEmitter);
        if (emitter) emitter->onCloudPointViewAppear({.scanPassCompleted = false});
    }];
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle
{
    [super prepareForRecycle];
    static const auto defaultProps = std::make_shared<const RNObjectCapturePointCloudViewProps>();
    _props = defaultProps;
}

@end
