import dbConnect from '../lib/mongoose';
import User from '../models/User';
import { hash } from 'bcryptjs';

async function main() {
  await dbConnect();
  
  const hashedPassword = await hash('test123', 12);
  
  const user = await User.findOneAndUpdate(
    { email: 'test@example.com' },
    {
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('Test kullanıcısı oluşturuldu:', user);
  process.exit(0);
}

main().catch(err => {
  console.error('Hata:', err);
  process.exit(1);
}); 