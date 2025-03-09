// Mongoose kütüphanesini kullanarak MongoDB bağlantısı yapıyoruz
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongoose';

/**
 * MongoDB'ye bağlanmak için yardımcı fonksiyon
 * @returns MongoDB client ve database instance'ları
 */
export async function connectToDatabase() {
  // Mongoose üzerinden bağlantı kur
  await dbConnect();
  
  // MongoDB bağlantısı ve veritabanı instance'ını döndür
  const db = mongoose.connection.db;
  
  return { 
    client: mongoose.connection.getClient(),
    db: db
  };
} 