/**
 * Minimal stub for local dev when the full Create IDE design-mode package is absent.
 * The real implementation wires element inspection into the host environment.
 */

export type ResolvedElement = { element: Element };

export type GetStyleInfo = (resolved: ResolvedElement) => {
  className: string;
  styles: Record<string, string> | null;
};

/** Returns a no-op reselect when running outside the Create design panel. */
export function initDesignMode(_getStyleInfo: GetStyleInfo): () => void {
  return () => {
    // Intentionally empty — nothing to re-sync without the parent frame.
  };
}
