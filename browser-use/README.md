# Browser Use Setup

This folder is an isolated Python workspace for Browser Use, separate from the main Node app.

## Requirements

- Python 3.11+
- `uv`
- One supported LLM credential in `browser-use/.env`

Browser Use upstream currently recommends `uv add browser-use` with `Python >= 3.11`, and notes that Browser Use Cloud is the better choice for stealth, proxies, and CAPTCHA-heavy flows.

## Files

- `pyproject.toml`: Python dependency manifest
- `.env.example`: API key and browser-profile settings
- `register_event.py`: Generic event-registration runner
- `attendee-details.example.txt`: Template for form data

## Install

```bash
cd browser-use
uv sync
uv run browser-use install
cp .env.example .env
cp attendee-details.example.txt attendee-details.txt
```

## Run

```bash
cd browser-use
uv run python register_event.py \
  --url "https://portraitmedia.group/events/possible-2026" \
  --details-file attendee-details.txt \
  --instructions "If a pricing tier is shown, stop before checkout and report the options."
```

## Notes

- The script refuses to proceed without supported LLM credentials.
- It will not intentionally submit payment.
- If a site relies on existing login state, set `CHROME_USER_DATA` and optionally `CHROME_PROFILE_DIRECTORY` in `.env` to reuse a local Chrome profile.
