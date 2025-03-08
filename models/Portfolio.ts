import mongoose, { Schema, Document } from 'mongoose';

export interface IPortfolio extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  propertyIds: mongoose.Types.ObjectId[];
  totalValue: number;
  totalIncome: number;
  totalExpenses: number;
  overallROI: number; // Return on Investment
  cashFlow: number;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioSchema = new Schema<IPortfolio>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Portföy adı zorunludur'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    propertyIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Property',
    }],
    totalValue: {
      type: Number,
      default: 0,
    },
    totalIncome: {
      type: Number,
      default: 0,
    },
    totalExpenses: {
      type: Number,
      default: 0,
    },
    overallROI: {
      type: Number,
      default: 0,
    },
    cashFlow: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Portföye eklenen gayrimenkulleri popüle eden sanal alan
PortfolioSchema.virtual('properties', {
  ref: 'Property',
  localField: 'propertyIds',
  foreignField: '_id',
});

// JSON dönüşümünde sanal alanların da dahil edilmesi
PortfolioSchema.set('toJSON', { virtuals: true });
PortfolioSchema.set('toObject', { virtuals: true });

export default mongoose.models.Portfolio || mongoose.model<IPortfolio>('Portfolio', PortfolioSchema); 