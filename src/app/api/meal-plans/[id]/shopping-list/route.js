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
      
      const mealPlanId = await params.id;
      
      // Get meal plan with populated recipe details
      const mealPlan = await MealPlan.findOne({
        _id: mealPlanId,
        userId: req.user._id
      }).populate({
        path: 'meals.recipe',
        select: 'name ingredients servings',
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

      // Debug log
      console.log('Meal Plan Data:', {
        id: mealPlan._id,
        meals: mealPlan.meals.map(meal => ({
          recipe: meal.recipe ? {
            id: meal.recipe._id,
            servings: meal.recipe.servings,
            ingredientsCount: meal.recipe.ingredients?.length
          } : null,
          servings: meal.servings
        }))
      });

      // Validate recipe data before processing
      for (const meal of mealPlan.meals) {
        if (meal.recipe && !meal.skipMeal) {
          if (!meal.recipe.ingredients || !meal.recipe.servings) {
            console.error('Invalid recipe data:', meal.recipe);
            return NextResponse.json(
              { error: 'Invalid recipe data' },
              { status: 400 }
            );
          }
        }
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
      console.error('Shopping list generation error details:', {
        error: error.message,
        stack: error.stack,
        mealPlanId: params.id
      });
      return NextResponse.json(
        { error: 'Failed to generate shopping list' },
        { status: 500 }
      );
    }
  });
} 