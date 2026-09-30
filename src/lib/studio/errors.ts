export class StudioNotFound extends Error {
  readonly code = "not_found";

  constructor(message: string) {
    super(message);
    this.name = "StudioNotFound";
  }
}

export class StudioBridgeError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "StudioBridgeError";
  }
}
