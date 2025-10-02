# Console Rendering and Overwriting

The rendering and overwriting of console output in this library is achieved through a combination of raw terminal mode and ANSI escape codes. This allows for fine-grained control over the cursor position and screen content, creating a dynamic and interactive user experience.

### Core Concepts:

1.  **Raw Mode:** For interactive prompts like lists (`select`, `checkbox`) or single-line inputs (`input`, `password`), the terminal is put into "raw mode". Normally, the terminal buffers input until the user presses `Enter`. In raw mode, every key press is immediately sent to the application. This is handled in `lib/io/readline.ts` and `lib/io/renderlist.ts` using `Deno.stdin.setRaw(true)`. This allows the application to respond to arrow keys, spacebar, and other non-character inputs instantly.

    **Crucially, when in raw mode, the terminal's default echoing behavior is typically disabled.** This means the application becomes solely responsible for echoing characters typed by the user back to the screen. If the application fails to echo characters correctly, the user will not see what they are typing.

2.  **ANSI Escape Codes:** These are special sequences of characters that, when written to the console, are interpreted as commands rather than displayable text. This library uses them to:
    *   **Move the cursor:** For example, `\x1b[A` moves the cursor up one line, and `\r` (carriage return) moves the cursor to the beginning of the current line.
    *   **Clear parts of the screen:** `\x1b[K` clears the line from the cursor to the end. `\x1b[2K` clears the entire line.
    *   **Apply colors and styles:** The `@std/fmt/colors` module is used, which generates the appropriate ANSI codes for text styling (e.g., making the selected item in a list bold or a different color).

### The Rendering Loop:

The core of the interactive experience is a loop within each prompt's `run()` or `question()` method.

1.  **Initial Render:** The prompt is first written to the screen.
    *   For `input`-style prompts, the `getPrompt()` method in `lib/prompt/base.ts` assembles the message, prefix, and other elements.
    *   For `list`-style prompts, the `renderList` function in `lib/io/renderlist.ts` is called. It calculates the required layout (including columns) and prints each item, row by row.

2.  **Wait for Input:** The application then waits for a single key press from the user. Because it's in raw mode, it doesn't need to wait for an `Enter`.

3.  **State Update:** The key press is processed.
    *   If it's an arrow key in a list, the application updates its internal state to change which item is considered "active".
    *   If it's a character in an `input` field, the internal string holding the user's text is updated.
    *   If it's a valid character in a `confirm` prompt (`y`, `n`, etc.), the internal state is updated to `true` or `false`.

4.  **Clear the Old Output:** This is the "overwrite" part of the process.
    *   For lists, the `renderList` function knows how many rows it just printed. After receiving user input, it uses ANSI codes to move the cursor up that many times, clearing each line as it goes.
    *   For single-line inputs and confirm prompts, the logic in `lib/io/readline.ts` and `lib/prompt/confirm.ts` handles echoing characters, backspace, and cursor movement by sending appropriate ANSI escape codes. This involves precisely clearing parts of the line and redrawing the updated input string or state.

5.  **Re-render:** The loop immediately repeats. The entire prompt is drawn again to the console, reflecting the new state (e.g., the newly highlighted item in a list, the updated text in an input, or the colored "Yes"/"No" in a confirm prompt).

This clear-and-redraw cycle happens so quickly for each key press that it appears to the user as if the output is being smoothly updated in place.

### Special Rendering Behaviors

Beyond the standard prompt loops, the library has special rendering cases for global key presses.

-   **`CTRL-R` Waiting Indicator:** When a global `onCtrlR` handler is defined, pressing `CTRL-R` triggers a special rendering state (this does not apply to hidden/password prompts). The prompt's prefix (e.g., `?`) is replaced by a static, gold-colored stopwatch symbol (`⏱`) to indicate that an operation is in progress. The application then `await`s the `onCtrlR` function. Once the function completes, the prompt is redrawn a final time, replacing the stopwatch with a success (`●` green) or failure (`●` red) indicator.

### Challenges with Raw Mode Echoing (The `Uint8Array` Problem):

A significant challenge in raw mode is ensuring that only the application's intended output is displayed. If the terminal's default echoing is not fully suppressed by `Deno.stdin.setRaw(true)` (which can vary across terminal emulators and operating systems), or if the application's echoing/redrawing logic is not perfectly synchronized, raw input bytes can be inadvertently printed to the console.

The observed `Uint8Array` output (e.g., `32,32,...27,91,49,109,...`) is a direct manifestation of this. It represents the raw byte sequence of the prompt message and ANSI escape codes that are being written to the console *before* or *instead of* the application's intended formatted string output. This occurs when the raw bytes from the terminal's input buffer are echoed directly to the screen, bypassing the `TextDecoder` and subsequent string formatting. The `lib/io/readline.ts` module is the primary location where this echoing and redrawing logic resides, making it the focal point for addressing such display artifacts. Achieving pixel-perfect control over terminal output in raw mode requires meticulous handling of ANSI escape codes for cursor positioning, line clearing, and ensuring that all drawing operations are atomic and complete.