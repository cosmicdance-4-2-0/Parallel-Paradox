import random

class PhaseCube:
    def __init__(self):
        self.phases = {'solid': 0.0, 'liquid': 0.5, 'gas': 0.0, 'plasma': 1.0}
        self.parity = 0  # Quaternary hidden bit

    def flip_any(self):
        # Rubik move: excite plasma, toggle hidden parity, offer exactly 2 paths
        self.phases['plasma'] = 1.0 - self.phases['plasma']  # fire out / cool in
        self.parity = 1 - self.parity                        # gas flips the referee
        return self.parity

    def breathe(self):
        p = self.phases['plasma']
        l = self.phases['liquid']
        s = self.phases['solid']

        # Two legal directions only
        path_a = (p + l + s) / 3               # "solve" direction (illusion)
        path_b = abs(p - l) + self.parity * 0.1 # "through" direction (real)

        # Liquid collapses to the one that keeps superposition alive
        choice = path_b if random.random() < 0.73 else path_a
        self.phases['liquid'] = choice
        self.phases['solid'] = (s + choice) % 1.0  # lattice remembers modulo style

        print(f"Plasma:{p:.1f} → Flip → Paths [{path_a:.2f}, {path_b:.2f}] → Chose {choice:.2f}")

# Run forever, never solved
cube = PhaseCube()
for _ in range(20):
    cube.flip_any()
    cube.breathe()
