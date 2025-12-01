import { useCallback, useEffect } from 'react';

export const useKeyboardNavigation = () => {
  // Handle Escape key to close modals or menus
  const handleEscape = useCallback((callback: () => void) => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle Enter/Space for activation
  const handleActivation = useCallback((callback: () => void) => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        callback();
      }
    };

    return handleKeyDown;
  }, []);

  // Handle arrow key navigation for lists
  const handleArrowNavigation = useCallback((
    items: HTMLElement[],
    currentIndex: number,
    onChange: (index: number) => void
  ) => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let newIndex = currentIndex;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        onChange(newIndex);
        items[newIndex].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        newIndex = (currentIndex - 1 + items.length) % items.length;
        onChange(newIndex);
        items[newIndex].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        newIndex = 0;
        onChange(newIndex);
        items[newIndex].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        newIndex = items.length - 1;
        onChange(newIndex);
        items[newIndex].focus();
      }
    };

    return handleKeyDown;
  }, []);

  // Trap focus within an element (useful for modals)
  const useFocusTrap = (containerRef: React.RefObject<HTMLElement>, isActive: boolean) => {
    useEffect(() => {
      if (!isActive || !containerRef.current) return;

      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      // Focus first element when activated
      firstElement?.focus();

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [containerRef, isActive]);
  };

  return {
    handleEscape,
    handleActivation,
    handleArrowNavigation,
    useFocusTrap,
  };
};

export default useKeyboardNavigation;