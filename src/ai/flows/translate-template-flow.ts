
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { TranslationServiceClient } from '@google-cloud/translate';

async function translateText(text: string, targetLanguage: string): Promise<string> {
    if (!text || targetLanguage === 'en') {
        return text;
    }
    const translationClient = new TranslationServiceClient();
    const projectId = (await translationClient.getProjectId());

    try {
        const [response] = await translationClient.translateText({
            parent: `projects/${projectId}/locations/global`,
            contents: [text],
            mimeType: 'text/plain',
            sourceLanguageCode: 'en',
            targetLanguageCode: targetLanguage,
        });

        if (response.translations && response.translations.length > 0 && response.translations[0].translatedText) {
            return response.translations[0].translatedText;
        }
        
        return text; 
    } catch (error) {
        console.error(`Error during translation from 'en' to '${targetLanguage}':`, error);
        return text;
    }
}

export const translateTemplateFlow = ai.defineFlow(
    {
        name: 'translateTemplateFlow',
        inputSchema: z.object({ template: z.string(), languageCode: z.string() }),
        outputSchema: z.string(),
    },
    async ({ template, languageCode }) => {
        if (languageCode === 'en') {
            return template;
        }

        const placeholderRegex = /({[a-zA-Z0-9_]+})/g;
        const parts = template.split(placeholderRegex);
        const placeholders = template.match(placeholderRegex) || [];
        const textToTranslate = parts.filter(part => !placeholderRegex.test(part));

        const translatedParts = await Promise.all(
            textToTranslate.map(part => translateText(part, languageCode))
        );
        
        // Reconstruct the template
        let result = '';
        let translatedIndex = 0;
        let placeholderIndex = 0;

        for(const part of parts) {
            if(placeholderRegex.test(part)) {
                result += placeholders[placeholderIndex++];
            } else {
                result += translatedParts[translatedIndex++];
            }
        }
        
        return result;
    }
);
