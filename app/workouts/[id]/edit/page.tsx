// app/workouts/[id]/edit/page.tsx

'use client'; // Enables client-side rendering for this component

import React, { useEffect, useState } from 'react'; // Import React and hooks
import { useParams, useRouter } from 'next/navigation'; // Import useParams and useRouter for route parameters and navigation

// Define the structure of a workout set received from the API
type WorkoutSet = {
	id?: number; // Optional: ID of the set (required for updating existing sets)
	reps: number; // Number of repetitions in the set
	weight: number; // Weight used in the set
};

// Define the structure of an exercise received from the API
type WorkoutExercise = {
	id?: number; // Optional: ID of the exercise (required for updating existing exercises)
	name: string; // Name of the exercise
	sets: WorkoutSet[]; // Array of sets for the exercise
};

// Define the structure of the workout as received from the API
type Workout = {
	id: number; // Unique identifier for the workout
	date: string; // ISO string representing the workout date
	exercises: WorkoutExercise[]; // Array of exercises within the workout
};

const UpdateWorkoutPage = () => {
	const { id } = useParams<{ id: string }>(); // Extract the 'id' parameter from the URL
	const router = useRouter(); // Initialize the router for navigation
	const [workout, setWorkout] = useState<Workout | null>(null); // State to hold workout details
	const [loading, setLoading] = useState<boolean>(true); // State to manage loading status
	const [error, setError] = useState<string | null>(null); // State to manage error messages
	const [updating, setUpdating] = useState<boolean>(false); // State to manage update status

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
	 * handleExerciseChange
	 * Handles changes to the exercise name.
	 */
	const handleExerciseChange = (index: number, newName: string) => {
		if (!workout) return; // Exit if workout data is not available

		const updatedExercises = [...workout.exercises]; // Create a copy of the exercises array
		updatedExercises[index].name = newName; // Update the exercise name at the specified index
		setWorkout({ ...workout, exercises: updatedExercises }); // Update the workout state
	};

	/**
	 * handleSetChange
	 * Handles changes to a specific set within an exercise.
	 */
	const handleSetChange = (
		exerciseIndex: number,
		setIndex: number,
		field: 'reps' | 'weight',
		value: number,
	) => {
		if (!workout) return; // Exit if workout data is not available

		const updatedExercises = [...workout.exercises]; // Create a copy of the exercises array
		updatedExercises[exerciseIndex].sets[setIndex][field] = value; // Update the specified field in the set
		setWorkout({ ...workout, exercises: updatedExercises }); // Update the workout state
	};

	/**
	 * handleAddExercise
	 * Adds a new exercise to the workout.
	 */
	const handleAddExercise = () => {
		if (!workout) return; // Exit if workout data is not available

		const newExercise: WorkoutExercise = {
			name: '', // Initialize with an empty name
			sets: [], // Initialize with an empty sets array
		};

		setWorkout({ ...workout, exercises: [...workout.exercises, newExercise] }); // Add the new exercise to the workout
	};

	/**
	 * handleRemoveExercise
	 * Removes an exercise from the workout.
	 */
	const handleRemoveExercise = (index: number) => {
		if (!workout) return; // Exit if workout data is not available

		const updatedExercises = [...workout.exercises]; // Create a copy of the exercises array
		updatedExercises.splice(index, 1); // Remove the exercise at the specified index
		setWorkout({ ...workout, exercises: updatedExercises }); // Update the workout state
	};

	/**
	 * handleAddSet
	 * Adds a new set to a specific exercise.
	 */
	const handleAddSet = (exerciseIndex: number) => {
		if (!workout) return; // Exit if workout data is not available

		const newSet: WorkoutSet = {
			reps: 0, // Initialize with 0 reps
			weight: 0, // Initialize with 0 weight
		};

		const updatedExercises = [...workout.exercises]; // Create a copy of the exercises array
		updatedExercises[exerciseIndex].sets.push(newSet); // Add the new set to the specified exercise
		setWorkout({ ...workout, exercises: updatedExercises }); // Update the workout state
	};

	/**
	 * handleRemoveSet
	 * Removes a set from a specific exercise.
	 */
	const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
		if (!workout) return; // Exit if workout data is not available

		const updatedExercises = [...workout.exercises]; // Create a copy of the exercises array
		updatedExercises[exerciseIndex].sets.splice(setIndex, 1); // Remove the set at the specified index
		setWorkout({ ...workout, exercises: updatedExercises }); // Update the workout state
	};

	/**
	 * handleSubmit
	 * Handles the submission of the updated workout data.
	 */
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault(); // Prevent the default form submission behavior

		if (!workout) return; // Exit if workout data is not available

		setUpdating(true); // Set updating status to true

		try {
			// Prepare the data to match the API's expected structure
			const formattedWorkout = {
				date: workout.date, // Use the existing workout date or updated date
				exercises: workout.exercises.map(exercise => ({
					id: exercise.id, // Include the exercise ID for updating existing exercises
					name: exercise.name, // Updated exercise name
					sets: exercise.sets.map(set => ({
						id: set.id, // Include the set ID for updating existing sets
						reps: set.reps, // Updated number of reps
						weight: set.weight, // Updated weight
					})),
				})),
			};

			// Send a PUT request to update the workout
			const response = await fetch(`/api/update-workout/${id}`, {
				method: 'PUT', // HTTP method
				headers: { 'Content-Type': 'application/json' }, // Set content type to JSON
				body: JSON.stringify(formattedWorkout), // Convert data to JSON string
			});

			if (!response.ok) {
				// Check if the response status is not OK (200)
				const errorData = await response.json(); // Parse the error message from the response
				throw new Error(errorData.error || 'Failed to update workout.'); // Throw an error with the message
			}

			const updatedWorkout: Workout = await response.json(); // Parse the JSON response
			console.log('Workout updated:', updatedWorkout); // Log the updated workout
			alert('Workout updated successfully!'); // Notify the user of successful update

			router.push(`/workouts/${updatedWorkout.id}`); // Navigate back to the Workout Detail page
		} catch (err: any) {
			// Catch any errors that occur during the update
			setError(
				err.message ||
					'An unexpected error occurred while updating the workout.',
			); // Update the error state with the error message
			console.error('Error updating workout:', err); // Log the error for debugging
		} finally {
			setUpdating(false); // Reset updating status
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
		<div className='max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg'>
			{' '}
			{/* Container with Tailwind classes */}
			<h1 className='text-2xl font-bold mb-6 text-center'>
				Update Workout
			</h1>{' '}
			{/* Page title */}
			{/* Update Workout Form */}
			<form onSubmit={handleSubmit}>
				{' '}
				{/* Form submission handled by handleSubmit */}
				{/* Workout Date Input */}
				<div className='mb-4'>
					<label className='block text-lg font-medium mb-2'>
						Workout Date:
					</label>{' '}
					{/* Date input label */}
					<input
						type='datetime-local' // Input type for date and time
						value={new Date(workout.date).toISOString().slice(0, 16)} // Format the date for the input
						onChange={e => setWorkout({ ...workout, date: e.target.value })} // Update the workout date on change
						className='w-full p-2 border border-gray-300 rounded-lg' // Styling with Tailwind
						required // Make the input required
					/>
				</div>
				{/* Exercises Section */}
				<div className='mb-6'>
					<h2 className='text-xl font-semibold mb-2'>Exercises</h2>{' '}
					{/* Exercises section title */}
					{workout.exercises.map(
						(
							exercise,
							exerciseIndex, // Iterate over each exercise
						) => (
							<div
								key={exerciseIndex}
								className='mb-4 p-4 bg-white rounded-lg shadow'>
								{' '}
								{/* Container for each exercise */}
								{/* Exercise Name Input */}
								<div className='flex justify-between items-center mb-2'>
									<input
										type='text' // Input type text
										value={exercise.name} // Controlled input value
										onChange={e =>
											handleExerciseChange(exerciseIndex, e.target.value)
										} // Handle changes to the exercise name
										placeholder='Exercise Name' // Placeholder text
										className='w-3/4 p-2 border border-gray-300 rounded-lg' // Styling with Tailwind
										required // Make the input required
									/>
									{/* Remove Exercise Button */}
									<button
										type='button' // Button type button to prevent form submission
										onClick={() => handleRemoveExercise(exerciseIndex)} // Handle removing the exercise
										className='px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700'>
										Remove
									</button>
								</div>
								{/* Sets Section */}
								<div className='ml-4'>
									<h3 className='text-lg font-medium mb-2'>Sets:</h3>{' '}
									{/* Sets section title */}
									{exercise.sets.map(
										(
											set,
											setIndex, // Iterate over each set
										) => (
											<div key={setIndex} className='flex items-center mb-2'>
												{/* Reps Input */}
												<input
													type='number' // Input type number
													value={set.reps} // Controlled input value
													onChange={e =>
														handleSetChange(
															exerciseIndex,
															setIndex,
															'reps',
															Number(e.target.value),
														)
													} // Handle changes to reps
													placeholder='Reps' // Placeholder text
													className='w-24 p-2 border border-gray-300 rounded-lg mr-2' // Styling with Tailwind
													min='0' // Minimum value constraint
													required // Make the input required
												/>

												{/* Weight Input */}
												<input
													type='number' // Input type number
													value={set.weight} // Controlled input value
													onChange={e =>
														handleSetChange(
															exerciseIndex,
															setIndex,
															'weight',
															Number(e.target.value),
														)
													} // Handle changes to weight
													placeholder='Weight (kg)' // Placeholder text
													className='w-32 p-2 border border-gray-300 rounded-lg mr-2' // Styling with Tailwind
													min='0' // Minimum value constraint
													required // Make the input required
												/>

												{/* Remove Set Button */}
												<button
													type='button' // Button type button to prevent form submission
													onClick={() =>
														handleRemoveSet(exerciseIndex, setIndex)
													} // Handle removing the set
													className='px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700'>
													Remove
												</button>
											</div>
										),
									)}
									{/* Add Set Button */}
									<button
										type='button' // Button type button to prevent form submission
										onClick={() => handleAddSet(exerciseIndex)} // Handle adding a new set
										className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mt-2'>
										Add Set
									</button>
								</div>
							</div>
						),
					)}
					{/* Add Exercise Button */}
					<button
						type='button' // Button type button to prevent form submission
						onClick={handleAddExercise} // Handle adding a new exercise
						className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
						Add Exercise
					</button>
				</div>
				{/* Submit Button */}
				<div className='text-center'>
					<button
						type='submit' // Button type submit to trigger form submission
						className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 ${
							updating ? 'opacity-50 cursor-not-allowed' : ''
						}`} // Conditional styling based on update status
						disabled={updating} // Disable the button while updating
					>
						{updating ? 'Updating...' : 'Update Workout'}{' '}
						{/* Button text changes based on update status */}
					</button>
				</div>
			</form>
		</div>
	);
};

export default UpdateWorkoutPage; // Export the UpdateWorkoutPage component as default
