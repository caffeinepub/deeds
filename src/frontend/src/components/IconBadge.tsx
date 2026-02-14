import { LucideIcon } from 'lucide-react';

interface IconBadgeProps {
  icon: LucideIcon;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  'aria-label'?: string;
}

export default function IconBadge({
  icon: Icon,
  label,
  size = 'md',
  variant = 'default',
  className = '',
  'aria-label': ariaLabel,
}: IconBadgeProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const containerSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const variantClasses = {
    default: 'icon-container',
    outline: 'border border-border/50 rounded-xl',
    ghost: 'hover:bg-accent/50 rounded-xl transition-colors',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 ${containerSizeClasses[size]} ${variantClasses[variant]} ${className}`}
      aria-label={ariaLabel || label}
    >
      <Icon className={`${sizeClasses[size]} text-primary`} strokeWidth={2} />
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}
