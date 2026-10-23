# Data layer

Local-first today, database-ready tomorrow. The UI never touches storage directly; it goes
through `useStore()` → pure repository functions → a `StorageAdapter`.

```
UI (pages/apps)
  └─ store.ts          React context; commit() = repo fn → stamp → adapter.write → setState
       └─ db/repo.ts   pure, immutable operations over a DatabaseSnapshot
            └─ db/adapter.ts   LocalStorageAdapter | MemoryAdapter | (your DB adapter)
```

## Tables

| table      | key | foreign keys                       | notes                                   |
|------------|-----|------------------------------------|-----------------------------------------|
| projects   | id  | —                                  | soft-delete via `deletedAt`             |
| sessions   | id  | projectId → projects.id (nullable) | `revision` bumps per save, `dataVersion` per app shape |
| notes      | id  | projectId → projects.id (nullable) | null projectId = global note            |
| files      | id  | projectId → projects.id            | metadata only                           |
| tasks      | id  | projectId → projects.id, sprintId → sprints.id (nullable) | kanban card: status, priority, assignee, dueDate, estimate, order, completedAt |
| sprints    | id  | projectId → projects.id            | scrum timebox: goal, startDate, endDate, status |
| activity   | id  | projectId (informational)          | append-only feed, capped at 50          |

### Delivery tracking (kanban + scrum)
Tasks are the unit of client delivery tracking. `status` is one of
`backlog → todo → doing → review → done` (`TASK_COLUMNS`), and `order` is the manual sort
within a column. `moveTask` renumbers both the source and target columns so ordering stays
dense. Crossing into `done` stamps `completedAt`, which is what `burndownSeries` uses to chart
remaining points across a sprint's date window. Sprints hold tasks by `sprintId`; deleting a
sprint detaches its tasks rather than hiding them, so nothing silently leaves the board.

Every row carries `id`, `createdAt`, `updatedAt` (ISO-8601) and optional `deletedAt`.
`updatedAt` drives last-write-wins merges (`mergeSnapshot`) for imports and future sync.

## Invariants (enforced by `validate.sanitize`)
- ids present and unique per table (latest `updatedAt` wins on collision)
- enums in range (`status`, `feeType`, activity `icon`)
- numbers clamped (`donePhases ≤ phases.length`, `0 ≤ sollPct ≤ 100`, `fee ≥ 0`)
- per-app `session.data` upgraded to `APP_DATA_VERSIONS[appId]` via `appData.migrateAppData`

## Storage versions
- v1 `consultancy-os-v1` — engagements
- v2 `consultancy-suite-v2` — projects with nested notes/files
- v3 `consultancy-suite-db` — normalised tables
- v4 — adds `tasks` and `sprints` (current). Additive: sanitize() defaults them to `[]`, so a v3 snapshot upgrades with no data movement.

`migrations.migrate()` upgrades any of these (and project export packages) to v4. Legacy keys are
left on disk. Unreadable data is quarantined under `consultancy-suite-db.corrupt.<timestamp>`.

## Soft delete & trash
`deleteProject` / `deleteSession` set `deletedAt`. Children of a trashed project are hidden, not
flagged, so a restore brings everything back. Trash is purged after 30 days (`purgeExpired`).

## Post-export retention
`clearProjectSessionData(projectId)` permanently replaces live session bodies with `{}` while
retaining the project, delivery board, sprints, session titles, tool ids, timestamps and revision
history. The Project export menu exposes this behind an explicit confirmation. This lets an agency
treat the exported Markdown/JSON context pack as the durable client-memory copy without retaining
methodology answers in the browser indefinitely.

## Adding a field
1. Add it to the interface in `schema.ts` (optional, or with a default in `validate.ts`).
2. If a tool's `data` shape changes, bump `APP_DATA_VERSIONS[appId]` and add a step in `appData.ts`.
3. Update the tool's print renderer.

## Swapping the backend
Implement `StorageAdapter` (read/write a snapshot blob) for IndexedDB or a file, or — for a
row-based database — subscribe to `store.subscribeChanges()` which emits `ChangeEvent`s
(`{ table, op, id, row }`) produced by `repo.diffSnapshots` after every commit. That stream is an
outbox: replay it to Supabase/Postgres/SQLite with `upsert … on conflict (id) do update where
excluded.updated_at > updated_at`.
