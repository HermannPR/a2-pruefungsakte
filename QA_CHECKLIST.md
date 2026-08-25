# Release QA checklist

## P0 before inviting more users

- Test signup, confirmation resend, login, and password reset with Gmail, Outlook, and Yahoo addresses.
- In Brevo **Transactional > Logs**, verify each test message is `Delivered`; investigate `Blocked`, `Bounced`, or missing events before retrying.
- Replace the Gmail sender with an authenticated custom domain using SPF, DKIM, and DMARC.
- Complete one full official reading and listening test on a real Android phone and iPhone.
- Verify keyboard-only navigation: skip link, menu, every tab, forms, answer choices, and dialogs.
- Test with NVDA on Windows and VoiceOver on iPhone, including error announcements and task-sheet alternative text.

## P1 product polish

- Run Lighthouse on login, dashboard, vocabulary, and official listening under mobile network throttling.
- Test browser zoom at 200% and text-only zoom without horizontal scrolling or hidden controls.
- Test interruption recovery: refresh, browser back, expired session, offline mode, and switching devices mid-exercise.
- Test long names, long email addresses, Turkish text, Chinese text, and narrow 320 px screens.
- Ask a German teacher to verify vocabulary OCR, answer keys, writing prompts, and speaking instructions.
- Observe five new learners completing registration and their first exercise without assistance.

## Automated commands

- `npm.cmd test`
- `npm.cmd run audit:a11y`
- `npm.cmd run build`
