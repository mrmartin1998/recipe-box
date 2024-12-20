import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authUtils';
import { ShoppingList } from '@/models/ShoppingList';
import { connectToDatabase } from '@/lib/mongodb';

// PUT /api/shopping-lists/:id/items/:itemId - Update item status
export async function PUT(request, { params }) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { completed, addToStock } = await req.json();

      // Update the specific item in the shopping list
      const updatedList = await ShoppingList.findOneAndUpdate(
        {
          _id: params.id,
          userId: req.user._id,
          'items._id': params.itemId
        },
        {
          $set: {
            'items.$.completed': completed,
            'items.$.addToStock': addToStock
          }
        },
        { new: true, runValidators: true }
      )
      .populate('fromRecipe', 'name')
      .populate('items.ingredient', 'name defaultUnit');

      if (!updatedList) {
        return NextResponse.json(
          { error: 'Shopping list or item not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ 
        shoppingList: updatedList,
        updatedItem: updatedList.items.find(item => 
          item._id.toString() === params.itemId
        )
      });

    } catch (error) {
      console.error('Shopping list item update error:', error);
      return NextResponse.json(
        { error: 'Failed to update shopping list item' },
        { status: 500 }
      );
    }
  });
} 