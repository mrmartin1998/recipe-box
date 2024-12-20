import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authUtils';
import { Recipe } from '@/models/Recipe';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Helper function to check recipe ownership
async function checkRecipeAccess(recipeId, userId) {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    return { error: 'Recipe not found', status: 404 };
  }
  if (recipe.userId.toString() !== userId.toString() && !recipe.isPublic) {
    return { error: 'Not authorized', status: 403 };
  }
  return { recipe };
}

// GET /api/recipes/:id - Get recipe details
export async function GET(request, { params }) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { recipe, error, status } = await checkRecipeAccess(params.id, req.user._id);
      if (error) {
        return NextResponse.json({ error }, { status });
      }

      return NextResponse.json({ recipe });

    } catch (error) {
      console.error('Recipe fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recipe' },
        { status: 500 }
      );
    }
  });
}

// PUT /api/recipes/:id - Update recipe
export async function PUT(request, { params }) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { recipe, error, status } = await checkRecipeAccess(params.id, req.user._id);
      if (error) {
        return NextResponse.json({ error }, { status });
      }

      const updates = await req.json();
      const updatedRecipe = await Recipe.findByIdAndUpdate(
        params.id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      return NextResponse.json({ recipe: updatedRecipe });

    } catch (error) {
      console.error('Recipe update error:', error);
      return NextResponse.json(
        { error: 'Failed to update recipe' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/recipes/:id - Delete recipe
export async function DELETE(request, { params }) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { recipe, error, status } = await checkRecipeAccess(params.id, req.user._id);
      if (error) {
        return NextResponse.json({ error }, { status });
      }

      await Recipe.findByIdAndDelete(params.id);
      return NextResponse.json({ success: true });

    } catch (error) {
      console.error('Recipe deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete recipe' },
        { status: 500 }
      );
    }
  });
} 