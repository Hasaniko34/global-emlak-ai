import { NextResponse } from 'next/server';
import { getNeighborhoodsData } from '@/lib/geoServicesServer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get('countryCode');
    const city = searchParams.get('city');
    const district = searchParams.get('district');
    const language = searchParams.get('language') || 'en';

    if (!countryCode || !city || !district) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const neighborhoods = getNeighborhoodsData(countryCode, city, district);

    return NextResponse.json(neighborhoods);

  } catch (error) {
    console.error('Neighborhood data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch neighborhood data' },
      { status: 500 }
    );
  }
} 