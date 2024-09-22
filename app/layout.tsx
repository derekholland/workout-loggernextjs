// app/layout.tsx

import './globals.css'; // Import global styles
import { Inter } from 'next/font/google'; // Import Inter font from Google Fonts

// Initialize the Inter font with specified subsets
const inter = Inter({ subsets: ['latin'] });

// Define metadata for the application
export const metadata = {
	title: 'Workout Logger', // Title of the application
	description: 'Log your workouts efficiently', // Description of the application
};

// RootLayout component wraps around all pages
export default function RootLayout({
	children, // Represents the content of the current page
}: {
	children: React.ReactNode; // Type annotation for children prop
}) {
	return (
		<html lang='en'>
			{' '}
			{/* Sets the language attribute for accessibility */}
			<body className={inter.className}>
				{' '}
				{/* Applies the Inter font */}
				{children} {/* Renders the current page's content */}
			</body>
		</html>
	);
}
