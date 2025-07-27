
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

const LANGUAGES = ['en', 'mr', 'hi', 'gu'];

async function translateText(text: string, targetLanguage: string): Promise<string> {
    // If the target language is English, just return the original text.
    if (targetLanguage === 'en') {
        return text;
    }

    const projectId = process.env.GCP_PROJECT_ID;
    if (!projectId) {
        throw new Error('GCP_PROJECT_ID environment variable not set.');
    }
    const location = 'global';

    // Instantiates a client within the function scope to ensure proper credential handling.
    const translationClient = new TranslationServiceClient();

    // Construct the request for the Translation API.
    const request = {
        parent: `projects/${projectId}/locations/${location}`,
        contents: [text],
        mimeType: 'text/plain',
        sourceLanguageCode: 'en', // Source is always English
        targetLanguageCode: targetLanguage,
    };

    try {
        const [response] = await translationClient.translateText(request);
        // If the translation is successful and text is returned, use it.
        if (response.translations && response.translations.length > 0 && response.translations[0].translatedText) {
            return response.translations[0].translatedText;
        }
        // Fallback to original text if translation returns no text.
        return text; 
    } catch (error) {
        console.error(`Error during translation from 'en' to '${targetLanguage}':`, error);
        // Fallback to original text in case of an API error.
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
      
      const languagePromises = LANGUAGES.map(langCode => 
        translateRouteFlow({route, languageCode: langCode})
      );
      
      const results = await Promise.all(languagePromises);
      allTranslations.push(...results);
  }

  return allTranslations;
}
