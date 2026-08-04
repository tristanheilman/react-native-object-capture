# iOS native architecture

How the native layer is put together, for anyone working on it. The code in the repo is the
source of truth — the snippets below show the shape, not necessarily line-for-line what shipped.

## Layers

Fabric component views must be **ObjC++** (`.mm`): they subclass `RCTViewComponentView` and deal
in C++ types (`Props::Shared`, `ComponentDescriptorProvider`, the generated event emitter structs).
Swift can't subclass them and can't see those types. The capture UI, meanwhile, is SwiftUI hosted
in a `UIHostingController<…>`, a generic type that's invisible to ObjC.

So each view is three layers, each seeing only what it can:

```
RNObjectCaptureViewComponentView.mm   (ObjC++)  Fabric plumbing, C++ event emitter
        │  owns a UIViewController *, calls @objc Swift
        ▼
RNObjectCaptureViewFactory.swift      (Swift)   @objc bridge, erases generics
        │  returns UIHostingController as plain UIViewController
        ▼
RNObjectCaptureViewWrapper.swift      (SwiftUI) the actual UI
```

The Swift factory exists purely to hide the generic parameter:

```swift
@objc(RNObjectCaptureViewFactory)
final class RNObjectCaptureViewFactory: NSObject {
    /// Returns the SwiftUI host as a plain UIViewController so ObjC++ can hold it
    /// without seeing the generic parameter.
    @objc static func makeHostingController() -> UIViewController {
        UIHostingController(
            rootView: RNObjectCaptureViewWrapper(
                sessionManager: RNObjectCaptureSessionManager.shared
            )
        )
    }
}
```

And the component view wires it into Fabric:

```objc
+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<RNObjectCaptureViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNObjectCaptureViewProps>();
    _props = defaultProps;

    _host = [RNObjectCaptureViewFactory makeHostingController];
    _host.view.frame = self.bounds;
    _host.view.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    self.contentView = _host.view;   // NOT addSubview - see Traps
  }
  return self;
}
```

## The generated headers are the contract

Prop and event field names are chosen by codegen from the specs in `src/specs`, not by you. After
`yarn && cd example/ios && pod install`, read them before writing native code:

```
example/ios/build/generated/ios/react/renderer/components/ObjectCaptureSpec/
  ComponentDescriptors.h
  EventEmitters.h        ← exact C++ event struct field names
  Props.h                ← exact C++ prop names and types
  RCTComponentViewHelpers.h
example/ios/build/generated/ios/ObjectCaptureSpec/
  ObjectCaptureSpec.h    ← ObjC protocols for the turbo modules
```

If these don't appear, codegen isn't picking up `src/specs` — fix that before going further.

## Events

Events go through a typed C++ emitter, which is nil until the view mounts:

```objc
- (void)emitSessionState:(NSString *)state {
  if (!_eventEmitter) return;   // always nil-check
  std::static_pointer_cast<const RNObjectCaptureViewEventEmitter>(_eventEmitter)
      ->onSessionStateChange({.state = std::string([state UTF8String])});
}
```

Array payloads (like `feedback: string[]`) become `std::vector<std::string>`:

```objc
std::vector<std::string> feedback;
for (NSString *item in items) {
  feedback.push_back(std::string([item UTF8String]));
}
std::static_pointer_cast<const RNObjectCaptureViewEventEmitter>(_eventEmitter)
    ->onFeedbackStateChange({.feedback = feedback});
```

`RNObjectCaptureSessionManager` reaches the view through an `@objc` observer protocol, so ObjC++
can conform:

```swift
@objc public protocol RNObjectCaptureSessionObserver: AnyObject {
    func sessionStateDidChange(_ state: String)
    func trackingStateDidChange(_ tracking: String)
    func feedbackStateDidChange(_ feedback: [String])
    func captureDidComplete(_ completed: Bool)
    func scanPassDidComplete(_ completed: Bool)
    func sessionDidError(_ error: String)
}
```

The session manager buffers events, and that behaviour matters: events can fire before the
component view mounts, and without buffering the first `onSessionStateChange` — the one the UI
needs — is lost.

## Registration

RN auto-discovers `<ComponentName>Cls()` and generates `RCTThirdPartyFabricComponentsProvider`.
If a component doesn't resolve at runtime, check in order:

1. The name in `codegenNativeComponent<NativeProps>('RNObjectCaptureView')` matches the `Cls`
   function name exactly.
2. The `.mm` is in `s.source_files` (the podspec glob covers `ios/**/*.mm`).
3. `pod install` was re-run after the spec changed.

## Modules

The imperative session methods live on the `RNObjectCaptureSession` TurboModule rather than as
view commands. The native session is a singleton — every method body operates on
`RNObjectCaptureSessionManager.shared` — so scoping the calls to a view instance never meant
anything, and modelling them as a module keeps them promise-returning, which view commands cannot
be. `RNPhotogrammetrySession` and `RNObjectCapture` (constants) are TurboModules too.

## Traps specific to this library

**`self.contentView`, not `addSubview`.** `RCTViewComponentView` manages its own subview
hierarchy. Adding directly causes views to survive recycling and reappear in the wrong place.

**Component views are recycled.** Fabric reuses instances for different React nodes. Implement
`prepareForRecycle` to detach the observer and reset state, or a second capture screen will
receive the first one's events.

**The session is a singleton, the views are not.** `RNObjectCaptureSessionManager.shared` outlives
any view, so two mounted capture views fight over one session.

**`ObjectCapture-Swift.h` needs `DEFINES_MODULE`.** Already set in the podspec. If the generated
header won't import, that setting or the module name is the cause.

**Metal + SwiftUI in a recycled view.** `ObjectCaptureSession` holds camera and Metal resources.
`cancelSession` has to run on unmount/recycle or the camera stays hot between screens.

## Verifying native changes

The simulator can't run a capture session. On a LiDAR device, the useful smoke test is:

- `pod install` succeeds and the app builds
- `ObjectCaptureSession.isDeviceSupported()` returns true
- a full capture → scan pass → finish cycle completes
- a reconstruction completes and the dimensions listener fires with plausible metres (measure the
  object and compare)
- `outputPath: 'model.usdz'` (flat) and `'Outputs/chair/model.usdz'` (nested) both write where
  they should
- checkpointing resumes an interrupted reconstruction
