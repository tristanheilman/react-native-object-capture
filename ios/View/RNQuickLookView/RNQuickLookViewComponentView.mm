#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>
#import <react/renderer/components/ObjectCaptureSpec/ComponentDescriptors.h>
#import <react/renderer/components/ObjectCaptureSpec/Props.h>
#import "RNObjectCaptureContainers.h"

using namespace facebook::react;

@interface RNQuickLookViewComponentView : RCTViewComponentView
@end

@implementation RNQuickLookViewComponentView {
    RNQuickLookViewFabricContainer *_fabricContainer;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<RNQuickLookViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const RNQuickLookViewProps>();
        _props = defaultProps;

        _fabricContainer = [[RNQuickLookViewFabricContainer alloc] initWithFrame:self.bounds];
        self.contentView = _fabricContainer;
    }
    return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &newProps = *std::static_pointer_cast<const RNQuickLookViewProps>(props);
    const auto &prevProps = *std::static_pointer_cast<const RNQuickLookViewProps>(oldProps);

    if (newProps.path != prevProps.path) {
        [_fabricContainer setPath:[NSString stringWithUTF8String:newProps.path.c_str()]];
    }

    [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle
{
    [super prepareForRecycle];
    static const auto defaultProps = std::make_shared<const RNQuickLookViewProps>();
    _props = defaultProps;
}

@end
