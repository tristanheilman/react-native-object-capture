#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>
#import <react/renderer/components/ObjectCaptureSpec/ComponentDescriptors.h>
#import <react/renderer/components/ObjectCaptureSpec/Props.h>

using namespace facebook::react;

@interface RNObjectCapturePointCloudViewComponentView : RCTViewComponentView
@end

@implementation RNObjectCapturePointCloudViewComponentView

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNObjectCapturePointCloudViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNObjectCapturePointCloudViewProps>();
    _props = defaultProps;
  }
  return self;
}

@end
