# Security

Do not post API keys, environment files, private prompts, or raw HTTP headers in issues or pull requests. For a vulnerability report, use GitHub's private security advisory reporting if enabled. Otherwise contact the repository owner through their GitHub profile before sharing details.

The app is intended to run locally. Its scripts bind to loopback and its API handlers reject non-loopback hosts and foreign browser origins. It has no multi-user authentication; add authentication, authorization, and rate limits before changing it into a shared deployment.

Pasted keys stay in browser tab memory and are sent to the local server. The server sends keys and chat messages to NVIDIA's fixed API endpoint. The public model catalog is fetched without a key. Keys are not saved in browser storage or logs. Conversation content and the selected model are saved in this browser's local storage. Delete chats from the sidebar to remove their stored content.

Run `npm run check:secrets` before publishing changes. It checks tracked and eligible untracked files, all branches and local reflogs, common credential patterns, and matches against local environment secrets. Output contains locations and rule names, never matched values. It also rejects unresolved merge conflicts, personal filesystem paths, and current filename case collisions. Pattern scans cannot prove that every possible secret is absent.

If a real credential is ever committed or pushed, revoke or rotate it immediately. Deleting it in a later commit does not remove it from history.
