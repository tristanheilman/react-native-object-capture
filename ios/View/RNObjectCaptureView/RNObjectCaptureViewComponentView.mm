#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>
#import <react/renderer/components/ObjectCaptureSpec/ComponentDescriptors.h>
#import <react/renderer/components/ObjectCaptureSpec/Props.h>

using namespace facebook::react;

@interface RNObjectCaptureViewComponentView : RCTViewComponentView
@end

@implementation RNObjectCaptureViewComponentView

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNObjectCaptureViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNObjectCaptureViewProps>();
    _props = defaultProps;
  }
  return self;
}

@end
