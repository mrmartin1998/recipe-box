import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authUtils';
import { MealPlan } from '@/models/MealPlan';
import { connectToDatabase } from '@/lib/mongodb';

// Helper function to check meal access
async function checkMealAccess(planId, mealId, userId) {
  const plan = await MealPlan.findOne({
    _id: planId,
    userId,
    'meals._id': mealId
  });
  
  if (!plan) {
    return { error: 'Meal plan or meal not found', status: 404 };
  }
  
  const meal = plan.meals.find(m => m._id.toString() === mealId);
  return { plan, meal };
}

// PUT /api/meal-plans/:id/meals/:mealId - Update specific meal
export async function PUT(request, { params }) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { plan, meal, error, status } = await checkMealAccess(
        params.id, 
        params.mealId, 
        req.user._id
      );
      
      if (error) {
        return NextResponse.json({ error }, { status });
      }

      const updates = await req.json();
      
      // Update the specific meal
      const updatedPlan = await MealPlan.findOneAndUpdate(
        {
          _id: params.id,
          'meals._id': params.mealId
        },
        {
          $set: {
            'meals.$': {
              ...meal.toObject(),
              ...updates,
              _id: meal._id // Preserve the original meal ID
            }
          }
        },
        { new: true, runValidators: true }
      ).populate('meals.recipe', 'name prepTime cookTime');

      return NextResponse.json({ 
        mealPlan: updatedPlan,
        updatedMeal: updatedPlan.meals.find(m => 
          m._id.toString() === params.mealId
        )
      });

    } catch (error) {
      console.error('Meal update error:', error);
      return NextResponse.json(
        { error: 'Failed to update meal' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/meal-plans/:id/meals/:mealId - Remove meal from plan
export async function DELETE(request, { params }) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { plan, meal, error, status } = await checkMealAccess(
        params.id, 
        params.mealId, 
        req.user._id
      );
      
      if (error) {
        return NextResponse.json({ error }, { status });
      }

      // Remove the meal from the plan
      const updatedPlan = await MealPlan.findByIdAndUpdate(
        params.id,
        {
          $pull: { meals: { _id: params.mealId } }
        },
        { new: true }
      ).populate('meals.recipe', 'name prepTime cookTime');

      return NextResponse.json({ mealPlan: updatedPlan });

    } catch (error) {
      console.error('Meal deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete meal' },
        { status: 500 }
      );
    }
  });
} 