# Local Development Config
# This file is gitignored — never commit it

## Local Environment
- Node version: 22.19.0 (use `nvm use`)
- Frontend port: 3001
- Backend: http://localhost:3000

## Local .env.local
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Useful Commands
```bash
# Start dev server
npm run dev

# Type check without building
npx tsc --noEmit

# Check for unused exports / dead code
npx ts-prune
```

## Personal Notes
<!-- Add your own notes here — this file is never committed -->
