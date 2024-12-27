import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Recipe } from '@/models/Recipe';
import { connectToDatabase } from '@/lib/mongodb';

// GET /api/recipes - List recipes
export async function GET(request) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const recipes = await Recipe.find({ userId: req.user._id })
        .sort({ createdAt: -1 });

      return NextResponse.json(recipes);

    } catch (error) {
      console.error('Recipe list error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recipes' },
        { status: 500 }
      );
    }
  });
}

// POST /api/recipes - Create new recipe
export async function POST(request) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const userId = req.user._id;
      const {
        name,
        description,
        servings,
        prepTime,
        cookTime,
        difficulty,
        ingredients,
        steps,
        category,
        image,
        isPublic
      } = await req.json();

      // Validate required fields
      if (!name || !servings || !ingredients || !steps) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Create recipe
      const recipe = await Recipe.create({
        userId,
        name,
        description,
        servings,
        prepTime,
        cookTime,
        difficulty,
        ingredients,
        steps,
        category,
        image,
        isPublic
      });

      return NextResponse.json({ recipe });

    } catch (error) {
      console.error('Recipe creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create recipe' },
        { status: 500 }
      );
    }
  });
} 