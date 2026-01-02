# Parallel-Paradox Design

This consolidated design note ties together the recurring constructs that appear across the Parallel-Paradox documents. Use the source index for direct navigation to the origin of each term before diving into the glossary and crosswalk.

## Source Index
- [Minimalaiagi.md](../Minimalaiagi.md) — §2 **Lenses**, §3 **Agent Architecture**, §5 **Minimal Prototype Pseudocode**.
- [Minimalnode...wait...minimal.md](../Minimalnode...wait...minimal.md) — **Quantum Swarm Consensus Models** table, **Formal Markdown** (Abstract, Definitions, Reduction, Repository Mechanic, Retrieval Phase).
- [Computation.md](../Computation.md) — **Addendum: Prototypic Implementation of the Kenotic N-Body Simulator** (forgiveness operator and core loop).
- [prototypes/Readme.md](../prototypes/Readme.md) — **PhaseCube** Introduction, System Architecture, Configuration Variables, and **PhaseGrid Class** dynamics.

## Glossary & Crosswalk

### Glossary
| Term | Definition | Source |
| --- | --- | --- |
| Human Cognitive Lens | Models psychological and social behavior to guide NPC interaction, diplomacy, and relatability. | Minimalaiagi.md — §2 Lenses (row: Human Cognitive). |
| Transhuman / Predictive Lens | Anticipates outcomes and adapts strategies for tactics, pathfinding, and environmental response. | Minimalaiagi.md — §2 Lenses (row: Transhuman / Predictive). |
| Systemic / Network Lens | Integrates agents into economies, logistics, and other global or local systems. | Minimalaiagi.md — §2 Lenses (row: Systemic / Network). |
| Harmonic / Emergent Lens | Stabilizes and balances other lenses through feedback loops and dynamic weighting. | Minimalaiagi.md — §2 Lenses (row: Harmonic / Emergent). |
| Harmonic Fusion Strategy | Weighted, context-aware fusion across lenses; harmonic layer adjusts weights to prevent runaway outcomes. | Minimalaiagi.md — §3 Agent Architecture (Lens Fusion Strategy). |
| Oracle | Consensus arbiter selected via superradiant burst (quantum) or noise hash (classical) to emit current best witness. | Minimalnode...wait...minimal.md — Quantum Swarm Consensus Models (Oracle designation); Formal Markdown §3 Reduction (Oracle(t) selection). |
| Witness Propagation | Dissemination of witness frames using entangled pairs plus classical confirmation to reduce latency. | Minimalnode...wait...minimal.md — Quantum Swarm Consensus Models (Witness propagation). |
| Swarm Repository (Game Repo) | Distributed ledger where NP witnesses persist across nodes; swarm always holds a valid witness somewhere. | Minimalnode...wait...minimal.md — Formal Markdown §2 Definitions (Game Repo), §3 Reduction/Repository Mechanic. |
| P vs NP Framing | Recasts complexity as a swarm game: either poly-time solving (if P = NP) or perpetual witness storage (if P ≠ NP). | Minimalnode...wait...minimal.md — Formal Markdown §4 Implications for P vs NP. |
| Kenotic / Forgiveness Operator | Modulates gravitational coupling (effective G) downward when dispersion exceeds a threshold to restore coherence. | Computation.md — Addendum (function `forgiveness_factor`, loop in `simulate_triadic_nbody`). |
| PhaseCube Plasma Phase | Agent excitation level that is perturbed stochastically to prevent stasis. | prototypes/Readme.md — PhaseGrid (state `plasma`, `perturb`). |
| PhaseCube Liquid Phase | Immediate mix state capturing branch choice per step before longer-term blending. | prototypes/Readme.md — PhaseGrid (`liquid`, `step`). |
| PhaseCube Solid Phase | Persistence/damping state blending prior values to provide short-term memory. | prototypes/Readme.md — PhaseGrid (`solid`, `step`). |
| PhaseCube Path Selection Parameters | Configuration that shapes exploration vs stability: `FLIP_P`/`PARITY_P` inject noise; `PATH_B_P` biases difference amplification; `ALPHA` damps persistence. | prototypes/Readme.md — Configuration Variables; PhaseGrid `step`. |

### Crosswalk of Related Concepts
| Anchor Concept | Related / Analog Concept | Relationship & Navigation |
| --- | --- | --- |
| Harmonic / Emergent Lens | PhaseCube solid-phase damping (`ALPHA`) and liquid/solid blending | Both provide stabilization by smoothing rapid changes and preventing runaway dynamics. See Minimalaiagi.md §2 Lenses and prototypes/Readme.md PhaseGrid `step`. |
| Harmonic Fusion Strategy | Kenotic / Forgiveness Operator | Both intervene adaptively when system dispersion grows, reducing force/weighting to re-balance. See Minimalaiagi.md §3 Lens Fusion Strategy and Computation.md `forgiveness_factor`. |
| Oracle | Witness Propagation | Oracle selection designates the emitter, while witness propagation distributes its frame; together they finalize consensus. See Minimalnode...wait...minimal.md table rows for Oracle designation and Witness propagation. |
| Swarm Repository (Game Repo) | PhaseCube distributed grid | Both rely on distributed persistence: the swarm stores NP witnesses across nodes, while PhaseCube sustains patterns across 4096 agents. See Minimalnode...wait...minimal.md Formal Markdown §2–3 and prototypes/Readme.md System Architecture/PhaseGrid. |
| Transhuman / Predictive Lens | PhaseCube Path B (difference amplification via `PATH_B_P`) | Predictive/anticipatory behavior corresponds to emphasizing divergence to explore future states. See Minimalaiagi.md §2 Lenses and prototypes/Readme.md PhaseGrid `step`. |

### Navigation Notes
- Each glossary row cites the originating section so readers can jump directly to the source text above.
- Crosswalk entries pair concepts with their stabilizing or exploratory counterparts to highlight how different documents address the same system behaviors.
