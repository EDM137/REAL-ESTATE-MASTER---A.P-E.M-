
import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-brand-blue text-white hover:bg-brand-blue/90 focus:ring-brand-blue',
        secondary: 'bg-brand-accent text-brand-highlight hover:bg-brand-accent/80 focus:ring-brand-accent',
        outline: 'border border-brand-accent bg-transparent hover:bg-brand-accent text-brand-highlight focus:ring-brand-accent',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    const sizeStyles = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        icon: 'h-9 w-9',
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export { Button };
