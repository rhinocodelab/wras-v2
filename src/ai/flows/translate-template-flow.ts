
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
    generateAudio: z.boolean().optional().default(true),
    isTextTranslated: z.boolean().optional().default(false),
});
export type TemplateTranslationInput = z.infer<typeof TemplateTranslationInputSchema>;


const TemplateTranslationOutputSchema = z.object({
    translatedText: z.string(),
    audioParts: z.array(z.string()),
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
    async ({ template, languageCode, category, generateAudio, isTextTranslated }) => {
        const placeholderRegex = /({[a-zA-Z0-9_]+})/g;
        let translatedText = template;

        // 1. Translate the full text template if it hasn't been already
        if (!isTextTranslated) {
            const parts = template.split(placeholderRegex);
            const textToTranslate = parts.filter(part => !placeholderRegex.test(part));
    
            const translatedParts = await Promise.all(
                textToTranslate.map(part => translateText(part, languageCode))
            );
            
            let tempTranslatedText = '';
            let translatedIndex = 0;
            let placeholderIndex = 0;
            const placeholders = template.match(placeholderRegex) || [];
    
            for(const part of parts) {
                if(placeholderRegex.test(part)) {
                    tempTranslatedText += placeholders[placeholderIndex++];
                } else {
                    tempTranslatedText += translatedParts[translatedIndex++];
                }
            }
            translatedText = tempTranslatedText;
        }
        
        // 2. Generate audio for static parts if requested
        const audioParts: string[] = [];
        if (generateAudio) {
            const translatedStaticParts = translatedText.split(placeholderRegex).filter(part => !placeholderRegex.test(part) && part.trim().length > 0);
            const audioDir = path.join(process.cwd(), 'public', 'audio', '_template_parts', category, languageCode);
            await fs.mkdir(audioDir, { recursive: true });
    
            for (let i = 0; i < translatedStaticParts.length; i++) {
                const part = translatedStaticParts[i];
                const audioContent = await generateSpeech(part, languageCode);
                if (audioContent) {
                    const audioPath = path.join(audioDir, `part_${i}.wav`);
                    await fs.writeFile(audioPath, audioContent, 'binary');
                    const publicPath = audioPath.replace(path.join(process.cwd(), 'public'), '');
                    audioParts.push(publicPath);
                }
                // Add a delay to avoid rate-limiting issues with the TTS API
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return { translatedText, audioParts };
    }
);

    