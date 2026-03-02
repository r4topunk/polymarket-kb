"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import type { ForceGraphData, FGNode, FGLink } from "@/lib/graph";

export type { ForceGraphData, FGNode, FGLink };

/* ─── Types ──────────────────────────────────────────────────────── */

interface SimNode extends SimulationNodeDatum {
  id: string;
  label: string;
  type: "topic" | "entity" | "phantom";
  linkCount: number;
  href: string | null;
}

type SimLink = SimulationLinkDatum<SimNode>;

type RGB = [number, number, number];

interface ThemeColors {
  primary: RGB;
  foreground: RGB;
  muted: RGB;
  background: RGB;
  border: RGB;
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function resolveColor(v: string): RGB {
  const el = document.createElement("div");
  el.style.color = `var(${v})`;
  el.style.position = "fixed";
  el.style.pointerEvents = "none";
  el.style.opacity = "0";
  document.body.appendChild(el);
  const c = getComputedStyle(el).color;
  document.body.removeChild(el);
  // Use a 1x1 Canvas to convert any CSS color (oklch, lab, etc.) to RGB
  const cvs = document.createElement("canvas");
  cvs.width = cvs.height = 1;
  const cctx = cvs.getContext("2d")!;
  cctx.fillStyle = c;
  cctx.fillRect(0, 0, 1, 1);
  const px = cctx.getImageData(0, 0, 1, 1).data;
  return [px[0], px[1], px[2]];
}

function readTheme(): ThemeColors {
  return {
    primary: resolveColor("--primary"),
    foreground: resolveColor("--foreground"),
    muted: resolveColor("--muted-foreground"),
    background: resolveColor("--background"),
    border: resolveColor("--border"),
  };
}

const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

function nodeR(n: { type: string; linkCount: number }): number {
  if (n.type === "phantom") return 1.5;
  if (n.type === "topic") return Math.min(11, 3.5 + n.linkCount * 0.55);
  return Math.min(5.5, 2 + n.linkCount * 0.3);
}

/* ─── Component ──────────────────────────────────────────────────── */

export default function ForceGraphClient({ data }: { data: ForceGraphData }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef<ThemeColors>({
    primary: [0, 200, 80],
    foreground: [200, 200, 200],
    muted: [100, 100, 100],
    background: [18, 18, 18],
    border: [50, 50, 50],
  });
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [tooltip, setTooltip] = useState<{
    label: string;
    type: string;
    links: number;
  } | null>(null);

  // Update colors on theme change — does NOT restart simulation
  useEffect(() => {
    colorsRef.current = readTheme();
  }, [resolvedTheme]);

  // Main effect — simulation + canvas renderer
  useEffect(() => {
    if (!canvasRef.current || !wrapRef.current) return;
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;

    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio, 2);

    // Ensure colors are read before first frame
    colorsRef.current = readTheme();

    /* ── Build simulation data ──────────────────────────────────── */

    const nodes: SimNode[] = data.nodes.map((n) => ({
      ...n,
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
    }));

    const nodeById = new Map(nodes.map((n) => [n.id, n]));

    const links: SimLink[] = data.links
      .map((l) => ({ source: l.source, target: l.target }))
      .filter(
        (l) =>
          nodeById.has(l.source as string) && nodeById.has(l.target as string),
      );

    // Adjacency lookup
    const adj = new Map<string, Set<string>>();
    data.links.forEach((l) => {
      if (!adj.has(l.source)) adj.set(l.source, new Set());
      if (!adj.has(l.target)) adj.set(l.target, new Set());
      adj.get(l.source)!.add(l.target);
      adj.get(l.target)!.add(l.source);
    });

    /* ── Simulation ─────────────────────────────────────────────── */

    const sim: Simulation<SimNode, SimLink> = forceSimulation(nodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(45)
          .strength(0.25),
      )
      .force("charge", forceManyBody<SimNode>().strength(-90).distanceMax(300))
      .force("center", forceCenter(0, 0).strength(0.05))
      .force("collide", forceCollide<SimNode>().radius((d) => nodeR(d) + 2).strength(0.7))
      .force("x", forceX<SimNode>(0).strength(0.015))
      .force("y", forceY<SimNode>(0).strength(0.015))
      .alphaDecay(0.018)
      .velocityDecay(0.35);

    /* ── View state ─────────────────────────────────────────────── */

    let W = 0;
    let H = 0;
    let scale = 1;
    let tx = 0;
    let ty = 0;
    let hovered: SimNode | null = null;
    let dragging: SimNode | null = null;
    let panning = false;
    let lastPtr = { x: 0, y: 0 };
    let dragStart = { x: 0, y: 0 };
    let didDrag = false;
    let dirty = true;
    let animating = true;

    function resize() {
      const r = wrap.getBoundingClientRect();
      const prevW = W;
      W = r.width;
      H = r.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      if (!prevW) {
        tx = W / 2;
        ty = H / 2;
      } else {
        tx += (W - prevW) / 2;
        ty += (H - (canvas.height / dpr || H)) / 2;
      }
      dirty = true;
    }
    resize();

    const s2g = (sx: number, sy: number) => ({
      x: (sx - tx) / scale,
      y: (sy - ty) / scale,
    });

    function hitTest(sx: number, sy: number): SimNode | null {
      const { x, y } = s2g(sx, sy);
      let best: SimNode | null = null;
      let bestD = Infinity;
      for (const n of nodes) {
        const d = Math.hypot(n.x! - x, n.y! - y);
        const hit = nodeR(n) + 6 / scale;
        if (d < hit && d < bestD) {
          best = n;
          bestD = d;
        }
      }
      return best;
    }

    /* ── Zoom to fit (animated) ──────────────────────────────────── */

    function computeFit(pad = 50) {
      let x0 = Infinity,
        x1 = -Infinity,
        y0 = Infinity,
        y1 = -Infinity;
      for (const n of nodes) {
        const r = nodeR(n);
        x0 = Math.min(x0, n.x! - r);
        x1 = Math.max(x1, n.x! + r);
        y0 = Math.min(y0, n.y! - r);
        y1 = Math.max(y1, n.y! + r);
      }
      const gw = x1 - x0 || 1;
      const gh = y1 - y0 || 1;
      const s = Math.min((W - pad * 2) / gw, (H - pad * 2) / gh, 2.5);
      return {
        scale: s,
        tx: W / 2 - ((x0 + x1) / 2) * s,
        ty: H / 2 - ((y0 + y1) / 2) * s,
      };
    }

    let fitAnim: number | null = null;
    function animateFit(dur = 600) {
      const target = computeFit();
      const s0 = scale,
        tx0 = tx,
        ty0 = ty;
      const t0 = performance.now();
      function step(now: number) {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
        scale = s0 + (target.scale - s0) * e;
        tx = tx0 + (target.tx - tx0) * e;
        ty = ty0 + (target.ty - ty0) * e;
        dirty = true;
        if (p < 1) fitAnim = requestAnimationFrame(step);
      }
      fitAnim = requestAnimationFrame(step);
    }

    // Fit after simulation settles
    sim.on("end", () => {
      animating = false;
      animateFit();
    });

    sim.on("tick", () => {
      dirty = true;
    });

    /* ── Draw ────────────────────────────────────────────────────── */

    function draw() {
      const C = colorsRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = rgba(C.background, 1);
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);

      const hId = hovered?.id ?? null;
      const neighbors = hId ? adj.get(hId) : null;

      // ── Links ──
      for (const link of links) {
        const src = link.source as SimNode;
        const tgt = link.target as SimNode;
        if (src.x == null || tgt.x == null) continue;

        const sId = src.id;
        const tId = tgt.id;
        const isHL = hId !== null && (sId === hId || tId === hId);
        const isDim = hId !== null && !isHL;

        ctx.beginPath();
        ctx.moveTo(src.x!, src.y!);
        ctx.lineTo(tgt.x!, tgt.y!);

        if (isHL) {
          ctx.strokeStyle = rgba(C.primary, 0.45);
          ctx.lineWidth = 1.5 / scale;
        } else if (isDim) {
          ctx.strokeStyle = rgba(C.primary, 0.015);
          ctx.lineWidth = 0.5 / scale;
        } else {
          ctx.strokeStyle = rgba(C.primary, 0.09);
          ctx.lineWidth = 0.5 / scale;
        }
        ctx.stroke();
      }

      // ── Nodes ──
      for (const n of nodes) {
        if (n.x == null) continue;
        const isHov = n.id === hId;
        const isConn = neighbors ? neighbors.has(n.id) : false;
        const isDim = hId !== null && !isHov && !isConn;
        const r = nodeR(n);

        // Phantom
        if (n.type === "phantom") {
          ctx.beginPath();
          ctx.arc(n.x!, n.y!, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = rgba(C.muted, isDim ? 0.02 : 0.15);
          ctx.fill();
          continue;
        }

        // ── Glow (the key Obsidian effect) ──
        if (!isDim) {
          ctx.save();
          const glowColor =
            n.type === "topic" ? C.primary : C.foreground;
          ctx.shadowColor = rgba(glowColor, isHov ? 0.9 : 0.5);
          ctx.shadowBlur = isHov ? 22 : 10;

          if (n.type === "topic") {
            ctx.beginPath();
            ctx.arc(n.x!, n.y!, r, 0, Math.PI * 2);
            ctx.fillStyle = rgba(
              C.primary,
              isHov ? 1 : isConn ? 0.85 : 0.6,
            );
            ctx.fill();
          } else {
            // Entity diamond
            ctx.beginPath();
            ctx.moveTo(n.x!, n.y! - r);
            ctx.lineTo(n.x! + r, n.y!);
            ctx.lineTo(n.x!, n.y! + r);
            ctx.lineTo(n.x! - r, n.y!);
            ctx.closePath();
            ctx.fillStyle = rgba(
              isHov || isConn ? C.primary : C.foreground,
              isHov ? 1 : isConn ? 0.8 : 0.4,
            );
            ctx.fill();
          }
          ctx.restore();
        } else {
          // Dimmed — no glow
          if (n.type === "topic") {
            ctx.beginPath();
            ctx.arc(n.x!, n.y!, r, 0, Math.PI * 2);
            ctx.fillStyle = rgba(C.primary, 0.05);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.moveTo(n.x!, n.y! - r);
            ctx.lineTo(n.x! + r, n.y!);
            ctx.lineTo(n.x!, n.y! + r);
            ctx.lineTo(n.x! - r, n.y!);
            ctx.closePath();
            ctx.fillStyle = rgba(C.foreground, 0.03);
            ctx.fill();
          }
        }

        // ── Labels ──
        // Topics: always (fade with zoom). Entities: hover/connected only.
        const zoomAlpha = Math.min(1, Math.max(0, (scale - 0.35) / 0.4));
        const showLabel =
          isHov ||
          isConn ||
          (n.type === "topic" && zoomAlpha > 0);

        if (showLabel && !isDim) {
          const fs = Math.min(14, Math.max(3, 11 / scale));
          ctx.font = `${isHov ? "bold " : ""}${fs}px monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          const a = isHov
            ? 1
            : isConn
              ? 0.8
              : n.type === "topic"
                ? zoomAlpha * 0.5
                : 0.6;
          ctx.fillStyle = rgba(
            n.type === "topic" ? C.primary : C.muted,
            a,
          );
          const lbl =
            n.label.length > 26 ? n.label.slice(0, 24) + "…" : n.label;
          ctx.fillText(lbl, n.x!, n.y! + r + 3);
        }
      }

      // ── Hover ring (on top of everything) ──
      if (hovered && hovered.x != null) {
        ctx.beginPath();
        ctx.arc(
          hovered.x!,
          hovered.y!,
          nodeR(hovered) + 3,
          0,
          Math.PI * 2,
        );
        ctx.strokeStyle = rgba(C.primary, 0.6);
        ctx.lineWidth = 1.5 / scale;
        ctx.stroke();
      }

      ctx.restore();
    }

    /* ── Render loop ─────────────────────────────────────────────── */

    let raf: number;
    function loop() {
      if (dirty) {
        draw();
        dirty = false;
      }
      raf = requestAnimationFrame(loop);
    }
    loop();

    /* ── Pointer events ──────────────────────────────────────────── */

    function onPointerMove(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      if (dragging) {
        const g = s2g(sx, sy);
        dragging.fx = g.x;
        dragging.fy = g.y;
        sim.alpha(0.3).restart();
        animating = true;
        dirty = true;
        return;
      }

      if (panning) {
        tx += e.clientX - lastPtr.x;
        ty += e.clientY - lastPtr.y;
        lastPtr = { x: e.clientX, y: e.clientY };
        dirty = true;
        return;
      }

      const found = hitTest(sx, sy);
      if (found !== hovered) {
        hovered = found;
        canvas.style.cursor = found ? "pointer" : "default";
        dirty = true;
        if (found) {
          setTooltip({
            label: found.label,
            type: found.type,
            links: adj.get(found.id)?.size ?? 0,
          });
        } else {
          setTooltip(null);
        }
      }
    }

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return;
      canvas.setPointerCapture(e.pointerId);
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      dragStart = { x: e.clientX, y: e.clientY };
      lastPtr = { x: e.clientX, y: e.clientY };
      didDrag = false;

      const found = hitTest(sx, sy);
      if (found) {
        dragging = found;
        const g = s2g(sx, sy);
        found.fx = g.x;
        found.fy = g.y;
        sim.alpha(0.3).restart();
        animating = true;
        canvas.style.cursor = "grabbing";
      } else {
        panning = true;
        canvas.style.cursor = "grabbing";
      }
    }

    function onPointerUp(e: PointerEvent) {
      canvas.releasePointerCapture(e.pointerId);
      const moved = Math.hypot(
        e.clientX - dragStart.x,
        e.clientY - dragStart.y,
      );
      didDrag = moved > 4;

      if (dragging) {
        dragging.fx = null;
        dragging.fy = null;
        dragging = null;
      }
      panning = false;
      canvas.style.cursor = hovered ? "pointer" : "default";
      dirty = true;
    }

    function onClick(e: MouseEvent) {
      if (didDrag) return;
      const rect = canvas.getBoundingClientRect();
      const found = hitTest(e.clientX - rect.left, e.clientY - rect.top);
      if (found?.href) router.push(found.href);
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      const ns = Math.max(0.12, Math.min(6, scale * factor));
      tx = mx - (mx - tx) * (ns / scale);
      ty = my - (my - ty) * (ns / scale);
      scale = ns;
      dirty = true;
    }

    // ── Touch pinch-to-zoom ──
    let lastPinchDist = 0;
    let lastPinchCenter = { x: 0, y: 0 };

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        panning = false;
        if (dragging) {
          dragging.fx = null;
          dragging.fy = null;
          dragging = null;
        }
        const [a, b] = [e.touches[0], e.touches[1]];
        lastPinchDist = Math.hypot(
          a.clientX - b.clientX,
          a.clientY - b.clientY,
        );
        lastPinchCenter = {
          x: (a.clientX + b.clientX) / 2,
          y: (a.clientY + b.clientY) / 2,
        };
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const center = {
        x: (a.clientX + b.clientX) / 2,
        y: (a.clientY + b.clientY) / 2,
      };

      const factor = dist / lastPinchDist;
      const ns = Math.max(0.12, Math.min(6, scale * factor));
      const rect = canvas.getBoundingClientRect();
      const mx = center.x - rect.left;
      const my = center.y - rect.top;
      tx = mx - (mx - tx) * (ns / scale);
      ty = my - (my - ty) * (ns / scale);
      tx += center.x - lastPinchCenter.x;
      ty += center.y - lastPinchCenter.y;
      scale = ns;

      lastPinchDist = dist;
      lastPinchCenter = center;
      dirty = true;
    }

    /* ── Attach events ───────────────────────────────────────────── */

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });

    const ro = new ResizeObserver(() => {
      resize();
      dirty = true;
    });
    ro.observe(wrap);

    /* ── Cleanup ──────────────────────────────────────────────────── */

    return () => {
      cancelAnimationFrame(raf);
      if (fitAnim) cancelAnimationFrame(fitAnim);
      sim.stop();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      ro.disconnect();
    };
  }, [data, router]);

  const topicCount = data.nodes.filter((n) => n.type === "topic").length;
  const entityCount = data.nodes.filter((n) => n.type === "entity").length;

  return (
    <div ref={wrapRef} className="w-full h-full relative">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Stats */}
      <div className="absolute bottom-3 left-3 text-[10px] font-mono pointer-events-none flex gap-1.5">
        <div className="border border-border bg-background/70 px-2 py-1 flex items-center gap-3">
          <span>
            <span className="tui-dim">N&nbsp;</span>
            <span className="text-primary font-bold">{data.nodes.length}</span>
          </span>
          <span>
            <span className="tui-dim">E&nbsp;</span>
            <span className="text-primary font-bold">{data.links.length}</span>
          </span>
        </div>
        <div className="border border-border bg-background/70 px-2 py-1 flex items-center gap-2.5">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-primary opacity-70" />
            <span className="tui-dim">{topicCount} topics</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rotate-45 bg-foreground opacity-40" />
            <span className="tui-dim">{entityCount} entities</span>
          </span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-mono border border-primary/50 bg-background/85 px-3 py-1.5 pointer-events-none whitespace-nowrap backdrop-blur-sm">
          <span className="text-primary font-bold">{tooltip.label}</span>
          <span className="tui-dim ml-2">{tooltip.type}</span>
          <span className="tui-dim ml-2">{tooltip.links} connections</span>
        </div>
      )}
    </div>
  );
}
