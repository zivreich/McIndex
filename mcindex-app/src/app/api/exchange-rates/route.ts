import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface ExchangeRateData {
  [month: string]: {
    rates: {
      [currency: string]: number;
    };
    // Add other month-specific properties if any, e.g., 'end_date'
    end_date?: string;
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get('year');
  const month = searchParams.get('month'); // e.g., "January"
  const targetCurrency = searchParams.get('currency'); // e.g., "EUR"

  if (!year || !month || !targetCurrency) {
    return NextResponse.json(
      { error: 'Missing required query parameters: year, month, and currency' },
      { status: 400 }
    );
  }

  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'exchange-rates', `${year}.json`);
    
    // Log the path for debugging
    // console.log(`Attempting to read file from: ${filePath}`);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      // console.error(`File not found at path: ${filePath}`);
      return NextResponse.json(
        { error: `Exchange rate data for year ${year} not found.` },
        { status: 404 }
      );
    }

    const fileContents = await fs.readFile(filePath, 'utf8');
    const data: ExchangeRateData = JSON.parse(fileContents);

    if (data[month] && data[month].rates && data[month].rates[targetCurrency.toUpperCase()]) {
      const rate = data[month].rates[targetCurrency.toUpperCase()];
      return NextResponse.json({
        baseCurrency: 'USD',
        targetCurrency: targetCurrency.toUpperCase(),
        year,
        month,
        rate,
      });
    } else {
      return NextResponse.json(
        { error: `Exchange rate not found for ${targetCurrency.toUpperCase()} in ${month}, ${year}.` },
        { status: 404 }
      );
    }
  } catch {
    // console.error('Error fetching exchange rate:');
    const errorMessage = 'Failed to fetch exchange rate.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
