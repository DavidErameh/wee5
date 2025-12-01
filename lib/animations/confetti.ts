/**
 * Confetti Animation Utility for WEE5 Design System
 * 
 * This file provides a canvas-based confetti animation implementation
 * for celebratory moments like level-ups, following the design system.
 */

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  shapes?: ('circle' | 'square' | 'bar')[];
  gravity?: number;
  ticks?: number;
  zIndex?: number;
  disableForReducedMotion?: boolean;
}

/**
 * Trigger a confetti burst effect
 * 
 * @param options - Configuration options for the confetti effect
 * @returns A promise that resolves when the animation completes
 */
export async function triggerConfetti(options: ConfettiOptions = {}): Promise<void> {
  // Check for reduced motion preference
  if (options.disableForReducedMotion !== false && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return Promise.resolve();
  }

  // Default options
  const {
    particleCount = 50,
    spread = 70,
    origin = { x: 0.5, y: 0.3 },
    colors = ['#6B46C1', '#9F7AEA', '#FFFFFF', '#10B981', '#F59E0B'],
    shapes = ['circle'],
    gravity = 0.2,  // Increased gravity to make particles fall faster for shorter duration
    ticks = 60,  // Approximately 500ms at 60fps with faster physics (30-60 frames)
    zIndex = 1000
  } = options;

  // Create canvas element
  const canvas = document.createElement('canvas');
  const container = document.body;
  const context = canvas.getContext('2d');
  
  if (!context) {
    console.error('Could not get 2D context for confetti canvas');
    return;
  }

  // Set canvas dimensions
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = zIndex.toString();
  canvas.style.pointerEvents = 'none';

  // Add canvas to the document
  container.appendChild(canvas);

  // Create particles
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: canvas.width * origin.x,
      y: canvas.height * origin.y,
      radius: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
      tiltAngleIncrement: Math.random() * 0.07 - 0.035,
      velocity: {
        x: Math.random() * spread - (spread / 2),
        y: Math.random() * spread - (spread / 2)
      }
    });
  }

  // Animation variables
  let animationFrameId: number;
  let tick = 0;

  // Animation function
  const animate = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      // Update position - faster movement for 500ms animation
      p.velocity.x *= 0.95; // less friction for faster movement
      p.velocity.y *= 0.95; // less friction for faster movement
      p.velocity.y += gravity; // gravity
      p.x += p.velocity.x;
      p.y += p.velocity.y;
      
      // Update tilt
      p.tiltAngle += p.tiltAngleIncrement;
      
      // Draw particle based on shape
      context.fillStyle = p.color;
      context.save();
      context.translate(p.x, p.y);
      context.rotate(p.tiltAngle);
      context.beginPath();
      
      if (p.shape === 'circle') {
        context.arc(0, 0, p.radius, 0, Math.PI * 2);
      } else if (p.shape === 'square') {
        context.rect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
      } else if (p.shape === 'bar') {
        // Tilted bar shape
        context.rect(-p.radius, -p.radius / 2, p.radius * 2, p.radius);
      }
      
      context.closePath();
      context.fill();
      context.restore();
    }

    // Continue animation if not completed
    if (tick < ticks) {
      tick++;
      animationFrameId = requestAnimationFrame(animate);
    } else {
      // Clean up after animation completes
      container.removeChild(canvas);
    }
  };

  // Start animation
  animationFrameId = requestAnimationFrame(animate);

  // Return a promise that resolves when the animation completes
  return new Promise(resolve => {
    const cleanup = () => {
      if (tick >= ticks) {
        cancelAnimationFrame(animationFrameId);
        resolve();
      } else {
        setTimeout(cleanup, 100);
      }
    };
    cleanup();
  });
}

/**
 * Preload confetti assets if needed
 */
export function preloadConfettiAssets(): void {
  // Currently no assets to preload, but this is a placeholder for future use
}

/**
 * Cleanup function to remove any active confetti canvases
 */
export function cleanupConfetti(): void {
  const canvases = document.querySelectorAll('canvas[data-confetti]');
  canvases.forEach(canvas => canvas.remove());
}