export default class AppError extends Error {

  constructor(message, details) {
    super(message);

    this.details = details;
  }

  get detailsString() {
    return JSON.stringify(this.details, null, '  ');
  }

}
