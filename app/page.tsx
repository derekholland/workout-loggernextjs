// app/page.tsx

'use client'; // Enables client-side rendering for this component

import React, { useEffect, useState } from 'react'; // Import React and hooks
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

const Home = () => {
	// State to hold the list of workouts
	const [workouts, setWorkouts] = useState<Workout[]>([]);

	// State to manage loading status
	const [loading, setLoading] = useState<boolean>(true);

	// State to manage error messages
	const [error, setError] = useState<string | null>(null);

	/**
	 * fetchWorkouts
	 * Asynchronously fetches the list of workouts from the API.
	 */
	const fetchWorkouts = async () => {
		try {
			const response = await fetch('/api/get-workouts'); // Fetch data from the API

			if (!response.ok) {
				// Check if the response status is not OK (200)
				const errorData = await response.json(); // Parse the error message from the response
				throw new Error(errorData.error || 'Failed to fetch workouts.'); // Throw an error with the message
			}

			const data: Workout[] = await response.json(); // Parse the JSON data

			setWorkouts(data); // Update the workouts state with fetched data
		} catch (err: any) {
			// Catch any errors that occur during the fetch
			setError(err.message || 'An unexpected error occurred.'); // Update the error state with the error message
			console.error('Error fetching workouts:', err); // Log the error for debugging
		} finally {
			setLoading(false); // Set loading to false regardless of success or failure
		}
	};

	// useEffect hook to fetch workouts when the component mounts
	useEffect(() => {
		fetchWorkouts(); // Invoke the fetchWorkouts function
	}, []); // Empty dependency array ensures this runs only once on mount

	return (
		<div className='max-w-2xl mx-auto p-6 bg-gray-100 min-h-screen'>
			{' '}
			{/* Container with Tailwind classes */}
			<h1 className='text-3xl font-bold mb-6 text-center'>
				Your Workouts
			</h1>{' '}
			{/* Page title */}
			{/* Link to the Log Workout page */}
			<div className='mb-6 text-center'>
				<Link
					href='/workout'
					className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
					{' '}
					{/* Next.js Link for client-side navigation */} {/* Styled button */}
					Log a New Workout
				</Link>
			</div>
			{/* Display loading state */}
			{loading && <p>Loading workouts...</p>}
			{/* Display error message if any */}
			{error && <p className='text-red-500'>{error}</p>}
			{/* Display message if no workouts are logged */}
			{!loading && !error && workouts.length === 0 && (
				<p>No workouts logged yet.</p>
			)}
			{/* Display list of workouts if available */}
			{!loading && !error && workouts.length > 0 && (
				<ul className='space-y-4'>
					{' '}
					{/* List container with spacing between items */}
					{workouts.map(
						(
							workout, // Iterate over each workout
						) => (
							<li key={workout.id} className='p-4 bg-white rounded-lg shadow'>
								{' '}
								{/* List item with styling */}
								<Link href={`/workouts/${workout.id}`} className='block'>
									{' '}
									{/* Link to the workout detail page */}{' '}
									{/* Make the entire list item clickable */}
									<div className='flex justify-between items-center'>
										{' '}
										{/* Flex container to space out content */}
										<span className='text-lg font-medium'>
											{new Date(workout.date).toLocaleString()}{' '}
											{/* Display formatted workout date */}
										</span>
										<span className='text-sm text-gray-500'>
											{workout.exercises.length} Exercises{' '}
											{/* Display the number of exercises */}
										</span>
									</div>
								</Link>
							</li>
						),
					)}
				</ul>
			)}
		</div>
	);
};

export default Home; // Export the Home component as default
