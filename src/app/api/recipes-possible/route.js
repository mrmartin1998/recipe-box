import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authUtils';
import { Recipe } from '@/models/Recipe';
import { Stock } from '@/models/Stock';
import { Ingredient } from '@/models/Ingredient';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();

      // Get user's current stock
      const stockItems = await Stock.find({ userId: req.user._id })
        .populate({
          path: 'ingredient',
          model: Ingredient,
          select: 'name defaultUnit'
        });

      // Create a map of ingredient IDs to quantities
      const stockMap = new Map(
        stockItems.map(item => [
          item.ingredient._id.toString(),
          {
            quantity: item.quantity,
            unit: item.unit
          }
        ])
      );

      // Get all recipes
      const recipes = await Recipe.find({
        $or: [
          { userId: req.user._id },
          { isPublic: true }
        ]
      }).populate({
        path: 'ingredients.item',
        model: Ingredient,
        select: 'name defaultUnit'
      });

      // Filter recipes that can be made with current stock
      const possibleRecipes = recipes.filter(recipe => {
        return recipe.ingredients.every(ing => {
          const stockItem = stockMap.get(ing.item._id.toString());
          if (!stockItem) return false;
          
          // Check if we have enough quantity
          // Note: This is a simple check assuming units match
          // In a real app, you might want to add unit conversion
          return stockItem.unit === ing.unit && 
                 stockItem.quantity >= ing.amount;
        });
      });

      return NextResponse.json({ 
        recipes: possibleRecipes.map(recipe => ({
          _id: recipe._id,
          name: recipe.name,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          ingredients: recipe.ingredients
        }))
      });

    } catch (error) {
      console.error('Failed to fetch possible recipes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recipes' },
        { status: 500 }
      );
    }
  });
} 