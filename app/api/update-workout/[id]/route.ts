// app/api/update-workout/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'; // Import Next.js server utilities
import { prisma } from '../../../../lib/prisma'; // Import the Prisma client

// Define the structure of a workout set received from the frontend
type WorkoutSet = {
	id?: number; // Optional: ID of the set (required for updating existing sets)
	reps: number; // Number of repetitions in the set
	weight: number; // Weight used in the set
};

// Define the structure of an exercise received from the frontend
type WorkoutExercise = {
	id?: number; // Optional: ID of the exercise (required for updating existing exercises)
	name: string; // Name of the exercise
	sets: WorkoutSet[]; // Array of sets for the exercise
};

// Define the structure of the request body for updating a workout
type UpdateWorkoutRequest = {
	date?: string; // Optional: New date for the workout (ISO string)
	exercises?: WorkoutExercise[]; // Optional: Updated list of exercises
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
 * PUT /api/update-workout/[id]
 * Updates a specific workout along with its exercises and sets.
 */
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const { id } = params; // Extract the workout ID from the URL parameters
	console.log(`Received PUT request to /api/update-workout/${id}`); // Log receipt of the request

	// Validate the ID
	const workoutId = parseInt(id, 10); // Convert the ID to an integer
	if (isNaN(workoutId)) {
		// Check if the conversion was successful
		console.warn(`Invalid workout ID received: ${id}`); // Log a warning for invalid ID
		return NextResponse.json({ error: 'Invalid workout ID' }, { status: 400 }); // Respond with a 400 Bad Request
	}

	try {
		// Parse the JSON body of the request
		const body: UpdateWorkoutRequest = await request.json();
		console.log('Request Body:', body); // Log the request body for debugging

		// Find the existing workout
		const existingWorkout = await prisma.workout.findUnique({
			where: { id: workoutId }, // Search by workout ID
			include: { exercises: { include: { sets: true } } }, // Include exercises and sets
		});

		if (!existingWorkout) {
			// Check if the workout exists
			console.warn(`Workout not found with ID: ${workoutId}`); // Log a warning if not found
			return NextResponse.json({ error: 'Workout not found' }, { status: 404 }); // Respond with a 404 Not Found
		}

		// Prepare the data for updating
		const updateData: any = {};

		// Update the date if provided
		if (body.date) {
			updateData.date = new Date(body.date); // Convert the ISO string to a Date object
		}

		// Update exercises if provided
		if (body.exercises) {
			updateData.exercises = {
				upsert: body.exercises.map(exercise => ({
					where: { id: exercise.id }, // Identify the exercise by ID
					update: {
						name: exercise.name, // Update the exercise name
						sets: {
							upsert: exercise.sets.map(set => ({
								where: { id: set.id }, // Identify the set by ID
								update: {
									reps: set.reps, // Update the number of reps
									weight: set.weight, // Update the weight
								},
								create: {
									reps: set.reps, // Create a new set if it doesn't exist
									weight: set.weight, // Set the weight
								},
							})),
						},
					},
					create: {
						// Create a new exercise if it doesn't exist
						name: exercise.name, // Set the exercise name
						sets: {
							create: exercise.sets.map(set => ({
								reps: set.reps, // Set the number of reps
								weight: set.weight, // Set the weight
							})),
						},
					},
				})),
			};
		}

		// Update the workout in the database
		const updatedWorkout = await prisma.workout.update({
			where: { id: workoutId }, // Specify the workout to update
			data: updateData, // Provide the update data
			include: { exercises: { include: { sets: true } } }, // Include exercises and sets in the response
		});

		console.log(`Workout updated with ID: ${updatedWorkout.id}`); // Log the updated workout ID

		// Transform the date to an ISO string for the frontend
		const workoutResponse: WorkoutResponse = {
			id: updatedWorkout.id,
			date: updatedWorkout.date.toISOString(),
			exercises: updatedWorkout.exercises.map(exercise => ({
				id: exercise.id,
				name: exercise.name,
				sets: exercise.sets.map(set => ({
					id: set.id,
					reps: set.reps,
					weight: set.weight,
				})),
			})),
		};

		// Respond with the updated workout data
		return NextResponse.json(workoutResponse, { status: 200 });
	} catch (error) {
		console.error(`Error updating workout with ID ${workoutId}:`, error); // Log any errors that occur during the process
		return NextResponse.json(
			{ error: 'Error updating workout' },
			{ status: 500 },
		); // Respond with a 500 Internal Server Error
	}
}
