import mongoose from 'mongoose';

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  try {
    if (cached?.conn) {
      console.log('Using cached database connection');
      return cached.conn;
    }

    if (!cached?.promise) {
      const opts: mongoose.ConnectOptions = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: true,
        retryReads: true,
        maxIdleTimeMS: 10000,
        compressors: "zlib",
        zlibCompressionLevel: 6,
      };

      console.log('Connecting to MongoDB Atlas...');
      const mongoosePromise = mongoose.connect(MONGODB_URI!, opts)
        .then((mongooseInstance) => {
          console.log('Successfully connected to MongoDB Atlas');
          console.log('Database:', mongooseInstance.connection.name);
          console.log('Host:', mongooseInstance.connection.host);
          return mongooseInstance;
        })
        .catch((error: Error) => {
          console.error('MongoDB Atlas connection error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
          cached = global.mongoose = { conn: null, promise: null };
          throw error;
        });

      cached = global.mongoose = {
        conn: null,
        promise: mongoosePromise
      };
    }

    const mongooseInstance = await cached.promise;
    if (!mongooseInstance) {
      throw new Error('Failed to establish MongoDB connection');
    }
    cached.conn = mongooseInstance;
    return mongooseInstance;
  } catch (error) {
    console.error('Failed to establish MongoDB connection:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    cached = global.mongoose = { conn: null, promise: null };
    throw error;
  }
}

// Add connection event handlers
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB connection reestablished');
});

// Handle application termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB connection closure:', err);
    process.exit(1);
  }
});

export default connectDB; 