# What We Changed & How to Test It

---

## 1. Security — Role Exploit Fix

**The problem:**
Anyone could hit the register API with `{ role: "Admin" }` in the body and become an admin. That's a serious hole.

**What we changed:**
- `backend/controllers/authController.js` — removed `role` from the register destructure, hardcoded it to `'User'` always
- `frontend/src/context/AuthContext.jsx` — removed the `role` param from the register function call

**How to test:**
1. Open Postman or Thunder Client
2. POST to `http://localhost:5000/api/auth/register` with body:
   ```json
   { "username": "hacker", "email": "h@h.com", "password": "123456", "role": "Admin" }
   ```
3. Check the response — role should come back as `"User"` not `"Admin"`
4. Before this fix it would've returned `"Admin"`. Now it doesn't matter what you send.

---

## 2. Security — CORS & Helmet

**The problem:**
`app.use(cors())` with no config means any website on the internet could make requests to your backend. Also helmet (which sets security headers) was installed but never actually used.

**What we changed:**
- `backend/server.js` — `cors()` now only allows `http://localhost:5173` (or whatever `CLIENT_URL` is in .env)
- `backend/server.js` — added `app.use(helmet())` at the top

**How to test:**
1. Start the backend
2. Open browser console on any random site (like google.com)
3. Try: `fetch('http://localhost:5000/api/events')`
4. You'll get a CORS error — that's correct, it should block it
5. From your actual frontend on port 5173 it still works fine

---

## 3. Bug Fix — Duplicate Route

**The problem:**
In `server.js`, `/api/events` was registered twice. This causes weird behavior where some middleware runs twice on event routes.

**What we changed:**
- `backend/server.js` — removed the duplicate `app.use("/api/events", eventRoutes)` line

**How to test:**
Open `backend/server.js` and just count the lines — you'll see `/api/events` appears only once now.

---

## 4. Bug Fix — participant.remove() Deprecated

**The problem:**
In `eventController.js`, rejecting a participant used `participant.remove()` which is deprecated in Mongoose 6+ and throws a warning (or breaks silently in newer versions).

**What we changed:**
- `backend/controllers/eventController.js` — replaced `participant.remove()` with `event.participants.pull(participantId)`

**How to test:**
1. Register a user for an event
2. As admin, reject that participant
3. Check the DB or re-fetch the event — participant should be gone, no console warnings

---

## 5. New Feature — Event Capacity Limit

**The problem:**
There was no way to limit how many people could join an event. In real life you can't have 500 people show up to a 50-seat room.

**What we changed:**
- `backend/models/eventModel.js` — added `maxParticipants` field (Number, default null = unlimited) and `status` field (Upcoming/Ongoing/Completed)
- `backend/controllers/eventController.js` — before adding a participant, it now checks if approved count >= maxParticipants and throws "Event is full"
- `backend/controllers/adminController.js` — updateEvent now saves maxParticipants and status
- `frontend/src/pages/AdminEvents.jsx` — Create and Edit modals now have Max Participants input and Status dropdown. Table shows Status badge and Capacity column.

**How to test:**
1. Go to Admin → Manage Events → Create Event
2. Set Max Participants to `2`
3. Register 2 different users for that event and approve both
4. Try registering a 3rd user
5. Should get "Event is full" error — button also shows "Event Full" and is disabled on the user side

---

## 6. New Feature — Search & Filter on User Dashboard

**The problem:**
If there are 20+ events, users had no way to find what they're looking for. They had to scroll through everything.

**What we changed:**
- `frontend/src/pages/UserDashboard.jsx` — added a search input (filters by title or location) and a status dropdown filter (All / Upcoming / Ongoing / Completed)

**How to test:**
1. Log in as a regular user
2. You'll see a search bar and a dropdown at the top
3. Type part of an event title or location — cards filter in real time
4. Change the dropdown to "Completed" — only completed events show

---

## 7. New Feature — Toast Notifications on User Dashboard

**The problem:**
The old code used `alert()` for everything. That's a browser popup that blocks the page and looks terrible. Not enterprise at all.

**What we changed:**
- `frontend/src/pages/UserDashboard.jsx` — replaced all `alert()` calls with a toast notification that appears top-right, auto-dismisses after 3 seconds, green for success, red for error

**How to test:**
1. Log in as a user
2. Click Register on any event
3. A green toast should slide in top-right saying "Participation request sent! Waiting for admin approval."
4. If you try to register for a full event, red toast shows the error
5. No browser popup at all

---

## 8. UX — Event Status Badges & Capacity on User Dashboard

**What we changed:**
- Each event card now shows a colored badge (blue = Upcoming, green = Ongoing, gray = Completed)
- If an event has a capacity set, it shows "🟢 3 / 10 spots filled" or "🔴 Event Full"
- Register button text changes based on state: Register / Registered / Event Full / Event Ended
- Welcome message now shows the logged-in user's name

**How to test:**
1. Log in as user
2. Look at the event cards — you'll see the badge top-right of each card
3. For events with maxParticipants set, you'll see the spot counter
4. Approved status shows ✅, Rejected shows ❌, Pending shows ⏳

---

## Running the Project

```
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend  
cd frontend
npm run dev
```

Backend runs on port 5000, frontend on port 5173.

Make sure your `.env` has:
```
MONGO_URI=your_mongo_uri
PORT=5000
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

---

## Quick Sanity Checklist

- [ ] Register a new user → role should be "User" not "Admin"
- [ ] Create an event with Max Participants = 2
- [ ] Register 2 users, approve both, try a 3rd → blocked
- [ ] Search for an event by title on user dashboard → filters correctly
- [ ] Register for an event → toast appears, no alert popup
- [ ] Edit an event → Status and Max Participants fields are there
- [ ] Admin events table → shows Status badge and Capacity column
