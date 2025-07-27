import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// By default, the Google AI plugin will use the value of the
// GOOGLE_API_KEY environment variable for authentication.
//
// You can also specify the API key directly.
//
// To use Vertex AI, you must explicitly set the apiClient to 'vertex'.
// The Vertex AI API uses Google Cloud Application Default Credentials for
// authentication, which will be automatically discovered by the plugin.
export const ai = genkit({
  plugins: [
    googleAI({
      apiClient: 'vertex',
    }),
  ],
});
