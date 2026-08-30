#!/usr/bin/env python3
"""生成背景分子水印。改完跑：~/envs/gnn/bin/python tools/make_bg.py"""
import math, random

random.seed(7)                      # 固定种子，重跑结果一致
W = H = 760
INK, OP, SW = "#2b3138", 0.085, 2.0
J = 1.1                             # 手绘抖动幅度

def j(v):  return v + random.uniform(-J, J)
def pt(cx, cy, r, a, rot=0):
    a = math.radians(a + rot)
    return j(cx + r*math.cos(a)), j(cy + r*math.sin(a))

out = []
def path(d, **kw):
    at = "".join(f' {k.replace("_","-")}="{v}"' for k, v in kw.items())
    out.append(f'<path d="{d}" fill="none"{at}/>')
def line(x1,y1,x2,y2,**kw): path(f"M{x1:.1f} {y1:.1f}L{x2:.1f} {y2:.1f}", **kw)
def poly(ps, close=True, **kw):
    d = "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in ps) + ("Z" if close else "")
    path(d, **kw)
def circ(cx,cy,r,**kw):
    at = "".join(f' {k.replace("_","-")}="{v}"' for k,v in kw.items())
    out.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="none"{at}/>')

def ring(cx, cy, r, n=6, rot=0, inner=False):
    ps = [pt(cx, cy, r, 360*i/n, rot) for i in range(n)]
    poly(ps)
    if inner:                        # 芳香内圈（画三条内侧双键）
        for i in (0, 2, 4):
            a, b = ps[i], ps[(i+1) % n]
            f = 0.74
            line(cx+(a[0]-cx)*f, cy+(a[1]-cy)*f, cx+(b[0]-cx)*f, cy+(b[1]-cy)*f)

def phenol(cx, cy, s=1.0, rot=0):     # 苯酚 —— 那篇 hydroxyarene
    ring(cx, cy, 26*s, 6, rot, inner=True)
    x, y = pt(cx, cy, 26*s, 90, rot); line(x, y, *pt(cx, cy, 44*s, 90, rot))

def cyclobutane(cx, cy, s=1.0, rot=0):   # 环丁烷 —— 那篇 1,3-二取代
    ring(cx, cy, 22*s, 4, rot)
    for a in (45, 225):
        x, y = pt(cx, cy, 22*s, a, rot); line(x, y, *pt(cx, cy, 38*s, a, rot))

def carbonate(cx, cy, s=1.0, rot=0):     # 碳酸乙烯酯 EC
    ring(cx, cy, 22*s, 5, rot)
    x, y = pt(cx, cy, 22*s, -90, rot)
    x2, y2 = pt(cx, cy, 40*s, -90, rot)
    line(x, y, x2, y2); line(x+4, y-2, x2+4, y2-2)     # C=O 双键
    out.append(f'<text x="{x2-4:.0f}" y="{y2-4:.0f}" font-size="{11*s:.0f}" '
               f'fill="{INK}" fill-opacity="{OP}" font-family="serif">O</text>')

def glyme(x, y, n=4, s=1.0, rot=0):      # 醚链锯齿
    ps, dx, dy = [], 15*s, 9*s
    for i in range(n*2+1):
        ps.append((j(x+i*dx), j(y+(dy if i % 2 else -dy))))
    a = math.radians(rot)
    ps = [(x+(px-x)*math.cos(a)-(py-y)*math.sin(a),
           y+(px-x)*math.sin(a)+(py-y)*math.cos(a)) for px, py in ps]
    poly(ps, close=False)
    for i in range(1, len(ps), 2):
        out.append(f'<text x="{ps[i][0]-3:.0f}" y="{ps[i][1]+4:.0f}" font-size="{11*s:.0f}" '
                   f'fill="{INK}" fill-opacity="{OP}" font-family="serif">O</text>')

def solvation(cx, cy, s=1.0):            # Li+ 第一溶剂化壳
    circ(cx, cy, 5*s)
    out.append(f'<text x="{cx+8*s:.0f}" y="{cy-6*s:.0f}" font-size="{12*s:.0f}" '
               f'fill="{INK}" fill-opacity="{OP}" font-family="serif">Li⁺</text>')
    for a in range(0, 360, 72):
        x1, y1 = pt(cx, cy, 12*s, a); x2, y2 = pt(cx, cy, 30*s, a)
        line(x1, y1, x2, y2, stroke_dasharray="3 4")
        circ(x2, y2, 6*s)

def orbital(cx, cy, s=1.0, rot=0):       # p 轨道双瓣
    for sgn in (1, -1):
        a = math.radians(rot)
        dx, dy = -math.sin(a)*20*s*sgn, math.cos(a)*20*s*sgn
        out.append(f'<ellipse cx="{cx+dx:.1f}" cy="{cy+dy:.1f}" rx="{11*s:.1f}" ry="{20*s:.1f}" '
                   f'transform="rotate({rot} {cx+dx:.1f} {cy+dy:.1f})" fill="none"/>')

def fsi(cx, cy, s=1.0, rot=0):           # FSI⁻ 骨架 F-S(=O)2-N-S(=O)2-F
    ps = [pt(cx, cy, 26*s, a, rot) for a in (180, 235, 305, 0)]
    poly(ps, close=False)
    for lbl, p in zip(("F", "N", "F"), (ps[0], ps[2], ps[3])):
        out.append(f'<text x="{p[0]-4:.0f}" y="{p[1]+4:.0f}" font-size="{11*s:.0f}" '
                   f'fill="{INK}" fill-opacity="{OP}" font-family="serif">{lbl}</text>')

# 散布：尽量离边缘远一点，平铺时不容易看出接缝
phenol(120, 110, 1.0, 8)
cyclobutane(560, 95, 1.0, 12)
carbonate(300, 250, .95, -6)
glyme(430, 380, 4, 1.0, -8)
solvation(150, 420, 1.0)
orbital(640, 300, .85, 24)
phenol(620, 560, .8, -14)
fsi(300, 620, 1.0, 5)
cyclobutane(120, 660, .8, 30)
carbonate(560, 690, .8, 18)
glyme(60, 250, 3, .8, 14)
orbital(400, 120, .7, -30)

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
       f'<g stroke="{INK}" stroke-opacity="{OP}" stroke-width="{SW}" '
       f'stroke-linecap="round" stroke-linejoin="round">'
       + "".join(out) + "</g></svg>")
open("assets/img/bg-molecules.svg", "w").write(svg)
print("wrote assets/img/bg-molecules.svg", len(svg), "bytes")
