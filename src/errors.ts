export class NotJobError extends Error {
  constructor() {
    super();
    this.message = 'Passed object is not a job';
    Object.setPrototypeOf(this, NotJobError.prototype);
  }
}

export class UnknownJobTypeError extends Error {
  constructor() {
    super();
    this.message = 'Passed object is job but represents unknown type';
    Object.setPrototypeOf(this, UnknownJobTypeError.prototype);
  }
}
