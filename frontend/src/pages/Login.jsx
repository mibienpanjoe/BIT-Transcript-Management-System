import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaLock, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo from '/logo.jpg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const from = location.state?.from?.pathname || '/';

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await login(data.email, data.password);
            toast.success('Login successful!');
            navigate(from, { replace: true });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-ink via-brand-ink to-black">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl border border-brand-border">
                <div className="text-center space-y-3">
                    <div className="flex justify-center">
                        <img src={Logo} alt="BIT Logo" className="h-12 w-auto" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to access the BIT TMS
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUser className="text-gray-400" />
                                </div>
                                <input
                                    id="email-address"
                                    type="email"
                                    autoComplete="email"
                                    className={`appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border ${errors.email ? 'border-red-500' : 'border-brand-border'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-accent/40 focus:border-brand-accent focus:z-10 sm:text-sm transition-colors`}
                                    placeholder="Email address"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    className={`appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 pr-10 border ${errors.password ? 'border-red-500' : 'border-brand-border'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-accent/40 focus:border-brand-accent focus:z-10 sm:text-sm transition-colors`}
                                    placeholder="Password"
                                    {...register('password', { required: 'Password is required' })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-gray-400 hover:text-brand-ink"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-accent hover:bg-brand-accent-strong focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent/50 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <FaSpinner className="animate-spin h-5 w-5" />
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500">
                        &copy; {new Date().getFullYear()} Burkina Institute of Technology. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
