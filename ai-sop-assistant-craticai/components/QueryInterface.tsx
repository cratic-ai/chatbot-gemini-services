/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { RagStore, QueryResult, LanguageCode, supportedLanguages, languageFlags } from '../types';
import Spinner from './Spinner';
import SendIcon from './icons/SendIcon';

interface QueryInterfaceProps {
    selectedStore: RagStore | null;
    isLoading: boolean;
    result: QueryResult | null;
    onQuery: (query: string) => void;
    language: LanguageCode;
    onLanguageChange: (lang: LanguageCode) => void;
}

const QueryInterface: React.FC<QueryInterfaceProps> = ({ selectedStore, isLoading, result, onQuery, language, onLanguageChange }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onQuery(query);
            setQuery('');
        }
    };
    
    if (!selectedStore) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-center text-cratic-text-secondary">
                 <p className="text-lg">Select a Document Store</p>
                <p>to start asking questions.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold truncate" title={selectedStore.displayName}>Query: {selectedStore.displayName}</h2>
                <div className="relative">
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                        className="appearance-none bg-cratic-subtle border border-cratic-border rounded-full py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-cratic-purple"
                        aria-label="Select language"
                    >
                        {Object.entries(supportedLanguages).map(([code, name]) => (
                            <option key={code} value={code}>
                                {languageFlags[code as LanguageCode]} {name}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-cratic-text-secondary">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-6">
                 {isLoading && (
                    <div className="flex items-center justify-center p-4">
                        <Spinner /> <span className="ml-3 text-cratic-text-secondary">Searching...</span>
                    </div>
                )}
                {result && (
                    <div>
                        <div className="bg-cratic-subtle p-4 rounded-lg">
                            <h3 className="font-semibold text-cratic-purple mb-2">Answer</h3>
                            <p className="whitespace-pre-wrap">{result.text}</p>
                        </div>
                        {result.groundingChunks.length > 0 && (
                             <div className="mt-4">
                                <h3 className="font-semibold text-cratic-purple mb-2">Sources</h3>
                                <div className="space-y-2">
                                {result.groundingChunks.map((chunk, index) => (
                                    chunk.retrievedContext?.text && (
                                        <details key={index} className="bg-cratic-subtle/50 p-3 rounded-lg text-sm">
                                            <summary className="cursor-pointer font-medium">Source Chunk {index + 1}</summary>
                                            <p className="mt-2 text-cratic-text-secondary">{chunk.retrievedContext.text}</p>
                                        </details>
                                    )
                                ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                 {!result && !isLoading && (
                    <div className="flex h-full items-center justify-center text-cratic-text-secondary">
                        <p>Ask a question about the documents.</p>
                    </div>
                )}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-grow bg-cratic-subtle border border-cratic-border rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cratic-purple"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !query.trim()} className="p-3 bg-cratic-purple hover:bg-cratic-purple-hover rounded-full text-white disabled:bg-slate-300 transition-colors" title="Send query">
                    <SendIcon />
                </button>
            </form>
        </div>
    );
};

export default QueryInterface;