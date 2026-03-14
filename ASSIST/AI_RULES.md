# AI Operation Rules — Codexsun

## Operating Rules

1. **Always analyze** the previous repository structure and nature of the application before making changes.

2. **When a new user prompt is received:**
    - Create a new file inside `/prompts/`
    - Use sequential numbering (`001.md`, `002.md`, etc.)
    - Copy the full prompt text into the file **exactly as received**
    - Do not summarize, rewrite, trim, normalize, or change the prompt text before saving it
    - Prompt capture must happen before implementation so the exact source prompt can always be reviewed if chat memory is cleared

3. **Before starting implementation:**
   - Analyze the request
   - Plan the work
   - Update `/ASSIST/TASK.md`
   - `/ASSIST/STANDARDS.md` is the mandatory architectural checklist for this repository and must be followed on every task.
   
4. **Update `/ASSIST/ROADMAP.md`** if the task affects the long-term project plan.

5. **Only after planning** may code generation begin.

6. **Code must compile and build** with no failures.

7. **After finishing work**, update all documentation files in `/ASSIST`.

8. **Record the work** in `/ASSIST/PROJECT_LOG.md`.

9. **Project log entries** must use automatic serial numbers:
   ```
   CX-001
   CX-002
   CX-003
   ```

10. **If a commit command is issued:**
    - Read the latest log serial
    - Use it in the commit message.

---

## Rules — What the AI Must Do

- Respect repository architecture.
- Maintain modular design.
- Follow Clean Architecture.
- Use strong typing.
- Update documentation whenever system changes.
- Ensure code compiles successfully.
- Avoid breaking existing modules.
- Use dependency injection for services.
- Use DTOs for API contracts.

---

## Rules — What the AI Must Not Do

- Do not create random folders.
- Do not modify unrelated modules.
- Do not generate undocumented architecture.
- Do not bypass validation or security rules.
- Do not allow SQL injection or unsafe SQL.
- Do not commit without logging work.

---

## Non-Negotiable Rules

The AI must **never**:

- Create undocumented architecture
- Break module boundaries
- Bypass security protections

---

## Project Analysis Requirement

Before generating code, the AI must:

- Analyze repository structure
- Identify existing modules
- Detect missing modules
- Verify documentation alignment

---

## Code Generation Scope

### Backend

| Layer | Items |
|-------|-------|
| Domain | Entities, DbContext |
| Data | Repositories |
| Business | Services |
| API | Controllers, DTOs, Validators |

### Frontend

| Layer | Items |
|-------|-------|
| UI | Pages, Components |
| Logic | Hooks, State logic |
| Data | API clients |

### Shared

| Layer | Items |
|-------|-------|
| Domain | Domain models |
| Contracts | DTOs, API contracts |
| Utilities | Shared helpers |

All code must follow: **Clean Architecture**, **Dependency Injection**, **Strong Typing**.

---

## Documentation Update Discipline

| Change           | Document to Update |
|------------------|--------------------|
| Database schema  | `DATABASE.md`      |
| Folder structure | `STRUCTURE.md`     |
| Coding standards | `STANDARDS.md`     |
| Security logic   | `SECURITY.md`      |
| Architecture     | `ARCHITECTURE.md`  |
| Project Log      | `PROJECT_LOG.md`   |
