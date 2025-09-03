# Console Rendering and Overwriting

The rendering and overwriting of console output in this library is achieved through a combination of raw terminal mode and ANSI escape codes. This allows for fine-grained control over the cursor position and screen content, creating a dynamic and interactive user experience.

### Core Concepts:

1.  **Raw Mode:** For interactive prompts like lists (`select`, `checkbox`) or single-line inputs (`input`, `password`), the terminal is put into "raw mode". Normally, the terminal buffers input until the user presses `Enter`. In raw mode, every key press is immediately sent to the application. This is handled in `lib/io/readline.ts` and `lib/io/renderlist.ts` using `Deno.stdin.setRaw(true)`. This allows the application to respond to arrow keys, spacebar, and other non-character inputs instantly.

2.  **ANSI Escape Codes:** These are special sequences of characters that, when written to the console, are interpreted as commands rather than displayable text. This library uses them to:
    *   **Move the cursor:** For example, `\x1b[A` moves the cursor up one line, and `\r` (carriage return) moves the cursor to the beginning of the current line.
    *   **Clear parts of the screen:** `\x1b[K` clears the line from the cursor to the end.
    *   **Apply colors and styles:** The `@std/fmt/colors` module is used, which generates the appropriate ANSI codes for text styling (e.g., making the selected item in a list bold or a different color).

### The Rendering Loop:

The core of the interactive experience is a loop within each prompt's `run()` method (e.g., in `lib/prompt/select.ts` or `lib/prompt/input.ts`).

1.  **Initial Render:** The prompt is first written to the screen.
    *   For `input`-style prompts, the `getPrompt()` method in `lib/prompt/base.ts` assembles the message, prefix, and other elements.
    *   For `list`-style prompts, the `renderList` function in `lib/io/renderlist.ts` is called. It calculates the required layout (including columns) and prints each item, row by row.

2.  **Wait for Input:** The application then waits for a single key press from the user. Because it's in raw mode, it doesn't need to wait for an `Enter`.

3.  **State Update:** The key press is processed.
    *   If it's an arrow key in a list, the application updates its internal state to change which item is considered "active".
    *   If it's a character in an `input` field, the internal string holding the user's text is updated.

4.  **Clear the Old Output:** This is the "overwrite" part of the process.
    *   For lists, the `renderList` function knows how many rows it just printed. After receiving user input, it uses ANSI codes to move the cursor up that many times, clearing each line as it goes. This logic is located at the end of the `renderList` function.
    *   For single-line inputs, the logic in `lib/io/readline.ts` handles backspace by sending the `\b` (backspace) character, which moves the cursor back, and then writing a space over the old character and moving back again.

5.  **Re-render:** The loop immediately repeats. The entire prompt (or list) is drawn again to the console, reflecting the new state (e.g., the newly highlighted item in a list, or the updated text in an input).

This clear-and-redraw cycle happens so quickly for each key press that it appears to the user as if the output is being smoothly updated in place.

### Final Output:

When the user confirms their choice (usually by pressing `Enter`), the rendering loop is broken.

The `redraw()` method in `lib/prompt/base.ts` is then typically called. It uses the `\r\x1b[K` sequence to move to the beginning of the current line, clear it completely, and then write the final, clean answer (e.g., "What is your name?: John Doe"). This replaces the interactive part of the prompt (like the list of options or the blinking cursor) with just the final submitted value.
