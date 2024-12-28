import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Stock } from '@/models/Stock';
import { connectToDatabase } from '@/lib/mongodb';

// POST /api/stock - Add stock item
export async function POST(request) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const userId = req.user._id;
      const { ingredient, quantity, unit, location, expiryDate, minimumQuantity, notes } = await req.json();

      // Validate required fields
      if (!ingredient || !quantity || !unit) {
        return NextResponse.json(
          { error: 'Ingredient, quantity, and unit are required' },
          { status: 400 }
        );
      }

      // Check for existing stock item
      let stockItem = await Stock.findOne({ userId, ingredient });
      
      if (stockItem) {
        // Update existing stock
        stockItem = await Stock.findByIdAndUpdate(
          stockItem._id,
          {
            $set: {
              quantity: quantity + stockItem.quantity,
              unit,
              location,
              expiryDate,
              minimumQuantity,
              notes
            }
          },
          { new: true }
        ).populate('ingredient', 'name defaultUnit');
      } else {
        // Create new stock item
        stockItem = await Stock.create({
          userId,
          ingredient,
          quantity,
          unit,
          location,
          expiryDate,
          minimumQuantity,
          notes
        });
        stockItem = await stockItem.populate('ingredient', 'name defaultUnit');
      }

      return NextResponse.json({ stockItem });

    } catch (error) {
      console.error('Stock creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create stock item' },
        { status: 500 }
      );
    }
  });
}

// GET /api/stock - List stock items
export async function GET(request) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search');
      const location = searchParams.get('location');
      const lowStock = searchParams.get('lowStock') === 'true';

      // Build query
      const query = { userId: req.user._id };
      
      if (location) {
        query.location = location;
      }
      
      if (lowStock) {
        query.$expr = { 
          $lte: ['$quantity', '$minimumQuantity'] 
        };
      }

      let stockItems = await Stock.find(query)
        .populate('ingredient', 'name defaultUnit')
        .sort({ 'ingredient.name': 1 });

      if (search) {
        stockItems = stockItems.filter(item => 
          item.ingredient.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      return NextResponse.json({ stockItems });

    } catch (error) {
      console.error('Stock list error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stock items' },
        { status: 500 }
      );
    }
  });
} 