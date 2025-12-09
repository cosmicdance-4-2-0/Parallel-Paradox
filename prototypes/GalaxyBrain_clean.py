# galaxybrain_clean.py
# Clean, readable rewrite of the PhaseCube GalaxyBrain 3D demo
# Requirements:
#   pip install pyglet pyrr numpy
#
# Run: python galaxybrain_clean.py
# Press S to save an SVG snapshot.

import pyglet
from pyglet.gl import *
import numpy as np
from pyrr import Matrix44, Quaternion, Vector3
import random
import xml.etree.ElementTree as ET
from datetime import datetime

# Config
WIDTH, HEIGHT = 800, 800
GRID = 16           # 16^3 = 4096 points
SCALE = 25
FPS = 60.0
POINT_SIZE = 8.0    # uniform point size (per-vertex sizes require a shader)

# Helper: convert float color in 0..1 to 4-tuple
def rgba_tuple(r, g, b, a):
    return (float(r), float(g), float(b), float(a))


class PhaseGrid:
    """
    A vectorized grid of phase states.
    Uses numpy arrays for plasma, liquid, solid, parity.
    """

    def __init__(self, size):
        self.size = size
        shape = (size, size, size)
        # initialize phases: keep plasma small/randomish
        self.plasma = np.random.rand(*shape) * 0.5
        self.liquid = np.random.rand(*shape) * 0.5
        self.solid = np.random.rand(*shape) * 0.5
        # parity as ints 0/1
        self.parity = np.zeros(shape, dtype=np.int8)

    def flip_any(self):
        """
        Toggle plasma and parity as in original code.
        (Original toggled every cube each update; we replicate that.)
        """
        self.plasma = 1.0 - self.plasma
        self.parity = 1 - self.parity

    def neighbors_avg(self):
        """
        Compute 6-neighbor average (non-wrapping) using padded slice technique.
        Edges have fewer neighbors - we divide by actual neighbor count.
        """
        p = self.plasma
        pad = np.pad(p, pad_width=1, mode='constant', constant_values=0.0)

        # access six neighbors via slicing on padded array
        xp = pad[2:, 1:-1, 1:-1]   # +x
        xm = pad[:-2, 1:-1, 1:-1]  # -x
        yp = pad[1:-1, 2:, 1:-1]   # +y
        ym = pad[1:-1, :-2, 1:-1]  # -y
        zp = pad[1:-1, 1:-1, 2:]   # +z
        zm = pad[1:-1, 1:-1, :-2]  # -z

        neighbor_sum = xp + xm + yp + ym + zp + zm

        # neighbor count: compute from ones padded
        ones = np.ones_like(p)
        pone = np.pad(ones, pad_width=1, mode='constant', constant_values=0.0)
        nc = (
            pone[2:, 1:-1, 1:-1] +
            pone[:-2, 1:-1, 1:-1] +
            pone[1:-1, 2:, 1:-1] +
            pone[1:-1, :-2, 1:-1] +
            pone[1:-1, 1:-1, 2:] +
            pone[1:-1, 1:-1, :-2]
        )
        # avoid division by zero
        nc = np.maximum(nc, 1.0)
        return neighbor_sum / nc

    def breathe_step(self):
        """
        Perform the 'breathe' update for the whole grid in vectorized form.
        Mirrors logic from original:
           path_a = (p + l + s) / 3
           path_b = abs(p - neighbors_avg) + parity*0.13
           choose path_b with prob 0.73, else path_a
           liquid = choice
           solid = (s + choice) % 1.0
        Note: parity and plasma flips are handled by flip_any() separately.
        """
        p, l, s = self.plasma, self.liquid, self.solid
        neighbors = self.neighbors_avg()

        path_a = (p + l + s) / 3.0
        path_b = np.abs(p - neighbors) + (self.parity.astype(np.float32) * 0.13)

        # random mask where True -> choose path_b
        mask = (np.random.rand(*p.shape) < 0.73)

        choice = np.where(mask, path_b, path_a)

        self.liquid = choice
        self.solid = (s + choice) % 1.0


class GalaxyBrain3D(pyglet.window.Window):
    def __init__(self):
        super().__init__(WIDTH, HEIGHT, caption="PhaseCube GalaxyBrain 3D — Clean", resizable=False)
        glEnable(GL_DEPTH_TEST)
        glEnable(GL_BLEND)
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)

        # enable program point size in case future shader used
        try:
            glEnable(GL_PROGRAM_POINT_SIZE)
        except Exception:
            pass

        self.time = 0.0
        self.grid = PhaseGrid(GRID)

        # Precompute positions (constant)
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
        self.positions = np.array(coords, dtype=np.float32)  # length = 3 * GRID^3

        # colors array (will be updated each frame)
        self.colors = np.zeros((GRID ** 3 * 4,), dtype=np.float32)

        # Create a static vertex list (v3f + c4f) and attach to a batch
        self.batch = pyglet.graphics.Batch()
        count = GRID ** 3
        # create vertex list and keep reference
        self.vertex_list = self.batch.add(
            count, GL_POINTS, None,
            ('v3f/static', self.positions.tolist()),
            ('c4f/stream', self.colors.tolist())
        )

        pyglet.clock.schedule_interval(self.update, 1.0 / FPS)

    def update_colors(self):
        """
        Compute RGBA color per point from plasma / parity / time.
        Stores into self.colors (flattened).
        """
        p = self.grid.plasma.ravel()
        parity = self.grid.parity.ravel().astype(np.float32)
        t = self.time

        # compute hue-like value then make rgb by sines (keeps original aesthetic)
        hue = (t * 0.1 + parity + p) % 1.0
        # 1D arrays
        angle = hue * 2.0 * np.pi
        r = np.abs(np.sin(angle))
        g = np.abs(np.sin(angle + 2.0))
        b = np.abs(np.sin(angle + 4.0))
        alpha = 0.4 + 0.6 * p

        # fill self.colors flat array: (r,g,b,a) per vertex
        rgba = np.vstack([r, g, b, alpha]).T.flatten()
        self.colors[:] = rgba
        # push to vertex list (pyglet expects lists)
        self.vertex_list.colors[:] = self.colors.tolist()

    def update(self, dt):
        self.time += dt
        # replicate original per-cube flip_any (toggle)
        self.grid.flip_any()
        # breathe update vectorized
        self.grid.breathe_step()

        # update colors to reflect new plasma & parity
        self.update_colors()

    def on_draw(self):
        self.clear()
        glMatrixMode(GL_PROJECTION)
        glLoadIdentity()
        # simple perspective
        gluPerspective(45.0, WIDTH / float(HEIGHT), 1.0, 5000.0)

        glMatrixMode(GL_MODELVIEW)
        glLoadIdentity()
        # camera (eye, center, up)
        gluLookAt(0, -400, 400, 0, 0, 0, 0, 0, 1)

        # rotate scene for animation
        angle = self.time * 20.0
        glRotatef(angle, 0.0, 0.0, 1.0)
        glRotatef(angle * 0.7, 0.0, 1.0, 0.0)

        # uniform point size (per-vertex size would need a shader)
        glPointSize(POINT_SIZE)

        self.batch.draw()

    def project_points(self, modelview, projection, viewport):
        """
        Project 3D positions to screen coordinates using gluProject logic.
        We implement a simple projection by applying modelview and projection matrices.
        Returns Nx2 array of (x_screen, y_screen) and depth z for optional z-sorting.
        This is a simple, approximate projection used for SVG saving.
        """
        # positions Nx3
        pts = self.positions.reshape(-1, 3)
        # append 1 for homogeneous coordinates
        ones = np.ones((pts.shape[0], 1), dtype=np.float32)
        pts_h = np.hstack([pts, ones])

        # apply modelview then projection
        mv = np.array(modelview, dtype=np.float32).reshape(4, 4).T  # pyrr uses row-major
        pr = np.array(projection, dtype=np.float32).reshape(4, 4).T

        clip = (pts_h @ mv) @ pr  # shape Nx4

        # perspective divide
        ndc = clip[:, :3] / clip[:, 3:4]

        # map to viewport
        x = (ndc[:, 0] * 0.5 + 0.5) * viewport[2] + viewport[0]
        y = (ndc[:, 1] * 0.5 + 0.5) * viewport[3] + viewport[1]
        z = ndc[:, 2]
        return np.vstack([x, y, z]).T

    def save_svg(self):
        """
        Save a simple SVG snapshot of currently visible points.
        This applies the same modelview/projection used in on_draw for a closer match.
        Note: this is an approximation — a full accurate gluProject would require glGet* calls.
        """
        # build modelview and projection matrices similarly to on_draw
        proj = Matrix44.perspective_projection(45.0, WIDTH / float(HEIGHT), 1.0, 5000.0)
        # modelview: lookAt + rotations
        eye = Vector3([0.0, -400.0, 400.0])
        target = Vector3([0.0, 0.0, 0.0])
        up = Vector3([0.0, 0.0, 1.0])
        mv = Matrix44.look_at(eye, target, up)
        angle = self.time * 20.0
        rot_z = Matrix44.from_z_rotation(np.radians(angle))
        rot_y = Matrix44.from_y_rotation(np.radians(angle * 0.7))
        modelview = mv * rot_z * rot_y

        viewport = (0, 0, WIDTH, HEIGHT)
        screen_pts = self.project_points(modelview, proj, viewport)  # Nx3

        svg = ET.Element('svg', width=str(WIDTH), height=str(HEIGHT),
                         xmlns="http://www.w3.org/2000/svg")

        p = self.grid.plasma.ravel()
        parity = self.grid.parity.ravel()

        # sort by depth (z) so farther points are drawn first
        idx = np.argsort(screen_pts[:, 2])
        for i in idx:
            zscr = screen_pts[i, 2]
            # only draw visible-ish points
            if zscr < -1.0 or zscr > 1.0:
                continue
            x_screen, y_screen = screen_pts[i, 0], HEIGHT - screen_pts[i, 1]  # flip Y for SVG
            plasma = float(p[i])
            if plasma < 0.05:
                continue
            r = 2 + 18 * plasma
            hue = (self.time * 0.1 + parity[i]) % 1.0
            # convert hue -> hsl string for SVG
            fill = f"hsl({int(hue * 360)}, 100%, 50%)"
            ET.SubElement(svg, 'circle', cx=str(x_screen), cy=str(y_screen),
                          r=str(r), fill=fill, opacity=str(0.6 + 0.4 * plasma))

        tree = ET.ElementTree(svg)
        fname = f"phasecube_clean_{datetime.now().isoformat().replace(':','')[:16]}.svg"
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
