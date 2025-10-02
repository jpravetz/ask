# Features

This document lists new features that are currently in development and that need to be tracked. Once a feature is completed, we will transfer relevant information to our [general documentation](./docs/) and will manually remove the feature from this document.

- **Word Navigation:**
  - [x] `CTRL-A` and `CTRL-E` to go to the beginning and end of the input line.
  - [x] `CTRL` or `OPT` left/right to go forward/backward a word.

- **Ctrl-D Behavior:**
  - [x] When a user presses `Ctrl-D`, the prompt should not exit. Instead, it should re-run the current prompt. This will make the library more forgiving of accidental `Ctrl-D` presses.

- **Ctrl-R Behavior:**
  - [x] When a user presses `Ctrl-R`, an optional `onCtrlR` callback should be called to allow the application to reload.

- **Pasting text:**
  - [x] Pasting text isn't working properly because the length of the pasted string is not being considered.
