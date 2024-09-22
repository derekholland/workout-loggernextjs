// app/api/delete-workout/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'; // Import Next.js server utilities
import { prisma } from '../../../../lib/prisma'; // Import the Prisma client

// Define the structure of the response sent back to the frontend
type DeleteWorkoutResponse = {
	message: string; // Success message
};

/**
 * DELETE /api/delete-workout/[id]
 * Deletes a specific workout along with its exercises and sets.
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const { id } = params; // Extract the workout ID from the URL parameters
	console.log(`Received DELETE request to /api/delete-workout/${id}`); // Log receipt of the request

	// Validate the ID
	const workoutId = parseInt(id, 10); // Convert the ID to an integer
	if (isNaN(workoutId)) {
		// Check if the conversion was successful
		console.warn(`Invalid workout ID received: ${id}`); // Log a warning for invalid ID
		return NextResponse.json({ error: 'Invalid workout ID' }, { status: 400 }); // Respond with a 400 Bad Request
	}

	try {
		// Check if the workout exists
		const existingWorkout = await prisma.workout.findUnique({
			where: { id: workoutId }, // Search by workout ID
		});

		if (!existingWorkout) {
			// Check if the workout exists
			console.warn(`Workout not found with ID: ${workoutId}`); // Log a warning if not found
			return NextResponse.json({ error: 'Workout not found' }, { status: 404 }); // Respond with a 404 Not Found
		}

		// Delete the workout. Due to cascade delete, associated exercises and sets will also be deleted.
		await prisma.workout.delete({
			where: { id: workoutId }, // Specify the workout to delete
		});

		console.log(`Workout deleted with ID: ${workoutId}`); // Log the deletion

		// Respond with a success message
		const response: DeleteWorkoutResponse = {
			message: 'Workout deleted successfully.',
		};

		return NextResponse.json(response, { status: 200 }); // Respond with the success message
	} catch (error) {
		console.error(`Error deleting workout with ID ${workoutId}:`, error); // Log any errors that occur during the process
		return NextResponse.json(
			{ error: 'Error deleting workout' },
			{ status: 500 },
		); // Respond with a 500 Internal Server Error
	}
}
