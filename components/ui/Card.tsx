
import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> & {
    Header: React.FC<{ children: ReactNode; className?: string }>;
    Title: React.FC<{ children: ReactNode; className?: string }>;
    Description: React.FC<{ children: ReactNode; className?: string }>;
    Content: React.FC<{ children: ReactNode; className?: string }>;
    Footer: React.FC<{ children: ReactNode; className?: string }>;
} = ({ children, className = '' }) => {
    return (
        <div className={`bg-brand-secondary border border-brand-accent rounded-lg shadow-lg overflow-hidden ${className}`}>
            {children}
        </div>
    );
};

const CardHeader: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`p-6 border-b border-brand-accent ${className}`}>{children}</div>
);

const CardTitle: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <h2 className={`text-xl font-bold text-brand-highlight ${className}`}>{children}</h2>
);

const CardDescription: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <p className={`text-sm text-brand-light mt-1 ${className}`}>{children}</p>
);

const CardContent: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>{children}</div>
);

const CardFooter: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`p-6 bg-brand-primary/50 border-t border-brand-accent ${className}`}>{children}</div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export { Card };
