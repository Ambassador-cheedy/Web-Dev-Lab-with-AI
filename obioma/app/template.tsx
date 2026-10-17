'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';

/** True until the first page has mounted, so the initial server render is never hidden. */
let firstLoad = true;

/** Re-mounts on every navigation, giving a soft fade-and-rise page transition. */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const animate = !firstLoad;
  useEffect(() => {
    firstLoad = false;
  }, []);
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: reduce ? 0 : 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
