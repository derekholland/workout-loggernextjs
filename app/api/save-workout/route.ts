// app/api/save-workout/route.ts

import { NextRequest, NextResponse } from 'next/server'; // Import Next.js server utilities
import { prisma } from '../../../lib/prisma'; // Import the Prisma client

// Define the structure of a workout entry received from the frontend
type WorkoutEntry = {
	exercise: string; // Name of the exercise (e.g., Squat)
	weight: number; // Weight used in the exercise (e.g., 100 kg)
	reps: number; // Number of repetitions (e.g., 10 reps)
};

// Define the structure of the request body for saving a workout
type SaveWorkoutRequest = {
	workout: {
		entries: WorkoutEntry[]; // Array of workout entries
	};
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
			reps: number; // Number of repetitions in the set
			weight: number; // Weight used in the set
		}[];
	}[];
};

/**
 * POST /api/save-workout
 * Saves a new workout along with its exercises and sets to the database.
 */
export async function POST(request: NextRequest) {
	console.log('Received POST request to /api/save-workout'); // Log receipt of the request

	try {
		// Parse the JSON body of the request
		const body: SaveWorkoutRequest = await request.json();
		console.log('Request Body:', body); // Log the request body for debugging

		// Validate the request body
		if (
			!body ||
			!body.workout ||
			!Array.isArray(body.workout.entries) ||
			body.workout.entries.length === 0
		) {
			console.warn('Invalid workout data received'); // Log a warning for invalid data
			return NextResponse.json(
				{ error: 'Invalid workout data' },
				{ status: 400 },
			); // Respond with a 400 Bad Request
		}

		// Create a new workout entry in the database
		const newWorkoutFromDB = await prisma.workout.create({
			data: {
				date: new Date(), // Set the workout date to the current date and time
				exercises: {
					create: body.workout.entries.map(entry => ({
						name: entry.exercise, // Name of the exercise
						sets: {
							create: [
								{
									reps: entry.reps, // Number of reps
									weight: entry.weight, // Weight used
								},
							],
						},
					})),
				},
			},
			include: { exercises: { include: { sets: true } } }, // Include exercises and their sets in the response
		});

		console.log(`Workout saved with ID: ${newWorkoutFromDB.id}`); // Log the saved workout ID

		// Transform the date to an ISO string for the frontend
		const newWorkout: WorkoutResponse = {
			id: newWorkoutFromDB.id,
			date: newWorkoutFromDB.date.toISOString(),
			exercises: newWorkoutFromDB.exercises.map(exercise => ({
				id: exercise.id,
				name: exercise.name,
				sets: exercise.sets.map(set => ({
					id: set.id,
					reps: set.reps,
					weight: set.weight,
				})),
			})),
		};

		// Respond with the saved workout data
		return NextResponse.json(newWorkout, { status: 200 });
	} catch (error) {
		console.error('Error saving workout:', error); // Log any errors that occur during the process
		return NextResponse.json(
			{ error: 'Error saving workout' },
			{ status: 500 },
		); // Respond with a 500 Internal Server Error
	}
}
