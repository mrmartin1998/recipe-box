import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { ShoppingList } from '@/models/ShoppingList';
import { connectToDatabase } from '@/lib/mongodb';

// POST /api/shopping-lists - Create shopping list
export async function POST(request) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const userId = req.user._id;
      const { name, items } = await req.json();

      // Validate required fields
      if (!name || !items?.length) {
        return NextResponse.json(
          { error: 'Name and items are required' },
          { status: 400 }
        );
      }

      // Create shopping list
      const shoppingList = await ShoppingList.create({
        userId,
        name,
        items
      });

      return NextResponse.json({ shoppingList });

    } catch (error) {
      console.error('Shopping list creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create shopping list' },
        { status: 500 }
      );
    }
  });
}

// GET /api/shopping-lists - List shopping lists
export async function GET(request) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { searchParams } = new URL(req.url);
      const archived = searchParams.get('archived') === 'true';

      const shoppingLists = await ShoppingList.find({
        userId: req.user._id,
        isArchived: archived
      })
      .sort({ createdAt: -1 })
      .populate('fromRecipe', 'name')
      .populate('items.ingredient', 'name defaultUnit');

      return NextResponse.json({ shoppingLists });

    } catch (error) {
      console.error('Shopping list fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch shopping lists' },
        { status: 500 }
      );
    }
  });
} 