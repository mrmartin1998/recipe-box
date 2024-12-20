import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authUtils';
import { Recipe } from '@/models/Recipe';
import { connectToDatabase } from '@/lib/mongodb';

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

// GET /api/recipes - List/search recipes
export async function GET(request) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search');
      const category = searchParams.get('category');
      const difficulty = searchParams.get('difficulty');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const skip = (page - 1) * limit;

      // Build query
      const query = {
        $or: [
          { userId: req.user._id }, // User's own recipes
          { isPublic: true }        // Public recipes
        ]
      };

      // Add filters if provided
      if (search) {
        query.$text = { $search: search };
      }
      if (category) {
        query.category = category;
      }
      if (difficulty) {
        query.difficulty = difficulty;
      }

      // Execute query
      const [recipes, total] = await Promise.all([
        Recipe.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Recipe.countDocuments(query)
      ]);

      return NextResponse.json({
        recipes,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });

    } catch (error) {
      console.error('Recipe list error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recipes' },
        { status: 500 }
      );
    }
  });
} 