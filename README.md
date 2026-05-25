# VedaAI – AI Assessment Creator

An AI-powered assessment creation platform that allows teachers to create assignments, generate question papers using AI, and view structured output with difficulty-tagged questions.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + TypeScript |
| State | Zustand |
| Styling | TailwindCSS v4 |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB (Mongoose) |
| Cache | Redis (ioredis) |
| Queue | BullMQ |
| Real-time | WebSocket (ws) |
| AI | Google Gemini 1.5 Flash |
| Validation | Zod |

## 📐 Architecture

```
Teacher fills form
       ↓
POST /api/assignments → MongoDB (status: pending)
       ↓
Job added to BullMQ queue → return assignmentId
       ↓
Frontend subscribes via WebSocket (assignmentId)
       ↓
Worker picks job → calls Gemini API
       ↓
Parse + validate JSON response
       ↓
Save result to MongoDB → cache in Redis
       ↓
WebSocket event: COMPLETED → result sent to frontend
       ↓
Output page renders structured question paper
```

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Google Gemini API Key

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your GEMINI_API_KEY, MONGODB_URI, etc.
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
# Edit .env.local if needed
npm run dev
```

### Environment Variables

**Backend (.env):**
| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/vedaai |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| GEMINI_API_KEY | Google Gemini API key | (required) |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

**Frontend (.env.local):**
| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:5000 |
| NEXT_PUBLIC_WS_URL | WebSocket URL | ws://localhost:5000/ws |

## 📱 Features

### Core
- ✅ Assignment creation form with file upload, due dates, question type configuration
- ✅ AI-powered question paper generation via Gemini 1.5 Flash
- ✅ Structured output with sections, difficulty badges, and answer key
- ✅ Real-time status updates via WebSocket
- ✅ Background job processing with BullMQ
- ✅ Redis caching for completed results
- ✅ Zustand state management

### Bonus
- ✅ PDF download
- ✅ Regenerate button
- ✅ Difficulty badges (Easy/Moderate/Hard) with color coding
- ✅ Mobile responsive (bottom nav + FAB)
- ✅ Search and filter assignments
- ✅ Delete assignments
- ✅ Loading and error states with animations

## 📁 Project Structure

```
├── frontend/                 # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── assignments/
│   │   │   │   ├── page.tsx           # List view (empty + filled)
│   │   │   │   ├── create/page.tsx    # Create form
│   │   │   │   └── [id]/page.tsx      # Output page
│   │   ├── components/layout/         # Sidebar, TopBar, MobileNav
│   │   ├── store/                     # Zustand stores
│   │   ├── hooks/                     # WebSocket hook
│   │   └── lib/                       # API client, types, validation
│
├── backend/                  # Express + TypeScript
│   ├── src/
│   │   ├── config/           # DB, Redis, env
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # REST API
│   │   ├── services/         # AI integration
│   │   ├── queue/            # BullMQ queue + worker
│   │   ├── websocket/        # WebSocket server
│   │   └── middleware/       # Validation, error handling
```

## 🎨 Color Palette

| Element | Color |
|---------|-------|
| Primary (buttons) | #1A1A1A |
| Accent (logo) | #FF6B35 |
| Easy badge | #22C55E |
| Moderate badge | #F59E0B |
| Hard badge | #EF4444 |
| Background | #F5F5F5 |
| Card | #FFFFFF |
| Border | #E5E7EB |
