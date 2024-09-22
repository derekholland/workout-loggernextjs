// app/workout/page.tsx

'use client'; // Enables client-side rendering for this component

import React, { useState } from 'react'; // Import React and useState hook
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

// Define the structure of a workout set
type WorkoutSet = {
	weight: number; // Weight used in the set (e.g., 100 kg)
	reps: number; // Number of repetitions in the set (e.g., 10 reps)
};

// Define the structure of an exercise within a workout
type WorkoutExercise = {
	exercise: string; // Name of the exercise (e.g., Squat)
	sets: WorkoutSet[]; // Array of sets for the exercise
};

const WorkoutLogger = () => {
	const router = useRouter(); // Initialize the router for navigation
	const exercises = [
		'Squat',
		'Bench Press',
		'Deadlift',
		'Overhead Press',
		'Barbell Row',
	]; // Predefined list of exercises

	// State to manage the selected exercise from the dropdown
	const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

	// State to manage the sets for the current exercise being added
	const [sets, setSets] = useState<WorkoutSet[]>([]);

	// State to manage all exercises in the current workout
	const [workout, setWorkout] = useState<WorkoutExercise[]>([]);

	// State to manage the current set input (weight and reps)
	const [currentSet, setCurrentSet] = useState<WorkoutSet>({
		weight: 0,
		reps: 0,
	});

	/**
	 * handleSelectExercise
	 * Handles the selection of an exercise from the dropdown.
	 */
	const handleSelectExercise = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedExercise(e.target.value); // Update the selected exercise
		setSets([]); // Reset sets when a new exercise is selected
	};

	/**
	 * handleSetChange
	 * Handles changes to the set input fields (weight and reps).
	 */
	const handleSetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target; // Destructure name and value from the input
		setCurrentSet({
			...currentSet, // Spread existing set data
			[name]: Number(value), // Update the specific field (weight or reps)
		});
	};

	/**
	 * handleAddSet
	 * Adds the current set to the sets array if valid.
	 */
	const handleAddSet = () => {
		if (currentSet.weight > 0 && currentSet.reps > 0) {
			// Validate inputs
			setSets([...sets, currentSet]); // Add the current set to the sets array
			setCurrentSet({ weight: 0, reps: 0 }); // Reset the current set inputs
		} else {
			alert('Please enter valid weight and reps.'); // Alert the user if inputs are invalid
		}
	};

	/**
	 * handleAddExercise
	 * Adds the current exercise and its sets to the workout array.
	 */
	const handleAddExercise = () => {
		if (selectedExercise && sets.length > 0) {
			// Ensure an exercise is selected and at least one set is added
			setWorkout([...workout, { exercise: selectedExercise, sets }]); // Add the exercise to the workout array
			setSelectedExercise(null); // Reset the selected exercise
			setSets([]); // Reset the sets for the next exercise
		} else {
			alert('Please select an exercise and add at least one set.'); // Alert the user if validation fails
		}
	};

	/**
	 * handleFinishWorkout
	 * Sends the completed workout to the API and navigates back to the home page.
	 */
	const handleFinishWorkout = async () => {
		if (workout.length === 0) {
			// Ensure at least one exercise is added
			alert('Please add at least one exercise before finishing the workout.'); // Alert the user
			return;
		}

		try {
			// Prepare the data to match the API's expected structure
			const formattedWorkout = {
				workout: {
					entries: workout.flatMap(exercise =>
						exercise.sets.map(set => ({
							exercise: exercise.exercise, // Exercise name
							weight: set.weight, // Weight used
							reps: set.reps, // Number of reps
						})),
					),
				},
			};

			// Send a POST request to save the workout
			const response = await fetch('/api/save-workout', {
				method: 'POST', // HTTP method
				headers: { 'Content-Type': 'application/json' }, // Set content type to JSON
				body: JSON.stringify(formattedWorkout), // Convert data to JSON string
			});

			if (response.ok) {
				// Check if the response status is OK (200)
				const result = await response.json(); // Parse the JSON response
				console.log('Workout saved:', result); // Log the saved workout
				alert('Workout saved successfully!'); // Notify the user

				router.push('/'); // Navigate back to the home page
			} else {
				// If the response status is not OK
				const errorData = await response.json(); // Parse the error message
				console.error('Error saving workout:', errorData.error); // Log the error
				alert(`Error saving workout: ${errorData.error}`); // Notify the user
			}
		} catch (error) {
			// Catch any errors during the fetch
			console.error('Error saving workout:', error); // Log the error
			alert('An unexpected error occurred while saving the workout.'); // Notify the user
		}
	};

	return (
		<div className='max-w-md mx-auto p-6 bg-gray-100 rounded-lg shadow-lg'>
			{' '}
			{/* Container with Tailwind classes */}
			<h1 className='text-2xl font-bold mb-6 text-center'>
				Workout Logger
			</h1>{' '}
			{/* Page title */}
			{/* Exercise selection dropdown */}
			{!selectedExercise && ( // Show dropdown only if no exercise is currently selected
				<div className='mb-4'>
					<label className='block text-lg font-medium mb-2'>
						Select Exercise:
					</label>{' '}
					{/* Dropdown label */}
					<select
						value={selectedExercise || ''} // Controlled input value
						onChange={handleSelectExercise} // Handle selection changes
						className='w-full p-2 border border-gray-300 rounded-lg' // Styling with Tailwind
					>
						<option value='' disabled>
							{' '}
							{/* Placeholder option */}
							-- Select an Exercise --
						</option>
						{exercises.map(
							(
								exercise,
								idx, // Iterate over predefined exercises
							) => (
								<option key={idx} value={exercise}>
									{' '}
									{/* Dropdown options */}
									{exercise}
								</option>
							),
						)}
					</select>
				</div>
			)}
			{/* Set inputs for weight and reps */}
			{selectedExercise && ( // Show set inputs only if an exercise is selected
				<div className='mb-6'>
					<h2 className='text-xl font-semibold mb-4'>{selectedExercise}</h2>{' '}
					{/* Selected exercise name */}
					<div className='mb-4'>
						<label className='block text-lg font-medium mb-2'>
							Weight (kg):
						</label>{' '}
						{/* Weight input label */}
						<input
							type='number' // Input type number
							name='weight' // Name attribute for identification
							value={currentSet.weight} // Controlled input value
							onChange={handleSetChange} // Handle input changes
							className='w-full p-2 border border-gray-300 rounded-lg' // Styling with Tailwind
							min='0' // Minimum value constraint
						/>
					</div>
					<div className='mb-4'>
						<label className='block text-lg font-medium mb-2'>Reps:</label>{' '}
						{/* Reps input label */}
						<input
							type='number' // Input type number
							name='reps' // Name attribute for identification
							value={currentSet.reps} // Controlled input value
							onChange={handleSetChange} // Handle input changes
							className='w-full p-2 border border-gray-300 rounded-lg' // Styling with Tailwind
							min='0' // Minimum value constraint
						/>
					</div>
					<button
						onClick={handleAddSet} // Handle adding the set
						className='w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700' // Styling with Tailwind
					>
						Add Set
					</button>
					<div className='mt-4'>
						<h3 className='text-lg font-medium'>Logged Sets:</h3>{' '}
						{/* Logged sets title */}
						<ul className='list-disc list-inside mt-2'>
							{' '}
							{/* List of logged sets */}
							{sets.map(
								(
									set,
									idx, // Iterate over sets
								) => (
									<li key={idx} className='mt-1'>
										{`Set ${idx + 1}: ${set.weight} kg x ${set.reps} reps`}{' '}
										{/* Display set details */}
									</li>
								),
							)}
						</ul>
					</div>
					<button
						onClick={handleAddExercise} // Handle adding the exercise
						className='w-full mt-4 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700' // Styling with Tailwind
					>
						Add Exercise
					</button>
				</div>
			)}
			{/* Workout summary and finish button */}
			{workout.length > 0 && ( // Show workout summary only if there are exercises added
				<div className='mt-6'>
					<h2 className='text-xl font-semibold mb-4'>Workout Summary</h2>{' '}
					{/* Summary title */}
					<ul className='list-disc list-inside'>
						{' '}
						{/* List of exercises */}
						{workout.map(
							(
								entry,
								idx, // Iterate over each exercise in the workout
							) => (
								<li key={idx} className='mt-2'>
									<strong>{entry.exercise}</strong> {/* Exercise name */}
									<ul className='list-disc list-inside ml-6 mt-1'>
										{' '}
										{/* List of sets for the exercise */}
										{entry.sets.map(
											(
												set,
												setIdx, // Iterate over each set
											) => (
												<li key={setIdx}>
													{`Set ${setIdx + 1}: ${set.weight} kg x ${
														set.reps
													} reps`}{' '}
													{/* Display set details */}
												</li>
											),
										)}
									</ul>
								</li>
							),
						)}
					</ul>
					<button
						onClick={handleFinishWorkout} // Handle finishing and saving the workout
						className='w-full mt-6 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700' // Styling with Tailwind
					>
						Finish Workout
					</button>
				</div>
			)}
		</div>
	);
};

export default WorkoutLogger; // Export the WorkoutLogger component as default
