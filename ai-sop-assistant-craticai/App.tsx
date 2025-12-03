/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import ChatbotView from './components/ChatbotView';
import ManagementView from './components/ManagementView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export type View = 'chat' | 'management' | 'dashboard' | 'placeholder';

const App: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    const [error, setError] = useState<string | null>(null);

    const clearError = () => {
        setError(null);
        // Reset to a safe default view on error clear
        setView('dashboard');
    };

    const handleError = (message: string, err: any) => {
        console.error(message, err);
        setError(`${message}${err ? `: ${err instanceof Error ? err.message : String(err)}` : ''}`);
    };

    const renderContent = () => {
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full bg-red-50 text-red-800 p-4">
                    <h1 className="text-3xl font-bold mb-4">Application Error</h1>
                    <p className="max-w-md text-center mb-4">{error}</p>
                    <button onClick={clearError} className="px-4 py-2 rounded-md bg-cratic-purple text-white hover:bg-cratic-purple-hover transition-colors" title="Return to the welcome screen">
                        Try Again
                    </button>
                </div>
            );
        }
        
        // Placeholder for other views from the screenshot
        const PlaceholderView = ({ viewName }: { viewName: string }) => (
             <div className="p-8">
                <h1 className="text-4xl font-bold mb-4 capitalize">{viewName.replace('-', ' ')}</h1>
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Under Development</p>
                    <p>This feature is coming soon. Please check back later!</p>
                </div>
            </div>
        );


        switch(view) {
            case 'chat':
                return <ChatbotView handleError={handleError} />;
            case 'management':
                return <ManagementView handleError={handleError} />;
            case 'dashboard':
                 return <PlaceholderView viewName="Dashboard" />;
            default:
                return <PlaceholderView viewName={view} />;
        }
    };

    return (
         <div className="h-screen bg-cratic-background text-cratic-text-primary flex">
            <Sidebar currentView={view} setView={setView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                {!error && <Header />}
                <main className="flex-grow overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;