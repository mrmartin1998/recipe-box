import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authUtils';
import { MealPlan } from '@/models/MealPlan';
import { connectToDatabase } from '@/lib/mongodb';

// Helper function to check meal plan access
async function checkMealPlanAccess(planId, userId) {
  const plan = await MealPlan.findById(planId);
  if (!plan) {
    return { error: 'Meal plan not found', status: 404 };
  }
  if (plan.userId.toString() !== userId.toString()) {
    return { error: 'Not authorized', status: 403 };
  }
  return { plan };
}

// PUT /api/meal-plans/:id - Update meal plan
export async function PUT(request, { params }) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { plan, error, status } = await checkMealPlanAccess(params.id, req.user._id);
      if (error) {
        return NextResponse.json({ error }, { status });
      }

      const updates = await req.json();
      
      // Validate dates if they're being updated
      if (updates.startDate && updates.endDate) {
        if (new Date(updates.startDate) > new Date(updates.endDate)) {
          return NextResponse.json(
            { error: 'Start date must be before end date' },
            { status: 400 }
          );
        }
      }

      const updatedPlan = await MealPlan.findByIdAndUpdate(
        params.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('meals.recipe', 'name prepTime cookTime');

      return NextResponse.json({ mealPlan: updatedPlan });

    } catch (error) {
      console.error('Meal plan update error:', error);
      return NextResponse.json(
        { error: 'Failed to update meal plan' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/meal-plans/:id - Delete meal plan
export async function DELETE(request, { params }) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { plan, error, status } = await checkMealPlanAccess(params.id, req.user._id);
      if (error) {
        return NextResponse.json({ error }, { status });
      }

      await MealPlan.findByIdAndDelete(params.id);
      return NextResponse.json({ success: true });

    } catch (error) {
      console.error('Meal plan deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete meal plan' },
        { status: 500 }
      );
    }
  });
}

// GET /api/meal-plans/:id - Get single meal plan details
export async function GET(request, { params }) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { plan, error, status } = await checkMealPlanAccess(params.id, req.user._id);
      if (error) {
        return NextResponse.json({ error }, { status });
      }

      // Populate recipe details and sort meals by date
      await plan.populate('meals.recipe', 'name prepTime cookTime ingredients');
      plan.meals.sort((a, b) => new Date(a.date) - new Date(b.date));

      return NextResponse.json({ mealPlan: plan });

    } catch (error) {
      console.error('Meal plan fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch meal plan' },
        { status: 500 }
      );
    }
  });
} 