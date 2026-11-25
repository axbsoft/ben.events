#!/usr/bin/env python3
"""benevents agency — the bars of the logo: assets/img/logo-bars.svg.

When the visitor scrolls down (or puts the mouse on the logo), the four-colour line of the logo breaks into fine rounded
bars that play like a sound meter (assets/css/style.css, "the logo plays sound and light"; assets/js/logo.js).
This image draws those bars, each with its own rhythm (SVG animation). It is used as a mask: the colours come from the
line itself, so the bars carry the logo's colours as they drift.

Units: 1 = .01em of the logo. The line is 4.74em wide; the image is .5em high; the line is .11em thick.
The bars are tallest in the middle and shorter towards the ends, like the levels of a mixing desk.
Run from the root of the site:  python3 tools/site/logo_bars.py"""
import math
import random

W, H, LINE = 474, 50, 11     # width of the line, height of the image, thickness of the line
N, BW = 30, 6                # number of bars, width of a bar
PITCH = (W - BW) / (N - 1)
EASE = ".45 0 .35 1"
random.seed(7)               # the same bars at every run


def window(k):
    return 0.42 + 0.58 * math.sin(math.pi * (k + .5) / N) ** 1.2


def bar(k):
    top = LINE + (H - LINE) * window(k)
    levels = [LINE + (top - LINE) * random.uniform(.4, 1) for _ in range(6)]
    levels.append(levels[0])
    dur = round(random.uniform(1.6, 2.4), 2)
    a = (f'calcMode="spline" keyTimes="{";".join(f"{i / 6:.3f}" for i in range(7))}" '
         f'keySplines="{";".join([EASE] * 6)}" dur="{dur}s" repeatCount="indefinite"')
    hv = ";".join(f"{h:.1f}" for h in levels)
    yv = ";".join(f"{(H - h) / 2:.1f}" for h in levels)
    return (f'<rect x="{k * PITCH:.1f}" y="{(H - levels[0]) / 2:.1f}" width="{BW}" height="{levels[0]:.1f}" rx="{BW / 2}">'
            f'<animate attributeName="height" values="{hv}" {a}/><animate attributeName="y" values="{yv}" {a}/></rect>')


svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="none">'
       + "".join(bar(k) for k in range(N)) + "</svg>\n")
open("assets/img/logo-bars.svg", "w", encoding="utf-8").write(svg)
print(f"assets/img/logo-bars.svg: {N} bars, {len(svg)} bytes")
