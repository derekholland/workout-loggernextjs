// app/api/get-workouts/route.ts

import { NextRequest, NextResponse } from 'next/server'; // Import Next.js server utilities
import { prisma } from '../../../lib/prisma'; // Import the Prisma client

// Define the structure of a workout retrieved from the database
type WorkoutFromDB = {
	id: number; // Unique identifier for the workout
	date: Date; // Date and time of the workout
	exercises: {
		id: number; // Unique identifier for the exercise
		name: string; // Name of the exercise
		sets: {
			id: number; // Unique identifier for the set
			reps: number; // Number of reps in the set
			weight: number; // Weight used in the set
		}[];
	}[];
};

// Define the structure of the response sent back to the frontend
type WorkoutResponse = {
	id: number; // Unique identifier for the workout
	date: string; // ISO string representing the workout date
	exercises: {
		id: number; // Unique identifier for the exercise
		name: string; // Name of the exercise
		sets: {
			id: number; // Unique identifier for the set
			reps: number; // Number of reps in the set
			weight: number; // Weight used in the set
		}[];
	}[];
};

/**
 * GET /api/get-workouts
 * Retrieves all workouts along with their exercises and sets from the database.
 */
export async function GET(request: NextRequest) {
	console.log('Received GET request to /api/get-workouts'); // Log receipt of the request

	try {
		// Fetch all workouts from the database, including their exercises and sets, ordered by date descending
		const workoutsFromDB: WorkoutFromDB[] = await prisma.workout.findMany({
			orderBy: { date: 'desc' }, // Order workouts by date, newest first
			include: {
				exercises: {
					include: {
						sets: true, // Include all sets for each exercise
					},
				},
			},
		});

		console.log(`Fetched ${workoutsFromDB.length} workouts from the database`); // Log the number of workouts fetched

		// Transform the data to convert Date objects to ISO strings
		const workoutsResponse: WorkoutResponse[] = workoutsFromDB.map(workout => ({
			id: workout.id,
			date: workout.date.toISOString(),
			exercises: workout.exercises.map(exercise => ({
				id: exercise.id,
				name: exercise.name,
				sets: exercise.sets.map(set => ({
					id: set.id,
					reps: set.reps,
					weight: set.weight,
				})),
			})),
		}));

		// Respond with the transformed workout data
		return NextResponse.json(workoutsResponse, { status: 200 });
	} catch (error) {
		console.error('Error fetching workouts:', error); // Log any errors that occur during the process
		return NextResponse.json(
			{ error: 'Error fetching workouts' },
			{ status: 500 },
		); // Respond with a 500 Internal Server Error
	}
}
