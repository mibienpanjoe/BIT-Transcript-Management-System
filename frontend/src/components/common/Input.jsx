import PropTypes from 'prop-types';
import { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    type = 'text',
    error,
    className = '',
    ...props
}, ref) => {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-brand-ink mb-1">
                    {label}
                </label>
            )}
            <div className="relative rounded-md shadow-sm">
                <input
                    ref={ref}
                    type={type}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-brand-accent/40 focus:border-brand-accent sm:text-sm transition-colors ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-brand-border'
                        }`}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error.message}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

Input.propTypes = {
    label: PropTypes.string,
    type: PropTypes.string,
    error: PropTypes.object,
    className: PropTypes.string,
};

export default Input;
