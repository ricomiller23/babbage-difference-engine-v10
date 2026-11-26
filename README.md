# Charles Babbage's Difference Engine No. 2 (1847–1849)
### Museum-Quality Interactive 3D Web Simulation & Mechanical Computing Exhibit

> **Live Production Deployment**: [https://babbage-difference-engine.vercel.app](https://babbage-difference-engine.vercel.app)  
> **Repository Location**: `/Users/ericmiller/NEW JUNE 26/babbage-difference-engine`

---

## 1. Historical Background & Machine Provenance

Charles Babbage conceived the **Difference Engine No. 2** between **1847 and 1849**, simplifying the massive architecture of his earlier unfinished Difference Engine No. 1 (1822–1833). Frustrated by widespread typographical and calculation errors in nautical almanacs and astronomical ephemerides—famously remarking, *"I wish to God these calculations had been executed by steam"*—Babbage designed the machine to calculate and directly imprint mathematical tables with zero risk of human transcription error.

Although unfunded in his lifetime, Babbage's drawings were vindicated between **1989 and 1991** when the **London Science Museum**, led by curator **Doron Swade**, constructed the calculating engine faithfully to Babbage's original 20-sheet design drawings. The engine operated virtually on its first mechanical test. The integral printing and stereotype plate stamping apparatus was completed in **2002**. A second identical machine was built for Nathan Myhrvold and resides at the **Computer History Museum** in Mountain View, California.

### Key Physical Specifications
- **Mass**: ~5 long tons (5,000 kg).
- **Dimensions**: ~11 feet (3.4 m) long, 7 feet (2.1 m) tall, 3 feet (0.9 m) deep.
- **Components**: ~8,000 distinct precision bronze, gunmetal, brass, and cast steel components.
- **Precision**: 31 decimal digits across 8 columns.
- **Mathematical Capability**: Evaluates 7th-degree polynomials using the method of finite differences.

---

## 2. Mechanical Architecture & Simulation Mapping

This simulation maps the physical mechanisms of the London Science Museum engine to interactive 3D procedural models and mathematical logic:

1. **Main Frame & Bracing**: Cast iron end-frames with cross-girders that support the heavy vertical drive shafts and wheel stacks.
2. **Eight Vertical Figure Columns**:
   - **Column 0**: Stores the running function value $f(x)$ (31 digits, units wheel at the bottom, 31st digit at the top).
   - **Columns 1 to 7**: Store the successive finite difference orders ($\Delta^1$ through $\Delta^7$).
3. **Carry / Carriage Arms & Anticipating Levers**:
   - When a figure wheel rotates through $9 \to 0$, a trip lever is cocked.
   - During the carry phase, helical sweep shafts spin sequentially from the lowest wheel upward, resolving carries without jamming or cumulative torque buildup.
4. **Main Camshaft & Bell-Crank Linkages**:
   - Driven by the hand crank via reduction gearing.
   - Synchronizes addition cycles: even-order difference addition followed by odd-order difference addition.
5. **Integral Stereotype & Printing Carriage**:
   - Reads the 31 digits of Column 0 via feeling levers.
   - Typesetting wheels position the embossed digits and stamp them into a stereotype papier-mâché or plaster plate for direct printing.

---

## 3. Interactive Features

- **Real-Time 3D Engine**: Built with Three.js featuring physical materials (brushed bronze, specular highlights, gunmetal gears, aged parchment roll).
- **Interactive Crank**:
  - Drag or click to manually turn the crank $360^\circ$.
  - Single-step mode advances through Addition, Carry Sweep, Typeface Alignment, and Stamping phases.
  - Auto-run mode with variable speed governor.
- **Polynomial Configuration**:
  - Choose historical presets: Babbage's Worked Example ($f(x) = x^2 + x + 41$, Euler's prime generator), Cubic Tables ($x^3$), Nautical Ephemerides, and High-Order polynomials ($\le 7$th degree).
  - Or enter custom coefficients and starting values of $x$.
- **Exploded / X-Ray & Subsystem Labels**:
  - Toggle frame opacity to inspect internal gear trains and helical carry spirals.
  - Toggle pins highlighting key mechanical subsystems.
- **Camera Tour Presets**: Full View, Figure Columns close-up, Helical Carriage close-up, Printing Carriage close-up, and Crank Assembly close-up.
- **Victorian Acoustic Engine**: Procedural Web Audio synthesizing mechanical ratchets, brass gear mesh clicks, and heavy cast iron stamping thuds.

---

## 4. Local Execution & Deployment

### Run Locally
```bash
cd "/Users/ericmiller/NEW JUNE 26/babbage-difference-engine"
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### Build & Deploy to Vercel
```bash
npm run build
npx -y vercel --prod --yes --scope team_bv8PYjAIyXPzg86ay1nYP3BA
```
