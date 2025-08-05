

import React from 'react';
import { NavLink } from 'react-router-dom';
import { DESIGN_FACTORS } from '../constants/cobitData';

const Sidebar: React.FC = () => {
    const stage1Factors = DESIGN_FACTORS.slice(0, 4);
    const stage2Factors = DESIGN_FACTORS.slice(4);

    const linkClasses = "block px-4 py-2 text-sm rounded-md transition-colors duration-150";
    const activeLinkClasses = "bg-primary-light text-white font-semibold";
    const inactiveLinkClasses = "text-gray-700 hover:bg-gray-200";

    return (
        <aside className="w-64 bg-gray-50 p-4 space-y-6 no-print">
            <div>
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Instructions</h3>
                <nav className="mt-2 space-y-1">
                    <NavLink to="/" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`} end>
                        Introduction
                    </NavLink>
                </nav>
            </div>
            <div>
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage 1: Initial Scope</h3>
                <nav className="mt-2 space-y-1">
                    {stage1Factors.map((factor, index) => (
                         <NavLink key={factor.id} to={`/design-factor/${factor.id}`} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                            DF{index + 1}: {factor.name}
                        </NavLink>
                    ))}
                    <NavLink to="/summary/step2" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                        <strong>Step 2 Summary</strong>
                    </NavLink>
                </nav>
            </div>
             <div>
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage 2: Scope Refinement</h3>
                <nav className="mt-2 space-y-1">
                    {stage2Factors.map((factor, index) => (
                         <NavLink key={factor.id} to={`/design-factor/${factor.id}`} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                            DF{index + 5}: {factor.name}
                        </NavLink>
                    ))}
                     <NavLink to="/summary/step3" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                        <strong>Step 3 Summary</strong>
                    </NavLink>
                </nav>
            </div>
             <div>
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Final Design</h3>
                <nav className="mt-2 space-y-1">
                    <NavLink to="/canvas" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                        <strong>Design Canvas</strong>
                    </NavLink>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;