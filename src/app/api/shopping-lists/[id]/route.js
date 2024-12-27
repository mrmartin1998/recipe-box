import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authUtils';
import { ShoppingList } from '@/models/ShoppingList';
import { connectToDatabase } from '@/lib/mongodb';

// Helper function to check shopping list access
async function checkShoppingListAccess(listId, userId) {
  const list = await ShoppingList.findById(listId);
  if (!list) {
    return { error: 'Shopping list not found', status: 404 };
  }
  if (list.userId.toString() !== userId.toString()) {
    return { error: 'Not authorized', status: 403 };
  }
  return { list };
}

// GET /api/shopping-lists/:id - Get single shopping list
export async function GET(request, { params }) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { list, error, status } = await checkShoppingListAccess(params.id, req.user._id);
      if (error) {
        return NextResponse.json({ error }, { status });
      }

      await list.populate('items.ingredient', 'name defaultUnit');
      if (list.fromRecipe) {
        await list.populate('fromRecipe', 'name');
      }
      if (list.fromMealPlan) {
        await list.populate('fromMealPlan', 'startDate endDate');
      }

      return NextResponse.json({ shoppingList: list });

    } catch (error) {
      console.error('Shopping list fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch shopping list' },
        { status: 500 }
      );
    }
  });
}

// PUT /api/shopping-lists/:id - Update shopping list
export async function PUT(request, { params }) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { list, error, status } = await checkShoppingListAccess(params.id, req.user._id);
      if (error) {
        return NextResponse.json({ error }, { status });
      }

      const updates = await req.json();
      const updatedList = await ShoppingList.findByIdAndUpdate(
        params.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('items.ingredient', 'name defaultUnit');

      return NextResponse.json({ shoppingList: updatedList });

    } catch (error) {
      console.error('Shopping list update error:', error);
      return NextResponse.json(
        { error: 'Failed to update shopping list' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/shopping-lists/:id - Delete shopping list
export async function DELETE(request, { params }) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { list, error, status } = await checkShoppingListAccess(params.id, req.user._id);
      if (error) {
        return NextResponse.json({ error }, { status });
      }

      await ShoppingList.findByIdAndDelete(params.id);
      return NextResponse.json({ success: true });

    } catch (error) {
      console.error('Shopping list deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete shopping list' },
        { status: 500 }
      );
    }
  });
} 