/**
 * BB84 Quantum Key Distribution Protocol Engine — Corrected Implementation
 *
 * Models:
 *  - Rectilinear basis (+): |0⟩ / |1⟩
 *  - Diagonal basis (×):    |+⟩ / |−⟩
 *
 * Measurement rule (quantum mechanics):
 *  - Same basis  → deterministic: returns the encoded bit.
 *  - Cross basis → probabilistic: returns 0 or 1 with equal probability.
 *
 * Eve performs an intercept-resend attack.
 * Channel noise is a probabilistic bit-flip, independent of Eve.
 *
 * NOTE: This is a simplified educational noise model.
 * It does not represent every physical disturbance in a real quantum channel.
 *
 * This simulation does NOT implement error correction or privacy amplification.
 * Do not interpret a low QBER as proof of a production-ready secure key.
 */

export type Basis = "+" | "x";
export type Bit = 0 | 1;

// ─── CSPRNG helpers ─────────────────────────────────────────────────────────

export type RandomProvider = () => number;

/** Returns a cryptographically random float in [0, 1). */
function defaultSecureRandom(): number {
  const buf = new Uint32Array(1);
  // crypto.getRandomValues works in modern browsers and Node ≥ 19.
  // Fallback to Math.random for environments without crypto (SSR build step).
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(buf);
    return buf[0] / 0x1_0000_0000;
  }
  return Math.random();
}

let activeRandomProvider: RandomProvider = defaultSecureRandom;

/** Set a custom random provider (e.g. seeded PRNG or mock sequence for deterministic testing). */
export function setRandomProvider(provider: RandomProvider): void {
  activeRandomProvider = provider;
}

/** Reset random provider back to default CSPRNG. */
export function resetRandomProvider(): void {
  activeRandomProvider = defaultSecureRandom;
}

/** Returns a random bit (0 or 1) using the active or provided RNG. */
export function randomBit(rng: RandomProvider = activeRandomProvider): Bit {
  return rng() < 0.5 ? 0 : 1;
}

/** Returns a random basis (+ or x) using the active or provided RNG. */
export function randomBasis(rng: RandomProvider = activeRandomProvider): Basis {
  return rng() < 0.5 ? "+" : "x";
}

// ─── Core measurement function ───────────────────────────────────────────────

/**
 * Simulate measuring a quantum state in a given basis.
 *
 * @param stateBit        The bit encoded in the incoming state.
 * @param stateBasis      The basis in which the state was prepared.
 * @param measureBasis    The basis chosen by the measurer.
 * @param rng             Optional custom random generator for testing.
 * @returns               Deterministic result if bases match; probabilistic random bit otherwise.
 */
export function measureQuantumState(
  stateBit: Bit,
  stateBasis: Basis,
  measureBasis: Basis,
  rng: RandomProvider = activeRandomProvider
): Bit {
  if (stateBasis === measureBasis) {
    return stateBit; // Same basis → deterministic
  }
  return randomBit(rng); // Cross basis → 50 / 50
}

/**
 * Encodes a classical bit into a quantum basis representation.
 * Rectilinear (+): 0 → |0⟩, 1 → |1⟩
 * Diagonal (×):    0 → |+⟩, 1 → |−⟩
 */
export function encodeQubit(bit: Bit, basis: Basis): { bit: Bit; basis: Basis; stateNotation: string } {
  const notation =
    basis === "+"
      ? bit === 0
        ? "|0⟩"
        : "|1⟩"
      : bit === 0
      ? "|+⟩"
      : "|−⟩";
  return { bit, basis, stateNotation: notation };
}

// ─── Data types ──────────────────────────────────────────────────────────────

export interface QubitRecord {
  /** 1-based display index. */
  index: number;

  // Alice
  aliceBit: Bit;
  aliceBasis: Basis;

  // Eve
  eveIntercepted: boolean;
  eveBasis?: Basis;
  eveMeasuredBit?: Bit;

  // Channel
  channelNoiseApplied: boolean;

  // Bob
  bobBasis: Basis;
  bobMeasuredBit: Bit;

  // Reconciliation
  /** True when Alice's basis === Bob's basis. */
  basesMatch: boolean;
  /** True when this position enters the sifted key pool. */
  isSifted: boolean;

  // Error estimation
  /** True when randomly selected into the public test sample. */
  isTestBit: boolean;
  /**
   * True when Alice's bit !== Bob's measured bit in a test-sample position.
   * Undefined / false for discarded or untested sifted positions.
   */
  isError: boolean;
}

export interface SimulationConfig {
  numQubits: number;       // 8–32
  eveEnabled: boolean;
  eveProbability: number;  // 0.0–1.0
  channelNoise: number;    // 0.0–0.30 (simplified educational model)
  testFraction: number;    // fraction of sifted bits sampled (e.g. 0.25)
  randomFn?: RandomProvider; // Optional custom RNG for deterministic testing
}

/**
 * Protocol outcome status.
 *
 * "no_sample"   – No sifted bits were available for testing; QBER unavailable.
 * "aborted"     – QBER exceeds the educational threshold (11%); abort advised.
 * "candidate"   – QBER within threshold; candidate raw key ready for further processing.
 */
export type ProtocolStatus = "no_sample" | "aborted" | "candidate";

export interface SimulationResult {
  qubits: QubitRecord[];

  // Traceable metrics (all derived from `qubits`)
  totalQubits: number;
  eveInterceptionCount: number;
  matchingBasesCount: number;
  discardedCount: number;
  siftedKeyLength: number;
  testSampleSize: number;
  detectedErrorsCount: number;

  /**
   * QBER as a value in [0, 1], or null when no test sample is available.
   * Display as percentage (multiply by 100).
   */
  qber: number | null;

  /**
   * Alice's candidate raw key — untested sifted bits, in Alice's values.
   * Does NOT include test-sample positions.
   */
  aliceCandidateKey: Bit[];

  /**
   * Bob's candidate raw key — untested sifted bits, in Bob's measured values.
   * Does NOT include test-sample positions.
   * May differ from aliceCandidateKey due to residual errors.
   */
  bobCandidateKey: Bit[];

  candidateKeyLength: number;

  protocolStatus: ProtocolStatus;

  /** Human-readable status message. */
  statusMessage: string;

  /** Educational disclaimer always shown alongside results. */
  disclaimer: string;

  // Legacy compat fields (kept so SimulationScene still compiles)
  /** @deprecated Use protocolStatus. */
  isSecure: boolean;
  /** @deprecated Use aliceCandidateKey / bobCandidateKey. */
  secretKey: Bit[];
  status: "completed" | "aborted";
}

// ─── Invariant checker ───────────────────────────────────────────────────────

function checkInvariants(r: SimulationResult): void {
  const errors: string[] = [];

  if (r.matchingBasesCount + r.discardedCount !== r.totalQubits) {
    errors.push(
      `matchingBases(${r.matchingBasesCount}) + discarded(${r.discardedCount}) ≠ totalQubits(${r.totalQubits})`
    );
  }
  if (r.siftedKeyLength !== r.matchingBasesCount) {
    errors.push(
      `siftedKeyLength(${r.siftedKeyLength}) ≠ matchingBasesCount(${r.matchingBasesCount})`
    );
  }
  if (r.testSampleSize > r.siftedKeyLength) {
    errors.push(
      `testSampleSize(${r.testSampleSize}) > siftedKeyLength(${r.siftedKeyLength})`
    );
  }
  if (r.candidateKeyLength !== r.siftedKeyLength - r.testSampleSize) {
    errors.push(
      `candidateKeyLength(${r.candidateKeyLength}) ≠ sifted(${r.siftedKeyLength}) - test(${r.testSampleSize})`
    );
  }
  if (r.detectedErrorsCount > r.testSampleSize) {
    errors.push(
      `detectedErrors(${r.detectedErrorsCount}) > testSampleSize(${r.testSampleSize})`
    );
  }

  if (errors.length > 0) {
    console.error(
      "[BB84 Engine] Invariant violation — results are unreliable:\n" +
        errors.join("\n")
    );
  }
}

// ─── Validation tests ────────────────────────────────────────────────────────

/**
 * Runs the built-in self-validation suite.
 * Returns an array of failure messages; empty array means all tests passed.
 * Call from a test harness or browser console: import and invoke directly.
 */
export function runValidationTests(): string[] {
  const failures: string[] = [];

  function assert(condition: boolean, label: string) {
    if (!condition) failures.push(`FAIL: ${label}`);
  }

  // Test 1 — Ideal channel: no Eve, no noise → matching bases must agree.
  {
    const r = runBB84Simulation({
      numQubits: 200,
      eveEnabled: false,
      eveProbability: 0,
      channelNoise: 0,
      testFraction: 0,
    });
    const mismatches = r.qubits.filter(
      (q) => q.isSifted && q.aliceBit !== q.bobMeasuredBit
    ).length;
    assert(
      mismatches === 0,
      `Test 1 — Ideal channel: 0 mismatches expected, got ${mismatches}`
    );
    assert(
      r.eveInterceptionCount === 0,
      `Test 1 — No Eve: interceptions=${r.eveInterceptionCount}`
    );
  }

  // Test 2 — Discarded positions must never enter sifted key.
  {
    const r = runBB84Simulation({
      numQubits: 100,
      eveEnabled: false,
      eveProbability: 0,
      channelNoise: 0,
      testFraction: 0.25,
    });
    const discardedInSifted = r.qubits.filter(
      (q) => !q.basesMatch && q.isSifted
    ).length;
    assert(
      discardedInSifted === 0,
      `Test 2 — No discarded in sifted: found ${discardedInSifted}`
    );
    const discardedInTest = r.qubits.filter(
      (q) => !q.basesMatch && q.isTestBit
    ).length;
    assert(
      discardedInTest === 0,
      `Test 2 — No discarded in test: found ${discardedInTest}`
    );
  }

  // Test 3 — Eve 100%: every qubit intercepted, QBER ≈ 25% over many trials.
  {
    const r = runBB84Simulation({
      numQubits: 500,
      eveEnabled: true,
      eveProbability: 1.0,
      channelNoise: 0,
      testFraction: 0.25,
    });
    assert(
      r.eveInterceptionCount === 500,
      `Test 3 — Eve 100%: interceptions=${r.eveInterceptionCount} (expected 500)`
    );
    if (r.qber !== null) {
      // Statistical tolerance: ≈25% ± 8% for 500 qubits
      assert(
        r.qber >= 0.10 && r.qber <= 0.40,
        `Test 3 — Eve 100% QBER in [10%, 40%]: got ${(r.qber * 100).toFixed(1)}%`
      );
    }
  }

  // Test 4 — Partial interception: count within statistical bounds.
  {
    const r = runBB84Simulation({
      numQubits: 500,
      eveEnabled: true,
      eveProbability: 0.5,
      channelNoise: 0,
      testFraction: 0,
    });
    // Expect ~250 ± 50
    assert(
      r.eveInterceptionCount >= 150 && r.eveInterceptionCount <= 350,
      `Test 4 — 50% interception in [150,350]: got ${r.eveInterceptionCount}`
    );
  }

  // Test 5 — Channel noise is independent of Eve.
  {
    const noEveNoNoise = runBB84Simulation({
      numQubits: 200,
      eveEnabled: false,
      eveProbability: 0,
      channelNoise: 0,
      testFraction: 0,
    });
    const noEveNoise = runBB84Simulation({
      numQubits: 200,
      eveEnabled: false,
      eveProbability: 0,
      channelNoise: 0.3,
      testFraction: 0,
    });
    const siftedMismatchNoNoise = noEveNoNoise.qubits.filter(
      (q) => q.isSifted && q.aliceBit !== q.bobMeasuredBit
    ).length;
    const siftedMismatchNoise = noEveNoise.qubits.filter(
      (q) => q.isSifted && q.aliceBit !== q.bobMeasuredBit
    ).length;
    assert(
      siftedMismatchNoNoise === 0,
      `Test 5a — No noise → 0 mismatches: got ${siftedMismatchNoNoise}`
    );
    assert(
      siftedMismatchNoise > 0,
      `Test 5b — Noise 30% → some mismatches: got ${siftedMismatchNoise}`
    );
  }

  // Test 6 — Test sample only from sifted; tested removed from candidate key.
  {
    const r = runBB84Simulation({
      numQubits: 100,
      eveEnabled: false,
      eveProbability: 0,
      channelNoise: 0,
      testFraction: 0.25,
    });
    const testFromDiscarded = r.qubits.filter(
      (q) => q.isTestBit && !q.isSifted
    ).length;
    assert(
      testFromDiscarded === 0,
      `Test 6 — Test bits from discarded: ${testFromDiscarded}`
    );
    assert(
      r.candidateKeyLength === r.siftedKeyLength - r.testSampleSize,
      `Test 6 — candidateKeyLength: ${r.candidateKeyLength} ≠ ${r.siftedKeyLength - r.testSampleSize}`
    );
  }

  // Test 7 — QBER unavailable when testFraction=0.
  {
    const r = runBB84Simulation({
      numQubits: 16,
      eveEnabled: false,
      eveProbability: 0,
      channelNoise: 0,
      testFraction: 0,
    });
    assert(
      r.qber === null,
      `Test 7 — QBER null when no test bits: got ${r.qber}`
    );
    assert(
      r.protocolStatus === "no_sample",
      `Test 7 — Status no_sample: got ${r.protocolStatus}`
    );
  }

  // Test 8 — UI: active index never exceeds configured count.
  // (Checked in the page component; engine just verifies indices are 1-based and correct.)
  {
    const r = runBB84Simulation({
      numQubits: 16,
      eveEnabled: true,
      eveProbability: 1.0,
      channelNoise: 0,
      testFraction: 0.25,
    });
    const badIndex = r.qubits.find((q) => q.index < 1 || q.index > 16);
    assert(badIndex === undefined, `Test 8 — All indices in [1,16]`);
  }

  // Test 9 — Two separate runs produce independent results.
  {
    const r1 = runBB84Simulation({
      numQubits: 32,
      eveEnabled: true,
      eveProbability: 0.5,
      channelNoise: 0.05,
      testFraction: 0.25,
    });
    const r2 = runBB84Simulation({
      numQubits: 32,
      eveEnabled: true,
      eveProbability: 0.5,
      channelNoise: 0.05,
      testFraction: 0.25,
    });
    const identical = r1.qubits.every(
      (q, i) =>
        q.aliceBit === r2.qubits[i].aliceBit &&
        q.aliceBasis === r2.qubits[i].aliceBasis
    );
    // Two 32-qubit runs being identical is astronomically unlikely (1 in 2^64)
    assert(!identical, "Test 9 — Two runs are independent (not identical)");
  }

  // Test 10 — Eve OFF, 0% probability: exactly 0 interceptions, Bob measures every qubit.
  {
    const r = runBB84Simulation({
      numQubits: 32,
      eveEnabled: false,
      eveProbability: 0,
      channelNoise: 0,
      testFraction: 0.25,
    });
    assert(r.eveInterceptionCount === 0, "Test 10 — Eve OFF 0%: 0 interceptions");
    assert(r.qubits.every((q) => !q.eveIntercepted), "Test 10 — All eveIntercepted false");
    assert(r.qubits.every((q) => q.bobMeasuredBit !== undefined), "Test 10 — Bob measures every qubit");
    assert(r.matchingBasesCount + r.discardedCount === 32, "Test 10 — Reconciliation executed");
  }

  // Test 11 — Eve ON, 0% probability: 0 interceptions, Eve fields undefined.
  {
    const r = runBB84Simulation({
      numQubits: 32,
      eveEnabled: true,
      eveProbability: 0.0,
      channelNoise: 0,
      testFraction: 0.25,
    });
    assert(r.eveInterceptionCount === 0, "Test 11 — Eve ON 0%: 0 interceptions");
    assert(r.qubits.every((q) => !q.eveIntercepted && q.eveBasis === undefined && q.eveMeasuredBit === undefined), "Test 11 — Eve fields empty");
    assert(r.qubits.every((q) => q.bobMeasuredBit !== undefined), "Test 11 — Bob measures all qubits");
    assert(r.matchingBasesCount + r.discardedCount === 32, "Test 11 — Reconciliation executed");
  }

  // Test 12 — Eve ON, 100% probability: every qubit intercepted.
  {
    const r = runBB84Simulation({
      numQubits: 32,
      eveEnabled: true,
      eveProbability: 1.0,
      channelNoise: 0,
      testFraction: 0.25,
    });
    assert(r.eveInterceptionCount === 32, "Test 12 — Eve ON 100%: all 32 intercepted");
    assert(r.qubits.every((q) => q.eveIntercepted && q.eveBasis !== undefined && q.eveMeasuredBit !== undefined), "Test 12 — All Eve fields populated");
    assert(r.qubits.every((q) => q.bobMeasuredBit !== undefined), "Test 12 — Bob measures all qubits");
    assert(r.matchingBasesCount + r.discardedCount === 32, "Test 12 — Reconciliation executed");
  }

  // Test 13 — Eve ON, intermediate probability: each qubit follows its own path.
  {
    const r = runBB84Simulation({
      numQubits: 64,
      eveEnabled: true,
      eveProbability: 0.5,
      channelNoise: 0,
      testFraction: 0.25,
    });
    // Check that each qubit has valid fields matching its interception status
    for (const q of r.qubits) {
      if (q.eveIntercepted) {
        assert(q.eveBasis !== undefined && q.eveMeasuredBit !== undefined, `Test 13 — Intercepted #${q.index} has Eve fields`);
      } else {
        assert(q.eveBasis === undefined && q.eveMeasuredBit === undefined, `Test 13 — Unintercepted #${q.index} has empty Eve fields`);
      }
      assert(q.bobMeasuredBit !== undefined, `Test 13 — Bob measured #${q.index}`);
    }
    assert(r.matchingBasesCount + r.discardedCount === 64, "Test 13 — Reconciliation executed");
  }

  return failures;
}

/**
 * Calculates Quantum Bit Error Rate (QBER).
 * Returns null if no bits were tested.
 * Formula: (Number of mismatched tested bits / Total tested bits)
 */
export function calculateQBER(testedErrors: number, totalTested: number): number | null {
  if (totalTested <= 0) return null;
  return testedErrors / totalTested;
}

// ─── Main simulation function ─────────────────────────────────────────────────

export function runBB84Simulation(config: SimulationConfig): SimulationResult {
  const {
    numQubits,
    eveEnabled,
    eveProbability,
    channelNoise,
    testFraction,
    randomFn,
  } = config;

  const rng = randomFn ?? activeRandomProvider;
  const qubits: QubitRecord[] = [];

  // ── Phase 1: Qubit transmission ──────────────────────────────────────────

  for (let i = 0; i < numQubits; i++) {
    // Alice prepares
    const aliceBit = randomBit(rng);
    const aliceBasis = randomBasis(rng);

    // State on the quantum channel (mutated by Eve / noise)
    let currentBit: Bit = aliceBit;
    let currentBasis: Basis = aliceBasis;

    // Eve intercept-resend
    let eveIntercepted = false;
    let eveBasis: Basis | undefined;
    let eveMeasuredBit: Bit | undefined;

    if (eveEnabled && rng() < eveProbability) {
      eveIntercepted = true;
      eveBasis = randomBasis(rng);
      eveMeasuredBit = measureQuantumState(currentBit, currentBasis, eveBasis, rng);
      // Eve resends in her measurement basis
      currentBit = eveMeasuredBit;
      currentBasis = eveBasis;
    }

    // Channel noise (bit-flip, independent of Eve)
    // Applied to the state Eve resent if she intercepted, or Alice's state otherwise.
    // NOTE: simplified educational model — not a complete physical noise model.
    let channelNoiseApplied = false;
    if (channelNoise > 0 && rng() < channelNoise) {
      channelNoiseApplied = true;
      currentBit = currentBit === 0 ? 1 : 0; // bit-flip in current basis
    }

    // Bob measures
    const bobBasis = randomBasis(rng);
    const bobMeasuredBit = measureQuantumState(
      currentBit,
      currentBasis,
      bobBasis,
      rng
    );

    // Basis reconciliation (compare Alice's original basis with Bob's)
    const basesMatch = aliceBasis === bobBasis;

    qubits.push({
      index: i + 1, // 1-based
      aliceBit,
      aliceBasis,
      eveIntercepted,
      eveBasis,
      eveMeasuredBit,
      channelNoiseApplied,
      bobBasis,
      bobMeasuredBit,
      basesMatch,
      isSifted: basesMatch,
      isTestBit: false,
      isError: false,
    });
  }

  // ── Phase 2: Test-sample selection ───────────────────────────────────────

  const siftedIndices = qubits
    .map((q, idx) => (q.isSifted ? idx : -1))
    .filter((idx) => idx !== -1);

  const numSifted = siftedIndices.length;

  // Ensure test sample never exceeds sifted key length
  const numTest = Math.min(
    numSifted,
    Math.max(0, Math.round(numSifted * testFraction))
  );

  // Fisher-Yates shuffle using CSPRNG/RNG for random selection
  const shuffled = [...siftedIndices];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const testIndexSet = new Set(shuffled.slice(0, numTest));

  // ── Phase 3: Error counting & key extraction ─────────────────────────────

  let detectedErrors = 0;
  const aliceCandidateKey: Bit[] = [];
  const bobCandidateKey: Bit[] = [];

  for (let i = 0; i < qubits.length; i++) {
    const q = qubits[i];
    if (!q.isSifted) continue;

    if (testIndexSet.has(i)) {
      q.isTestBit = true;
      // Error: Alice's original bit ≠ Bob's measured bit
      if (q.aliceBit !== q.bobMeasuredBit) {
        q.isError = true;
        detectedErrors++;
      }
    } else {
      // Untested sifted position → candidate raw key
      aliceCandidateKey.push(q.aliceBit);
      bobCandidateKey.push(q.bobMeasuredBit);
    }
  }

  // ── Phase 4: QBER & status ────────────────────────────────────────────────

  // QBER is undefined if there are no test bits
  const qber: number | null = calculateQBER(detectedErrors, numTest);

  const QBER_THRESHOLD = 0.11; // Educational threshold (Shor-Preskill-inspired)

  let protocolStatus: ProtocolStatus;
  let statusMessage: string;

  if (qber === null) {
    protocolStatus = "no_sample";
    statusMessage =
      "Insufficient sample — QBER unavailable. Increase test fraction or qubit count.";
  } else if (qber > QBER_THRESHOLD) {
    protocolStatus = "aborted";
    statusMessage = `High error rate detected (QBER ${(qber * 100).toFixed(1)}% > ${(QBER_THRESHOLD * 100).toFixed(0)}%) — abort this simulated key exchange.`;
  } else {
    protocolStatus = "candidate";
    statusMessage = `No excessive errors detected in the tested sample (QBER ${(qber * 100).toFixed(1)}%). Candidate raw key remains subject to further processing.`;
  }

  const disclaimer =
    "This educational simulation does not implement error correction, privacy amplification, or a formal security proof.";

  // ── Phase 5: Invariants & return ─────────────────────────────────────────

  const eveInterceptionCount = qubits.filter((q) => q.eveIntercepted).length;
  const discardedCount = numQubits - numSifted;
  const candidateKeyLength = aliceCandidateKey.length;

  const result: SimulationResult = {
    qubits,
    totalQubits: numQubits,
    eveInterceptionCount,
    matchingBasesCount: numSifted,
    discardedCount,
    siftedKeyLength: numSifted,
    testSampleSize: numTest,
    detectedErrorsCount: detectedErrors,
    qber,
    aliceCandidateKey,
    bobCandidateKey,
    candidateKeyLength,
    protocolStatus,
    statusMessage,
    disclaimer,
    // Legacy compat
    isSecure: protocolStatus === "candidate",
    secretKey: bobCandidateKey,
    status: protocolStatus === "aborted" ? "aborted" : "completed",
  };

  checkInvariants(result);
  return result;
}
