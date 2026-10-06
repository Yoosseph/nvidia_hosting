# Repository publication audit

Checked on 7 October 2026. This report records the state before the open-source preparation changes in this working tree.

- Repository: `Yoosseph/nvidia_hosting` on GitHub. It was already public.
- Remote `main`: `3f0f7d610aa7e3f614fe4654031ddb9b412b2e59`.
- Other remote branch: `claude/wonderful-cannon-1f0r0j` at `41441a6f5e69b1d3db2ab16d799d32413308dc34`.
- Five reachable commits and 49 unique historical blobs were scanned, including all local refs and reflogs. No credential-pattern matches or copies of the local environment key were found. The only secret-assignment match was an environment-variable reference in a documentation example, not a credential.
- `.env` was not present in the reachable commit history. It is ignored, along with environment variants, generated output, dependency directories, caches, and credential file formats.
- GitHub reported no Pages site, deployment records, or Actions runs. This does not rule out hosting outside GitHub.
- The already-pushed merge contained conflict markers in `.gitignore` and both `README.md` and `readme.md`. These were corrected locally; the lowercase duplicate was removed from the index without deleting the retained README file.

The preparation work adds an MIT license, app-focused setup and contribution instructions, security guidance, CI checks, and a reusable redacted-output scanner. No remote visibility change, push, deployment, history rewrite, or key rotation was performed during this audit.

Run `npm run check:secrets` again before pushing. The result is a scoped audit, not a guarantee against every possible kind of sensitive data. Git author identities remain part of the existing public history.
