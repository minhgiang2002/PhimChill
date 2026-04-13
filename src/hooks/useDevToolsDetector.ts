import { useEffect } from 'react';

export const useDevToolsDetector = (onDetected: () => void) => {
  useEffect(() => {
    let isDetected = false;

    const detect = () => {
      // Check for window size difference (DevTools docked)
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;

      if (widthThreshold || heightThreshold) {
        if (!isDetected) {
          isDetected = true;
          onDetected();
        }
      } else {
        isDetected = false;
      }
    };

    // More aggressive detection: Debugger trap
    const debuggerTrap = () => {
      const startTime = performance.now();
      debugger;
      const endTime = performance.now();
      if (endTime - startTime > 100) {
        onDetected();
      }
    };

    // Block common DevTools shortcuts
    const blockShortcuts = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        onDetected();
        return false;
      }
    };

    // Block right click
    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      onDetected();
      return false;
    };

    const interval = setInterval(() => {
      detect();
      debuggerTrap();
    }, 500); // Faster check

    window.addEventListener('resize', detect);
    window.addEventListener('keydown', blockShortcuts);
    window.addEventListener('contextmenu', blockContextMenu);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', detect);
      window.removeEventListener('keydown', blockShortcuts);
      window.removeEventListener('contextmenu', blockContextMenu);
    };
  }, [onDetected]);
};
