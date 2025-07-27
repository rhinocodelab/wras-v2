
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
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
    audioFilePaths: z.array(z.string().nullable()),
});
export type TemplateTranslationOutput = z.infer<typeof TemplateTranslationOutputSchema>;


export const translateTemplateFlow = ai.defineFlow(
    {
        name: 'translateTemplateFlow',
        inputSchema: TemplateTranslationInputSchema,
        outputSchema: TemplateTranslationOutputSchema,
    },
    async ({ template, languageCode, category }) => {
        const placeholderRegex = /({[a-zA-Z0-9_]+})/g;
        
        const parts = template.split(placeholderRegex);
        const audioFilePaths: (string | null)[] = [];

        const audioDir = path.join(process.cwd(), 'public', 'audio', 'templates', category, languageCode);
        await fs.mkdir(audioDir, { recursive: true });

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (placeholderRegex.test(part) || part.trim().length === 0) {
                 // For placeholders or empty strings, we push null and continue
                 audioFilePaths.push(null);
            } else {
                try {
                    // Remove punctuation before generating speech
                    const cleanedPart = part.replace(/[.,]/g, '');
                    
                    const audioContent = await generateSpeech(cleanedPart, languageCode);
                    if (audioContent) {
                        const filePath = path.join(audioDir, `part_${i}.wav`);
                        await fs.writeFile(filePath, audioContent, 'binary');
                        // Store the relative path for web access
                        const relativePath = path.join('/audio', 'templates', category, languageCode, `part_${i}.wav`).replace(/\\/g, '/');
                        audioFilePaths.push(relativePath);
                    } else {
                        audioFilePaths.push(null);
                    }
                    // Add a delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch(e) {
                     console.error(`Error generating speech for part "${part}"`, e);
                     audioFilePaths.push(null);
                }
            }
        }
        
        return { translatedText: template, audioFilePaths };
    }
);
