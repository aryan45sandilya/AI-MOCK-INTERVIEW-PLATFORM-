import { Server, Socket } from "socket.io";

interface RoomParticipant {
  userId: string;
  socketId: string;
  role: "interviewer" | "candidate";
}

const rooms = new Map<string, RoomParticipant[]>();

export function setupSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join interview room
    socket.on("join-room", ({ roomId, userId, role }: { roomId: string; userId: string; role: string }) => {
      socket.join(roomId);

      const participants = rooms.get(roomId) || [];
      const existing = participants.findIndex((p) => p.userId === userId);

      if (existing >= 0) {
        participants[existing].socketId = socket.id;
      } else {
        participants.push({ userId, socketId: socket.id, role: role as "interviewer" | "candidate" });
      }
      rooms.set(roomId, participants);

      socket.to(roomId).emit("user-joined", { userId, socketId: socket.id });
      socket.emit("room-participants", participants);

      console.log(`User ${userId} joined room ${roomId}`);
    });

    // WebRTC signaling
    socket.on("offer", ({ to, offer, roomId }: { to: string; offer: RTCSessionDescriptionInit; roomId: string }) => {
      socket.to(to).emit("offer", { from: socket.id, offer });
    });

    socket.on("answer", ({ to, answer }: { to: string; answer: RTCSessionDescriptionInit }) => {
      socket.to(to).emit("answer", { from: socket.id, answer });
    });

    socket.on("ice-candidate", ({ to, candidate }: { to: string; candidate: RTCIceCandidateInit }) => {
      socket.to(to).emit("ice-candidate", { from: socket.id, candidate });
    });

    // Interview events
    socket.on("question-change", ({ roomId, questionIndex }: { roomId: string; questionIndex: number }) => {
      socket.to(roomId).emit("question-change", { questionIndex });
    });

    socket.on("emotion-update", ({ roomId, data }: { roomId: string; data: unknown }) => {
      socket.to(roomId).emit("emotion-update", data);
    });

    socket.on("interview-complete", ({ roomId }: { roomId: string }) => {
      io.to(roomId).emit("interview-complete");
    });

    // Chat messages
    socket.on("chat-message", ({ roomId, message, userId }: { roomId: string; message: string; userId: string }) => {
      io.to(roomId).emit("chat-message", { userId, message, timestamp: new Date().toISOString() });
    });

    // Disconnect
    socket.on("disconnect", () => {
      rooms.forEach((participants, roomId) => {
        const idx = participants.findIndex((p) => p.socketId === socket.id);
        if (idx >= 0) {
          const [user] = participants.splice(idx, 1);
          if (participants.length === 0) {
            rooms.delete(roomId);
          } else {
            rooms.set(roomId, participants);
          }
          socket.to(roomId).emit("user-left", { userId: user.userId, socketId: socket.id });
        }
      });
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
