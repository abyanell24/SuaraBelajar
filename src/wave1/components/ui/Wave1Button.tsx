import React from 'react';

interface Wave1ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const Wave1Button: React.FC<Wave1ButtonProps> = ({ variant = 'primary', children, ...props }) => {
  return (
    <button
      data-testid={props['data-testid'] || 'wave1-button'}
      {...props}
    >
      {children}
    </button>
  );
};

export default Wave1Button;