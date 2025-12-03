/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { View } from '../App';
import CraticLogoIcon from './icons/CraticLogoIcon';
import DashboardIcon from './icons/DashboardIcon';
import DocumentChatbotIcon from './icons/DocumentChatbotIcon';
import DocumentsControlIcon from './icons/DocumentsControlIcon';


interface SidebarProps {
    currentView: View;
    setView: (view: View) => void;
}

interface SidebarLinkProps {
    icon: React.ReactNode;
    label: string;
    view: View;
    currentView: View;
    setView: (view: View) => void;
    badge?: number;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, view, currentView, setView, badge }) => {
    const isActive = currentView === view;
    return (
        <a
            href="#"
            onClick={(e) => { e.preventDefault(); setView(view); }}
            className={`flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
                ${isActive
                    ? 'bg-cratic-purple-active-bg text-cratic-purple'
                    : 'text-cratic-text-primary hover:bg-cratic-subtle'
                }`}
        >
            <span className={isActive ? 'text-cratic-purple' : 'text-cratic-text-secondary'}>{icon}</span>
            <span className="ml-3 flex-1">{label}</span>
            {badge && <span className="bg-cratic-purple text-white text-xs font-semibold px-2 py-0.5 rounded-full">{badge}</span>}
        </a>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
    return (
        <aside className="w-64 bg-cratic-panel border-r border-cratic-border flex flex-col flex-shrink-0">
            <div className="h-16 flex items-center px-4 border-b border-cratic-border">
                <CraticLogoIcon />
                <div className="ml-3">
                    <h1 className="text-base font-bold text-cratic-text-primary">CraticAI</h1>
                    <p className="text-xs text-cratic-text-secondary">AI-Powered Workspace</p>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div>
                    <div className="space-y-1">
                        <SidebarLink icon={<DashboardIcon />} label="Dashboard" view="dashboard" currentView={currentView} setView={setView} />
                    </div>
                </div>
                 <div>
                    <h2 className="px-3 text-xs font-bold uppercase text-cratic-purple-text tracking-wider mb-2">SOP Assistant</h2>
                    <div className="space-y-1">
                        <SidebarLink icon={<DocumentChatbotIcon />} label="Document Chatbot" view="chat" currentView={currentView} setView={setView} />
                        <SidebarLink icon={<DocumentsControlIcon />} label="Documents Control" view="management" currentView={currentView} setView={setView} />
                    </div>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;