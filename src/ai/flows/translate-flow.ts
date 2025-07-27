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

// Define language codes
const LANGUAGES: Record<string, string> = {
    'en-IN': 'en',
    'mr-IN': 'mr',
    'hi-IN': 'hi',
    'gu-IN': 'gu',
};

const translationClient = new TranslationServiceClient();

async function translateText(text: string, languageCode: string): Promise<string> {
    const targetLanguage = LANGUAGES[languageCode];
    if (!targetLanguage || targetLanguage === 'en') {
        return text;
    }

    const projectId = process.env.GCP_PROJECT_ID;
    if (!projectId) {
        throw new Error('GCP_PROJECT_ID environment variable not set.');
    }
    const location = 'global';

    const request = {
        parent: `projects/${projectId}/locations/${location}`,
        contents: [text],
        mimeType: 'text/plain',
        sourceLanguageCode: 'en',
        targetLanguageCode: targetLanguage,
    };

    try {
        const [response] = await translationClient.translateText(request);
        if (response.translations && response.translations.length > 0 && response.translations[0].translatedText) {
            return response.translations[0].translatedText;
        }
        return text; // Fallback to original text if translation is empty
    } catch (error) {
        console.error(`Error during translation to ${targetLanguage}:`, error);
        return text; // Fallback to original text on error
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
