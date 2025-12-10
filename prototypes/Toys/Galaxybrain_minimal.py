# galaxybrain_minimal.py
# Minimal, modular PhaseCube — preserves your conceptual ruleset while fixing
# stability/boundary/overwrite issues for clearer emergent structure.
#
# Requirements:
#   pip install pyglet pyrr numpy
#
# Run: python galaxybrain_minimal.py
# Press S to save an SVG snapshot.

import pyglet
from pyglet.gl import *
import numpy as np
from pyrr import Matrix44, Quaternion, Vector3
import random
import xml.etree.ElementTree as ET
from datetime import datetime

# Config (tuning knobs exposed)
WIDTH, HEIGHT = 800, 800
GRID = 16
SCALE = 25
FPS = 60.0
POINT_SIZE = 8.0

# Dynamics tuning: small, interpretable parameters
FLIP_PROB = 0.02           # per-cell probability to invert plasma (small quanta)
PARITY_FLIP_PROB = 0.01    # per-cell chance to toggle parity
PATH_B_PROB = 0.65         # probability to choose path_b (was 0.73)
BLEND_ALPHA = 0.18         # how strongly solid incorporates new choice (memory term)

def rgba_tuple(r, g, b, a):
    return (float(r), float(g), float(b), float(a))


class PhaseGrid:
    """
    Vectorized grid of phase states with controllable, local perturbation.
    Uses periodic (wrap) topology to remove boundary bias.
    """

    def __init__(self, size, flip_prob=FLIP_PROB, parity_prob=PARITY_FLIP_PROB):
        self.size = size
        shape = (size, size, size)
        # initial phases in [0,1)
        self.plasma = np.random.rand(*shape) * 0.5
        self.liquid = np.random.rand(*shape) * 0.5
        self.solid = np.random.rand(*shape) * 0.5
        self.parity = np.zeros(shape, dtype=np.int8)

        self.flip_prob = flip_prob
        self.parity_prob = parity_prob

    def perturb_local(self):
        """
        Local, small-probability perturbation instead of global invert.
        This preserves 'difference is the quantum' while avoiding frame-strobe.
        """
        # per-cell coin to invert plasma
        mask = np.random.rand(*self.plasma.shape) < self.flip_prob
        if np.any(mask):
            # invert only selected cells
            self.plasma[mask] = 1.0 - self.plasma[mask]

        # parity flips locally
        pmask = np.random.rand(*self.parity.shape) < self.parity_prob
        if np.any(pmask):
            self.parity[pmask] = 1 - self.parity[pmask]

    def neighbors_avg(self):
        """
        Compute 6-neighbor average using wrap (periodic) padding.
        Periodic topology reduces boundary artifacts and respects translational invariance.
        """
        p = self.plasma
        # wrap pad: easiest is to use np.roll for each axis — avoids explicit pad
        xp = np.roll(p, -1, axis=0)
        xm = np.roll(p, +1, axis=0)
        yp = np.roll(p, -1, axis=1)
        ym = np.roll(p, +1, axis=1)
        zp = np.roll(p, -1, axis=2)
        zm = np.roll(p, +1, axis=2)

        neighbor_sum = xp + xm + yp + ym + zp + zm
        # in wrap topology neighbor count is constant 6
        return neighbor_sum / 6.0

    def breathe_step(self, path_b_prob=PATH_B_PROB, blend_alpha=BLEND_ALPHA):
        """
        Vectorized breathe update:
          path_a = (p + l + s) / 3
          path_b = abs(p - neighbors_avg) + parity*0.13
          choose path_b with probability path_b_prob else path_a
          liquid = choice
          solid blends with choice to retain memory
        """
        p, l, s = self.plasma, self.liquid, self.solid
        neighbors = self.neighbors_avg()

        path_a = (p + l + s) / 3.0
        path_b = np.abs(p - neighbors) + (self.parity.astype(np.float32) * 0.13)

        # stochastic mask
        mask = (np.random.rand(*p.shape) < path_b_prob)
        choice = np.where(mask, path_b, path_a)

        # update liquid (instant)
        self.liquid = choice

        # blend into solid (retain history; less destructive)
        self.solid = (s * (1.0 - blend_alpha) + choice * blend_alpha) % 1.0


class GalaxyBrain3D(pyglet.window.Window):
    def __init__(self):
        super().__init__(WIDTH, HEIGHT, caption="PhaseCube GalaxyBrain 3D — Minimal", resizable=False)
        glEnable(GL_DEPTH_TEST)
        glEnable(GL_BLEND)
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)
        try:
            glEnable(GL_PROGRAM_POINT_SIZE)
        except Exception:
            pass

        self.time = 0.0
        self.grid = PhaseGrid(GRID)

        # positions (constant)
        coords = []
        half = GRID // 2
        for x in range(GRID):
            for y in range(GRID):
                for z in range(GRID):
                    coords.extend([
                        (x - half) * SCALE,
                        (y - half) * SCALE,
                        (z - half) * SCALE
                    ])
        self.positions = np.array(coords, dtype=np.float32)

        # color buffer (flattened RGBA floats)
        self.colors = np.zeros((GRID ** 3 * 4,), dtype=np.float32)

        self.batch = pyglet.graphics.Batch()
        count = GRID ** 3
        # create vertex list (positions static, colors stream)
        self.vertex_list = self.batch.add(
            count, GL_POINTS, None,
            ('v3f/static', self.positions.tolist()),
            ('c4f/stream', self.colors.tolist())
        )

        pyglet.clock.schedule_interval(self.update, 1.0 / FPS)

    def update_colors(self):
        """
        Map plasma & parity to RGBA via simple hue-to-sin mapping (aesthetic).
        Minimizes Python-level loops.
        """
        p = self.grid.plasma.ravel()
        parity = self.grid.parity.ravel().astype(np.float32)
        t = self.time

        hue = (t * 0.1 + parity + p) % 1.0
        angle = hue * 2.0 * np.pi
        r = np.abs(np.sin(angle))
        g = np.abs(np.sin(angle + 2.0))
        b = np.abs(np.sin(angle + 4.0))
        alpha = 0.35 + 0.65 * p

        rgba = np.vstack([r, g, b, alpha]).T.flatten().astype(np.float32)
        # push to vertex list (pyglet accepts sequence; this is a single conversion)
        self.colors[:] = rgba
        self.vertex_list.colors[:] = self.colors.tolist()

    def update(self, dt):
        self.time += dt
        # local perturbation (replaces global flip)
        self.grid.perturb_local()
        # breathe step (less destructive; retains memory)
        self.grid.breathe_step()

        self.update_colors()

    def on_draw(self):
        self.clear()
        glMatrixMode(GL_PROJECTION)
        glLoadIdentity()
        gluPerspective(45.0, WIDTH / float(HEIGHT), 1.0, 5000.0)

        glMatrixMode(GL_MODELVIEW)
        glLoadIdentity()
        gluLookAt(0, -400, 400, 0, 0, 0, 0, 0, 1)

        angle = self.time * 20.0
        glRotatef(angle, 0.0, 0.0, 1.0)
        glRotatef(angle * 0.7, 0.0, 1.0, 0.0)

        glPointSize(POINT_SIZE)
        self.batch.draw()

    def project_points(self, modelview, projection, viewport):
        pts = self.positions.reshape(-1, 3)
        ones = np.ones((pts.shape[0], 1), dtype=np.float32)
        pts_h = np.hstack([pts, ones])

        mv = np.array(modelview, dtype=np.float32).reshape(4, 4).T
        pr = np.array(projection, dtype=np.float32).reshape(4, 4).T

        clip = (pts_h @ mv) @ pr
        ndc = clip[:, :3] / clip[:, 3:4]

        x = (ndc[:, 0] * 0.5 + 0.5) * viewport[2] + viewport[0]
        y = (ndc[:, 1] * 0.5 + 0.5) * viewport[3] + viewport[1]
        z = ndc[:, 2]
        return np.vstack([x, y, z]).T

    def save_svg(self):
        proj = Matrix44.perspective_projection(45.0, WIDTH / float(HEIGHT), 1.0, 5000.0)
        eye = Vector3([0.0, -400.0, 400.0])
        target = Vector3([0.0, 0.0, 0.0])
        up = Vector3([0.0, 0.0, 1.0])
        mv = Matrix44.look_at(eye, target, up)
        angle = self.time * 20.0
        rot_z = Matrix44.from_z_rotation(np.radians(angle))
        rot_y = Matrix44.from_y_rotation(np.radians(angle * 0.7))
        modelview = mv * rot_z * rot_y

        viewport = (0, 0, WIDTH, HEIGHT)
        screen_pts = self.project_points(modelview, proj, viewport)

        svg = ET.Element('svg', width=str(WIDTH), height=str(HEIGHT),
                         xmlns="http://www.w3.org/2000/svg")

        p = self.grid.plasma.ravel()
        parity = self.grid.parity.ravel()

        idx = np.argsort(screen_pts[:, 2])
        for i in idx:
            zscr = screen_pts[i, 2]
            if zscr < -1.0 or zscr > 1.0:
                continue
            x_screen, y_screen = screen_pts[i, 0], HEIGHT - screen_pts[i, 1]
            plasma = float(p[i])
            if plasma < 0.05:
                continue
            r = 2 + 18 * plasma
            hue = (self.time * 0.1 + parity[i]) % 1.0
            fill = f"hsl({int(hue * 360)}, 100%, 50%)"
            ET.SubElement(svg, 'circle', cx=str(x_screen), cy=str(y_screen),
                          r=str(r), fill=fill, opacity=str(0.6 + 0.4 * plasma))

        tree = ET.ElementTree(svg)
        fname = f"phasecube_minimal_{datetime.now().isoformat().replace(':','')[:16]}.svg"
        tree.write(fname)
        print(f"Saved SVG → {fname}")

    def on_key_press(self, symbol, modifiers):
        if symbol == pyglet.window.key.S:
            self.save_svg()


if __name__ == "__main__":
    random.seed(777)
    np.random.seed(777)
    window = GalaxyBrain3D()
    pyglet.app.run()
