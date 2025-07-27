
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { revalidatePath } from 'next/cache';
import { translateAllRoutes } from '@/ai/flows/translate-flow';
import { generateSpeech } from '@/ai/flows/tts-flow';
import * as fs from 'fs/promises';
import * as path from 'path';

const SESSION_COOKIE_NAME = 'session';

// In a real app, this would come from a database and passwords would be hashed.
const DUMMY_USER = {
  email: 'admin',
  password: 'wras@dhh',
  name: 'Admin',
};

const loginSchema = z.object({
  email: z.string().min(1, { message: 'Username cannot be empty.' }),
  password: z.string().min(1, { message: 'Password cannot be empty.' }),
});

export type FormState = {
  message: string;
  errors?: {
    email?: string[];
    password?: string[];
  };
};

// --- Database Functions ---
async function getDb() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database,
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS train_routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_number TEXT,
      train_name TEXT,
      start_station TEXT,
      start_code TEXT,
      end_station TEXT,
      end_code TEXT
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS train_route_translations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        route_id INTEGER,
        language_code TEXT,
        train_number_translation TEXT,
        train_name_translation TEXT,
        start_station_translation TEXT,
        end_station_translation TEXT,
        FOREIGN KEY (route_id) REFERENCES train_routes(id) ON DELETE CASCADE
    )
    `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS train_route_audio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        route_id INTEGER,
        language_code TEXT,
        train_number_audio_path TEXT,
        train_name_audio_path TEXT,
        start_station_audio_path TEXT,
        end_station_audio_path TEXT,
        FOREIGN KEY (route_id) REFERENCES train_routes(id) ON DELETE CASCADE
    )
    `);
  return db;
}

export type TrainRoute = {
  id?: number;
  'Train Number': string;
  'Train Name': string;
  'Start Station': string;
  'Start Code': string;
  'End Station': string;
  'End Code': string;
};

export async function addTrainRoute(route: Omit<TrainRoute, 'id'>) {
  const db = await getDb();
  await db.run(
    'INSERT INTO train_routes (train_number, train_name, start_station, start_code, end_station, end_code) VALUES (?, ?, ?, ?, ?, ?)',
    route['Train Number'],
    route['Train Name'],
    route['Start Station'],
    route['Start Code'],
    route['End Station'],
    route['End Code']
  );
  await db.close();
  revalidatePath('/train-route-management');
  return { message: 'Route added successfully.' };
}


export async function saveTrainRoutes(routes: TrainRoute[]) {
  const db = await getDb();
  await db.run('DELETE FROM train_routes'); // Clear existing routes
  const stmt = await db.prepare(
    'INSERT INTO train_routes (train_number, train_name, start_station, start_code, end_station, end_code) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (const route of routes) {
    await stmt.run(
      route['Train Number'],
      route['Train Name'],
      route['Start Station'],
      route['Start Code'],
      route['End Station'],
      route['End Code']
    );
  }
  await stmt.finalize();
  await db.close();
  revalidatePath('/train-route-management');
  return { message: `${routes.length} routes saved successfully.` };
}

export async function getTrainRoutes(): Promise<TrainRoute[]> {
  try {
    const db = await getDb();
    const routes = await db.all('SELECT id, train_number as "Train Number", train_name as "Train Name", start_station as "Start Station", start_code as "Start Code", end_station as "End Station", end_code as "End Code" FROM train_routes ORDER BY id DESC');
    await db.close();
    return routes;
  } catch (error) {
    console.error('Failed to fetch train routes:', error);
    return [];
  }
}

export async function deleteTrainRoute(id: number) {
  const db = await getDb();
  await db.run('DELETE FROM train_routes WHERE id = ?', id);
  await db.close();
  revalidatePath('/train-route-management');
  return { message: 'Route deleted successfully.' };
}

export async function clearAllTrainRoutes() {
  const db = await getDb();
  await db.run('DELETE FROM train_routes');
  await db.close();
  revalidatePath('/train-route-management');
  return { message: 'All routes have been deleted.' };
}

export type Translation = {
    route_id: number;
    language_code: string;
    train_number_translation: string;
    train_name_translation: string;
    start_station_translation: string;
    end_station_translation: string;
}

export async function saveTranslations(translations: Translation[]) {
    const db = await getDb();
    await db.run('DELETE FROM train_route_translations');
    const stmt = await db.prepare(
        'INSERT INTO train_route_translations (route_id, language_code, train_number_translation, train_name_translation, start_station_translation, end_station_translation) VALUES (?, ?, ?, ?, ?, ?)'
    );

    for (const t of translations) {
        await stmt.run(t.route_id, t.language_code, t.train_number_translation, t.train_name_translation, t.start_station_translation, t.end_station_translation);
    }
    await stmt.finalize();
    await db.close();
}


export async function startTranslationProcess(routes: TrainRoute[]) {
  const translations = await translateAllRoutes(routes);
  await saveTranslations(translations);
  return { message: "Translation completed successfully." };
}

export type TranslationRecord = {
  language_code: string;
  train_number_translation: string;
  train_name_translation: string;
  start_station_translation: string;
  end_station_translation: string;
};

export type FullTranslationInfo = {
  id: number;
  train_number: string;
  train_name: string;
  translations: TranslationRecord[];
};

export async function getTranslations(): Promise<FullTranslationInfo[]> {
  try {
    const db = await getDb();
    const results = await db.all(`
      SELECT
        tr.id,
        tr.train_number,
        tr.train_name,
        trt.language_code,
        trt.train_number_translation,
        trt.train_name_translation,
        trt.start_station_translation,
        trt.end_station_translation
      FROM train_routes tr
      JOIN train_route_translations trt ON tr.id = trt.route_id
      ORDER BY tr.id, trt.language_code
    `);
    await db.close();
    
    const groupedTranslations: Record<string, FullTranslationInfo> = {};

    results.forEach(row => {
      if (!groupedTranslations[row.train_number]) {
        groupedTranslations[row.train_number] = {
          id: row.id,
          train_number: row.train_number,
          train_name: row.train_name,
          translations: [],
        };
      }
      groupedTranslations[row.train_number].translations.push({
        language_code: row.language_code,
        train_number_translation: row.train_number_translation,
        train_name_translation: row.train_name_translation,
        start_station_translation: row.start_station_translation,
        end_station_translation: row.end_station_translation,
      });
    });

    return Object.values(groupedTranslations);
  } catch (error) {
    console.error('Failed to fetch translations:', error);
    return [];
  }
}

export async function clearAllTranslations() {
  const db = await getDb();
  await db.run('DELETE FROM train_route_translations');
  await db.close();
  revalidatePath('/ai-database');
  return { message: 'All translations have been deleted.' };
}

async function saveAudioFile(base64Data: string, filePath: string): Promise<string> {
    const audioDir = path.dirname(filePath);
    await fs.mkdir(audioDir, { recursive: true });
    const data = base64Data.split(';base64,').pop();
    if (data) {
        await fs.writeFile(filePath, data, { encoding: 'base64' });
        return filePath.replace(path.join(process.cwd(), 'public'), '');
    }
    return '';
}

export async function generateAudioForRoute(routeId: number, trainNumber: string, translations: TranslationRecord[]) {
    const db = await getDb();
    await db.run('DELETE FROM train_route_audio WHERE route_id = ?', routeId);
    
    const audioDir = path.join(process.cwd(), 'public', 'audio', trainNumber);
    await fs.mkdir(audioDir, { recursive: true });

    for (const t of translations) {
        const lang = t.language_code;

        const numAudio = await generateSpeech(t.train_number_translation);
        await new Promise(resolve => setTimeout(resolve, 21000)); 
        const nameAudio = await generateSpeech(t.train_name_translation);
        await new Promise(resolve => setTimeout(resolve, 21000));
        const startAudio = await generateSpeech(t.start_station_translation);
        await new Promise(resolve => setTimeout(resolve, 21000));
        const endAudio = await generateSpeech(t.end_station_translation);
        await new Promise(resolve => setTimeout(resolve, 21000));
        
        const numPath = numAudio ? await saveAudioFile(numAudio, path.join(audioDir, `train_number_${lang}.wav`)) : '';
        const namePath = nameAudio ? await saveAudioFile(nameAudio, path.join(audioDir, `train_name_${lang}.wav`)) : '';
        const startPath = startAudio ? await saveAudioFile(startAudio, path.join(audioDir, `start_station_${lang}.wav`)) : '';
        const endPath = endAudio ? await saveAudioFile(endAudio, path.join(audioDir, `end_station_${lang}.wav`)) : '';
        
        await db.run(
            'INSERT INTO train_route_audio (route_id, language_code, train_number_audio_path, train_name_audio_path, start_station_audio_path, end_station_audio_path) VALUES (?, ?, ?, ?, ?, ?)',
            routeId, lang, numPath, namePath, startPath, endPath
        );
    }

    await db.close();
    revalidatePath('/ai-database/translations');
    return { message: `Audio generated successfully for Train ${trainNumber}.` };
}

// --- Auth Functions ---

export async function login(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      message: 'Invalid form data.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
    const sessionData = {
      email: DUMMY_USER.email,
      name: DUMMY_USER.name,
    };
    cookies().set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    return redirect('/');
  } else {
    return {
      message: 'Invalid username or password. Please try again.',
    };
  }
}

export async function logout() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/login');
}

export async function getSession() {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    return null;
  }
  try {
    // In a real app, you'd want to verify the session against a database or token signature.
    return JSON.parse(sessionCookie.value) as { email: string; name: string };
  } catch {
    return null;
  }
}

    