/**
 * Pure Mathematical Finite Difference Engine
 * Faithfully modeling Charles Babbage's Difference Engine No. 2
 * 
 * 8 Columns (Columns 0 through 7)
 * 31 decimal digits per column (Figure Wheels 0 to 30, where 0 is units, 30 is MSB)
 * Column 0 stores the function value f(x)
 * Columns 1..7 store the 1st through 7th differences Δ¹..Δ⁷
 */

export const NUM_COLUMNS = 8;
export const NUM_WHEELS = 31;

export const HISTORICAL_PRESETS = [
  {
    id: "euler-primes",
    name: "Babbage's Prime Generator",
    formula: "f(x) = x² + x + 41",
    description: "Famous Euler polynomial generating 40 consecutive prime numbers (41, 43, 47, 53, 61, 71...). Babbage cited this as proof of mechanical infallibility.",
    degree: 2,
    coefficients: [41, 1, 1, 0, 0, 0, 0, 0]
  },
  {
    id: "squares",
    name: "Table of Squares",
    formula: "f(x) = x²",
    description: "Fundamental navigational table benchmark. Constant second difference Δ² = 2.",
    degree: 2,
    coefficients: [0, 0, 1, 0, 0, 0, 0, 0]
  },
  {
    id: "cubes",
    name: "Table of Cubes",
    formula: "f(x) = x³",
    description: "Third-order polynomial with constant third difference Δ³ = 6.",
    degree: 3,
    coefficients: [0, 0, 0, 1, 0, 0, 0, 0]
  },
  {
    id: "babbage-1849",
    name: "Babbage 1849 Worked Example",
    formula: "f(x) = x³ - 3x² + 2x + 1",
    description: "The specific cubic demonstration preserved in Babbage's 1847-1849 design notes submitted to the Royal Society.",
    degree: 3,
    coefficients: [1, 2, -3, 1, 0, 0, 0, 0]
  },
  {
    id: "nautical-quartic",
    name: "Nautical Almanac Ephemeris (Quartic)",
    formula: "f(x) = x⁴ - 6x³ + 11x² - 6x + 24",
    description: "Fourth-degree ephemeris curve representing lunar distance tables used for maritime longitude calculation.",
    degree: 4,
    coefficients: [24, -6, 11, -6, 1, 0, 0, 0]
  },
  {
    id: "septenary-degree7",
    name: "Maximum Capacity (7th-Degree Polynomial)",
    formula: "f(x) = x⁷ + 2x⁴ + 15x + 100",
    description: "Engages all 8 calculating columns of Difference Engine No. 2 simultaneously, testing maximum carry ripple across 31 digits.",
    degree: 7,
    coefficients: [100, 15, 0, 0, 2, 0, 0, 1]
  }
];

export function evaluatePolynomial(coeffs, x) {
  let result = 0n;
  const xBig = BigInt(x);
  for (let i = 0; i < coeffs.length; i++) {
    const c = BigInt(coeffs[i] || 0);
    if (c === 0n) continue;
    let power = 1n;
    for (let p = 0; p < i; p++) {
      power *= xBig;
    }
    result += c * power;
  }
  return result;
}

export function computeInitialDifferences(coeffs, startX = 0) {
  const n = NUM_COLUMNS;
  const table = [];

  const row0 = [];
  for (let x = startX; x < startX + n; x++) {
    row0.push(evaluatePolynomial(coeffs, x));
  }
  table.push(row0);

  for (let d = 1; d < n; d++) {
    const prevRow = table[d - 1];
    const newRow = [];
    for (let i = 0; i < prevRow.length - 1; i++) {
      newRow.push(prevRow[i + 1] - prevRow[i]);
    }
    table.push(newRow);
  }

  const initialValues = [];
  for (let col = 0; col < n; col++) {
    initialValues.push(table[col][0]);
  }

  return initialValues;
}

export function bigIntToDigits(val) {
  const digits = new Array(NUM_WHEELS).fill(0);
  const MOD = 10n ** BigInt(NUM_WHEELS);
  let norm = ((val % MOD) + MOD) % MOD;
  for (let i = 0; i < NUM_WHEELS; i++) {
    digits[i] = Number(norm % 10n);
    norm /= 10n;
  }
  return digits;
}

export function digitsToBigInt(digits) {
  let val = 0n;
  for (let i = NUM_WHEELS - 1; i >= 0; i--) {
    val = val * 10n + BigInt(digits[i]);
  }
  const MOD = 10n ** BigInt(NUM_WHEELS);
  const HALF = MOD / 2n;
  if (val >= HALF) {
    return val - MOD;
  }
  return val;
}

export class DifferenceEngineState {
  constructor(coeffs = HISTORICAL_PRESETS[0].coefficients, startX = 0) {
    this.reset(coeffs, startX);
  }

  loadPolynomial(coeffs, startX = 0) { return this.reset(coeffs, startX); }

  reset(coeffs = HISTORICAL_PRESETS[0].coefficients, startX = 0) {
    this.coefficients = coeffs;
    this.x = startX;
    this.initialDifferences = computeInitialDifferences(coeffs, startX);
    
    this.columns = [];
    for (let c = 0; c < NUM_COLUMNS; c++) {
      this.columns.push(bigIntToDigits(this.initialDifferences[c]));
    }

    this.carryWarnings = Array.from({ length: NUM_COLUMNS }, () => new Array(NUM_WHEELS).fill(false));
    this.interlockActive = false; // Mechanical safety lockout
    this.currentPhase = 0; // 0: Idle, 1: Addition, 2: Helical Carry, 3: Typeface Align, 4: Print Hammer
    this.crankAngle = 0; // 0 to 360 degrees
    this.lastCarriesResolved = [];
    
    this.history = [
      {
        cycle: 0,
        x: this.x,
        value: this.getColumnValue(0),
        differences: Array.from({ length: NUM_COLUMNS }, (_, c) => this.getColumnValue(c)),
        formattedOutput: this.formatValue(this.getColumnValue(0)),
        timestamp: Date.now()
      }
    ];
  }

  getColumnValue(colIdx) {
    return digitsToBigInt(this.columns[colIdx]);
  }

  formatValue(val) {
    return val.toString();
  }

  /**
   * Phase 1: Addition (Columns 1..7 transfer into columns 0..6)
   * Figure wheels rotate and trip carry warnings on 9->0 roll
   */
  executeAdditionPhase() {
    const sourceSnapshots = this.columns.map(col => [...col]);
    const deltas = [];

    for (let k = 0; k < NUM_COLUMNS - 1; k++) {
      const colDeltas = new Array(NUM_WHEELS).fill(0);
      for (let w = 0; w < NUM_WHEELS; w++) {
        const addAmount = sourceSnapshots[k + 1][w];
        const oldVal = this.columns[k][w];
        const sum = oldVal + addAmount;
        this.columns[k][w] = sum % 10;
        colDeltas[w] = addAmount;

        if (sum >= 10) {
          this.carryWarnings[k][w] = true;
        }
      }
      deltas.push({ destCol: k, srcCol: k + 1, colDeltas });
    }
    this.currentPhase = 1;
    return deltas;
  }

  /**
   * Phase 2: Helical Carry Resolution
   * Spiral carry cams sweep upward from wheel 0 to wheel 30
   */
  executeCarryPhase() {
    const resolvedCarries = [];

    for (let k = 0; k < NUM_COLUMNS - 1; k++) {
      for (let w = 0; w < NUM_WHEELS - 1; w++) {
        if (this.carryWarnings[k][w]) {
          this.carryWarnings[k][w] = false;
          const oldVal = this.columns[k][w + 1];
          const newVal = (oldVal + 1) % 10;
          this.columns[k][w + 1] = newVal;
          resolvedCarries.push({ col: k, fromWheel: w, toWheel: w + 1 });

          // Mechanical ripple: if next wheel passed 9->0, trip next carry warning
          if (oldVal === 9) {
            this.carryWarnings[k][w + 1] = true;
          }
        }
      }
      this.carryWarnings[k][NUM_WHEELS - 1] = false;
    }
    this.lastCarriesResolved = resolvedCarries;
    this.currentPhase = 2;
    return resolvedCarries;
  }

  /**
   * Phase 3: Typeface Wheel Alignment
   * Reads digits from Column 0 and sets printer stamping wheels
   */
  executeTypefaceAlignPhase() {
    this.currentPhase = 3;
    const col0Digits = [...this.columns[0]];
    return col0Digits;
  }

  /**
   * Phase 4: Printer Hammer Strike & Paper Advance
   */
  executePrintPhase() {
    this.x += 1;
    const newValue = this.getColumnValue(0);
    const entry = {
      cycle: this.history.length,
      x: this.x,
      value: newValue,
      differences: Array.from({ length: NUM_COLUMNS }, (_, c) => this.getColumnValue(c)),
      formattedOutput: this.formatValue(newValue),
      timestamp: Date.now()
    };
    this.history.push(entry);
    this.currentPhase = 4;
    return entry;
  }

  /**
   * Complete 1 full calculating cycle (driven by 1 full 360° turn of the crank)
   */
  executeFullCycle() {
    const additions = this.executeAdditionPhase();
    const carries = this.executeCarryPhase();
    const typeface = this.executeTypefaceAlignPhase();
    const printEntry = this.executePrintPhase();
    this.currentPhase = 0;

    return {
      additions,
      carries,
      typeface,
      printEntry,
      newX: this.x,
      newValue: printEntry.value
    };
  }
}
