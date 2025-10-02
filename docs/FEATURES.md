# Future Features and Known Issues

This document tracks desired features, enhancements, and known issues for future development cycles.

## Dynamic Input Width

-   **Goal:** The `input` and `password` prompts should prevent the user's text input from exceeding the width of the terminal window, avoiding line wrapping and display glitches.
-   **Implementation Idea:** Use `Deno.consoleSize().columns` to get the terminal width dynamically within the `readLine` function. Replace the hardcoded character limit with this value.
-   **Current Status:** **Not Implemented / Buggy.** An attempt was made to implement this, but it resulted in the length limit not being applied at all. The code was reverted to the previous hardcoded limit of 120 characters. This needs to be re-investigated and fixed in a future release.
