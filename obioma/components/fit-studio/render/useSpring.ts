'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Spring-animates a flat array of numbers towards `target`. When `topologyKey`
 * changes (a different garment type, so different point counts) it snaps instead.
 * Runs one rAF loop and re-renders once per frame while moving.
 */
export function useSpringArray(
  target: number[],
  topologyKey: string,
  stiffness = 210,
  damping = 26,
): number[] {
  const reduce = useReducedMotion();
  const pos = useRef<number[]>(target);
  const vel = useRef<number[]>(target.map(() => 0));
  const key = useRef(topologyKey);
  const goal = useRef(target);
  const raf = useRef<number | null>(null);
  const [, setFrame] = useState(0);

  goal.current = target;

  useEffect(() => {
    if (reduce || key.current !== topologyKey || pos.current.length !== target.length) {
      key.current = topologyKey;
      pos.current = target;
      vel.current = target.map(() => 0);
      setFrame((n) => n + 1);
      return;
    }
    if (raf.current != null) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const g = goal.current;
      const p = pos.current.slice();
      const v = vel.current;
      let moving = false;
      for (let i = 0; i < p.length; i++) {
        const force = -stiffness * (p[i]! - g[i]!) - damping * v[i]!;
        v[i]! += force * dt;
        p[i]! += v[i]! * dt;
        if (Math.abs(v[i]!) > 0.01 || Math.abs(p[i]! - g[i]!) > 0.01) moving = true;
      }
      pos.current = moving ? p : g.slice();
      setFrame((n) => n + 1);
      raf.current = moving ? requestAnimationFrame(tick) : null;
    };
    raf.current = requestAnimationFrame(tick);
  }, [target, topologyKey, reduce, stiffness, damping]);

  useEffect(
    () => () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    },
    [],
  );

  return pos.current.length === target.length ? pos.current : target;
}
