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
      
      // Get query parameters
      const url = new URL(request.url);
      const mealType = url.searchParams.get('mealType');
      const maxPrepTime = parseInt(url.searchParams.get('maxPrepTime'));

      // Get user's current stock
      const stockItems = await Stock.find({ userId: req.user._id })
        .populate({
          path: 'ingredient',
          model: Ingredient,
          select: 'name defaultUnit'
        });

      // Create stock map
      const stockMap = new Map(
        stockItems.map(item => [
          item.ingredient._id.toString(),
          {
            quantity: item.quantity,
            unit: item.unit
          }
        ])
      );

      // Build query
      const query = {
        $or: [
          { userId: req.user._id },
          { isPublic: true }
        ]
      };

      // Add meal type filter if provided
      if (mealType) {
        query.mealTypes = mealType;
      }

      // Add prep time filter if provided
      if (maxPrepTime) {
        query.prepTime = { $lte: maxPrepTime };
      }

      // Get filtered recipes
      const recipes = await Recipe.find(query)
        .populate({
          path: 'ingredients.item',
          model: Ingredient,
          select: 'name defaultUnit'
        });

      // Filter recipes that can be made with current stock
      const possibleRecipes = recipes.filter(recipe => {
        return recipe.ingredients.every(ing => {
          const stockItem = stockMap.get(ing.item._id.toString());
          if (!stockItem) return false;
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
      console.error('Failed to fetch recipe suggestions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recipe suggestions' },
        { status: 500 }
      );
    }
  });
} 