
import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && <label htmlFor={id} className="block text-sm font-medium text-brand-light mb-1">{label}</label>}
            <input
                id={id}
                className={`w-full bg-brand-primary border border-brand-accent rounded-md p-2 text-brand-highlight focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-shadow ${className}`}
                {...props}
            />
        </div>
    );
};

export { Input };
