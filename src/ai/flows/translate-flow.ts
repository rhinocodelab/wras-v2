'use server';

/**
 * @fileOverview A Genkit flow for translating train route data.
 *
 * - translateAllRoutes - A function that handles the translation process for all routes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { TrainRoute, Translation } from '@/app/actions';

// Define language codes
const LANGUAGES = {
    'en-IN': 'Indian English',
    'mr-IN': 'Indian Marathi',
    'hi-IN': 'Indian Hindi',
    'gu-IN': 'Indian Gujarati',
};

const TranslationInputSchema = z.object({
  text: z.string(),
  languageName: z.string(),
});

const TranslationOutputSchema = z.object({
    translation: z.string(),
});

const translatePrompt = ai.definePrompt({
    name: 'translatePrompt',
    input: { schema: TranslationInputSchema },
    output: { schema: TranslationOutputSchema },
    prompt: `Translate the following text to {{languageName}}: "{{text}}"`,
});


async function translateText(text: string, languageCode: string): Promise<string> {
    const languageName = LANGUAGES[languageCode as keyof typeof LANGUAGES];
    if (!languageName) {
        throw new Error(`Language code '${languageCode}' not supported.`);
    }

    const { output } = await translatePrompt({ text, languageName });
    return output?.translation ?? text;
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
