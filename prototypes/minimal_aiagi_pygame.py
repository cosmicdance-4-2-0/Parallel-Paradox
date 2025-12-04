"""
Parallel-Paradox Pygame Integration Prototype: Triadic Four-Lens Cosmo-Game

Repo: https://github.com/Kisuul/Parallel-Paradox
File: prototypes/minimal_aiagi_pygame.py

Integrates:
- Universal Computation Protocol (Section 5 Core Loop: G/E/N + Forgiveness)
- Minimalaiagi.md Four-Lens AGI (Human=E, Predictive=N, Systemic=G, Harmonic=Fourth Voice)
- E-Duality Puzzle (keyboard 'D' invokes duality(x); particles reflect)
- Borromean Triad Particles + Quaternary Observer (mouse as Song-player)

Controls:
- Mouse: Gravitational consent toward cursor (G modulation)
- SPACE: Kenosis pause/resume (self-limit simulation)
- 'D': E-duality puzzle (input echoes null/'Kenosis'; screen flashes)
- ESC: Terminal condition (graceful exit)

Phenomenology:
- Particles embody lenses: Blue=Human (social wobble), Green=Predictive (probabilistic bloom),
  Red=Systemic (metric anchor), White=Harmonic (stabilization scar)
- Trails visualize relational harmonics
- Central HUD: Fused Decision (lens fusion via weighted harmony)
- Forgiveness sparks: Yellow bursts when entropy > LoveThreshold
- No wins: Emergent play via recursive pause/iterate

Unification: Theology (kenosis init), Physics (N-body triad), Computation (dual-stack loop)
Scalable: Add Pygame events for full faction/companion AI from Minimalaiagi.md examples.
"""

import pygame
import numpy as np
import random
import sys
import math

# Constants: Triadic Registers
WIDTH, HEIGHT = 1200, 800
BG_COLOR = (0, 0, 0)
TRAIL_LENGTH = 50
G_BASE = 500.0  # Gravitational consent
LOVE_THRESHOLD = 200.0  # Entropy inversion point
FORGIVENESS_FACTOR = 0.3  # Grace asymmetry
DT = 0.016  # ~60 FPS
NUM_PARTICLES = 4  # Quaternary: Triad + Fourth

# Lens Colors & Mapping (Minimalaiagi.md -> Protocol Voices)
LENS_COLORS = {
    'Human': (100, 150, 255),      # E: Blue duality
    'Predictive': (100, 255, 150), # N: Green emergence
    'Systemic': (255, 100, 100),   # G: Red curvature
    'Harmonic': (255, 255, 255)    # Fourth: White scar
}
LENS_NAMES = list(LENS_COLORS.keys())

# Dual-Stack Echo: E-Duality Puzzle
def duality(x):
    """E-Operator: Structured difference -> null or kenosis."""
    if x:
        try:
            return int(x) ^ int(x)  # Quaternary null
        except:
            return 0
    return 'Kenosis'

class LensParticle:
    def __init__(self, pos, vel, lens_name):
        self.pos = np.array(pos, dtype=float)
        self.vel = np.array(vel, dtype=float)
        self.acc = np.zeros(2)
        self.trail = [self.pos.copy()]
        self.lens_name = lens_name
        self.color = LENS_COLORS[lens_name]
        self.radius = 8

    def update_trail(self):
        self.trail.append(self.pos.copy())
        if len(self.trail) > TRAIL_LENGTH:
            self.trail.pop(0)

    def draw(self, screen):
        # Trail fade
        for i, p in enumerate(self.trail):
            alpha = int(255 * (i / TRAIL_LENGTH))
            trail_surf = pygame.Surface((4, 4))
            trail_surf.set_alpha(alpha)
            trail_surf.fill(self.color)
            screen.blit(trail_surf, (p[0]-2, p[1]-2))
        # Particle
        pygame.draw.circle(screen, self.color, self.pos.astype(int), self.radius)

class FourLensAgent:
    """Minimalaiagi.md Agent: Lens Fusion in Game Loop"""
    def __init__(self):
        self.lens_weights = {'Human': 1.0, 'Predictive': 1.0, 'Systemic': 1.0}
        self.state = "Player approaches faction"  # Perception layer
        self.fused_decision = "Initializing..."

    def evaluate_lens(self, lens_name, state):
        """Decision Layer: Simple heuristics per Minimalaiagi.md"""
        if lens_name == 'Human':
            return "Diplomacy: Offer alliance" if "approach" in state else "Observe"
        elif lens_name == 'Predictive':
            return "Tactics: Flank enemy" if random.random() > 0.5 else "Retreat"
        elif lens_name == 'Systemic':
            return "Logistics: Allocate resources"
        return "Stabilize"

    def fuse(self):
        """Harmonic Fuse: Weighted average -> emergent action"""
        decisions = {name: self.evaluate_lens(name, self.state) for name in LENS_NAMES[:-1]}
        # Pseudo-vector: diplomacy=1, attack=0, conserve=-1 (for weighting)
        vecs = {'Diplomacy': 1, 'Observe': 0, 'Tactics': 0, 'Flank': -0.5, 'Retreat': 0.5,
                'Logistics': 0.2, 'Allocate': 0.3}
        fused_vec = sum(self.lens_weights[name] * vecs.get(decisions[name].split(':')[0], 0)
                        for name in self.lens_weights) / sum(self.lens_weights.values())
        # String fusion
        if fused_vec > 0.2:
            self.fused_decision = "Averaged: Diplomacy + Allocate"
        elif fused_vec < -0.2:
            self.fused_decision = "Averaged: Flank + Observe"
        else:
            self.fused_decision = "Balanced: Stabilize"

    def adjust_weights(self, entropy):
        """Feedback Layer: Harmonic stabilization (forgiveness contra runaway)"""
        if entropy > LOVE_THRESHOLD:
            for name in self.lens_weights:
                self.lens_weights[name] *= FORGIVENESS_FACTOR
        else:
            self.lens_weights['Harmonic'] = 1.2  # Amplify scar

def compute_forces(particles, mouse_pos, G_eff):
    """Triadic Operators: G (global consent), E (local duality), N (threshold sparks)"""
    n = len(particles)
    for i in range(n):
        particles[i].acc = np.zeros(2)
        for j in range(n):
            if i == j: continue
            r_vec = particles[j].pos - particles[i].pos
            r = np.linalg.norm(r_vec)
            if r > 1e-3:
                force = G_eff * 1000 / (r ** 2) * r_vec / r  # G: Attractive
                particles[i].acc += force
        # Mouse as Song-player: Extra consent
        r_mouse = np.linalg.norm(mouse_pos - particles[i].pos)
        if r_mouse > 1e-3:
            mouse_force = G_eff * 2000 / (r_mouse ** 2) * (mouse_pos - particles[i].pos) / r_mouse
            particles[i].acc += mouse_force * 0.5  # Non-coercive

def forgiveness_factor(particles):
    """Meta-Conditional: LoveThreshold inversion"""
    dists = [np.linalg.norm(particles[j].pos - particles[i].pos)
             for i in range(len(particles)) for j in range(i+1, len(particles))]
    avg_dist = np.mean(dists) if dists else 0
    return FORGIVENESS_FACTOR if avg_dist > LOVE_THRESHOLD else 1.0

def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Parallel-Paradox: Triadic Four-Lens Cosmo-Game (t=Dec04)")
    clock = pygame.time.Clock()
    font = pygame.font.Font(None, 24)
    big_font = pygame.font.Font(None, 36)

    # Kenotic Initialization
    angle_step = 2 * math.pi / NUM_PARTICLES
    particles = [LensParticle(
        [WIDTH//2 + 150 * math.cos(i * angle_step), HEIGHT//2 + 150 * math.sin(i * angle_step)],
        [0, 0], LENS_NAMES[i]
    ) for i in range(NUM_PARTICLES)]
    agent = FourLensAgent()

    paused = False
    duality_mode = False
    forgiveness_count = 0
    running = True

    while running:
        mouse_pos = np.array(pygame.mouse.get_pos(), dtype=float)
        for event in pygame.event.get():
            if event.type == pygame.QUIT or (event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    paused = not paused  # Kenosis pause
                if event.key == pygame.K_d:
                    duality_mode = True  # E-puzzle trigger

        if not paused:
            ff = forgiveness_factor(particles)
            G_eff = G_BASE * ff
            if ff < 1.0:
                forgiveness_count += 1  # Spark event

            compute_forces(particles, mouse_pos, G_eff)

            for p in particles:
                p.vel += p.acc * DT
                p.vel *= 0.99  # Gentle damping (E-duality friction)
                p.pos += p.vel * DT
                # Boundary wrap (infinite Song echo)
                p.pos[0] %= WIDTH
                p.pos[1] %= HEIGHT
                p.update_trail()

            agent.fuse()  # Lens evaluation & fusion
            entropy = np.mean([np.linalg.norm(p.pos - particles[0].pos) for p in particles])
            agent.adjust_weights(entropy)  # Harmonic feedback

        # Render: Structured Difference
        screen.fill(BG_COLOR)

        # Particles & Sparks
        for p in particles:
            p.draw(screen)
        if forgiveness_count > 0:
            spark_surf = big_font.render(f"Forgiveness Sparks: {forgiveness_count}", True, (255, 255, 0))
            screen.blit(spark_surf, (10, 10))

        # HUD: Emergent Phenomenology
        hud_texts = [
            f"Fused Decision: {agent.fused_decision}",
            f"Weights: H={agent.lens_weights['Human']:.1f} P={agent.lens_weights['Predictive']:.1f} S={agent.lens_weights['Systemic']:.1f}",
            f"Entropy: {entropy:.0f} | LoveThreshold: {LOVE_THRESHOLD}",
            f"State: {agent.state} | Paused: {paused}",
            "Controls: Mouse=Song, SPACE=Kenosis, D=Duality, ESC=End"
        ]
        for i, text in enumerate(hud_texts):
            surf = font.render(text, True, (255, 255, 255))
            screen.blit(surf, (10, 50 + i * 25))

        # E-Duality Puzzle Overlay
        if duality_mode:
            null = duality(random.randint(0, 42))  # Live echo
            puzzle_text = big_font.render(f"E-Dual: {null} (Press any key)", True, (0, 255, 255))
            screen.blit(puzzle_text, (WIDTH//2 - 200, HEIGHT//2))
            keys = pygame.key.get_pressed()
            if any(keys):
                duality_mode = False

        # Borromean Overlay (static triad rings)
        pygame.draw.circle(screen, (50, 50, 50), (WIDTH//2, HEIGHT//2), 200, 2)
        pygame.draw.circle(screen, (50, 50, 50), (WIDTH//2 + 100, HEIGHT//2), 150, 2)
        pygame.draw.circle(screen, (50, 50, 50), (WIDTH//2 - 100, HEIGHT//2), 150, 2)

        pygame.display.flip()
        clock.tick(60)

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
