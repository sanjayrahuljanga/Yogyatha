import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Scheme, Language } from '../types';

// This interface is used in AdminDashboard
export interface AiScheme extends Omit<Scheme, 'id' | 'name' | 'description' | 'benefits' | 'documents' | 'score'> {
    name: string;
    description: string;
    benefits: string[];
    documents: string[];
}

// FIX: Initialize GoogleGenAI with a named apiKey parameter, sourcing the key from environment variables.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

const findNewSchemesSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "Official name of the scheme." },
            description: { type: Type.STRING, description: "A concise, one-sentence description." },
            eligibility: {
                type: Type.OBJECT,
                properties: {
                    minAge: { type: Type.NUMBER },
                    maxAge: { type: Type.NUMBER },
                    maxIncome: { type: Type.NUMBER },
                    states: { type: Type.ARRAY, items: { type: Type.STRING } },
                    categories: { type: Type.ARRAY, items: { type: Type.STRING, enum: ['General', 'SC', 'ST', 'OBC', 'EWS'] } },
                    roles: { type: Type.ARRAY, items: { type: Type.STRING, enum: ['Citizen', 'Student', 'Farmer', 'Entrepreneur', 'Job Seeker'] } },
                },
                required: ["minAge", "maxAge", "maxIncome", "states", "categories", "roles"],
            },
            benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
            documents: { type: Type.ARRAY, items: { type: Type.STRING } },
            applyLink: { type: Type.STRING, description: "The direct, official application link." },
            sourceUrl: { type: Type.STRING, description: "The source URL where the information was found." },
            icon: { type: Type.STRING, description: "A relevant icon name from the provided list.", enum: ['users', 'leaf', 'academic-cap', 'light-bulb', 'home', 'briefcase', 'currency-rupee', 'tag', 'shield-check', 'gift'] }
        },
        required: ["name", "description", "eligibility", "benefits", "documents", "applyLink", "sourceUrl", "icon"],
    },
};

const enrichSchemeSchema = {
    type: Type.OBJECT,
    properties: {
        name: {
            type: Type.OBJECT,
            properties: {
                hi: { type: Type.STRING, description: "Scheme name translated to Hindi" },
                te: { type: Type.STRING, description: "Scheme name translated to Telugu" },
            },
        },
        description: {
            type: Type.OBJECT,
            properties: {
                hi: { type: Type.STRING, description: "Scheme description translated to Hindi" },
                te: { type: Type.STRING, description: "Scheme description translated to Telugu" },
            },
        },
        benefits: {
            type: Type.OBJECT,
            properties: {
                hi: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of benefits translated to Hindi" },
                te: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of benefits translated to Telugu" },
            },
        },
        documents: {
            type: Type.OBJECT,
            properties: {
                hi: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of documents translated to Hindi" },
                te: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of documents translated to Telugu" },
            },
        },
    },
};

const applicationStepsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.STRING,
        description: "A single step in the application process."
    }
};

export const geminiService = {
    findNewSchemes: async (topic: string): Promise<AiScheme[]> => {
        const prompt = `Find up to 3 real government schemes in India related to "${topic}". For each scheme, provide a concise name, a one-sentence description, key eligibility criteria (min/max age, max income, states, categories, roles), a list of benefits, a list of required documents, an official application link, and the source URL where you found the information. Also suggest a relevant icon from this list: 'users', 'leaf', 'academic-cap', 'light-bulb', 'home', 'briefcase', 'currency-rupee', 'tag', 'shield-check', 'gift'.`;

        try {
            const response = await ai.models.generateContent({
               model: "gemini-2.5-pro", // Using a more powerful model for structured data generation
               contents: prompt,
               config: {
                 responseMimeType: "application/json",
                 responseSchema: findNewSchemesSchema,
               },
            });
            // FIX: Access the .text property and parse the resulting JSON string.
            const jsonText = response.text.trim();
            return JSON.parse(jsonText) as AiScheme[];
        } catch (error) {
            console.error("Error finding new schemes:", error);
            throw new Error("Failed to fetch new schemes from AI service.");
        }
    },

    enrichSchemeWithAI: async (scheme: Scheme): Promise<Partial<Scheme>> => {
        const prompt = `Translate the following scheme details into Hindi and Telugu.
        Scheme Name: ${scheme.name.en}
        Description: ${scheme.description.en}
        Benefits: ${scheme.benefits.en.join(', ')}
        Documents: ${scheme.documents.en.join(', ')}
        
        Provide the translations in the specified JSON format.`;

        try {
            const response = await ai.models.generateContent({
               model: "gemini-2.5-flash", // Flash is sufficient for translation tasks
               contents: prompt,
               config: {
                 responseMimeType: "application/json",
                 responseSchema: enrichSchemeSchema,
               },
            });
            const jsonText = response.text.trim();
            const parsed = JSON.parse(jsonText);
            // Re-structure to match the Scheme type
            return {
                name: { ...scheme.name, ...parsed.name },
                description: { ...scheme.description, ...parsed.description },
                benefits: { ...scheme.benefits, ...parsed.benefits },
                documents: { ...scheme.documents, ...parsed.documents },
            };
        } catch (error) {
            console.error("Error enriching scheme:", error);
            throw new Error("Failed to enrich scheme with AI translations.");
        }
    },
    
    generateEasySummary: async (scheme: Scheme, language: Language): Promise<string> => {
        const prompt = `Explain the following government scheme in very simple terms, as if for a 5th grader. Keep it under 50 words.
        Scheme Name: ${scheme.name[language]}
        Description: ${scheme.description[language]}
        Benefits: ${scheme.benefits[language].join(', ')}`;
        
        try {
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
            // FIX: Access the .text property directly for text responses.
            return response.text.trim();
        } catch (error) {
            console.error("Error generating easy summary:", error);
            throw new Error("Failed to generate summary.");
        }
    },
    
    getAiAnswer: async (question: string, context: Scheme[]): Promise<string> => {
        const contextString = context.map(s => `Scheme: ${s.name.en}\nSummary: ${s.description.en}`).join('\n\n');
        const prompt = `Based on the following government schemes, answer the user's question. If the answer isn't in the provided context, say that you don't have information on that topic.
        
        Context:\n${contextString}
        
        Question: ${question}`;
        
         try {
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
            return response.text.trim();
        } catch (error) {
            console.error("Error getting AI answer:", error);
            throw new Error("Failed to get answer from AI.");
        }
    },

    generateApplicationSteps: async (schemeName: string): Promise<string[]> => {
        const prompt = `Generate a generic, step-by-step guide on how to typically apply for a government scheme in India named "${schemeName}". The guide should be practical for a citizen. Provide the output as a simple JSON array of strings, where each string is one step. For example: ["Gather required documents like Aadhaar and PAN card.", "Visit the official scheme website.", ...]. Do not include any introductory text, just the array.`;
    
        try {
            const response = await ai.models.generateContent({
               model: "gemini-2.5-flash",
               contents: prompt,
               config: {
                 responseMimeType: "application/json",
                 responseSchema: applicationStepsSchema,
               },
            });
            const jsonText = response.text.trim();
            const steps = JSON.parse(jsonText);
            // Ensure the result is an array of strings
            if (Array.isArray(steps) && steps.every(s => typeof s === 'string')) {
                return steps;
            }
            throw new Error("AI returned data in an unexpected format.");
        } catch (error) {
            console.error("Error generating application steps:", error);
            // Provide a fallback generic set of steps
            return [
                "Visit the scheme's official website.",
                "Find and read the application guidelines carefully.",
                "Register or log in to the portal.",
                "Fill out the application form with accurate details.",
                "Upload scanned copies of all required documents.",
                "Review and submit your application.",
                "Save the application number for future reference."
            ];
        }
    }
};