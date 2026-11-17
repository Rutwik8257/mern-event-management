import { forwardRef } from 'react';

export const Button = forwardRef(function Button(
  { className = '', type = 'button', ...props },
  ref,
) {
  return <button ref={ref} type={type} className={`eh-button ${className}`} {...props} />;
});