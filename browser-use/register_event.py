import argparse
import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv


def build_llm():
    from browser_use import ChatAnthropic, ChatBrowserUse, ChatGoogle, ChatOpenAI

    model = os.getenv("BROWSER_USE_MODEL")

    if os.getenv("BROWSER_USE_API_KEY"):
        return ChatBrowserUse(model=model) if model else ChatBrowserUse()

    if os.getenv("ANTHROPIC_API_KEY"):
        selected_model = model or "claude-sonnet-4-6"
        return ChatAnthropic(model=selected_model)

    if os.getenv("GOOGLE_API_KEY"):
        selected_model = model or "gemini-3-flash-preview"
        return ChatGoogle(model=selected_model)

    if os.getenv("OPENAI_API_KEY"):
        selected_model = model or "gpt-4.1"
        return ChatOpenAI(model=selected_model)

    raise RuntimeError(
        "No supported LLM credentials found. Set BROWSER_USE_API_KEY, "
        "OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_API_KEY in browser-use/.env."
    )


def build_browser():
    from browser_use import Browser, BrowserProfile

    user_data_dir = os.getenv("CHROME_USER_DATA")
    profile_directory = os.getenv("CHROME_PROFILE_DIRECTORY")

    if user_data_dir:
        return Browser(
            profile=BrowserProfile(
                user_data_dir=user_data_dir,
                profile_directory=profile_directory,
            )
        )

    return Browser()


def build_task(url: str, attendee_details: str, extra_instructions: str | None) -> str:
    task = f"""
Open the event page at {url}.

Goal:
- Register for the event if registration is available.
- Use the attendee details below for form filling.
- Stop and clearly report if payment is required, a CAPTCHA blocks progress, or the site asks for email verification.

Constraints:
- Do not submit any payment step.
- Do not invent missing information.
- Ask for clarification in the final result if a required field is missing.

Attendee details:
{attendee_details}
""".strip()

    if extra_instructions:
        task = f"{task}\n\nExtra instructions:\n{extra_instructions.strip()}"

    return task


async def main():
    load_dotenv(Path(__file__).with_name(".env"))

    parser = argparse.ArgumentParser(description="Register for an event with Browser Use.")
    parser.add_argument("--url", required=True, help="Event page URL")
    parser.add_argument(
        "--details-file",
        required=True,
        help="Path to a text file containing attendee details for form filling",
    )
    parser.add_argument(
        "--instructions",
        default="",
        help="Optional extra instructions for the agent",
    )
    args = parser.parse_args()

    attendee_details = Path(args.details_file).read_text(encoding="utf-8").strip()
    if not attendee_details:
        raise RuntimeError("The attendee details file is empty.")

    from browser_use import Agent

    browser = build_browser()
    agent = Agent(
        task=build_task(args.url, attendee_details, args.instructions),
        llm=build_llm(),
        browser=browser,
    )

    try:
        result = await agent.run()
        print(result)
    finally:
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
