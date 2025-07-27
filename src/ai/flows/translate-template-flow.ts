
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { TranslationServiceClient } from '@google-cloud/translate';
import { generateSpeech } from './tts-flow';
import * as fs from 'fs/promises';
import * as path from 'path';

const TemplateTranslationInputSchema = z.object({
    template: z.string(),
    languageCode: z.string(),
    category: z.string(),
});
export type TemplateTranslationInput = z.infer<typeof TemplateTranslationInputSchema>;


const TemplateTranslationOutputSchema = z.object({
    translatedText: z.string(),
});
export type TemplateTranslationOutput = z.infer<typeof TemplateTranslationOutputSchema>;


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
        inputSchema: TemplateTranslationInputSchema,
        outputSchema: TemplateTranslationOutputSchema,
    },
    async ({ template, languageCode, category }) => {
        const placeholderRegex = /({[a-zA-Z0-9_]+})/g;
        
        // 1. Translate the text parts of the template
        const parts = template.split(placeholderRegex);
        
        const translatedTextParts = await Promise.all(
            parts.map(part => {
                if (placeholderRegex.test(part) || part.trim().length === 0) {
                    return Promise.resolve(part);
                }
                return translateText(part, languageCode);
            })
        );
        
        const translatedText = translatedTextParts.join('');

        return { translatedText };
    }
);
