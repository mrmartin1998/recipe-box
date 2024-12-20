import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authUtils';
import { Stock } from '@/models/Stock';
import { connectToDatabase } from '@/lib/mongodb';

export async function PUT(request, { params }) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const stockItem = await Stock.findOne({
        _id: params.id,
        userId: req.user._id
      });

      if (!stockItem) {
        return NextResponse.json(
          { error: 'Stock item not found' },
          { status: 404 }
        );
      }

      const { quantity, unit } = await req.json();
      
      const updatedStock = await Stock.findByIdAndUpdate(
        params.id,
        { $set: { quantity, unit } },
        { new: true }
      ).populate('ingredient', 'name defaultUnit');

      return NextResponse.json({ stockItem: updatedStock });

    } catch (error) {
      console.error('Stock update error:', error);
      return NextResponse.json(
        { error: 'Failed to update stock' },
        { status: 500 }
      );
    }
  });
} 