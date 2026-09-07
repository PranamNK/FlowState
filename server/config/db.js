import mongoose from 'mongoose';
import dns from 'dns';

let memoryServer = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  
  if (uri && uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (_) {}
  }
  
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[DB] Connected to MongoDB: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[DB] Could not connect to primary MongoDB URI (${uri}). Error: ${err.message}`);
    
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[DB] Initializing embedded in-memory MongoDB for seamless development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        await mongoose.connect(memUri);
        console.log(`[DB] Connected to embedded in-memory MongoDB at: ${memUri}`);
      } catch (memErr) {
        console.error('[DB] Failed to start in-memory MongoDB:', memErr.message);
        throw memErr;
      }
    } else {
      throw err;
    }
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
