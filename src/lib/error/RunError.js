import AppError from './AppError';

export default class RunError extends AppError {

  constructor(command, code, details) {
    super(`Command failed: "${command}" (${code})`, details);

    this.command = command;
  }

  get detailsString() {
    return `Output:
${this.details.output}`;
  }

}
