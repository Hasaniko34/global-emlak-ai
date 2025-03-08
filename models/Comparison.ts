import mongoose, { Schema, Document } from 'mongoose';

export interface IComparison extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  properties: mongoose.Types.ObjectId[];
  criteria: {
    priceWeight: number;
    locationWeight: number; 
    featureWeight: number;
    financialWeight: number;
  };
  results: {
    propertyId: mongoose.Types.ObjectId;
    totalScore: number;
    priceScore: number;
    locationScore: number;
    featureScore: number;
    financialScore: number;
    notes: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ComparisonSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    properties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
    criteria: {
      priceWeight: { type: Number, default: 25 }, // Toplam 100 olacak şekilde ağırlıklar
      locationWeight: { type: Number, default: 25 },
      featureWeight: { type: Number, default: 25 },
      financialWeight: { type: Number, default: 25 }
    },
    results: [{
      propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
      totalScore: { type: Number, default: 0 },
      priceScore: { type: Number, default: 0 },
      locationScore: { type: Number, default: 0 },
      featureScore: { type: Number, default: 0 },
      financialScore: { type: Number, default: 0 },
      notes: { type: String }
    }]
  },
  { timestamps: true }
);

// Indexes for better query performance
ComparisonSchema.index({ userId: 1 });

// JSON dönüşümünde virtuals dahil edilmesi
ComparisonSchema.set('toJSON', { virtuals: true });
ComparisonSchema.set('toObject', { virtuals: true });

export default mongoose.models.Comparison || mongoose.model<IComparison>('Comparison', ComparisonSchema); 