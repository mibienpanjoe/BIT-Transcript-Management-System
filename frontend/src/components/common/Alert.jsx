import React from 'react';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
    const types = {
        info: {
            icon: FaInfoCircle,
            classes: 'bg-brand-ink text-white border-brand-ink',
            iconColor: 'text-brand-accent-soft',
            closeClasses: 'bg-brand-ink text-white border-brand-ink focus:ring-brand-accent'
        },
        success: {
            icon: FaCheckCircle,
            classes: 'bg-brand-ink text-white border-brand-ink',
            iconColor: 'text-green-300',
            closeClasses: 'bg-brand-ink text-white border-brand-ink focus:ring-green-400'
        },
        warning: {
            icon: FaExclamationTriangle,
            classes: 'bg-brand-ink text-white border-brand-ink',
            iconColor: 'text-amber-300',
            closeClasses: 'bg-brand-ink text-white border-brand-ink focus:ring-amber-400'
        },
        error: {
            icon: FaExclamationCircle,
            classes: 'bg-brand-ink text-white border-brand-ink',
            iconColor: 'text-red-300',
            closeClasses: 'bg-brand-ink text-white border-brand-ink focus:ring-red-400'
        }
    };

    const config = types[type] || types.info;
    const Icon = config.icon;
    const closeClasses = config.closeClasses || config.classes;

    return (
        <div className={`rounded-md p-4 border ${config.classes} ${className}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <Icon className={`h-5 w-5 ${config.iconColor}`} aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{message}</p>
                </div>
                {onClose && (
                    <div className="ml-auto pl-3">
                        <div className="-mx-1.5 -my-1.5">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${closeClasses} hover:bg-opacity-75`}
                            >
                                <span className="sr-only">Dismiss</span>
                                <FaTimes className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alert;
