export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    // Client joins their personal room based on user id
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    socket.on('leave_user_room', (userId) => {
      if (userId) {
        socket.leave(`user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnect cleanly
    });
  });
}
