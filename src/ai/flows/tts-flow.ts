
'use server';

import { googleAI } from '@genkit-ai/googleai';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const ttsFlow = ai.defineFlow(
  {
    name: 'ttsFlow',
    inputSchema: z.object({ text: z.string(), languageCode: z.string() }),
    outputSchema: z.any(),
  },
  async ({ text, languageCode }) => {
    if (!text) {
      return { media: null };
    }

    const localeMap: { [key: string]: string } = {
        'en': 'en-IN',
        'mr': 'mr-IN',
        'hi': 'hi-IN',
        'gu': 'gu-IN',
    };

    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { 
                voiceName: 'Achernar',
                languageCode: localeMap[languageCode] || 'en-IN',
             },
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      return { media: null };
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);
    return {
      media: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

export async function generateSpeech(text: string, languageCode: string): Promise<string | null> {
    const result = await ttsFlow({ text, languageCode });
    return result.media;
}
