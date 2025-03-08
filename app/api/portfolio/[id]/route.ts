// Rotayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Portfolio from '@/models/Portfolio';
import Property from '@/models/Property';

// GET: Retrieve a specific portfolio by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: 'Geçersiz portföy ID formatı.' }, { status: 400 });
    }
    
    await dbConnect();
    
    const portfolio = await Portfolio.findOne({
      _id: id,
      userId: (session.user as any).id
    }).populate({
      path: 'properties',
      model: Property,
    });
    
    if (!portfolio) {
      return Response.json({ error: 'Portföy bulunamadı.' }, { status: 404 });
    }
    
    return Response.json({ portfolio }, { status: 200 });
  } catch (error) {
    console.error('Portföy getirme hatası:', error);
    return Response.json({ error: 'Portföy getirilirken bir hata oluştu.' }, { status: 500 });
  }
}

// PUT: Update a portfolio by ID
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: 'Geçersiz portföy ID formatı.' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Check if portfolio exists and belongs to the user
    const existingPortfolio = await Portfolio.findOne({
      _id: id,
      userId: (session.user as any).id
    });
    
    if (!existingPortfolio) {
      return Response.json({ error: 'Portföy bulunamadı veya erişim izniniz yok.' }, { status: 404 });
    }
    
    const data = await request.json();
    
    // Prevent userId modification
    if (data.userId) {
      delete data.userId;
    }
    
    // Validate propertyIds - check user has access to the properties
    if (data.propertyIds && data.propertyIds.length > 0) {
      // Check all propertyIds are valid ObjectIds
      const validIds = data.propertyIds.filter((id: string) => mongoose.Types.ObjectId.isValid(id));
      
      if (validIds.length !== data.propertyIds.length) {
        return Response.json({ error: 'Geçersiz gayrimenkul ID formatı.' }, { status: 400 });
      }
      
      // Get properties that belong to the user
      const userProperties = await Property.find({
        _id: { $in: validIds },
        userId: (session.user as any).id
      });
      
      // Check if all propertyIds belong to the user
      if (userProperties.length !== validIds.length) {
        return Response.json({ 
          error: 'Bir veya daha fazla gayrimenkule erişim izniniz yok.' 
        }, { status: 403 });
      }
      
      // Calculate financial metrics
      let totalValue = 0;
      let totalIncome = 0;
      let totalExpenses = 0;
      
      userProperties.forEach(property => {
        totalValue += property.financials.currentValue || property.price;
        totalIncome += property.financials.monthlyIncome || 0;
        totalExpenses += property.financials.monthlyExpenses || 0;
      });
      
      // Calculate performance metrics
      const cashFlow = totalIncome - totalExpenses;
      const overallROI = totalValue > 0 ? (cashFlow * 12) / totalValue : 0;
      
      // Update data
      data.totalValue = totalValue;
      data.totalIncome = totalIncome;
      data.totalExpenses = totalExpenses;
      data.cashFlow = cashFlow;
      data.overallROI = overallROI;
    }
    
    // Update portfolio
    const updatedPortfolio = await Portfolio.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate({
      path: 'properties',
      model: Property,
    });
    
    return Response.json({ portfolio: updatedPortfolio }, { status: 200 });
  } catch (error: any) {
    console.error('Portföy güncelleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      return Response.json({ 
        error: 'Doğrulama hatası: ' + Object.values(error.errors).map((err: any) => err.message).join(', ') 
      }, { status: 400 });
    }
    
    return Response.json({ error: 'Portföy güncellenirken bir hata oluştu.' }, { status: 500 });
  }
}

// DELETE: Remove a portfolio by ID
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: 'Geçersiz portföy ID formatı.' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Check if portfolio exists and belongs to the user
    const portfolio = await Portfolio.findOne({
      _id: id,
      userId: (session.user as any).id
    });
    
    if (!portfolio) {
      return Response.json({ error: 'Portföy bulunamadı veya erişim izniniz yok.' }, { status: 404 });
    }
    
    // Delete portfolio
    await Portfolio.findByIdAndDelete(id);
    
    return Response.json({ message: 'Portföy başarıyla silindi.' }, { status: 200 });
  } catch (error) {
    console.error('Portföy silme hatası:', error);
    return Response.json({ error: 'Portföy silinirken bir hata oluştu.' }, { status: 500 });
  }
} 