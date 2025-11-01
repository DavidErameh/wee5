import { createServer } from 'http';
import { Server } from 'socket.io';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    console.log('Socket.io client connected');

    // Example: Listen for Whop events and emit to connected clients
    // socket.on('whopEvent', (data) => {
    //   io.emit('updateLeaderboard', data);
    // });

    socket.on('disconnect', () => {
      console.log('Socket.io client disconnected');
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
