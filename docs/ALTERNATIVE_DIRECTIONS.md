# Alternative Directions — Non-Furniture

Companion to `PRODUCT_ASSESSMENT.md`. That doc concluded the furniture-fit idea is a weak
consumer bet. This one asks a different question:

> **Who already pays for a dimensionally-accurate record of a physical object?**

Not "what else could we scan." The scan is never the product. In every direction below that
works, the scan is one step in a workflow somebody already performs and already pays for.

---

## 0. First, the technical envelope — it rules out most of the exciting markets

Before picking a direction, be honest about what Apple's Object Capture can and cannot do.
This eliminated three of the hottest markets I looked at.

**Works well on:**
- Rigid, static objects roughly 5cm–2m — small enough to walk around, big enough to resolve
- Matte, textured surfaces: wood, ceramic, fabric, stone, painted metal, cardboard, plaster
- Output is metric USDZ, viewable in AR Quick Look on any iPhone with no app install

**Fails or degrades on:**
- Chrome, mirror, gloss black, glass, anything transparent or highly specular
- Fur, hair, fine mesh, thin wires
- Anything larger than a small room (LiDAR range is a few meters) or smaller than a few cm
- Anything that moves or deforms

**Hardware floor:** iPhone 12 Pro or newer (LiDAR). That's a minority of iPhone owners — but
it skews toward professional and higher-income users, which is fine if you're selling to
businesses and actively bad if you're selling a mass-market consumer app.

**Cost:** minutes of on-device reconstruction per object, and it heats the phone.

### Markets this envelope kills

| Market | Why it's tempting | Why it doesn't work |
|---|---|---|
| **Rental car damage** | Genuinely hot right now — a consumer backlash over AI damage scanners, [House Oversight investigating](https://oversight.house.gov/release/mace-investigates-use-of-artificial-intelligence-for-car-rental-damage-assessments), [Forbes covering it as "AI vs. the iPhone"](https://www.forbes.com/sites/christopherelliott/2025/11/01/ai-vs-the-iphone-the-battle-for-your-rental-car-damage-bill/), and [Ravin.ai](https://www.ravin.ai/blog/giving-customers-more-power-in-ai-scans-for-rental-car-damage) already letting renters self-scan | Cars are too big for LiDAR range and automotive clearcoat is the single worst photogrammetry surface. This is a photo + AI problem, not an Object Capture problem. Right market, wrong tool. |
| **Wound care / medical measurement** | Real reimbursement pressure; [$901M in 2026 → $1.69B by 2032](https://www.coherentmarketinsights.com/market-insight/digital-wound-management-devices-market-461) | Regulated (FDA, HIPAA), long sales cycles, and providers are actively [moving away from smartphone-approximate measurement toward higher-accuracy tools](https://www.futuremarketinsights.com/reports/ai-enabled-wound-analysis-market). You'd be entering as the thing they're leaving. |
| **Warehouse / 3PL parcel dimensioning** | Clear ROI math on dimensional weight; incumbent hardware is expensive | [Cubiscan 325 resolves to 0.05 inches](https://cubiscan.com/warehouse-dimensioning-precision-toughness-with-325/). You will not match that. And for boxes you need three numbers, not a mesh — no reason to use photogrammetry at all. |
| **Aerospace / industrial reverse engineering** | High value per part, [real on-demand parts momentum](https://metrology.news/hexagon-enables-on-demand-aircraft-parts-replacement-with-portable-reverse-engineering/) | Needs CAD-grade tolerance and Geomagic-class software. Different precision class entirely. |
| **Jewelry, watches, coins** | High value, high dispute rate | Small, shiny, reflective. Worst case for the technology. |

---

## 1. One-of-a-kind commerce — vintage, antique, artisan, estate

**This is the strongest direction, and it's strong precisely *because* of the AI advances.**

### The setup

3D and AR product media measurably sells: [Shopify found 94% higher conversion](https://blog.neural4d.com/image-to-3d/shopify-3d-model-5-step-guide-to-boost-ar-sales-2026/)
for products with 3D/AR content versus flat images, and [AR cuts return rates 22–40%](https://www.spherelinks.io/blog/3d-product-pages-reduce-returns-conversion-data).
Historically the blocker was cost — 3D models meant an agency and hundreds of dollars per SKU.

### Why the obvious version of this business is already dead

Generative image-to-3D killed it. [Meshy](https://www.meshy.ai/features/image-to-3d) turns a
product photo into a mesh in ~90 seconds; Tripo does quad retopology in seconds. For a
**mass-produced** product, one model serves a million identical units, so you amortize the cost
across all of them and generation wins on price and speed every time. Do not build a general
"3D models for e-commerce" scanning app. That race is over and you lost it.

### The exception, which is large and defensible

**Items where every unit is unique.** You cannot generate a model of *this* chair with *this*
chip in *this* leg. There is no reference photo set for a one-off. Each item requires its own
physical capture, every time, forever — and the more capable generative models get at
commodities, the more the unique-item case is the only thing left that must be measured.

That's a moat that gets *wider* as AI improves, which is a rare shape.

Who has that problem:
- Vintage and antique dealers (1stDibs, Chairish, Etsy vintage)
- Estate liquidators and auction houses — hundreds of unique lots per sale, catalogued under time pressure
- Consignment and secondhand shops
- Artisans: potters, woodworkers, glassblowers, sculptors, small-batch makers
- Architectural salvage, used equipment dealers

Every one of these already photographs every item as a required step. You are not adding work
to their day — you are upgrading a step they already perform, and their listings currently
almost never include dimensions, which is the #1 buyer question and the #1 cause of returns.

Technically this is a **perfect** fit for the envelope in §0: matte, hand-to-body-sized,
one-off, non-specular. It is what Object Capture was built for.

**Monetization:** per-listing fee, or a seller subscription, or a marketplace integration that
takes a cut. Recurring by construction — new inventory arrives weekly.

**Risk:** these are price-sensitive small businesses, and you need to prove the scan sells the
item faster. Test that with 10 dealers before writing a line of code.

---

## 2. Condition-of-record — "scan out, scan in, diff the geometry"

**The most novel direction. Nobody is doing this with metric meshes.**

The idea: capture an object when it leaves your possession, capture it when it returns, and
compute the geometric difference. Photos can tell you there's a mark. A metric mesh diff tells
you the dent is 4mm deep and 30mm across — which is the difference between an argument and
evidence.

The rental car version of this is the hot market (see §0) and the wrong one technically. The
version that fits the envelope:

- **Tool and equipment rental** — contractors, party/event rental, film and photo gear
- **Musical instrument rental and repair** — high-value, matte finishes, real dispute costs
- **Art and antique shipping / museum loans** — condition reports are already a formal,
  mandatory, labor-intensive deliverable in this industry, currently done with photos and prose
- **Consignment intake** — proving what condition an item arrived in

The art-shipping case is the most interesting: condition reporting is already a required
document, already billed for, and already painful. You'd be digitizing a mandated artifact
rather than inventing a new habit.

**Honest cost:** mesh registration and diffing is real work you do not have today, and it's the
hard part. Alignment of two independent scans to sub-millimeter is a research-adjacent problem.
Budget seriously for it or scope down to "side-by-side viewer with shared scale," which is
much easier and might be 80% of the perceived value.

---

## 3. Sell the SDK, not an app

The one direction where **the asset you already own is the product.**

`react-native-object-capture` is the only React Native Object Capture wrapper on GitHub — a
search for `object capture react-native in:name` returns exactly one result, this repo. Every
vertical above needs a mobile app, and a large share of small-team mobile apps are React Native.

The work: New Architecture migration, expose dimensions, expose detail level, add a RoomPlan
view, ship 1.0, write real docs. Then dual-license (MIT for OSS, commercial for closed-source)
or sell support.

**Ceiling is low** — realistically low thousands per month at best, and that's if it goes well.
But the effort is a few focused weekends, it's the only option where you're not starting from
zero, it generates consulting inbound, and **every other direction on this list requires it
anyway.** Do this regardless of which product bet you make.

---

## 4. Robotics / embodied AI training data — the left-field one

The contrarian option, and the one with the highest ceiling.

The embodied AI market is projected to go from [$4.44B in 2025 to $23.06B by 2030](https://www.physicl.ai/insights/embodied-ai),
and the bottleneck everyone complains about is real-world data. Physical AI training needs
[structured, physics-accurate 3D data — real objects with real scale, diverse coverage, and failure cases](https://www.vivid3d.ai/blog/synthetic-data-for-robotics-training).
There's a documented shift from simulated to real-world capture because sim-to-real transfer
keeps breaking on the messy physical details.

Here's the fit: a robot grasping a mug needs to know the mug is 94mm tall, not that it's
*plausibly mug-shaped*. **Generative 3D hallucinates scale. Object Capture measures it.** That
distinction is worth nothing in games and marketing, and it's the entire ballgame in robotics.

Possible shapes: a curated metric object library licensed to robotics labs; a "scan-to-earn"
contributor network; or contract capture for a specific lab's object set.

**Be skeptical.** This is selling picks during a gold rush, which is a good business right up
until it isn't. The major datasets ([AGIBOT WORLD](https://www.therobotreport.com/agibot-world-2026-dataset-open-source-accelerate-embodied-ai-development/),
OXE, DROID) are open-source, which suppresses willingness to pay. It's enterprise sales with a
long cycle and you'd be a solo dev pitching well-funded labs.

**But it costs five phone calls to find out.** Email five robotics groups and ask what they'd
pay for 1,000 metrically-accurate scans of household objects. If three say "nothing, we have
AGIBOT," it's dead in a week and you've lost nothing.

---

## 5. Honorable mention — consumer replacement parts

"Scan the broken knob, get a printable replacement." Genuinely beloved, technically feasible
now that mesh→CAD tooling is improving, and it taps real frustration with
[OEM spare-parts monopoly pricing and planned obsolescence](http://www.advice-manufacturing.com/3D-Scanning-Reverse-Engineering.html).

Monetization is the problem: makers famously don't pay, and the people who *would* pay don't
own 3D printers. Fun weekend project, weak business.

---

## Recommendation

**The reframe:** stop thinking of this as a scanning app. In all three viable directions, the
product is the workflow — listing creation, dispute resolution, dataset delivery — and the
scanner is a feature inside it. Scanning is free everywhere now (Scaniverse, RealityScan);
nobody pays for the act of scanning.

**The through-line:** everyone can *generate* a 3D model now. Almost nobody can hand you one
that's dimensionally correct to the centimeter, of a specific real object that exists in the
world. Every direction worth pursuing sits on that sentence.

Ranked:

1. **§3 (SDK) — do this now, regardless.** Cheap, uncontested, prerequisite for everything else.
2. **§1 (one-of-a-kind commerce) — the product bet.** Validate with 10 vintage/estate dealers
   before building. Best technical fit, recurring need, and a moat that widens as generative AI
   improves.
3. **§4 (robotics data) — five phone calls.** Highest ceiling, most uncertain. Cheap to disprove.
4. **§2 (condition-of-record) — the interesting long shot.** Most novel, but the mesh-diff work
   is a serious lift. Revisit if §1 stalls.

Do not build: rental cars, medical, warehouse dimensioning. Right instincts, wrong tool.

---

## Sources

- [Shopify 3D Model guide — 94% conversion lift](https://blog.neural4d.com/image-to-3d/shopify-3d-model-5-step-guide-to-boost-ar-sales-2026/)
- [SphereLinks — 3D Product Pages Reduce Returns](https://www.spherelinks.io/blog/3d-product-pages-reduce-returns-conversion-data)
- [Meshy — Image to 3D](https://www.meshy.ai/features/image-to-3d)
- [House Oversight — Mace investigates AI for car rental damage assessments](https://oversight.house.gov/release/mace-investigates-use-of-artificial-intelligence-for-car-rental-damage-assessments)
- [Forbes — AI vs. The iPhone: The Battle For Your Rental Car Damage Bill](https://www.forbes.com/sites/christopherelliott/2025/11/01/ai-vs-the-iphone-the-battle-for-your-rental-car-damage-bill/)
- [InvestigateTV — Rental car AI scanners flag alleged damage](https://www.investigatetv.com/2026/06/29/rental-car-ai-scanners-flag-alleged-damage-leaving-customers-with-surprise-bills/)
- [Ravin.ai — Giving Customers More Power in AI Scans](https://www.ravin.ai/blog/giving-customers-more-power-in-ai-scans-for-rental-car-damage)
- [Coherent Market Insights — Digital Wound Measurement Devices Market](https://www.coherentmarketinsights.com/market-insight/digital-wound-management-devices-market-461)
- [Future Market Insights — AI-enabled Wound Analysis Market](https://www.futuremarketinsights.com/reports/ai-enabled-wound-analysis-market)
- [Cubiscan 325 — warehouse dimensioning precision](https://cubiscan.com/warehouse-dimensioning-precision-toughness-with-325/)
- [Cubiscan — Understanding Dimensional Weight](https://cubiscan.com/understanding-dimensional-weight-how-carriers-charge-and-how-you-can-save/)
- [Metrology News — Hexagon on-demand aircraft parts reverse engineering](https://metrology.news/hexagon-enables-on-demand-aircraft-parts-replacement-with-portable-reverse-engineering/)
- [Advice Manufacturing — 3D Scanning Reverse Engineering](http://www.advice-manufacturing.com/3D-Scanning-Reverse-Engineering.html)
- [Physicl.ai — Embodied AI in 2026](https://www.physicl.ai/insights/embodied-ai)
- [Vivid3D — Synthetic 3D Data for Robotics Training](https://www.vivid3d.ai/blog/synthetic-data-for-robotics-training)
- [The Robot Report — AGIBOT WORLD 2026 dataset open-sourced](https://www.therobotreport.com/agibot-world-2026-dataset-open-source-accelerate-embodied-ai-development/)
