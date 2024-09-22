// app/workouts/[id]/page.tsx

'use client'; // Enables client-side rendering for this component

import React, { useEffect, useState } from 'react'; // Import React and hooks
import { useParams, useRouter } from 'next/navigation'; // Import useParams and useRouter for route parameters and navigation
import Link from 'next/link'; // Import Link component for client-side navigation

// Define the structure of a workout as received from the API
type Workout = {
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

const WorkoutDetailPage = () => {
	const { id } = useParams<{ id: string }>(); // Extract the 'id' parameter from the URL
	const router = useRouter(); // Initialize the router for navigation
	const [workout, setWorkout] = useState<Workout | null>(null); // State to hold workout details
	const [loading, setLoading] = useState<boolean>(true); // State to manage loading status
	const [error, setError] = useState<string | null>(null); // State to manage error messages
	const [deleting, setDeleting] = useState<boolean>(false); // State to manage deletion status

	/**
	 * fetchWorkout
	 * Asynchronously fetches the workout details from the API using the workout ID.
	 */
	const fetchWorkout = async () => {
		if (!id) {
			// Check if the ID is present
			setError('No workout ID provided.'); // Set an error message if ID is missing
			setLoading(false); // Stop loading
			return;
		}

		try {
			const response = await fetch(`/api/get-workout/${id}`); // Fetch workout details from the API

			if (!response.ok) {
				// Check if the response status is not OK (200)
				const errorData = await response.json(); // Parse the error message from the response
				throw new Error(errorData.error || 'Failed to fetch workout details.'); // Throw an error with the message
			}

			const data: Workout = await response.json(); // Parse the JSON data

			setWorkout(data); // Update the workout state with fetched data
		} catch (err: any) {
			// Catch any errors that occur during the fetch
			setError(err.message || 'An unexpected error occurred.'); // Update the error state with the error message
			console.error('Error fetching workout details:', err); // Log the error for debugging
		} finally {
			setLoading(false); // Set loading to false regardless of success or failure
		}
	};

	/**
	 * handleDelete
	 * Handles the deletion of the workout by sending a DELETE request to the API.
	 */
	const handleDelete = async () => {
		const confirmDelete = confirm(
			'Are you sure you want to delete this workout? This action cannot be undone.',
		);

		if (!confirmDelete) {
			return; // Exit if the user cancels the deletion
		}

		setDeleting(true); // Set deletion status to true

		try {
			const response = await fetch(`/api/delete-workout/${id}`, {
				method: 'DELETE', // HTTP method
			});

			if (!response.ok) {
				// Check if the response status is not OK (200)
				const errorData = await response.json(); // Parse the error message from the response
				throw new Error(errorData.error || 'Failed to delete workout.'); // Throw an error with the message
			}

			const result = await response.json(); // Parse the JSON response
			console.log(result.message); // Log the success message
			alert(result.message); // Notify the user of successful deletion

			router.push('/'); // Navigate back to the home page after deletion
		} catch (err: any) {
			// Catch any errors that occur during the deletion
			setError(
				err.message ||
					'An unexpected error occurred while deleting the workout.',
			); // Update the error state with the error message
			console.error('Error deleting workout:', err); // Log the error for debugging
		} finally {
			setDeleting(false); // Reset deletion status
		}
	};

	// useEffect hook to fetch workout details when the component mounts or when 'id' changes
	useEffect(() => {
		fetchWorkout(); // Invoke the fetchWorkout function
	}, [id]); // Dependency array ensures this runs when 'id' changes

	// Render loading state
	if (loading) {
		return <div className='p-4'>Loading workout details...</div>;
	}

	// Render error message if any
	if (error) {
		return <div className='p-4 text-red-500'>Error: {error}</div>;
	}

	// Render message if no workout data is available
	if (!workout) {
		return <div className='p-4'>No workout data available.</div>;
	}

	return (
		<div className='max-w-lg mx-auto p-6 bg-gray-100 rounded-lg shadow-lg'>
			{' '}
			{/* Container with Tailwind classes */}
			<h1 className='text-2xl font-bold mb-4 text-center'>
				Workout Details
			</h1>{' '}
			{/* Page title */}
			<div className='mb-4'>
				{' '}
				{/* Container for workout date */}
				<p className='text-lg'>
					Date: {new Date(workout.date).toLocaleString()}
				</p>{' '}
				{/* Display formatted workout date */}
			</div>
			<div>
				{' '}
				{/* Container for exercises */}
				{workout.exercises.map(
					(
						exercise, // Iterate over each exercise in the workout
					) => (
						<div key={exercise.id} className='mb-4'>
							{' '}
							{/* Container for each exercise */}
							<h2 className='text-xl font-semibold'>{exercise.name}</h2>{' '}
							{/* Exercise name */}
							<ul className='list-disc list-inside mt-2'>
								{' '}
								{/* List of sets for the exercise */}
								{exercise.sets.map(
									(
										set, // Iterate over each set in the exercise
									) => (
										<li key={set.id}>
											{`Set ${set.id}: ${set.reps} reps @ ${set.weight} kg`}{' '}
											{/* Display set details */}
										</li>
									),
								)}
							</ul>
						</div>
					),
				)}
			</div>
			{/* Action Buttons */}
			<div className='flex justify-center space-x-4 mt-6'>
				{' '}
				{/* Container for buttons with spacing */}
				{/* Update Button */}
				<Link
					href={`/workouts/${workout.id}/edit`}
					className='px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700'>
					{' '}
					{/* Link to the Update Workout page */}
					Update Workout
				</Link>
				{/* Delete Button */}
				<button
					onClick={handleDelete} // Attach the handleDelete function to the button's onClick event
					className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ${
						deleting ? 'opacity-50 cursor-not-allowed' : ''
					}`} // Conditional styling based on deletion status
					disabled={deleting} // Disable the button while deletion is in progress
				>
					{deleting ? 'Deleting...' : 'Delete Workout'}{' '}
					{/* Button text changes based on deletion status */}
				</button>
			</div>
		</div>
	);
};

export default WorkoutDetailPage; // Export the WorkoutDetailPage component as default
