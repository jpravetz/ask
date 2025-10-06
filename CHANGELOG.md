# Changelog for @jpravetz/ask

All notable changes to this project will be documented in this file.

## [2.0.3-beta.26] - 2025-10-06

- Added blank lines around CTRL-D behaviour.
- Changed color of CTRL-D confirm to red.

## [2.0.3-beta.25] - 2025-10-02

- Replaced spinner with static stopwatch symbol

## [2.0.3-beta.24] - 2025-10-02

- Modified confirm prompt behaviour
- Implemented password masking
- Fixed CTRL-D bug when typed twice
- Introduced spinner regression for CTRL-R that still needs fixing.

## [2.0.3-beta.23] - 2025-10-01

- Implemented global `onCtrlR` callback with spinner and final state feedback (green/red circle).
- Implemented global `CTRL-D` exit confirmation with `UserAbortedError`.
- Implemented word navigation (`OPT-left/right`, `CTRL-left/right`).
- Standardized `ESC` key behavior across all prompts to return `undefined`.
- Improved test suite robustness for `ESC` and `CTRL-D` handling, including an "ABORTED" status.
- Updated `README.md` with detailed prompt configurations, key behaviors, and global preferences.

## [2.0.3-beta.22] - 2025-09-30

- Added CTRL-A and CTRL-E to input.
- Fixed left/right arrow keys not working.
- Added interactive test using `./examples/test.ts`.

## [2.0.3-beta.21] - 2025-09-26

- Fixed issue with number key presses being caught when useNumbers is not true in select prompt.

## [2.0.3-beta.20] - 2025-09-08

- Added color formatting to input text edits.

## [2.0.3-beta.19] - 2025-09-08

- Fixed cleanup methods for the prompts.
- Improved handling of ESC and Ctrl-D.

## [2.0.3-beta.16] - 2025-09-05

- Fixed password finalPrompt rendering.
- Fixed all example scripts.
- Fixed some import references for consistency.
- Added `inlineCheckbox` prompt.
- Made the spacing before questions a global preNewline option.
- Bug fixes with final prompt output

## [2.0.3-beta.12] - 2025-09-04

- Fix lint and check bugs
- Completed fixes for display of checkbox, select, confirm, input and number.

## [2.0.3-beta.10] - 2025-09-03

- Fix to Uint8array problem, with more consolidation on io/writer
- Improve prompt functionality, underlying I/O and rendering logic.

## [2.0.3-beta.7] - 2025-09-02

- Fixed export bug and made some changes to README.
- Reorganized code into namespaces, including for Opts and Prompts.
  - Split type definitions into separate files.
- Work on improving UI interactivity (but not done yet)
- Fixed use of generics from original code, and a number of lint type errors.

## [2.0.3-beta.4] - 2025-09-01

- Added list of bug fixes to fix next time around

## [2.0.3-beta.3] - 2025-09-01

- Added multi column checkbox support.
- Formatting enchancements.
