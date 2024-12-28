import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
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
      
      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search');
      
      let query = {};
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      const ingredients = await Ingredient.find(query)
        .limit(10)
        .sort({ name: 1 });

      return NextResponse.json({ ingredients });

    } catch (error) {
      console.error('Ingredient search error:', error);
      return NextResponse.json(
        { error: 'Failed to search ingredients' },
        { status: 500 }
      );
    }
  });
} 