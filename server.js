import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url || '', true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Initialize Socket.IO with secure CORS
    const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        // Add your production domain here:
        // 'https://yourdomain.com',
        // 'https://www.yourdomain.com',
    ];

    const io = new Server(httpServer, {
        cors: {
            origin: function (origin, callback) {
                // Allow requests with no origin (mobile apps, curl, etc)
                if (!origin) return callback(null, true);

                if (allowedOrigins.indexOf(origin) === -1) {
                    console.warn(`Blocked CORS request from origin: ${origin}`);
                    return callback(new Error('CORS policy: Origin not allowed'), false);
                }
                return callback(null, true);
            },
            methods: ['GET', 'POST'],
            credentials: true, // Allow cookies
        }
    });

    // Socket.IO connection handler
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });

        // Listen for database updates
        socket.on('db:update', (data) => {
            console.log('Database updated:', data);
            // Broadcast to all clients except sender
            socket.broadcast.emit('db:updated', data);
        });

        // Listen for deposit updates
        socket.on('deposit:update', (data) => {
            console.log('Deposit updated:', data);
            socket.broadcast.emit('deposit:updated', data);
        });

        // Listen for user updates
        socket.on('user:update', (data) => {
            console.log('User updated:', data);
            socket.broadcast.emit('user:updated', data);
        });
    });

    // --- File Watcher for Real-time DB Updates ---
    const dbPath = path.join(__dirname, 'src', 'database');

    // Watch for changes in the database directory
    let fsWait = false;
    try {
        if (fs.existsSync(dbPath)) {
            console.log(`Watching for database changes in: ${dbPath}`);
            console.log(`[Watcher] Starting recursive watch on ${dbPath}`);
            fs.watch(dbPath, { recursive: true }, (eventType, filename) => {
                console.log(`[Watcher] Event: ${eventType} File: ${filename}`);
                if (filename && filename.endsWith('.json')) {
                    if (fsWait) return;
                    fsWait = true;
                    setTimeout(() => {
                        fsWait = false;
                    }, 100); // Debounce 100ms

                    console.log(`DB File Changed: ${filename}`);
                    // Emit generic update event
                    io.emit('db:updated', { filename, eventType });

                    // Emit specific events based on filename
                    if (filename.includes('users')) io.emit('user:updated');
                    if (filename.includes('deposit')) io.emit('deposit:updated');
                    if (filename.includes('products')) io.emit('product:updated');
                }
            });
        } else {
            console.warn(`Database directory not found at ${dbPath}, file watching disabled.`);
        }
    } catch (err) {
        console.error('Failed to setup file watcher:', err);
    }

    httpServer
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
            console.log(`> Socket.IO server running`);
        });
});
