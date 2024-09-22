// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Extend the global object to include PrismaClient, preventing multiple instances in development.
declare global {
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined;
}

// Create a new PrismaClient instance or use the existing one if it exists.
export const prisma =
	global.prisma ||
	new PrismaClient({
		log: ['query'], // Optional: logs all queries to the console
	});

// In development, store the PrismaClient instance on the global object to prevent multiple instances.
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
