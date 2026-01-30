import PropTypes from 'prop-types';
import { FaSpinner } from 'react-icons/fa';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    className = '',
    disabled = false,
    isLoading = false
}) => {
    const baseStyles = "inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "border-transparent text-white bg-brand-accent hover:bg-brand-accent-strong focus:ring-brand-accent shadow-sm",
        secondary: "border-brand-border text-brand-ink bg-white hover:bg-brand-surface focus:ring-brand-accent shadow-sm",
        danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-sm",
        success: "border-transparent text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-sm",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {isLoading && <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />}
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success']),
    className: PropTypes.string,
    disabled: PropTypes.bool,
    isLoading: PropTypes.bool,
};

export default Button;
