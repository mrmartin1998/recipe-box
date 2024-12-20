import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authUtils';
import { MealPlan } from '@/models/MealPlan';
import { ShoppingList } from '@/models/ShoppingList';
import { connectToDatabase } from '@/lib/mongodb';

// POST /api/meal-plans/:id/shopping-list - Generate shopping list from meal plan
export async function POST(request, { params }) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      // Get meal plan with populated recipe details
      const mealPlan = await MealPlan.findOne({
        _id: params.id,
        userId: req.user._id
      }).populate({
        path: 'meals.recipe',
        select: 'name ingredients',
        populate: {
          path: 'ingredients.item',
          select: 'name defaultUnit'
        }
      });

      if (!mealPlan) {
        return NextResponse.json(
          { error: 'Meal plan not found' },
          { status: 404 }
        );
      }

      // Aggregate ingredients from all meals
      const ingredientMap = new Map();
      
      mealPlan.meals.forEach(meal => {
        if (meal.recipe && !meal.skipMeal) {
          meal.recipe.ingredients.forEach(ing => {
            const key = ing.item._id.toString();
            const servingRatio = meal.servings / meal.recipe.servings;
            const amount = ing.amount * servingRatio;
            
            if (ingredientMap.has(key)) {
              ingredientMap.get(key).amount += amount;
            } else {
              ingredientMap.set(key, {
                ingredient: ing.item._id,
                amount,
                unit: ing.unit,
                notes: ing.notes
              });
            }
          });
        }
      });

      // Create shopping list
      const shoppingList = await ShoppingList.create({
        userId: req.user._id,
        name: `Shopping List for Meal Plan (${new Date(mealPlan.startDate).toLocaleDateString()} - ${new Date(mealPlan.endDate).toLocaleDateString()})`,
        items: Array.from(ingredientMap.values()),
        fromMealPlan: mealPlan._id
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