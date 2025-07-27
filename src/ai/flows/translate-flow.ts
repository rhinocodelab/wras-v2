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
import * as fs from 'fs';
import * as path from 'path';

const LANGUAGES = ['en', 'mr', 'hi', 'gu'];

// Function to read the service account configuration
function getTranslationConfig() {
    const configPath = path.join(process.cwd(), 'config', 'isl.json');
    if (!fs.existsSync(configPath)) {
        throw new Error("Service account file not found at 'config/isl.json'");
    }
    const configFile = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configFile);
    return {
        projectId: config.project_id,
        credentials: {
            client_email: config.client_email,
            private_key: config.private_key,
        }
    };
}


async function translateText(text: string, targetLanguage: string): Promise<string> {
    if (!text || targetLanguage === 'en') {
        return text;
    }

    try {
        const { projectId, credentials } = getTranslationConfig();
        const translationClient = new TranslationServiceClient({ projectId, credentials });
        
        const request = {
            parent: `projects/${projectId}/locations/global`,
            contents: [text],
            mimeType: 'text/plain',
            sourceLanguageCode: 'en',
            targetLanguageCode: targetLanguage,
        };

        const [response] = await translationClient.translateText(request);
        
        if (response.translations && response.translations.length > 0 && response.translations[0].translatedText) {
            return response.translations[0].translatedText;
        }
        
        return text; 
    } catch (error) {
        console.error(`Error during translation from 'en' to '${targetLanguage}':`, error);
        // In case of an error, return the original text to avoid breaking the flow
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
        
        const trainNumberFormatted = route['Train Number'].toString().split('').join(' ');

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
