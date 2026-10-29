import mongoose from 'mongoose';

/** A failed real connection never switches storage or creates example records. */
export async function connectDatabase(
  env: NodeJS.ProcessEnv = process.env,
  connect: (uri: string) => Promise<unknown> = uri => mongoose.connect(uri, {serverSelectionTimeoutMS: 5000}),
) {
  const uri = env.MONGODB_URI?.trim();
  if (env.USE_LOCAL_MOCK_DB === 'true' || (uri && !/^mongodb(?:\+srv)?:\/\//.test(uri))) {
    throw new Error('Use a real mongodb:// or mongodb+srv:// MONGODB_URI. Temporary databases are test-only.');
  }
  if (!uri) throw new Error('MONGODB_URI is not configured. Database-backed requests remain unavailable.');
  await connect(uri);
}
