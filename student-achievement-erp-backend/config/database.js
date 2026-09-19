import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      logger.info('Database connected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Database connection error', {
        message: err.message,
        stack: err.stack,
      });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Database disconnected');
    });

    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI || !mongoURI.trim()) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    logger.info('Starting to connect to database...');

    await mongoose.connect(mongoURI);

    logger.info('MongoDB connected successfully');
    return true;
  } catch (error) {
    logger.error('MongoDB connection error', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export default connectDB;
