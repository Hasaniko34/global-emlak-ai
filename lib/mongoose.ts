import mongoose from 'mongoose';

// Global tipini tanımlayalım
declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  } | undefined;
}

// MONGODB_URI kullanılacak
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MongoDB URI bulunamadı. Lütfen .env dosyasını kontrol edin.');
}

// cached değişkenini tanımlayalım ve başlangıç değeri atayalım
let cached = global.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Sadece bufferCommands seçeneğini kullanıyoruz, diğer seçenekler artık gerekli değil
    const opts = {
      bufferCommands: false
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('MongoDB bağlantısı başarılı!');
      return mongoose.connection;
    }).catch(err => {
      console.error('MongoDB bağlantı hatası:', err);
      throw err;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;