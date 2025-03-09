import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

if (!uri) {
  throw new Error('MongoDB URI tanımlanmamış. Lütfen .env.local dosyasına MONGODB_URI ekleyin.');
}

if (!dbName) {
  throw new Error('MongoDB veritabanı adı tanımlanmamış. Lütfen .env.local dosyasına MONGODB_DB ekleyin.');
}

/**
 * MongoDB'ye bağlanmak için yardımcı fonksiyon
 * @returns MongoDB client ve database instance'ları
 */
export async function connectToDatabase() {
  // Cache'lenmiş bağlantı varsa onu kullan
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Yeni bağlantı oluştur
  const client = await MongoClient.connect(uri as string);
  const db = client.db(dbName);

  // Sonraki istekler için cache'le
  cachedClient = client;
  cachedDb = db;

  return { client, db };
} 