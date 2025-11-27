import { useState } from 'react';
import { Tab } from '@headlessui/react';
import FieldsManager from '../../components/academic/FieldsManager';
import PromotionsManager from '../../components/academic/PromotionsManager';
import SemestersManager from '../../components/academic/SemestersManager';
import TUsManager from '../../components/academic/TUsManager';
import TUEsManager from '../../components/academic/TUEsManager';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const AcademicStructure = () => {
    const [categories] = useState({
        'Fields': <FieldsManager />,
        'Promotions': <PromotionsManager />,
        'Semesters': <SemestersManager />,
        'Teaching Units (TU)': <TUsManager />,
        'TU Elements (TUE)': <TUEsManager />,
    });

    return (
        <div className="w-full px-2 py-4 sm:px-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Academic Structure</h1>
            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                    {Object.keys(categories).map((category) => (
                        <Tab
                            key={category}
                            className={({ selected }) =>
                                classNames(
                                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                    selected
                                        ? 'bg-white shadow'
                                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                                )
                            }
                        >
                            {category}
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="mt-2">
                    {Object.values(categories).map((component, idx) => (
                        <Tab.Panel
                            key={idx}
                            className={classNames(
                                'rounded-xl bg-white p-3',
                                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                            )}
                        >
                            {component}
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};

export default AcademicStructure;
