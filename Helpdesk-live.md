# HelpDesk Live

A real-time customer support ticketing platform built as a hands-on learning project — covering backend fundamentals, real-time communication, background processing, caching, distributed locking, cloud deployment, and observability.

---

## 1. What is this project?

HelpDesk Live is a mini support-desk system, similar in spirit to a "Help" or "Raise a Complaint" section you'd find in apps like Swiggy or Zomato — but built from scratch as a full backend + web + admin product.

**Core idea:**
- A **customer** raises an issue (a "ticket") — with a title, description, and optionally a screenshot.
- A **support agent** gets notified instantly, claims the ticket, and chats live with the customer.
- The ticket moves through a status lifecycle (`open → inProgress → resolved → closed`).
- Once resolved, the customer gets an automatic email and can leave a rating.

Two roles share a single identity system:
- **Customer** — raises tickets, chats with the assigned agent, rates the resolution.
- **Agent** — claims tickets, chats with customers, resolves issues.

---

## 2. Why this project?

This project was built specifically as a **learning vehicle**, not just a product to ship. Every technology included has a genuine, load-bearing reason to exist in the flow — nothing is added just to check a box on a resume. The goal was to go from *"I got it working"* to *"I understand why it works this way,"* by deliberately building in real-world problems:

- **Concurrency** — what happens when two agents try to claim the same ticket at the same time?
- **Failure handling** — what happens when a background email job fails? How many times should it retry?
- **Real-time state** — how do you keep a chat and a "typing..." indicator in sync across multiple connections?
- **Observability** — how do you actually find out when something breaks in production, before a user complains?

---

## 3. Statement of Work (SOW) Summary

### 3.1 Scope

**In scope:**
- Single-identity auth (customer + agent roles) with JWT access/refresh tokens
- Ticket creation, listing, status updates, and agent assignment
- Screenshot/file attachments via S3 presigned uploads + CloudFront delivery
- Real-time chat per ticket (Socket.IO) with typing indicators and read receipts
- Redis-backed distributed lock to prevent two agents claiming the same ticket
- Redis-backed rate limiting on ticket creation
- Background email job on ticket resolution (BullMQ) with retry/backoff
- Push notifications to agents on new tickets (Firebase FCM)
- Dockerized backend deployed to AWS ECS Fargate behind an ALB
- Error tracking (Sentry) and monitoring/alerting (CloudWatch + SNS)
- Two frontends: a customer-facing Web app and an Agent Admin dashboard

**Out of scope (deferred):**
- Payments/billing
- Multi-tenant/organization support
- SLA timers, escalation rules, canned responses
- Native mobile apps
- Multi-language support

### 3.2 Deliverables

| # | Deliverable | Description |
|---|---|---|
| 1 | Monorepo | Turborepo + pnpm workspace (`apps/web`, `apps/admin`, `apps/backend`, `packages/shared`) |
| 2 | Backend API | Express.js + TypeScript + MongoDB/Mongoose, all modules functional |
| 3 | Real-time layer | Socket.IO chat + presence, Redis adapter |
| 4 | Background jobs | BullMQ queues/workers with retry handling |
| 5 | Web app | Next.js + Tailwind — customer ticket creation + chat UI |
| 6 | Admin app | Vite + React + Ant Design + Tailwind — agent ticket queue + chat UI |
| 7 | Infra | Dockerfile, ECS Fargate service, ALB, VPC |
| 8 | Observability | Sentry integration, CloudWatch alarms, SNS alerts |
| 9 | Documentation | This file + API docs + architecture diagram |

### 3.3 Success Criteria

- A customer can sign up, create a ticket with a screenshot, and chat live with an agent.
- Two agents attempting to claim the same ticket simultaneously → only one succeeds.
- A resolved ticket triggers an email within seconds via a background job.
- The app runs in Docker locally and is deployed on AWS ECS Fargate.
- Errors are visible in Sentry; a simulated CloudWatch alarm sends an SNS alert.

---

## 4. Tech Stack

**Monorepo tooling**
- pnpm workspaces + Turborepo

**Backend**
- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- Zod (validation/DTOs, shared via `@repo/shared`)
- JWT (jsonwebtoken) + bcryptjs — auth
- Redis (ioredis, hosted on Upstash) — caching, rate limiting, distributed locking, Socket.IO adapter
- Socket.IO — real-time chat, typing indicators, presence
- BullMQ — background job queue (Redis-backed)
- AWS S3 + presigned URLs, CloudFront — file uploads/delivery
- Firebase Admin (FCM) — push notifications
- Helmet, CORS, express-rate-limit — security & abuse prevention
- Pino — structured logging
- Sentry (@sentry/node) — error tracking

**Frontend**
- **Web** (customer-facing): Next.js + Tailwind CSS
- **Admin** (agent dashboard): React + Vite + Ant Design + Tailwind CSS

**Shared package**
- `@repo/shared` — Zod schemas acting as both request/response DTOs and inferred entity types, plus shared enums (`TicketStatus`, `UserRole`, etc.), consumed by backend, web, and admin alike.

**Cloud infrastructure (AWS)**
- ECS Fargate — container hosting for the backend (API + Socket.IO)
- ECR — Docker image registry
- ALB — routing + HTTPS termination
- Route53 + ACM — DNS + SSL
- VPC — private networking for backend/DB/Redis
- CloudWatch + SNS — logs, metrics, alarms, alerts
- Sentry (SaaS) — error tracking, separate from AWS

---

## 5. How the Project Works — End-to-End Flow

1. **Signup/Login** — A user signs up as either a `customer` or `agent`. Passwords are hashed with bcrypt; JWT access (short-lived) and refresh (long-lived) tokens are issued.

2. **Ticket creation** — A customer submits a ticket (title, description, category, priority) and optionally attaches a screenshot. The screenshot is uploaded directly to S3 via a presigned URL (not proxied through the server), and served back through CloudFront.

3. **Agent notification** — The moment a ticket is created, connected agents see it appear live via Socket.IO, and offline/inactive agents get a push notification via Firebase FCM.

4. **Claiming a ticket** — When an agent hits "Assign to me," a Redis lock (`SETNX`) is acquired before the assignment is written to the database. If two agents click at the same instant, only the first one succeeds — the second gets a clear "already assigned" response. This is the project's core concurrency lesson.

5. **Live chat** — Once assigned, the customer and agent chat inside a Socket.IO room scoped to that ticket. Messages are persisted to MongoDB and broadcast in real time; a "typing..." indicator and read receipts are also handled over the same socket connection.

6. **Resolution** — The agent marks the ticket `resolved` with a mandatory resolution note. This enqueues a BullMQ job to send a resolution email to the customer asynchronously — the customer isn't kept waiting on the request/response cycle for the email to actually go out. If the email fails, BullMQ retries with backoff before marking the job as failed for visibility.

7. **Rating** — The customer is prompted to rate the resolution (1–5 stars + optional comment).

8. **Observability** — Any unhandled error anywhere in the backend is captured by Sentry, giving a full stack trace. CloudWatch tracks logs and metrics from the ECS service; a configured alarm (e.g., elevated error rate) fires an SNS notification (email/Slack) so problems are caught before they're reported by users.

9. **Deployment** — The backend is containerized with Docker, pushed to ECR, and run as an ECS Fargate service sitting behind an ALB, which handles HTTPS termination and routes both REST (`/api/*`) and WebSocket (`/socket.io/*`) traffic to the running containers.

---

## 6. Module Breakdown (Backend)

| Module | Responsibility |
|---|---|
| `auth` | Signup, login, JWT issue/refresh, session/token management |
| `ticket` | Create, list, assign, update status, resolve, rate |
| `message` | Send/fetch messages within a ticket, read receipts |
| `upload` | S3 presigned URL generation for attachments |
| `realtime` (Socket.IO) | Chat events, typing indicators, presence, ticket-room management |
| `infra/queues` (BullMQ) | Background email job on resolution |
| Notifications (FCM) | Push notification to agents on new ticket |

Each module follows the same internal layering for consistency:
```
<module>.model.ts        → Mongoose schema
<module>.repository.ts   → isolated DB queries
<module>.service.ts      → business logic, rules, error throwing
<module>.controller.ts   → HTTP request/response handling, DTO validation
<module>.routes.ts       → route definitions
```

---

## 7. Build Order (as followed in this project)

1. Monorepo + config (`env`, `database`, `logger`) setup
2. **Ticket module** — core CRUD, easiest starting point
3. **Message module** — depends on Ticket, same pattern
4. **Upload module** — S3 presigned URLs
5. Generic middlewares (error handler, rate limiter, request logger)
6. **Auth module** (built last, deliberately) — then wired back into Ticket/Message to replace temporary hardcoded user IDs with real `req.user` data from JWT
7. Real-time layer (Socket.IO + Redis adapter + distributed lock)
8. Background jobs (BullMQ) + push notifications (FCM)
9. Deployment (Docker → ECR → ECS Fargate → ALB)
10. Observability (Sentry, CloudWatch, SNS)

> Auth was intentionally built last so the core CRUD, validation, and data-modeling patterns could be learned without JWT complexity in the way — then auth was added and used to "wire up" ownership/permissions across the already-built modules.
