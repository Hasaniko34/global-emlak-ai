import mongoose from 'mongoose';

// Global tipini tanımlayalım
declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI ortam değişkeni tanımlanmamış');
}

// cached değişkenine direkt olarak varsayılan değer atama
let cached = global.mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
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

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Diğer dosyalar tek bir DB bağlantı fonksiyonu kullanabilsin diye
// mongoose.ts'deki fonksiyonu da buradan export ediyoruz
import dbConnect from './mongoose';
export { dbConnect };
// Geriye dönük uyumluluk için varsayılan export olarak connectToDatabase'i kullanıyoruz
export default connectToDatabase;