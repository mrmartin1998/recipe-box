import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authUtils';
import { ShoppingList } from '@/models/ShoppingList';
import { Recipe } from '@/models/Recipe';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request, { params }) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { servings } = await req.json();
      
      const recipe = await Recipe.findById(params.id)
        .populate('ingredients.item', 'name defaultUnit');

      if (!recipe) {
        return NextResponse.json(
          { error: 'Recipe not found' },
          { status: 404 }
        );
      }

      // Calculate quantities based on servings
      const servingRatio = servings / recipe.servings;
      const items = recipe.ingredients.map(ing => ({
        ingredient: ing.item._id,
        amount: ing.amount * servingRatio,
        unit: ing.unit,
        notes: ing.notes
      }));

      // Create shopping list
      const shoppingList = await ShoppingList.create({
        userId: req.user._id,
        name: `Shopping List for ${recipe.name}`,
        items,
        fromRecipe: recipe._id,
        servings
      });

      await shoppingList.populate('items.ingredient', 'name defaultUnit');
      return NextResponse.json({ shoppingList });

    } catch (error) {
      console.error('Shopping list generation error:', error);
      return NextResponse.json(
        { error: 'Failed to generate shopping list' },
        { status: 500 }
      );
    }
  });
} 