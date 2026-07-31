# Native New Architecture Migration — Step-by-Step

> **Status: implemented.** This migration has landed on `main` (merged in
> [#10](https://github.com/tristanheilman/react-native-object-capture/pull/10)). The three views
> are now Fabric component views (`*ComponentView.mm` + `*FabricContainer.swift`) and the modules
> are TurboModules; the example app compiles green on iOS and Android in CI. This document is kept
> as the design record and a guide for the still-pending pieces (the RN version bump and on-device
> verification). **The code in the repo is the source of truth** — the snippets below are the
> shape it was built to, not necessarily line-for-line what shipped.

The JS and codegen layer was done first (see the Phase 1 section of `ROADMAP.md`). This document
covers the native work: turning three `RCTViewManager` classes into Fabric component views, and
deciding what to do about the modules.

Originally written against the codegen contracts as of RN 0.82/0.83, then implemented against
RN 0.79.2 (the example's current version).

---

## 0. Prerequisites, in this order

1. **Bump React Native first.** Codegen output shape is version-dependent, so migrating against
   0.79 and then upgrading means doing parts of it twice. Go to 0.83 in `example/package.json`
   and the root devDependency together.
2. `yarn && cd example/ios && pod install`
3. **Find the generated headers before writing anything.** They are the contract:
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
   Everything below depends on names that codegen chooses, and reading them beats guessing.

---

## 1. Scope: what actually has to change

| Piece | Migrate? | Why |
|---|---|---|
| The three views | **Yes, required** | View event emitters and view commands are the known-bad cases for the interop layer. This is what's actually broken. |
| `RNObjectCaptureSession` (new module) | Later | Plain promise-returning methods go through TurboModule interop reliably. |
| `RNPhotogrammetrySession` | Later, but **verify early** | It's an `RCTEventEmitter`. Module-level events are generally fine through interop, but confirm on device before assuming. |
| `RNObjectCapture` (constants) | Later | Constants-only module, lowest risk. |

**Do the views first.** Don't migrate all five things at once — you'll have no idea which change
broke the build.

---

## 2. The Swift problem, and the shape that solves it

Fabric component views must be **ObjC++** (`.mm`). They subclass `RCTViewComponentView` and deal
in C++ types (`Props::Shared`, `ComponentDescriptorProvider`, the generated event emitter
structs). Swift cannot subclass them and cannot see those types.

The existing views are Swift and host SwiftUI (`UIHostingController<RNObjectCaptureViewWrapper>`).
That generic type is invisible to ObjC too.

The shape that works — three layers, each seeing only what it can:

```
RNObjectCaptureViewComponentView.mm   (ObjC++)  Fabric plumbing, C++ event emitter
        │  owns a UIViewController *, calls @objc Swift
        ▼
RNObjectCaptureViewFactory.swift      (Swift)   @objc bridge, erases generics
        │  returns UIHostingController as plain UIViewController
        ▼
RNObjectCaptureViewWrapper.swift      (SwiftUI) unchanged - reuse as-is
```

The SwiftUI layer doesn't change at all. That's the good news: `RNObjectCaptureViewWrapper`,
`SessionView`, `CloudPointView` and the session manager are all reusable.

### 2a. The Swift factory

```swift
// ios/View/RNObjectCaptureView/RNObjectCaptureViewFactory.swift
import SwiftUI
import UIKit

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

### 2b. The component view

```objc
// ios/View/RNObjectCaptureView/RNObjectCaptureViewComponentView.mm
#import <React/RCTViewComponentView.h>
#import <react/renderer/components/ObjectCaptureSpec/ComponentDescriptors.h>
#import <react/renderer/components/ObjectCaptureSpec/EventEmitters.h>
#import <react/renderer/components/ObjectCaptureSpec/Props.h>
#import "ObjectCapture-Swift.h"   // generated Swift interface

using namespace facebook::react;

@interface RNObjectCaptureViewComponentView : RCTViewComponentView
@end

@implementation RNObjectCaptureViewComponentView {
  UIViewController *_host;
}

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
    self.contentView = _host.view;   // NOT addSubview - see §5
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps {
  const auto &oldViewProps = *std::static_pointer_cast<RNObjectCaptureViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<RNObjectCaptureViewProps const>(props);

  if (oldViewProps.checkpointDirectory != newViewProps.checkpointDirectory) {
    [RNObjectCaptureSessionManagerBridge
        setCheckpointDirectory:[NSString stringWithUTF8String:newViewProps.checkpointDirectory.c_str()]];
  }
  if (oldViewProps.imagesDirectory != newViewProps.imagesDirectory) {
    [RNObjectCaptureSessionManagerBridge
        setImagesDirectory:[NSString stringWithUTF8String:newViewProps.imagesDirectory.c_str()]];
  }

  [super updateProps:props oldProps:oldProps];
}
@end

// Name must be <ComponentName>Cls for RN to auto-discover it.
Class<RCTComponentViewProtocol> RNObjectCaptureViewCls(void) {
  return RNObjectCaptureViewComponentView.class;
}
```

---

## 3. Events: the part that actually changes semantics

Today the session manager pushes events by calling back into the view manager, which invokes
`RCTDirectEventBlock` props. Under Fabric, events go through a typed C++ emitter:

```objc
- (void)emitSessionState:(NSString *)state {
  if (!_eventEmitter) return;   // always nil-check; it is nil before mounting
  std::static_pointer_cast<const RNObjectCaptureViewEventEmitter>(_eventEmitter)
      ->onSessionStateChange({.state = std::string([state UTF8String])});
}
```

Field names come from `EventEmitters.h`. **Read that file** — codegen derives them from the spec
and won't match your assumption if the spec drifts.

For the `feedback: string[]` event the generated type is a `std::vector<std::string>`:

```objc
std::vector<std::string> feedback;
for (NSString *item in items) {
  feedback.push_back(std::string([item UTF8String]));
}
std::static_pointer_cast<const RNObjectCaptureViewEventEmitter>(_eventEmitter)
    ->onFeedbackStateChange({.feedback = feedback});
```

### Rewiring the session manager

`RNObjectCaptureSessionManager` currently holds `weak var viewManager: RNObjectCaptureView?` and
calls methods on it with a react tag. Replace with an `@objc` observer protocol so ObjC++ can
conform:

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

The component view conforms and translates each callback into an emitter call. Drop the
`node: NSNumber` parameter throughout — it was never used (same finding as the JS migration).

Keep the existing event-buffering behaviour in the session manager. Events can fire before the
component view mounts, and `_eventEmitter` is nil until it does; without buffering you will lose
the first `onSessionStateChange`, which is exactly the one the UI needs.

---

## 4. Registration

RN auto-discovers `<ComponentName>Cls()` and generates `RCTThirdPartyFabricComponentsProvider`.
If a component doesn't resolve at runtime, check in order:

1. The name in `codegenNativeComponent<NativeProps>('RNObjectCaptureView')` matches the `Cls`
   function name exactly.
2. The `.mm` is in `s.source_files` (the podspec glob covers `ios/**/*.mm` already).
3. `pod install` was re-run after the spec changed.

---

## 5. Traps specific to this library

**`self.contentView`, not `addSubview`.** `RCTViewComponentView` manages its subview hierarchy.
Adding directly causes views to survive recycling and reappear in the wrong place. The current
`didMoveToSuperview` + `addSubview` in `RNObjectCaptureViewContainer` must not be carried over.

**Component views are recycled.** Fabric reuses instances for different React nodes. Implement
`prepareForRecycle` to detach the observer and reset state, or a second capture screen will
receive the first one's events.

**The session is a singleton, the views are not.** `RNObjectCaptureSessionManager.shared` outlives
any view. Two mounted capture views would fight over one session — decide whether that's an
error, and if so, guard it rather than letting it fail confusingly.

**`ObjectCapture-Swift.h` needs `DEFINES_MODULE`.** Already set in the podspec. If the generated
header won't import, that setting or the module name is the cause.

**Metal + SwiftUI in a recycled view.** `ObjectCaptureSession` holds camera and Metal resources.
Make sure `cancelSession` runs on unmount/recycle or the camera stays hot between screens.

---

## 6. Order of work, with checkpoints

Each step should build and run before the next. Resist doing two at once.

1. **Bump RN to 0.83, `pod install`, build unchanged.** Confirms the interop layer state and
   gives you a baseline. Note what already breaks — that's your real starting point.
2. **`RNQuickLookView` first.** One prop, no events, no session. It's the smallest possible test
   of whether your codegen setup, registration and podspec are correct.
   *Checkpoint: a USDZ renders.*
3. **`RNObjectCapturePointCloudView`.** Adds two events but no imperative surface.
   *Checkpoint: `onAppear` fires and the point cloud draws.*
4. **`RNObjectCaptureView`.** The big one — six events, two props, the observer rewiring.
   *Checkpoint: a full capture → scan pass → finish cycle.*
5. **Delete the old `RCTViewManager` classes and bridge `.m` files** only once all three work.
6. **Reassess the modules.** If they've been working through interop the whole time, migrating
   them is optional cleanup rather than a fix.

---

## 7. What to check first on device, before any of this

The Phase 0 and Phase 1 work is uncompiled. Validate it before layering more on top:

- [ ] `pod install` succeeds — confirms the `React-Codegen` → `ReactCodegen` podspec fix
- [ ] `RNObjectCaptureSession` module resolves and `isDeviceSupported()` returns true
- [ ] A reconstruction completes and `onDimensions` fires with plausible metres
      (measure the object with a tape and compare — this is the number the product rests on)
- [ ] `detail: 'reduced'` is measurably faster than the default
- [ ] `outputPath: 'model.usdz'` (flat) and `'Outputs/chair/model.usdz'` (nested) both work
- [ ] Checkpointing actually resumes now that `checkpointDirectory` is applied

That list is small and concrete. If it passes, the foundation is sound and the view migration is
mechanical. If `onDimensions` is wrong or absent, fix that before anything else — it's the
capability the whole product direction depends on.
