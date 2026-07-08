export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Generic client-safe message in production; detailed in development. */
export function clientFacingMessage(
  developmentMessage: string,
  productionMessage = "Request could not be processed."
): string {
  return isProductionEnvironment() ? productionMessage : developmentMessage;
}
