
'use server';

/**
 * @fileOverview A Genkit flow for translating train route data.
 *
 * - translateAllRoutes - A function that handles the translation process for all routes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { TrainRoute, Translation } from '@/app/actions';
import { TranslationServiceClient } from '@google-cloud/translate';
import * as path from 'path';
import * as fs from 'fs';
import { googleAI } from '@genkit-ai/googleai';

const keyFilename = path.join(process.cwd(), 'config', 'isl.json');

async function translateText(text: string, targetLanguage: string): Promise<string> {
    if (!text || targetLanguage === 'en') {
        return text;
    }
    
    const credentials = JSON.parse(fs.readFileSync(keyFilename, 'utf8'));
    const projectId = credentials.project_id;

    const translationClient = new TranslationServiceClient({
        projectId,
        keyFilename,
    });

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

const hindiDigitMap: { [key: string]: string } = {
    '0': 'शून्य',
    '1': 'एक',
    '2': 'दो',
    '3': 'तीन',
    '4': 'चार',
    '5': 'पांच',
    '6': 'छह',
    '7': 'सात',
    '8': 'आठ',
    '9': 'नौ'
};

const translateRouteFlow = ai.defineFlow(
    {
        name: 'translateRouteFlow',
        inputSchema: z.object({ route: z.any(), languageCode: z.string() }),
        outputSchema: z.any(),
    },
    async ({ route, languageCode }) => {
        
        let trainNumberTranslation: string;

        if (languageCode === 'hi') {
            const trainNumberStr = String(route['Train Number']);
            trainNumberTranslation = trainNumberStr.split('').map(digit => hindiDigitMap[digit] || digit).join(' ');
        } else {
            trainNumberTranslation = await translateText(String(route['Train Number']), languageCode);
        }

        const [
            trainNameTranslation,
            startStationTranslation,
            endStationTranslation
        ] = await Promise.all([
            translateText(route['Train Name'], languageCode),
            translateText(route['Start Station'], languageCode),
            translateText(route['End Station'], languageCode),
        ]);

        return {
            route_id: route.id,
            language_code: languageCode,
            train_number_translation: trainNumberTranslation,
            train_name_translation: trainNameTranslation,
            start_station_translation: startStationTranslation,
            end_station_translation: endStationTranslation,
        };
    }
);

export async function translateAllRoutes(routes: TrainRoute[]): Promise<Translation[]> {
  const allTranslations: Translation[] = [];
  
  for (const route of routes) {
      if (!route.id) continue;
      
      const languagePromises = ['en', 'mr', 'hi', 'gu'].map(langCode => 
        translateRouteFlow({route, languageCode: langCode})
      );
      
      const results = await Promise.all(languagePromises);
      allTranslations.push(...results);
  }

  return allTranslations;
}
