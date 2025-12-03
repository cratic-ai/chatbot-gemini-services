/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { AppStatus, ChatMessage, LanguageCode } from '../types';
import * as geminiService from '../services/geminiService';
import Spinner from './Spinner';
import WelcomeScreen from './WelcomeScreen';
import ProgressBar from './ProgressBar';
import ChatInterface from './ChatInterface';

interface ChatbotViewProps {
    handleError: (message: string, err: any) => void;
}

const ChatbotView: React.FC<ChatbotViewProps> = ({ handleError }) => {
    const [status, setStatus] = useState<AppStatus>(AppStatus.Initializing);
    const [uploadProgress, setUploadProgress] = useState<{ current: number, total: number, message?: string, fileName?: string } | null>(null);
    const [activeRagStoreName, setActiveRagStoreName] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isQueryLoading, setIsQueryLoading] = useState(false);
    const [exampleQuestions, setExampleQuestions] = useState<string[]>([]);
    const [documentName, setDocumentName] = useState<string>('');
    const [files, setFiles] = useState<File[]>([]);
    const [language, setLanguage] = useState<LanguageCode>('en');
    const ragStoreNameRef = useRef(activeRagStoreName);

    useEffect(() => {
        ragStoreNameRef.current = activeRagStoreName;
    }, [activeRagStoreName]);
    
    useEffect(() => {
        const handleUnload = () => {
            if (ragStoreNameRef.current) {
                geminiService.deleteRagStore(ragStoreNameRef.current)
                    .catch(err => console.error("Error deleting RAG store on unload:", err));
            }
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, []);

    useEffect(() => {
        setStatus(AppStatus.Welcome);
    }, []);

    useEffect(() => {
        const loadSuggestions = async () => {
            if (status === AppStatus.Chatting && activeRagStoreName) {
                // To prevent showing old suggestions while new ones load
                setExampleQuestions([]);
                try {
                    const questions = await geminiService.generateExampleQuestions(activeRagStoreName, language);
                    setExampleQuestions(questions);
                } catch (err) {
                    console.error("Failed to load example questions:", err);
                    // Silently fail on suggestion generation
                    setExampleQuestions([]);
                }
            }
        };
        loadSuggestions();
    }, [language, status, activeRagStoreName]);

    const handleUploadAndStartChat = async () => {
        if (files.length === 0) return;
        
        try {
            geminiService.initialize();
        } catch (err) {
            handleError("Initialization failed. Please select a valid API Key.", err);
            throw err;
        }
        
        setStatus(AppStatus.Uploading);
        
        const totalProgress = 100;
        const storeCreationWeight = 5;
        const embeddingWeight = 95;

        setUploadProgress({ current: 0, total: totalProgress, message: "Creating document index..." });

        try {
            const storeName = `chat-session-${Date.now()}`;
            const ragStoreName = await geminiService.createRagStore(storeName);
            
            setUploadProgress({ current: storeCreationWeight, total: totalProgress, message: "Generating embeddings..." });

            const embeddingPerFile = files.length > 0 ? embeddingWeight / files.length : 0;

            for (let i = 0; i < files.length; i++) {
                const progressBeforeFile = storeCreationWeight + (i * embeddingPerFile);
                setUploadProgress(prev => ({ 
                    ...(prev!),
                    current: Math.round(progressBeforeFile),
                    total: totalProgress,
                    message: "Generating embeddings...",
                    fileName: `(${i + 1}/${files.length}) ${files[i].name}`
                }));
                await geminiService.uploadToRagStore(ragStoreName, files[i]);
            }
            
            setUploadProgress({ current: totalProgress, total: totalProgress, message: "All set!", fileName: "" });
            
            await new Promise(resolve => setTimeout(resolve, 500));

            let docName = '';
            if (files.length === 1) {
                docName = files[0].name;
            } else if (files.length === 2) {
                docName = `${files[0].name} & ${files[1].name}`;
            } else {
                docName = `${files.length} SOPs`;
            }
            setDocumentName(docName);

            setActiveRagStoreName(ragStoreName);
            setChatHistory([]);
            setStatus(AppStatus.Chatting);
            setFiles([]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
            if (errorMessage.includes('api key not valid') || errorMessage.includes('requested entity was not found')) {
                handleError("The provided API key is invalid. Please configure a valid key and try again.", null);
            } else {
                handleError("Failed to start chat session", err);
            }
            setStatus(AppStatus.Welcome); // Reset to welcome on failure
            throw err;
        } finally {
            setUploadProgress(null);
        }
    };

    const handleEndChat = () => {
        if (activeRagStoreName) {
            geminiService.deleteRagStore(activeRagStoreName).catch(err => {
                console.error("Failed to delete RAG store in background", err);
            });
        }
        setActiveRagStoreName(null);
        setChatHistory([]);
        setExampleQuestions([]);
        setDocumentName('');
        setFiles([]);
        setStatus(AppStatus.Welcome);
    };

    const handleSendMessage = async (message: string) => {
        if (!activeRagStoreName) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
        setChatHistory(prev => [...prev, userMessage]);
        setIsQueryLoading(true);

        try {
            const result = await geminiService.fileSearch(activeRagStoreName, message, language);
            const modelMessage: ChatMessage = {
                role: 'model',
                parts: [{ text: result.text }],
                groundingChunks: result.groundingChunks
            };
            setChatHistory(prev => [...prev, modelMessage]);
        } catch (err) {
            const errorMessage: ChatMessage = {
                role: 'model',
                parts: [{ text: "Sorry, I encountered an error. Please try again." }]
            };
            setChatHistory(prev => [...prev, errorMessage]);
            handleError("Failed to get response", err);
        } finally {
            setIsQueryLoading(false);
        }
    };
    
    const renderContent = () => {
        switch(status) {
            case AppStatus.Initializing:
                return (
                    <div className="flex items-center justify-center h-full">
                        <Spinner /> <span className="ml-4 text-xl">Initializing...</span>
                    </div>
                );
            case AppStatus.Welcome:
                 return <WelcomeScreen onUpload={handleUploadAndStartChat} files={files} setFiles={setFiles} />;
            case AppStatus.Uploading:
                let icon = null;
                if (uploadProgress?.message === "Creating document index...") {
                    icon = <img src="https://services.google.com/fh/files/misc/applet-upload.png" alt="Uploading files icon" className="h-80 w-80 rounded-lg object-cover" />;
                } else if (uploadProgress?.message === "Generating embeddings...") {
                    icon = <img src="https://services.google.com/fh/files/misc/applet-creating-embeddings_2.png" alt="Creating embeddings icon" className="h-240 w-240 rounded-lg object-cover" />;
                } else if (uploadProgress?.message === "Generating suggestions...") {
                    icon = <img src="https://services.google.com/fh/files/misc/applet-suggestions_2.png" alt="Generating suggestions icon" className="h-240 w-240 rounded-lg object-cover" />;
                } else if (uploadProgress?.message === "All set!") {
                    icon = <img src="https://services.google.com/fh/files/misc/applet-completion_2.png" alt="Completion icon" className="h-240 w-240 rounded-lg object-cover" />;
                }

                return <ProgressBar 
                    progress={uploadProgress?.current || 0} 
                    total={uploadProgress?.total || 1} 
                    message={uploadProgress?.message || "Preparing your chat..."} 
                    fileName={uploadProgress?.fileName}
                    icon={icon}
                />;
            case AppStatus.Chatting:
                return <ChatInterface 
                    documentName={documentName}
                    history={chatHistory}
                    isQueryLoading={isQueryLoading}
                    onSendMessage={handleSendMessage}
                    onNewChat={handleEndChat}
                    suggestions={exampleQuestions}
                    language={language}
                    onLanguageChange={setLanguage}
                />;
            default:
                 return <WelcomeScreen onUpload={handleUploadAndStartChat} files={files} setFiles={setFiles} />;
        }
    }

    return (
       <div className="h-full bg-cratic-panel">
         {renderContent()}
       </div>
    );
};

export default ChatbotView;