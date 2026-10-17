<!-- LOVABLE:BEGIN -->

<!-- LOVABLE:END -->

## Code Review Rules

### Correctness and user-facing behavior
- Prioritize concrete bugs, regressions, broken user flows, and incorrect calculations over style preferences.
- For crypto prices, portfolio values, balances, percentages, and historical data, verify units, decimal precision, currency conversions, missing data, stale data, and loading/error/empty states. Never silently present mock or stale data as live data.
- Check edge cases such as zero values, large numbers, invalid inputs, failed requests, and partially available API responses.

### Security and privacy
- Flag exposed credentials, API keys, tokens, private keys, seed phrases, or secrets. Never suggest placing secrets in client-side code or committing them to the repository.
- Treat external API responses and user input as untrusted. Check validation, error handling, URL construction, and unsafe rendering.
- Do not log sensitive account, wallet, authentication, or financial information.

### Project conventions
- Follow the existing TypeScript, React, TanStack Start/Router, and component patterns in this repository; avoid unnecessary architectural rewrites.
- Check React state/effect behavior, async request races, cleanup, and server/client boundaries where relevant.
- Report only actionable findings supported by the diff or repository context. Include severity, the affected file/line, impact, and a practical fix. Do not report speculative issues as facts.

### Validation
- Check whether changes are compatible with the existing lint/build scripts and relevant tests. Treat formatting-only issues as lower priority than correctness or security defects.
