#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>
#import <react/renderer/components/ObjectCaptureSpec/ComponentDescriptors.h>
#import <react/renderer/components/ObjectCaptureSpec/Props.h>

using namespace facebook::react;

@interface RNQuickLookViewComponentView : RCTViewComponentView
@end

@implementation RNQuickLookViewComponentView

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNQuickLookViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNQuickLookViewProps>();
    _props = defaultProps;
  }
  return self;
}

@end
