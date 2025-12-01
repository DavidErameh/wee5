require("dotenv").config({
	path: ".env.local",
});

// Mock Next.js server components for testing API routes
global.Request = class MockRequest extends Request {};
global.Response = class MockResponse extends Response {};
