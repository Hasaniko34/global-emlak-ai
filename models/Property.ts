import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  propertyType: 'apartment' | 'house' | 'land' | 'commercial' | 'other';
  location: {
    address: string;
    city: string;
    district: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    }
  };
  features: {
    size: number;
    rooms?: number;
    bathrooms?: number;
    floors?: number;
    yearBuilt?: number;
    heating?: string;
  };
  price: number;
  currency: string;
  status: 'active' | 'sold' | 'rented';
  isFeatured: boolean;
  isFavorite: boolean;
  financials: {
    currentValue: number;
    purchaseDate?: Date;
    monthlyIncome: number;
    monthlyExpenses: number;
  };
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Başlık zorunludur'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'land', 'commercial', 'other'],
      required: [true, 'Gayrimenkul tipi zorunludur'],
    },
    location: {
      address: {
        type: String,
        required: [true, 'Adres zorunludur'],
      },
      city: {
        type: String,
        required: [true, 'Şehir zorunludur'],
      },
      district: {
        type: String,
        required: [true, 'İlçe zorunludur'],
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    features: {
      size: {
        type: Number,
        required: [true, 'Metrekare zorunludur'],
      },
      rooms: Number,
      bathrooms: Number,
      floors: Number,
      yearBuilt: Number,
      heating: String,
    },
    price: {
      type: Number,
      required: [true, 'Fiyat zorunludur'],
    },
    currency: {
      type: String,
      default: 'TL',
    },
    status: {
      type: String,
      enum: ['active', 'sold', 'rented'],
      default: 'active',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    financials: {
      currentValue: {
        type: Number,
        default: function(this: any) {
          return this.price;
        }
      },
      purchaseDate: Date,
      monthlyIncome: {
        type: Number,
        default: 0,
      },
      monthlyExpenses: {
        type: Number,
        default: 0,
      },
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
PropertySchema.index({ userId: 1 });
PropertySchema.index({ 'location.city': 1 });
PropertySchema.index({ propertyType: 1 });
PropertySchema.index({ isFavorite: 1 });
PropertySchema.index({ price: 1 });

// ROI (Return on Investment) hesaplama - Virtuals
PropertySchema.virtual('roi').get(function(this: any) {
  if (!this.financials.purchasePrice || this.financials.purchasePrice === 0) {
    return 0;
  }
  
  // Yıllık net gelir
  const annualIncome = this.financials.monthlyIncome * 12;
  const annualExpenses = this.financials.monthlyExpenses * 12;
  const netAnnualIncome = annualIncome - annualExpenses;
  
  // Mortgage ödemeleri dikkate alınarak
  const mortgagePayments = this.financials.mortgage.exists 
    ? this.financials.mortgage.monthlyPayment * 12 
    : 0;
    
  const totalAnnualCosts = annualExpenses + mortgagePayments;
  const netOperatingIncome = annualIncome - totalAnnualCosts;
  
  // ROI hesaplaması
  const roi = (netOperatingIncome / this.financials.purchasePrice) * 100;
  
  return parseFloat(roi.toFixed(2));
});

// Sermaye kazancı hesaplama - Virtuals
PropertySchema.virtual('capitalGain').get(function(this: any) {
  if (!this.financials.purchasePrice || !this.financials.currentValue) {
    return 0;
  }
  
  const gain = this.financials.currentValue - this.financials.purchasePrice;
  const capitalGainPercentage = (gain / this.financials.purchasePrice) * 100;
  
  return parseFloat(capitalGainPercentage.toFixed(2));
});

// Nakit akışı hesaplama - Virtuals
PropertySchema.virtual('cashFlow').get(function(this: any) {
  const monthlyIncome = this.financials.monthlyIncome || 0;
  const monthlyExpenses = this.financials.monthlyExpenses || 0;
  const mortgagePayment = this.financials.mortgage.exists 
    ? this.financials.mortgage.monthlyPayment 
    : 0;
    
  return monthlyIncome - monthlyExpenses - mortgagePayment;
});

// JSON dönüşümünde virtuals dahil edilmesi
PropertySchema.set('toJSON', { virtuals: true });
PropertySchema.set('toObject', { virtuals: true });

export default mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema); 