import mongoose from 'mongoose';
import { connectionString } from '@utils';

// ******************** mongoose connection
export const connectToMongo = async () => {
	await mongoose.connect(connectionString, {
		dbName: process.env.MONGODB_DBNAME,
		user: process.env.MONGODB_USERNAME,
		pass: process.env.MONGODB_PASSWORD
	});
	const connection = mongoose.connection;

	connection.on('connected', () => {
		console.log('MongoDB connected successfully');
	});
	connection.on('error', (error) => {
		console.error(`\n\n\n\t MongoDB connection error: ${error}\n\n\n\t`);
		process.exit(0);
	});
}