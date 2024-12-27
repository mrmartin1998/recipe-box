import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authUtils';
import { ShoppingList } from '@/models/ShoppingList';
import { Stock } from '@/models/Stock';
import { connectToDatabase } from '@/lib/mongodb';

// PUT /api/shopping-lists/items/:id - Update shopping list item
export async function PUT(request, { params }) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { completed, addToStock } = await req.json();
      
      // Find the shopping list containing this item
      const shoppingList = await ShoppingList.findOne({
        'items._id': params.id
      }).populate('items.ingredient', 'name defaultUnit');
      
      if (!shoppingList) {
        return NextResponse.json(
          { error: 'Shopping list item not found' },
          { status: 404 }
        );
      }

      // Update the specific item
      const item = shoppingList.items.find(i => i._id.toString() === params.id);
      item.completed = completed;

      // Add to stock if requested
      if (addToStock) {
        await Stock.findOneAndUpdate(
          { 
            userId: req.user._id,
            ingredient: item.ingredient._id
          },
          {
            $inc: { quantity: item.amount },
            $setOnInsert: {
              unit: item.unit,
              userId: req.user._id,
              ingredient: item.ingredient._id
            }
          },
          { upsert: true, new: true }
        );
      }

      await shoppingList.save();
      return NextResponse.json({ item });

    } catch (error) {
      console.error('Shopping list item update error:', error);
      return NextResponse.json(
        { error: 'Failed to update shopping list item' },
        { status: 500 }
      );
    }
  });
} 