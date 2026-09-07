import mongoose from 'mongoose';
import dns from 'dns';
import os from 'os';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (os.platform() === 'win32' && uri && uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (_) {}
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`[DB] Connected to MongoDB: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.warn(`[DB] Could not connect to primary MongoDB URI. Error: ${err.message}`);
    
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[DB] Initializing embedded in-memory MongoDB for seamless development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        await mongoose.connect(memUri);
        console.log(`[DB] Connected to embedded in-memory MongoDB at: ${memUri}`);
        cached.conn = mongoose;
      } catch (memErr) {
        console.error('[DB] Failed to start in-memory MongoDB:', memErr.message);
        throw memErr;
      }
    } else {
      throw err;
    }
  }

  return cached.conn;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
