/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback } from 'react';
import { RagStore, Document, QueryResult, CustomMetadata, LanguageCode } from '../types';
import * as geminiService from '../services/geminiService';
import RagStoreList from './RagStoreList';
import DocumentList from './DocumentList';
import QueryInterface from './QueryInterface';

interface ManagementViewProps {
    handleError: (message: string, err: any) => void;
}

const ManagementView: React.FC<ManagementViewProps> = ({ handleError }) => {
    const [stores, setStores] = useState<RagStore[]>([]);
    const [selectedStore, setSelectedStore] = useState<RagStore | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
    const [language, setLanguage] = useState<LanguageCode>('en');
    
    const [isLoadingStores, setIsLoadingStores] = useState(true);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
    const [isQuerying, setIsQuerying] = useState(false);
    const [processingFile, setProcessingFile] = useState<string | null>(null);

    const loadStores = useCallback(async () => {
        setIsLoadingStores(true);
        try {
            geminiService.initialize();
            const fetchedStores = await geminiService.listRagStores();
            setStores(fetchedStores);
        } catch (err) {
            handleError("Failed to load document stores", err);
        } finally {
            setIsLoadingStores(false);
        }
    }, [handleError]);

    useEffect(() => {
        loadStores();
    }, [loadStores]);

    useEffect(() => {
        if (selectedStore) {
            const loadDocuments = async () => {
                setIsLoadingDocuments(true);
                setDocuments([]);
                try {
                    const fetchedDocs = await geminiService.listDocumentsInStore(selectedStore.name);
                    setDocuments(fetchedDocs);
                } catch (err) {
                    handleError(`Failed to load documents for ${selectedStore.displayName}`, err);
                } finally {
                    setIsLoadingDocuments(false);
                }
            };
            loadDocuments();
        } else {
            setDocuments([]);
        }
        setQueryResult(null);
    }, [selectedStore, handleError]);

    const handleCreateStore = async (displayName: string) => {
        try {
            await geminiService.createRagStore(displayName);
            await loadStores();
        } catch (err) {
            handleError("Failed to create store", err);
        }
    };
    
    const handleDeleteStore = async (storeName: string) => {
        if (window.confirm("Are you sure you want to delete this store and all its documents? This action cannot be undone.")) {
            try {
                await geminiService.deleteRagStore(storeName);
                if (selectedStore?.name === storeName) {
                    setSelectedStore(null);
                }
                await loadStores();
            } catch (err) {
                handleError("Failed to delete store", err);
            }
        }
    };
    
    const handleUploadDocument = async (file: File, metadata: CustomMetadata[]) => {
        if (!selectedStore) return;
        setProcessingFile(file.name);
        try {
            await geminiService.uploadDocument(selectedStore.name, file, metadata);
            const fetchedDocs = await geminiService.listDocumentsInStore(selectedStore.name);
            setDocuments(fetchedDocs);
        } catch (err) {
            handleError(`Failed to upload ${file.name}`, err);
        } finally {
            setProcessingFile(null);
        }
    };

    const handleDeleteDocument = async (docName: string) => {
         if (!selectedStore) return;
        if (window.confirm("Are you sure you want to delete this document?")) {
            try {
                await geminiService.deleteDocument(docName);
                setDocuments(docs => docs.filter(d => d.name !== docName));
            } catch (err) {
                handleError("Failed to delete document", err);
            }
        }
    };

    const handleQuery = async (query: string) => {
        if (!selectedStore) return;
        setIsQuerying(true);
        setQueryResult(null);
        try {
            const result = await geminiService.fileSearch(selectedStore.name, query, language);
            setQueryResult(result);
        } catch (err) {
            handleError("Failed to execute query", err);
        } finally {
            setIsQuerying(false);
        }
    };


    return (
        <div className="grid grid-cols-1 md:grid-cols-12 h-full">
            <div className="md:col-span-3 bg-cratic-subtle p-4 border-r border-cratic-border overflow-y-auto">
                <RagStoreList 
                    stores={stores}
                    selectedStore={selectedStore}
                    isLoading={isLoadingStores}
                    onCreate={handleCreateStore}
                    onSelect={setSelectedStore}
                    onDelete={handleDeleteStore}
                    onRefresh={loadStores}
                />
            </div>
            <div className="md:col-span-5 bg-cratic-panel p-4 border-r border-cratic-border overflow-y-auto">
                <DocumentList 
                    selectedStore={selectedStore}
                    documents={documents}
                    isLoading={isLoadingDocuments}
                    processingFile={processingFile}
                    onUpload={handleUploadDocument}
                    onDelete={handleDeleteDocument}
                />
            </div>
            <div className="md:col-span-4 bg-cratic-panel p-4 overflow-y-auto">
                <QueryInterface 
                    selectedStore={selectedStore}
                    isLoading={isQuerying}
                    result={queryResult}
                    onQuery={handleQuery}
                    language={language}
                    onLanguageChange={setLanguage}
                />
            </div>
        </div>
    );
};

export default ManagementView;