import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { realtimeService } from "./services/realtime-service";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
	const httpServer = createServer((req, res) => {
		const parsedUrl = parse(req.url || '/', true);
		handle(req, res, parsedUrl);
	});

	// Initialize real-time WebSocket service when server starts
	try {
		console.log("Initializing real-time WebSocket service...");
		await realtimeService.initialize();
		console.log("Real-time WebSocket service initialized successfully");
	} catch (error) {
		console.error("Failed to initialize real-time service:", error);
		process.exit(1); // Exit if real-time service fails to initialize
	}

	httpServer
		.once("error", (err) => {
			console.error(err);
			process.exit(1);
		})
		.listen(port, () => {
			console.log(`> Ready on http://${hostname}:${port}`);
		});

	// Handle graceful shutdown
	process.on("SIGTERM", async () => {
		console.log("Received SIGTERM, shutting down gracefully...");
		await realtimeService.shutdown();
		process.exit(0);
	});

	process.on("SIGINT", async () => {
		console.log("Received SIGINT, shutting down gracefully...");
		await realtimeService.shutdown();
		process.exit(0);
	});
});
