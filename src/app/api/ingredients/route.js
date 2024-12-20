import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authUtils';
import { Ingredient } from '@/models/Ingredient';
import { connectToDatabase } from '@/lib/mongodb';

// POST /api/ingredients - Create new ingredient
export async function POST(request) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const userId = req.user._id;
      const { name, category, defaultUnit, isPublic } = await req.json();

      // Validate required fields
      if (!name) {
        return NextResponse.json(
          { error: 'Name is required' },
          { status: 400 }
        );
      }

      // Check for existing ingredient
      const existingIngredient = await Ingredient.findOne({ name: name.toLowerCase() });
      if (existingIngredient) {
        return NextResponse.json({ ingredient: existingIngredient });
      }

      // Create ingredient
      const ingredient = await Ingredient.create({
        name: name.toLowerCase(),
        category,
        defaultUnit,
        userId,
        isPublic
      });

      return NextResponse.json({ ingredient });

    } catch (error) {
      console.error('Ingredient creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create ingredient' },
        { status: 500 }
      );
    }
  });
}

// GET /api/ingredients - List ingredients
export async function GET(request) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search');
      const category = searchParams.get('category');

      // Build query
      const query = {
        $or: [
          { userId: req.user._id },
          { isPublic: true }
        ]
      };

      if (search) {
        query.$text = { $search: search };
      }
      if (category) {
        query.category = category;
      }

      const ingredients = await Ingredient.find(query).sort({ name: 1 });
      return NextResponse.json({ ingredients });

    } catch (error) {
      console.error('Ingredient list error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ingredients' },
        { status: 500 }
      );
    }
  });
} 