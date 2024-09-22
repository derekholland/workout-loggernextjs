// app/api/get-workout/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'; // Import Next.js server utilities
import { prisma } from '../../../../lib/prisma'; // Import the Prisma client

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
 * GET /api/get-workout/[id]
 * Retrieves a specific workout by ID along with its exercises and sets.
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const { id } = params; // Extract the workout ID from the URL parameters
	console.log(`Received GET request to /api/get-workout/${id}`); // Log receipt of the request

	// Validate the ID
	const workoutId = parseInt(id, 10); // Convert the ID to an integer
	if (isNaN(workoutId)) {
		// Check if the conversion was successful
		console.warn(`Invalid workout ID received: ${id}`); // Log a warning for invalid ID
		return NextResponse.json({ error: 'Invalid workout ID' }, { status: 400 }); // Respond with a 400 Bad Request
	}

	try {
		// Fetch the specific workout from the database, including its exercises and sets
		const workoutFromDB: WorkoutFromDB | null = await prisma.workout.findUnique(
			{
				where: { id: workoutId }, // Search by workout ID
				include: {
					exercises: {
						include: {
							sets: true, // Include all sets for each exercise
						},
					},
				},
			},
		);

		if (!workoutFromDB) {
			// Check if the workout exists
			console.warn(`Workout not found with ID: ${workoutId}`); // Log a warning if not found
			return NextResponse.json({ error: 'Workout not found' }, { status: 404 }); // Respond with a 404 Not Found
		}

		console.log(`Fetched workout with ID: ${workoutFromDB.id}`); // Log the fetched workout ID

		// Transform the data to convert Date objects to ISO strings
		const workoutResponse: WorkoutResponse = {
			id: workoutFromDB.id,
			date: workoutFromDB.date.toISOString(),
			exercises: workoutFromDB.exercises.map(exercise => ({
				id: exercise.id,
				name: exercise.name,
				sets: exercise.sets.map(set => ({
					id: set.id,
					reps: set.reps,
					weight: set.weight,
				})),
			})),
		};

		// Respond with the transformed workout data
		return NextResponse.json(workoutResponse, { status: 200 });
	} catch (error) {
		console.error(`Error fetching workout with ID ${workoutId}:`, error); // Log any errors that occur during the process
		return NextResponse.json(
			{ error: 'Error fetching workout' },
			{ status: 500 },
		); // Respond with a 500 Internal Server Error
	}
}
