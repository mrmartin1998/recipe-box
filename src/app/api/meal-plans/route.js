import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authUtils';
import { MealPlan } from '@/models/MealPlan';
import { connectToDatabase } from '@/lib/mongodb';

// POST /api/meal-plans - Create meal plan
export async function POST(request) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const userId = req.user._id;
      const { startDate, endDate, meals, notes } = await req.json();

      // Validate required fields
      if (!startDate || !endDate || !meals?.length) {
        return NextResponse.json(
          { error: 'Start date, end date, and meals are required' },
          { status: 400 }
        );
      }

      // Validate dates
      if (new Date(startDate) > new Date(endDate)) {
        return NextResponse.json(
          { error: 'Start date must be before end date' },
          { status: 400 }
        );
      }

      // Create meal plan
      const mealPlan = await MealPlan.create({
        userId,
        startDate,
        endDate,
        meals,
        notes
      });

      // Populate recipe details
      await mealPlan.populate('meals.recipe', 'name prepTime cookTime');

      return NextResponse.json({ mealPlan });

    } catch (error) {
      console.error('Meal plan creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create meal plan' },
        { status: 500 }
      );
    }
  });
}

// GET /api/meal-plans - List meal plans
export async function GET(request) {
  return withAuth(request, async (req) => {
    try {
      await connectToDatabase();
      
      const { searchParams } = new URL(req.url);
      const from = searchParams.get('from');
      const to = searchParams.get('to');

      // Build query
      const query = { userId: req.user._id };
      
      if (from || to) {
        query.$or = [];
        if (from) {
          query.$or.push({ endDate: { $gte: new Date(from) } });
        }
        if (to) {
          query.$or.push({ startDate: { $lte: new Date(to) } });
        }
      }

      const mealPlans = await MealPlan.find(query)
        .populate('meals.recipe', 'name prepTime cookTime')
        .sort({ startDate: 1 });

      return NextResponse.json({ mealPlans });

    } catch (error) {
      console.error('Meal plan list error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch meal plans' },
        { status: 500 }
      );
    }
  });
} 