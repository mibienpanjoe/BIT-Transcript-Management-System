import React from 'react';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
    const types = {
        info: {
            icon: FaInfoCircle,
            classes: 'bg-blue-50 text-blue-800 border-blue-200',
            iconColor: 'text-blue-400'
        },
        success: {
            icon: FaCheckCircle,
            classes: 'bg-green-50 text-green-800 border-green-200',
            iconColor: 'text-green-400'
        },
        warning: {
            icon: FaExclamationTriangle,
            classes: 'bg-yellow-50 text-yellow-800 border-yellow-200',
            iconColor: 'text-yellow-400'
        },
        error: {
            icon: FaExclamationCircle,
            classes: 'bg-red-50 text-red-800 border-red-200',
            iconColor: 'text-red-400'
        }
    };

    const config = types[type] || types.info;
    const Icon = config.icon;

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
                                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.classes} hover:bg-opacity-75`}
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
