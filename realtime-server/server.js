const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const config = require('./config');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS from config
const io = socketIo(server, config.SOCKET_IO);

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration from config
const dbConfig = config.DATABASE;

// Create database connection pool
let dbPool;
try {
  dbPool = mysql.createPool(dbConfig);
  console.log('✅ Database connection pool created');
} catch (error) {
  console.error('❌ Database connection failed:', error);
  process.exit(1);
}

// JWT verification middleware for Socket.IO
const verifyToken = (token) => {
  try {
    return jwt.verify(token, 'your-super-secret-jwt-key-change-this-in-production'); // Use same secret as PHP
  } catch (error) {
    return null;
  }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // Authenticate user on connection
  socket.on('authenticate', (data) => {
    const { token, userType } = data;

    if (!token) {
      socket.emit('auth_error', { message: 'No token provided' });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      socket.emit('auth_error', { message: 'Invalid token' });
      return;
    }

    // Store user info in socket
    socket.userId = decoded.user_id;
    socket.userType = userType || decoded.role;

    // Join appropriate room based on user type
    if (socket.userType === 'bfp_personnel' || socket.userType === 'admin') {
      socket.join('bfp_room');
      console.log(`👮 BFP personnel joined: ${socket.userId}`);
    } else {
      socket.join('residents_room');
      console.log(`👤 Resident joined: ${socket.userId}`);
    }

    socket.emit('authenticated', {
      message: 'Successfully authenticated',
      userType: socket.userType
    });
  });

  // Handle report creation
  socket.on('report_created', async (data) => {
    try {
      console.log('📝 New report created:', data);

      // Broadcast to BFP personnel
      io.to('bfp_room').emit('new_report', {
        ...data,
        timestamp: new Date().toISOString()
      });

      // Confirm to sender
      socket.emit('report_acknowledged', {
        status: 'success',
        message: 'Report broadcasted to emergency responders'
      });

    } catch (error) {
      console.error('Error handling report creation:', error);
      socket.emit('report_error', { message: 'Failed to process report' });
    }
  });

  // Handle status updates
  socket.on('status_updated', async (data) => {
    try {
      const { reportId, newStatus, updatedBy } = data;
      console.log(`📊 Status updated: Report ${reportId} -> ${newStatus}`);

      // Broadcast status change to all connected clients
      io.emit('report_status_changed', {
        reportId,
        newStatus,
        updatedBy,
        timestamp: new Date().toISOString()
      });

      // Send specific notification to report creator if they're online
      // This would require storing report-to-user mapping

    } catch (error) {
      console.error('Error handling status update:', error);
    }
  });

  // Handle emergency alerts
  socket.on('emergency_alert', (data) => {
    console.log('🚨 Emergency alert received:', data);

    // Broadcast emergency to all BFP personnel
    io.to('bfp_room').emit('emergency_notification', {
      ...data,
      timestamp: new Date().toISOString(),
      priority: 'high'
    });

    socket.emit('alert_acknowledged', {
      status: 'success',
      message: 'Emergency alert sent to all responders'
    });
  });

  // Handle location updates (for real-time tracking)
  socket.on('location_update', (data) => {
    // Only BFP personnel can share location updates
    if (socket.userType === 'bfp_personnel') {
      socket.to('bfp_room').emit('bfp_location_update', {
        userId: socket.userId,
        location: data,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    socket.to(data.room || 'bfp_room').emit('user_typing', {
      userId: socket.userId,
      username: data.username
    });
  });

  socket.on('typing_stop', (data) => {
    socket.to(data.room || 'bfp_room').emit('user_stopped_typing', {
      userId: socket.userId
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount
  });
});

// Get active connections info
app.get('/connections', (req, res) => {
  const clients = [];
  io.sockets.sockets.forEach((socket) => {
    clients.push({
      id: socket.id,
      userId: socket.userId,
      userType: socket.userType,
      rooms: Array.from(socket.rooms)
    });
  });

  res.json({
    total: clients.length,
    clients: clients
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Real-time server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Connections: http://localhost:${PORT}/connections`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  if (dbPool) {
    await dbPool.end();
  }
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
