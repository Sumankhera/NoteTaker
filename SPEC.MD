# Note Taking Web App — Technical Specification

Foundation document for an authenticated rich-text notes application.

## 1. Overview

A simple web application for creating and managing rich-text notes. Authenticated users can create, view, update, delete, publicly share, and stop sharing notes. Note content is stored as structured JSON in a SQLite database.

## 2. Core Principles

- Simple, distraction-free user interface.
- Fast note creation and editing.
- Minimal navigation.
- Authentication required for note management.
- Public notes accessible without authentication.
- Users can modify only their own notes.
- Rich-text content stored as structured JSON rather than raw HTML.

## 3. Suggested Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- TipTap rich-text editor

TipTap is a strong fit because editor documents can be stored directly as JSON.

### Backend

- Next.js Route Handlers and/or Server Actions
- TypeScript
- Zod for input validation
- **better-auth** for authentication

A separate backend service is unnecessary for the initial version.

### Database

- SQLite, accessed directly via a hand-rolled `bun:sqlite` connection in `lib/db.ts` (no ORM). better-auth is pointed at that same connection.

```
Next.js
  +-- React UI
  +-- API / Server Actions
        |
        +-- bun:sqlite (lib/db.ts)
              |
              +-- SQLite
```

## 4. User Model

A user must authenticate before managing notes. Authentication is handled by **better-auth**, which owns its own set of core tables (`user`, `session`, `account`, `verification`) rather than a single `User` model with a `passwordHash` column.

- Credentials (e.g. email/password) are stored on the `account` table, not on `user`.
- The application's `Note` model references `user.id` as a foreign key.
- See [Section 7](#7-database-schema) for the full schema, including the better-auth core tables.

## 5. Note Model

Each note belongs to exactly one user.

```
Note
----
id
userId
title
content
isPublic
publicId
createdAt
updatedAt
```

## 6. Rich-Text JSON

Store the editor document rather than generated HTML.

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [
        { "type": "text", "text": "Project Notes" }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "This is my first note." }
      ]
    }
  ]
}
```

- Preserves editor structure.
- Makes future transformations easier.
- Supports migration between rendering formats.
- Avoids relying entirely on HTML.
- Allows HTML to be generated only when rendering.

## 7. Database Schema

Actual schema, as raw SQLite tables created directly by `lib/db.ts` (`CREATE TABLE IF NOT EXISTS`) — there is no ORM or migration tool; `user`, `session`, `account`, and `verification` follow the [better-auth core schema](https://www.better-auth.com/docs/concepts/database) shape.

```
user
----
id            TEXT PRIMARY KEY
name          TEXT NOT NULL
email         TEXT NOT NULL UNIQUE
emailVerified INTEGER NOT NULL DEFAULT 0
image         TEXT
createdAt     TEXT NOT NULL
updatedAt     TEXT NOT NULL

session
-------
id        TEXT PRIMARY KEY
userId    TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
token     TEXT NOT NULL UNIQUE
expiresAt TEXT NOT NULL
ipAddress TEXT
userAgent TEXT
createdAt TEXT NOT NULL
updatedAt TEXT NOT NULL

account
-------
id                    TEXT PRIMARY KEY
userId                TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
issuer                TEXT NOT NULL
accountId             TEXT NOT NULL
providerId            TEXT NOT NULL
accessToken           TEXT
refreshToken          TEXT
accessTokenExpiresAt  TEXT
refreshTokenExpiresAt TEXT
scope                 TEXT
idToken               TEXT
password              TEXT
createdAt             TEXT NOT NULL
updatedAt             TEXT NOT NULL
UNIQUE(issuer, accountId)

verification
------------
id         TEXT PRIMARY KEY
identifier TEXT NOT NULL
value      TEXT NOT NULL
expiresAt  TEXT NOT NULL
createdAt  TEXT NOT NULL
updatedAt  TEXT NOT NULL

note
----
id        TEXT PRIMARY KEY
userId    TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
title     TEXT NOT NULL
content   TEXT NOT NULL   -- serialized JSON
isPublic  INTEGER NOT NULL DEFAULT 0
publicId  TEXT UNIQUE
createdAt TEXT NOT NULL
updatedAt TEXT NOT NULL
INDEX note_userId_idx (userId)
```

Notes on the better-auth tables:

- `account.password` holds the hashed password for email/password sign-in — there is no `passwordHash` column on `user`.
- `account` uses a compound unique index on `(issuer, accountId)`, not `(providerId, accountId)`. OAuth providers without a trusted issuer use the synthetic `local:oauth:<providerId>` namespace; email/password accounts use `local:credential`.
- `session.token` (not `id`) is the value stored in the session cookie and used to look up sessions.
- Table/column names are defined directly by the `CREATE TABLE` statements in `lib/db.ts`; if better-auth's own table expectations change, those statements must be updated by hand.

## 8. Application Routes

### Private Routes

| Route         | Description               |
| ------------- | -------------------------- |
| `/`           | Redirect based on authentication |
| `/notes`      | User's notes               |
| `/notes/new`  | Create a note               |
| `/notes/:id`  | View/edit a note            |

### Public Route

| Route            | Description              |
| ----------------- | ------------------------- |
| `/p/:publicId`    | Read-only public note     |

Authentication is not required for the public route.

## 9. Main UI Layout

```
+------------------------------------------------------+
| Notes                                     User Menu  |
+---------------+--------------------------------------+
|               |                                      |
| + New Note    |  Note title                          |
|               |                                      |
| Note 1        |  Rich text editor                    |
| Note 2        |                                      |
| Note 3        |                                      |
|               |                                      |
+---------------+--------------------------------------+
```

**Sidebar**

- New Note button
- Note list
- Optional search
- User/account menu

**Editor Area**

- Note title
- Rich-text toolbar
- Editor
- Share control
- Delete control

## 10. Note Creation Flow

1. User selects **+ New Note**.
2. Application creates an empty note.
3. The note is assigned to the authenticated user.
4. Application redirects to the note editor.

Suggested initial title: `Untitled`

```json
{
  "type": "doc",
  "content": []
}
```

## 11. Note Editing and Autosave

The editor modifies the `title` and `content` fields.

```
User types
  |
  | local editor state updates
  |
  | debounce ~500-1000 ms
  |
  v
save note
  |
  v
database updated
```

Display a lightweight status such as `Saving...` followed by `Saved`. A manual Save button is not required.

## 12. Note Retrieval and Authorization

When loading `/notes/:id`, the backend must verify note ownership.

```
note.userId === authenticatedUser.id
```

If the check fails, returning `404 Not Found` is preferable to revealing that a private note exists.

## 13. Note Deletion

```
Delete
  |
  v
confirmation
  |
  v
DELETE note
  |
  v
redirect /notes
```

Deleting a note automatically invalidates any public sharing link.

## 14. Public Sharing

Notes are private by default.

```
isPublic = false
publicId = null
```

When the user shares a note, generate a cryptographically random public identifier.

```
isPublic = true
publicId = "7MZd1aK82n"

Public URL: https://example.com/p/7MZd1aK82n
```

## 15. Stop Sharing

```
isPublic = false
publicId = null
```

The old public URL should immediately stop working and return `404 Not Found`.

## 16. Public Note Page

Route: `/p/:publicId`

```sql
WHERE
  publicId = ? AND
  isPublic = true
```

The page is read-only and should not show editing controls.

## 17. API Design

_TBD._

## 18. Authorization Rules

Every private note operation must perform ownership validation on the server.

```
request
  |
  v
authenticate user
  |
  v
retrieve note
  |
  v
verify note.userId == authenticatedUser.id
  |
  v
perform operation
```

Frontend visibility checks are not a security boundary.

## 19. Validation

Use Zod for request payload validation.

- `CreateNoteSchema`: optional title, optional content JSON.
- `UpdateNoteSchema`: optional title, optional content JSON.
- Suggested title limit: 200 characters.
- Apply a reasonable maximum size to note content.

## 20. Security Requirements

- Authenticate all private endpoints.
- Verify note ownership server-side.
- Generate cryptographically random public IDs.
- Validate request payloads.
- Rate-limit public endpoints if needed.
- Sanitize rendered rich-text output.
- Never allow arbitrary script execution from note content.
- Use secure session cookies.
- Use HTTPS in production.

## 21. Editor Features — MVP

- Paragraph
- Heading 1–3
- Bold
- Italic
- Strikethrough
- Bullet list
- Numbered list
- Blockquote
- Inline code
- Code block
- Link
- Undo
- Redo

Later additions may include images, tables, checklists, attachments, syntax highlighting, and Markdown shortcuts.

## 22. Suggested Component Structure

```
components/
  |
  +-- layout/
  |     +-- AppLayout
  |     +-- Sidebar
  |
  +-- notes/
  |     +-- NoteList
  |     +-- NoteListItem
  |     +-- NoteEditor
  |     +-- NoteTitle
  |     +-- NoteToolbar
  |     +-- ShareButton
  |     +-- DeleteNoteButton
  |
  +-- ui/
        +-- Button
        +-- Dialog
        +-- Dropdown
        +-- Input
```

## 23. Suggested Application Structure

```
app/
  |
  +-- page.tsx
  +-- notes/
  |     +-- page.tsx
  |     +-- new/
  |     |     +-- page.tsx
  |     +-- [id]/
  |           +-- page.tsx
  |
  +-- p/
  |     +-- [publicId]/
  |           +-- page.tsx
  |
  +-- api/
        +-- auth/
        |     +-- [...all]/
        |           +-- route.ts
        +-- notes/
              +-- route.ts
              +-- [id]/
                    +-- route.ts
                    +-- share/
                          +-- route.ts

components/

lib/
  +-- auth.ts
  +-- db.ts
  +-- permissions.ts
  +-- validation.ts
```

`lib/db.ts` opens the `bun:sqlite` connection and creates tables directly with `CREATE TABLE IF NOT EXISTS` — there is no `prisma/` directory or ORM in use.

`lib/auth.ts` holds the better-auth server instance (`betterAuth({...})`); `app/api/auth/[...all]/route.ts` mounts its handler.

## 24. Data Flow

```
TipTap
  |
  | editor.getJSON()
  v
React State
  |
  | debounce
  v
PATCH /api/notes/:id
  |
  v
Authorization
  |
  v
Validation
  |
  v
bun:sqlite (lib/db.ts)
  |
  v
SQLite
```

## 25. Note List Query

Do not load complete note content for the sidebar. Query only:

- `id`
- `title`
- `updatedAt`
- `isPublic`

Default ordering: `updatedAt DESC`.

## 26. Empty State

```
No notes yet.
Create your first note.
```

Primary action: **Create Note**

## 27. Sharing UI

```
Share note

Public access: ON

https://example.com/p/7MZd1aK82n

[Copy link]  [Stop sharing]
```

Do not introduce user-to-user permissions in the MVP.

## 28. Error Handling

UI messages should remain simple, for example: `Couldn't save note.`

## 29. MVP Scope

### Include

- User authentication
- Create, view, update, and delete notes
- Autosave
- Rich-text editor
- Notes sidebar
- Public sharing
- Stop sharing
- Public read-only page
- SQLite persistence

### Exclude Initially

- Folders
- Tags
- Collaborative editing
- Comments
- Note history
- Version control
- User-to-user sharing
- Images
- Attachments
- Offline mode
- AI features
- Real-time synchronization

## 30. Development Phases

**Phase 1 — Foundation**
- Next.js project
- SQLite
- Prisma
- Authentication
- User model

**Phase 2 — Notes CRUD**
- Create
- View
- Update
- Delete

**Phase 3 — Rich Text**
- Add TipTap
- Persist editor JSON

**Phase 4 — UX**
- Sidebar
- Autosave
- Save indicator
- Sorting
- Empty states
- Delete confirmation

**Phase 5 — Public Sharing**
- Share
- Public ID
- Public page
- Stop sharing

**Phase 6 — Hardening**
- Validation
- Authorization tests
- Error handling
- Rate limits
- Security review

## 31. Definition of Done

- [ ] User can sign in.
- [ ] User can create a note.
- [ ] User can edit rich-text content.
- [ ] Changes persist after refresh.
- [ ] User can see their notes.
- [ ] Notes are ordered by latest modification.
- [ ] User can delete notes.
- [ ] Users cannot access another user's private notes.
- [ ] User can generate a public link.
- [ ] Anyone with the public link can read the note.
- [ ] Public users cannot modify the note.
- [ ] User can stop sharing.
- [ ] Old public links stop functioning.
- [ ] All authorization is enforced server-side.

## 32. Recommended MVP Architecture

Next.js + TypeScript + React + Tailwind CSS + TipTap + better-auth + bun:sqlite + SQLite

```
Browser
  |
  v
Next.js
  |
  v
React + TipTap
  |
  v
Server Actions / API Routes
  |
  v
Authentication (better-auth) + Authorization
  |
  v
bun:sqlite (lib/db.ts)
  |
  v
SQLite
```

This architecture is intentionally small. It provides enough structure to build a solid notes application without introducing unnecessary distributed systems or infrastructure.
