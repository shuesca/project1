import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { FluidSmokeOverlay } from './FluidSmokeOverlay';
import {
  LAUNCH_SMOKE_NAV_SEC,
  LAUNCH_SMOKE_TOTAL_SEC,
  LAUNCH_SMOKE_WRAP_MS,
} from './launchTransitionConstants';

type Ctx = {
  launchWithFluidTransition: (to: string) => void;
  isLaunchTransitioning: boolean;
};

const LaunchTransitionContext = createContext<Ctx | null>(null);

export function useLaunchTransition(): Ctx | null {
  return useContext(LaunchTransitionContext);
}

export function LaunchTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [overlayOn, setOverlayOn] = useState(false);
  const [wrapFadeOut, setWrapFadeOut] = useState(false);
  const [isLaunchTransitioning, setIsLaunchTransitioning] = useState(false);
  const busyRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const endTransition = useCallback(() => {
    setOverlayOn(false);
    setWrapFadeOut(false);
    setIsLaunchTransitioning(false);
    busyRef.current = false;
  }, []);

  const launchWithFluidTransition = useCallback(
    (to: string) => {
      if (typeof window === 'undefined' || busyRef.current) return;
      busyRef.current = true;
      setWrapFadeOut(false);
      setIsLaunchTransitioning(true);
      setOverlayOn(true);

      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];

      timersRef.current.push(
        window.setTimeout(() => {
          try {
            sessionStorage.setItem('nitrogen:launchEntry', '1');
          } catch {
            /* ignore */
          }
          navigate(to);
        }, LAUNCH_SMOKE_NAV_SEC * 1000),
      );
      timersRef.current.push(
        window.setTimeout(() => {
          setWrapFadeOut(true);
        }, LAUNCH_SMOKE_TOTAL_SEC * 1000),
      );
      timersRef.current.push(
        window.setTimeout(() => {
          endTransition();
        }, LAUNCH_SMOKE_TOTAL_SEC * 1000 + LAUNCH_SMOKE_WRAP_MS),
      );
    },
    [navigate, endTransition],
  );

  useEffect(
    () => () => {
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    },
    [],
  );

  return (
    <LaunchTransitionContext.Provider
      value={{ launchWithFluidTransition, isLaunchTransitioning }}
    >
      {children}
      {overlayOn ? (
        <motion.div
          className="fixed inset-0 z-[9998] pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: wrapFadeOut ? 0 : 1 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <FluidSmokeOverlay active durationSec={LAUNCH_SMOKE_TOTAL_SEC} />
        </motion.div>
      ) : null}
    </LaunchTransitionContext.Provider>
  );
}
