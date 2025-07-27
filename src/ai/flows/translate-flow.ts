'use server';

/**
 * @fileOverview A Genkit flow for translating train route data.
 *
 * - translateAllRoutes - A function that handles the translation process for all routes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { TrainRoute, Translation } from '@/app/actions';
import { Translate } from '@google-cloud/translate/build/src/v2';

// Define language codes
const LANGUAGES = {
    'en-IN': 'en',
    'mr-IN': 'mr',
    'hi-IN': 'hi',
    'gu-IN': 'gu',
};

// Instantiate the Google Cloud Translation client
// It will automatically use credentials from the environment.
const translateClient = new Translate();

async function translateText(text: string, languageCode: string): Promise<string> {
    const targetLanguage = LANGUAGES[languageCode as keyof typeof LANGUAGES];
    if (!targetLanguage) {
        throw new Error(`Language code '${languageCode}' not supported.`);
    }

    // Use the Google Cloud Translation API
    try {
        const [translation] = await translateClient.translate(text, targetLanguage);
        return translation;
    } catch (error) {
        console.error('Error during translation:', error);
        // Fallback to original text in case of an error
        return text;
    }
}


const translateRouteFlow = ai.defineFlow(
    {
        name: 'translateRouteFlow',
        inputSchema: z.object({ route: z.any(), languageCode: z.string() }),
        outputSchema: z.any(),
    },
    async ({ route, languageCode }) => {
        
        const trainNumberFormatted = route['Train Number'].split('').join(' ');

        const [
            trainNumberTranslation,
            trainNameTranslation,
            startStationTranslation,
            endStationTranslation
        ] = await Promise.all([
            translateText(trainNumberFormatted, languageCode),
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
      
      const languagePromises = Object.keys(LANGUAGES).map(langCode => 
        translateRouteFlow({route, languageCode: langCode})
      );
      
      const results = await Promise.all(languagePromises);
      allTranslations.push(...results);
  }

  return allTranslations;
}
