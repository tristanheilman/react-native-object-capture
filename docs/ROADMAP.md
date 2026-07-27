# Roadmap & Decision Record

Consolidates `PRODUCT_ASSESSMENT.md` (what we have, what the market looks like) and
`ALTERNATIVE_DIRECTIONS.md` (where else this could go) into decisions and an ordered plan.

**Status:** July 2026. Library dormant since June 2025, resuming work.

---

## Decisions

### D1 — The library gets fixed regardless of which product bet wins

Every direction under consideration needs a working React Native Object Capture wrapper, and
this is the only one that exists. It's also currently unusable on any modern React Native
(see §2.1 of the assessment). Fixing it is a prerequisite, not a bet.

### D2 — The furniture-fit app is demoted from "the product" to "a feature"

Crowded niche, low willingness to pay, transient need, and a tape measure answers the question
for free. Keep the capability; don't build a company on it.

### D3 — The product direction is one-of-a-kind commerce

Generative image-to-3D (Meshy, Tripo, Hunyuan3D) has commoditized 3D models of *mass-produced*
goods — one generated model serves a million identical units. It cannot model a *specific,
unique* physical item, because there's no reference set for a one-off and scale is hallucinated.

Unique items must be measured, every time, forever. **That moat widens as generative AI
improves**, which is the rare shape worth building on.

### D4 — The positioning, in one sentence

> Everyone can generate a 3D model. Almost nobody can hand you one that's dimensionally
> correct to the centimetre, of a specific object that exists in the world.
>
> **Measured, not guessed.**

### D5 — Do not pursue: rental-car damage, medical/wound measurement, warehouse dimensioning, aerospace parts

All four have real money and all four fall outside Object Capture's technical envelope
(too large, too specular, too precise, or too regulated). Reasoning is documented per-market
in `ALTERNATIVE_DIRECTIONS.md` §0 so we don't re-litigate them in six months.

---

## The closet app connection

> *"This idea could maybe go hand in hand with my closet app eventually."*

This is a stronger fit than it first appears, and it may be the fastest route to validating D3
— because a closet app already has the users, the catalog, and the habit. The scanner becomes a
feature in a product that exists rather than a product that needs to find an audience.

**⚠️ Assumptions flagged — I haven't seen the closet app.** The below assumes a wardrobe
cataloguing app with per-item records and photos. Correct me and this section gets rewritten.

### Why the overlap is real

Secondhand fashion is the **largest** one-of-a-kind commerce category there is — Depop,
Poshmark, Vinted, The RealReal, Grailed. Every listing is a unique physical item in unique
condition. It is exactly the case D3 describes, at consumer scale, and a closet app is already
sitting on the inventory.

The natural arc: **catalogue → value → list → sell**, where the scan is what makes the listing
credible. Buyers of secondhand goods ask two questions — *what condition is it in* and *what
size is it, really* — and both are dimensional questions that photos answer badly.

### The important technical caveat

Object Capture's envelope (see `ALTERNATIVE_DIRECTIONS.md` §0) splits a wardrobe cleanly:

| Category | Fit | Why |
|---|---|---|
| **Shoes, sneakers, boots** | **Excellent** | Rigid, matte leather/textile, holds its shape, ~25cm. Ideal subject. |
| **Handbags, backpacks, luggage** | **Excellent** | Structured, matte, textured. Ideal subject. |
| **Hats, helmets, structured accessories** | **Good** | Rigid enough, right size. |
| **Belts, wallets, small leather goods** | **Good** | Matte, but small — near the lower size bound. |
| **Jackets, coats, structured outerwear** | **Marginal** | Only on a mannequin or form. Drapes and shifts otherwise. |
| **Shirts, dresses, knitwear, soft goods** | **Poor** | Deformable. Photogrammetry needs a rigid subject; fabric moves between passes. |
| **Jewellery, watches, sunglasses** | **Poor** | Small, specular, reflective. Worst case for the technology. |

So: **this is a shoes-and-bags feature, not a clothing feature.** That's not a consolation
prize — sneakers and handbags are among the highest-value, highest-fraud, most
dimension-sensitive categories in resale, and they're precisely where a measured 3D record is
worth something. Fit questions ("does this run small?") and authentication both benefit.

Trying to scan a folded t-shirt will produce garbage and burn user trust on the first try.
If this ships, it ships gated to the categories that work, with the others explicitly excluded.

### Open questions for the closet app

1. What is it built in — React Native? If so, this library drops in once D1 lands.
2. Does it already store per-item photos and metadata? The scan is a new media type on an
   existing record, which is a much smaller change than a new object model.
3. Is there any resale/listing flow today, or is it purely personal cataloguing? That
   determines whether D3 is one step away or a different product.
4. What's the user base and platform mix? Object Capture needs iPhone 12 Pro or newer, which
   is a meaningful gate on a consumer app.

---

## Ordered plan

### Phase 0 — Correctness and capability *(current)*

Contained changes, verifiable with typecheck/lint/tests, no architecture churn.

- [ ] Fix `outputPath` parsing bug — `RNPhotogrammetrySession.swift:54-57` splits on `/` and
      hard-indexes `[0]`/`[1]`; flat paths crash on out-of-range, nested paths write elsewhere
- [ ] Expose `PhotogrammetrySession.Configuration.detail` (`reduced`/`medium`/`full`/`raw`) —
      currently every caller pays for maximum quality
- [ ] **Surface real-world dimensions** — add `.bounds` to the request list and bridge the
      `ObjectCaptureSession` bounding box so JS gets `{width, height, depth}` in metres.
      *This is the single highest-value change in the repo.* Object Capture already knows the
      extent; we throw it away. Without it, D4 is not true of our own library.
- [ ] Document `finishSession` — implemented end-to-end, used by the example, missing from the
      README methods table

### Phase 1 — New Architecture migration

Required before anyone can use this on a current React Native. RN 0.82 removed the legacy
opt-out; 0.83 removed the legacy code.

- [ ] `codegenNativeComponent` + `RCTViewComponentView` for all three native views
- [ ] Real `TurboModuleRegistry` specs for both native modules (the existing `codegenConfig` is
      vestigial — nothing uses it)
- [ ] Bump the example app off `react-native@0.79.2`
- [ ] Verify on device — Phase 0 and 1 are both written blind; nothing here has been compiled

### Phase 2 — Product surface

- [ ] `RoomPlanView` — second leg of the stool, and independently the most-requested thing
      anyone would want from a React Native spatial library
- [ ] Scan catalog: persistence, metadata, thumbnails (today there's only `listDirectoryContents`)
- [ ] Decide the Android story. There is no Android equivalent to Object Capture; cross-platform
      means a cloud reconstruction pipeline, which is a different product. Right now the stubs
      imply a roadmap that doesn't exist — either scope them honestly or remove them.

### Phase 3 — Validation, in parallel with the above

- [ ] Ten conversations with vintage/estate/consignment dealers before building a product on D3
- [ ] Five emails to robotics labs on metric scan datasets — dead in a week or it's the biggest
      thing on the list (`ALTERNATIVE_DIRECTIONS.md` §4)
- [ ] Scope the closet-app integration once the open questions above are answered

---

## Known constraint on this work

Phases 0 and 1 touch Swift that **cannot be compiled or run in the current environment** — no
Xcode, no device. TypeScript, lint, and Jest are verifiable here; the native side is written
against the Apple API surface and must be built and tested on a LiDAR device before release.
Nothing in Phase 0 or 1 should be considered done until that happens.
