import { useAuth } from '../../context/AuthContext';
import { FaBars, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import PropTypes from 'prop-types';

const Header = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b-4 border-blue-600 shadow-md">
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="text-gray-500 focus:outline-none lg:hidden"
                >
                    <FaBars className="w-6 h-6" />
                </button>

                <div className="relative mx-4 lg:mx-0">
                    <h1 className="text-xl font-semibold text-gray-800">
                        {/* Dynamic Title could go here */}
                        Dashboard
                    </h1>
                </div>
            </div>

            <div className="flex items-center">
                <div className="relative">
                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                            <Menu.Button className="flex items-center focus:outline-none">
                                <div className="flex flex-col items-end mr-3 hidden md:flex">
                                    <span className="text-sm font-medium text-gray-700">{user?.firstName} {user?.lastName}</span>
                                    <span className="text-xs text-gray-500 uppercase">{user?.role}</span>
                                </div>
                                <FaUserCircle className="w-8 h-8 text-gray-600 hover:text-blue-600 transition-colors" />
                            </Menu.Button>
                        </div>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                <div className="px-1 py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={logout}
                                                className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'
                                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                            >
                                                <FaSignOutAlt className="w-5 h-5 mr-2" aria-hidden="true" />
                                                Logout
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    toggleSidebar: PropTypes.func.isRequired,
};

export default Header;
