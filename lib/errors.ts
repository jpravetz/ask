export class InterruptedError extends Error {
  constructor(message?: string) {
    super(message ?? 'Prompt interrupted by user (Ctrl+C).');
    this.name = 'InterruptedError';
  }
}

export class EndOfFileError extends Error {
  constructor(message?: string) {
    super(message ?? 'End of file reached (Ctrl+D).');
    this.name = 'EndOfFileError';
  }
}
