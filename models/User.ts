import mongoose, { Document, Model, Schema } from 'mongoose';
import { hash, compare } from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  password?: string;
  role: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateResetToken(): string;
}

const UserSchema = new Schema<IUser>(
  {
    name: String,
    email: { type: String, unique: true, sparse: true },
    emailVerified: Date,
    image: String,
    password: String,
    role: { type: String, default: 'user' },
  },
  { timestamps: true }
);

// Şifre karşılaştırma metodu
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const user = this as IUser;
  return compare(candidatePassword, user.password || '');
};

// Şifre hashlemek için pre-save hook
UserSchema.pre('save', async function (next) {
  const user = this as IUser;
  if (user.isModified('password')) {
    user.password = await hash(user.password || '', 12);
  }
  next();
});

// Model zaten tanımlanmışsa onu kullan, yoksa yeni model oluştur
const User = (mongoose.models.User || mongoose.model<IUser>('User', UserSchema)) as Model<IUser>;

export default User;