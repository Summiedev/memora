const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const uriTlsInsecure = /(?:[?&])tlsInsecure=true(?:&|$)/i.test(mongoUri);
    const tlsInsecure = uriTlsInsecure || process.env.MONGO_TLS_INSECURE === 'true';
    const tlsAllowInvalidCertificates = !tlsInsecure
      && process.env.MONGO_TLS_ALLOW_INVALID_CERTIFICATES === 'true';
    const connectionUrl = new URL(mongoUri);

    if (tlsInsecure) {
      connectionUrl.searchParams.delete('tlsAllowInvalidCertificates');
    } else if (tlsAllowInvalidCertificates) {
      connectionUrl.searchParams.delete('tlsInsecure');
    }

    const options = {
      // Connection Pool
      maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 20,
      minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE, 10) || 5,

      // Timeouts (ms)
      socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT, 10) || 45000,
      connectTimeoutMS: parseInt(process.env.MONGO_CONNECT_TIMEOUT, 10) || 10000,
      serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT, 10) || 5000,
      maxIdleTimeMS: parseInt(process.env.MONGO_MAX_IDLE_TIME, 10) || 30000,
      waitQueueTimeoutMS: parseInt(process.env.MONGO_WAIT_QUEUE_TIMEOUT, 10) || 5000,

      // Heartbeat
      heartbeatFrequencyMS: parseInt(process.env.MONGO_HEARTBEAT_FREQUENCY, 10) || 10000,

      // Retry behavior
      retryWrites: process.env.MONGO_RETRY_WRITES !== 'false',
      retryReads: process.env.MONGO_RETRY_READS !== 'false',

      // Identification
      appName: process.env.MONGO_APP_NAME || 'memora-api',

      // Read concern / write concern
      readPreference: process.env.MONGO_READ_PREFERENCE || 'primary',

      // TLS/SSL
      tls: isProduction || process.env.MONGO_TLS === 'true',
      // The MongoDB driver rejects these two options together. Avoid passing
      // either option at all unless it is explicitly enabled.
      ...(tlsInsecure
        ? { tlsInsecure: true }
        : tlsAllowInvalidCertificates
          ? { tlsAllowInvalidCertificates: true }
          : {}),

      // Observability
      monitorCommands: isProduction,
    };

    await mongoose.connect(connectionUrl.toString(), options);

    console.log(
      `✅ MongoDB connected [pool:${options.maxPoolSize} min:${options.minPoolSize} app:${options.appName}]`
    );

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    mongoose.connection.on('fullsetup', () => {
      console.log('✅ MongoDB full connection pool established');
    });

    mongoose.connection.on('timeout', () => {
      console.warn('⏱️  MongoDB connection timeout');
    });

  } catch (error) {
    console.error('❌ MongoDB initial connection failed:', error.message);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  try {
    console.log('🛑 Graceful shutdown: closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error closing MongoDB connection:', err.message);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = { connectDB, gracefulShutdown };
