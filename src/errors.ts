export class InterruptedError extends Error {
  silent = false;
  constructor(message?: string) {
    super(message ?? 'Prompt interrupted by user (Ctrl+C).');
    this.name = 'InterruptedError';
  }
}

export class EndOfFileError extends Error {
  silent = false;
  constructor(message?: string) {
    super(message ?? 'End of file reached (Ctrl+D).');
    this.name = 'EndOfFileError';
  }
}

export class ReloadPromptError extends Error {
  silent = false;
  constructor(message?: string) {
    super(message ?? 'Prompt reloaded by user.');
    this.name = 'ReloadPromptError';
  }
}

export class UserAbortedError extends Error {
  silent = false;
  constructor(message?: string) {
    super(message ?? 'User aborted the prompt.');
    this.name = 'UserAbortedError';
  }
}

export class ReturnToMainMenuError extends Error {
  silent = false;
  constructor(message?: string) {
    super(message ?? 'User requested to return to the main menu.');
    this.name = 'ReturnToMainMenuError';
  }
}

export { EndOfFileError as EndOfFile, InterruptedError as Interrupted };
