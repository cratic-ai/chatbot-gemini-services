/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { RagStore, Document, QueryResult, CustomMetadata, supportedLanguages, LanguageCode } from '../types';

let ai: GoogleGenAI;


export function initialize() {
    ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY; });
 }

async function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


// FIX: The list() method returns a Pager, which is an async iterable.
// The response object does not have a `fileSearchStores` property.
// We need to iterate over the Pager to collect the stores.
export async function listRagStores(): Promise<RagStore[]> {
    if (!ai) throw new Error("Gemini AI not initialized");
    const response = await ai.fileSearchStores.list();
    const stores: RagStore[] = [];
    for await (const store of response) {
        // FIX: The `name` property on the returned `FileSearchStore` is optional, but required by `RagStore`.
        // Check for its existence to satisfy the `RagStore` type.
        if (store.name && store.displayName) {
            stores.push({ name: store.name, displayName: store.displayName });
        }
    }
    return stores;
}

// FIX: The method to list files is `files.list` and it returns a Pager.
// The method `listFiles` does not exist. We need to iterate over the Pager to collect documents.
export async function listDocumentsInStore(ragStoreName: string): Promise<Document[]> {
    if (!ai) throw new Error("Gemini AI not initialized");
    // FIX: The correct service for file operations is `ai.files`, not `ai.fileSearchStores.files`.
    const response = await ai.files.list();
    // The API returns File objects, which match our Document type definition
    const documents: Document[] = [];
    for await (const doc of response) {
        // Since we cannot filter by parent in the API call due to type limitations,
        // we filter the results client-side.
        if (doc.name?.startsWith(`${ragStoreName}/`)) {
            documents.push(doc as Document);
        }
    }
    return documents;
}

export async function createRagStore(displayName: string): Promise<string> {
    if (!ai) throw new Error("Gemini AI not initialized");
    const ragStore = await ai.fileSearchStores.create({ config: { displayName } });
    if (!ragStore.name) {
        throw new Error("Failed to create RAG store: name is missing.");
    }
    return ragStore.name;
}

export async function uploadToRagStore(ragStoreName: string, file: File): Promise<void> {
    if (!ai) throw new Error("Gemini AI not initialized");
    
    let op = await ai.fileSearchStores.uploadToFileSearchStore({
        fileSearchStoreName: ragStoreName,
        file: file
    });

    while (!op.done) {
        await delay(3000);
        op = await ai.operations.get({operation: op});
    }
}

export async function uploadDocument(ragStoreName: string, file: File, metadata: CustomMetadata[]): Promise<void> {
    if (!ai) throw new Error("Gemini AI not initialized");
    
    // FIX: `ai.files.upload` was used incorrectly as it cannot associate files with a RAG store. Switched to `uploadToFileSearchStore` which correctly uploads a file to a specified store with metadata, and polls for completion of the long-running operation.
    let op = await ai.fileSearchStores.uploadToFileSearchStore({
        fileSearchStoreName: ragStoreName,
        file: file,
        displayName: file.name,
        customMetadata: metadata,
    });

    while (!op.done) {
        await delay(3000);
        op = await ai.operations.get({operation: op});
    }
}

export async function fileSearch(ragStoreName: string, query: string, language: LanguageCode): Promise<QueryResult> {
    if (!ai) throw new Error("Gemini AI not initialized");
    const languageName = supportedLanguages[language] || 'the user\'s query language';
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${query}\n\nIMPORTANT: Please respond in ${languageName}. DO NOT ASK THE USER TO READ THE MANUAL, pinpoint the relevant sections in the response itself.`,
        config: {
            tools: [
                    {
                        fileSearch: {
                            fileSearchStoreNames: [ragStoreName],
                        }
                    }
                ]
        }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {
        text: response.text,
        groundingChunks: groundingChunks,
    };
}

export async function generateExampleQuestions(ragStoreName: string, language: LanguageCode): Promise<string[]> {
    if (!ai) throw new Error("Gemini AI not initialized");
    const languageName = supportedLanguages[language] || 'English';
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are provided with Standard Operating Procedure (SOP) documents from a manufacturing environment. For each document, generate 4 short and practical example questions a user might ask about the procedures in ${languageName}. Return the questions as a JSON array of objects. Each object should have a 'product' key (representing the SOP topic, e.g., 'Machine Calibration') and a 'questions' key with an array of 4 question strings. For example: \`\`\`json[{\"product\": \"Machine Calibration SOP\", \"questions\": [\"What is the first step in calibration?\", \"How often should this machine be calibrated?\"]}, {\"product\": \"Assembly Line Safety\", \"questions\": [\"What personal protective equipment is required?\", \"What is the emergency shutdown procedure?\"]}]\`\`\``,
            config: {
                tools: [
                    {
                        fileSearch: {
                            fileSearchStoreNames: [ragStoreName],
                        }
                    }
                ]
            }
        });
        
        let jsonText = response.text.trim();

        const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            jsonText = jsonMatch[1];
        } else {
            const firstBracket = jsonText.indexOf('[');
            const lastBracket = jsonText.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                jsonText = jsonText.substring(firstBracket, lastBracket + 1);
            }
        }
        
        const parsedData = JSON.parse(jsonText);
        
        if (Array.isArray(parsedData)) {
            if (parsedData.length === 0) {
                return [];
            }
            const firstItem = parsedData[0];

            if (typeof firstItem === 'object' && firstItem !== null && 'questions' in firstItem && Array.isArray(firstItem.questions)) {
                return parsedData.flatMap(item => (item.questions || [])).filter(q => typeof q === 'string');
            }
            
            if (typeof firstItem === 'string') {
                return parsedData.filter(q => typeof q === 'string');
            }
        }
        
        console.warn("Received unexpected format for example questions:", parsedData);
        return [];
    } catch (error) {
        console.error("Failed to generate or parse example questions:", error);
        return [];
    }
}

export async function deleteRagStore(ragStoreName: string): Promise<void> {
    if (!ai) throw new Error("Gemini AI not initialized");
    await ai.fileSearchStores.delete({
        name: ragStoreName,
        config: { force: true },
    });
}

export async function deleteDocument(documentName: string): Promise<void> {
    if (!ai) throw new Error("Gemini AI not initialized");
    // FIX: The method to delete a file is `files.delete`, not `deleteFile`.
    // FIX: The correct service for file operations is `ai.files`, not `ai.fileSearchStores.files`.
    await ai.files.delete({ name: documentName });
}