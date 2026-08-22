# College Admission System

Welcome to the College & Admissions Portal for GAYATRI JUNIOR & DEGREE COLLEGE. This system handles online admission applications for academic sessions and includes a backend server for email sending and static file serving.

## Features

- **Admissions Portal**: Interface for students to apply online (`apply.html`).
- **Dashboard & Status**: Pages to view application status (`dashboard.html`, `status.html`).
- **Admin Interface**: Administrative dashboard for managing applications (`admin.html`).
- **Headless Screenshot Utility**: Built-in tool in the `tools` directory to capture headless Chrome screenshots of the site at common breakpoints.

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js, CORS, body-parser, dotenv
- **Tooling**: Puppeteer for automated screenshots

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm (Node Package Manager)

### Installation

1. Clone or download the repository.
2. Install the required dependencies:

```bash
npm install
```

### Running the Application

To start the backend server and serve the frontend files locally:

```bash
npm start
```
or 
```bash
npm run dev
```

The server will typically run on `http://localhost:5000` (or whichever port is defined in your `.env` file).

- **Frontend Access**: Navigate to `http://localhost:5000`
- **Health Check**: Check the server status at `http://localhost:5000/api/health`

### Deployment

This app can be deployed to Netlify using the included `netlify.toml`.

#### Netlify setup

1. Create or select a site in Netlify and connect this repository.
2. In **Site configuration > Environment variables**, add these variables for the Production scope:

	```text
	FIREBASE_API_KEY
	FIREBASE_AUTH_DOMAIN
	FIREBASE_PROJECT_ID
	FIREBASE_STORAGE_BUCKET
	FIREBASE_MESSAGING_SENDER_ID
	FIREBASE_APP_ID
	FIREBASE_MEASUREMENT_ID
	```

	Use the corresponding values from Firebase Console or the local `.env` file. Do not commit `.env`
	or expose secret values in frontend source files.
3. Use these Netlify build settings:
	- **Build command:** leave empty
	- **Publish directory:** `.`
	- **Functions directory:** `netlify/functions`
4. Deploy the site and verify the function at `/.netlify/functions/firebase-config`.

The function in `netlify/functions/firebase-config.js` reads the Firebase variables at runtime. The
redirect in `netlify.toml` also makes the function available at `/api/firebase-config`. In production,
the frontend loads configuration from `/.netlify/functions/firebase-config`; during local development,
it uses `/api/firebase-config` from `server.js`.

#### Firebase setup

In Firebase Console:

1. Enable **Email/Password** under **Authentication > Sign-in method**.
2. Create the administrator account under **Authentication > Users**.
3. Add the Netlify domain (for example, `your-site.netlify.app`) and any custom domain under
	**Authentication > Settings > Authorized domains**.
4. Create a Firestore database and configure its security rules for authenticated administrators.

The existing `server.js` remains the local and Node-hosting backend. Use `npm start` locally or on
Render/Railway. Port `5000` is for local development only; do not set `PORT` for Netlify. Do not run
`generate-firebase-config.js` for Netlify deployment.

## Environment Variables

You can configure the application using a `.env` file in the root directory. 
Important variables include:
- `PORT`: The port number the server runs on (default: 5000).
- `FIREBASE_API_KEY`: Firebase web API key.
- `FIREBASE_AUTH_DOMAIN`: Firebase Authentication domain.
- `FIREBASE_PROJECT_ID`: Firebase project ID.
- `FIREBASE_STORAGE_BUCKET`: Firebase Storage bucket.
- `FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID.
- `FIREBASE_APP_ID`: Firebase application ID.
- `FIREBASE_MEASUREMENT_ID`: Firebase Analytics measurement ID.

For Netlify, configure the Firebase variables in Netlify's environment variable settings instead of
deploying `.env`.

## Screenshots Utility

To automatically capture screenshots of all major portal pages across different device viewports:

```bash
npm run screenshot
```

Refer to `tools/README_SCREENS.md` for more details about the screenshot utility.

## License

This project is licensed under the MIT License.
