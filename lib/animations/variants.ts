/**
 * Animation Variants for WEE5 Design System
 * 
 * This file defines Framer Motion variants for consistent
 * animations across the WEE5 application following the design system.
 */

// Modal animations
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  }
};

// Toast animations
export const toastVariants = {
  hidden: { x: 400, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: { 
    x: 400, 
    opacity: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  }
};

// Slide-in from right (for side modals, dropdowns)
export const slideInRightVariants = {
  hidden: { x: 300, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: { 
    x: 300, 
    opacity: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  }
};

// Slide-in from left
export const slideInLeftVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: { 
    x: -300, 
    opacity: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  }
};

// Fade in
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  }
};

// Stagger children
export const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const listItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// Progress bar animation
export const progressBarVariants = {
  hidden: { width: 0 },
  visible: { 
    width: '100%',
    transition: { 
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// Pulse animation for XP gain
export const pulseVariants = {
  hidden: { scale: 1 },
  visible: {
    scale: [1, 1.02, 1],
    transition: { 
      duration: 0.3, 
      ease: 'easeInOut',
      repeat: 1
    }
  }
};

// Rank change animation
export const rankChangeVariants = {
  hidden: { x: -10, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      duration: 0.3, 
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// Button click animation
export const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
};

// Card hover animation
export const cardVariants = {
  rest: { 
    y: 0,
    transition: { duration: 0.2 }
  },
  hover: { 
    y: -2,
    boxShadow: '0 0 12px rgba(107, 70, 193, 0.25)',
    transition: { 
      duration: 0.2,
      ease: 'easeInOut'
    }
  }
};

// Level up celebration animation
export const levelUpVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: [0.34, 1.56, 0.64, 1]
    }
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Loading animation
export const loadingVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};