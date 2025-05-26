// database/db.ts
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const initializeDatabase = async () => {
  if (db) {
    console.log("Database 'sistema' already initialized.");
    return;
  }
  try {
    db = await SQLite.openDatabaseAsync('sistema');
    console.log("Database 'sistema' opened successfully.");

    await db.execAsync(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS atendentes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        n_cracha TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pedidos (
        id TEXT PRIMARY KEY NOT NULL,
        mesa TEXT NOT NULL,
        n_cracha_atendente TEXT NOT NULL,
        nome_atendente TEXT NOT NULL,
        quantidadePessoas INTEGER NOT NULL,
        status TEXT NOT NULL,
        valorTotal REAL NOT NULL,
        dataHoraInicio TEXT NOT NULL,
        dataHoraFim TEXT,
        itens TEXT NOT NULL
      );
    `);
    console.log('Tables created or already exist.');

  } catch (error) {
    console.error('Error initializing database or creating tables:', error);
    throw error;
  }
};

export const getDb = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return db;
};