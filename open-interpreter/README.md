# Open Interpreter Setup

This folder is an isolated Python environment for Open Interpreter.

## Upstream install guidance

As of April 25, 2026, the official docs recommend installing `open-interpreter` with `pip` in a Python `3.10` or `3.11` virtual environment:

- https://docs.openinterpreter.com/getting-started/setup
- https://docs.openinterpreter.com/

## Local layout

- `.venv/`: local virtual environment

## Install

```bash
cd open-interpreter
python3.11 -m venv .venv
.venv/bin/pip install open-interpreter
```

## Run

From the repo root:

```bash
npm run oi
```

Or directly:

```bash
open-interpreter/.venv/bin/interpreter
```
