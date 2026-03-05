# PulseBoard Web

> Web dashboard for PulseBoard — mobile app observability platform by [Aenexar](https://github.com/aenexar).

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS
- **Real-time** — Socket.IO client
- **Deployment** — Vercel

## Local Development

### Prerequisites

- Node.js 22+
- PulseBoard backend running on `http://localhost:3000`

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open `http://localhost:3001` in your browser.

## Environment Variables

| Variable              | Required | Description           |
| --------------------- | -------- | --------------------- |
| `NEXT_PUBLIC_API_URL` | Yes      | Backend API URL       |
| `NEXT_PUBLIC_WS_URL`  | Yes      | Backend WebSocket URL |

## Deployment

Deployed on [Vercel](https://vercel.com). Connect the `pulseboard-web` repository
to a new Vercel project and add the environment variables.

## License

Private — © 2026 Aenexar. All rights reserved.
