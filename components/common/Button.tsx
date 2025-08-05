import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'normal' | 'sm';
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'normal', onClick, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center border font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
      normal: 'px-6 py-3 text-base',
      sm: 'px-3 py-1 text-sm'
  }

  const variantClasses = {
    primary: 'border-transparent text-white bg-primary hover:bg-primary-dark focus:ring-primary',
    secondary: 'border-transparent text-black bg-secondary hover:bg-yellow-400 focus:ring-secondary',
    outline: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary-light',
  };

  return (
    <button
      type="button"
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;