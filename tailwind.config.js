/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./app/**/*.{js,ts,jsx,tsx}', // Scan all files in the app directory
		'./pages/**/*.{js,ts,jsx,tsx}', // Include pages directory if exists
		'./components/**/*.{js,ts,jsx,tsx}', // Include components directory
	],
	theme: {
		extend: {},
	},
	plugins: [],
};
