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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative rounded-md shadow-sm">
                <input
                    ref={ref}
                    type={type}
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
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
