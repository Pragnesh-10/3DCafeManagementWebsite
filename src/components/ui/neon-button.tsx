import React from 'react';
import { cn } from '../../utils/cn';
import { VariantProps, cva } from 'class-variance-authority';

const buttonVariants = cva(
  'relative group border text-foreground mx-auto text-center rounded-full inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        // warm outline with a faint clay wash
        default: 'bg-clay/5 hover:bg-clay/0 border-clay/25 text-espresso',
        // filled terracotta call-to-action
        solid: 'bg-clay hover:bg-clay-dark text-cream border-transparent transition-all duration-200',
        // quiet, surfaces only on hover
        ghost: 'border-transparent bg-transparent text-espresso hover:border-line hover:bg-sand/60',
      },
      size: {
        default: 'px-7 py-1.5 text-sm',
        sm: 'px-4 py-1 text-sm',
        lg: 'px-10 py-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Show the soft terracotta light-line accent on hover. */
  neon?: boolean;
}

import { triggerHaptic } from '../../utils/haptics';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, neon = true, size, variant, children, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      triggerHaptic("light");
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <button 
        className={cn(buttonVariants({ variant, size }), className)} 
        ref={ref} 
        onClick={handleClick}
        {...props}
      >
        <span
          className={cn(
            'absolute h-px opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 top-0 bg-gradient-to-r w-3/4 mx-auto from-transparent via-clay to-transparent hidden',
            neon && 'block'
          )}
        />
        {children}
        <span
          className={cn(
            'absolute group-hover:opacity-40 opacity-0 transition-all duration-500 ease-in-out inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-clay to-transparent hidden',
            neon && 'block'
          )}
        />
      </button>
    );
  }
);

Button.displayName = 'NeonButton';

export { Button, buttonVariants };
