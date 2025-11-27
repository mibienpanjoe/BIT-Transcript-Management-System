export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePassword = (password) => {
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password);
};

export const validateGrade = (grade) => {
    const num = Number(grade);
    return !isNaN(num) && num >= 0 && num <= 20;
};

export const validateCoefficient = (coeff) => {
    const num = Number(coeff);
    return !isNaN(num) && num > 0 && num <= 100;
};

export const validateRequired = (value) => {
    if (typeof value === 'string') return value.trim().length > 0;
    return value !== null && value !== undefined;
};
