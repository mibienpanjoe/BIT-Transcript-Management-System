import { useState } from 'react';

const useForm = (initialValues = {}, validate) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setValues({
            ...values,
            [name]: type === 'checkbox' ? checked : value
        });

        // Clear error when user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = async (onSubmit) => {
        setIsSubmitting(true);
        const validationErrors = validate ? validate(values) : {};
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            try {
                await onSubmit(values);
            } catch (error) {
                // Handle submission error
            }
        }
        setIsSubmitting(false);
    };

    const resetForm = () => {
        setValues(initialValues);
        setErrors({});
    };

    return {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        resetForm,
        setValues
    };
};

export default useForm;
