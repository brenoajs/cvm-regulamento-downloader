type LogPayload = Record<string, unknown>;

const serialize = (
  level: "info" | "warn" | "error",
  payload?: LogPayload,
  message?: string
): string => {
  return JSON.stringify({
    level,
    time: new Date().toISOString(),
    msg: message,
    ...(payload ?? {})
  });
};

const log = (
  level: "info" | "warn" | "error",
  payloadOrMessage?: LogPayload | string,
  message?: string
): void => {
  const payload =
    payloadOrMessage && typeof payloadOrMessage === "object"
      ? payloadOrMessage
      : undefined;
  const msg =
    typeof payloadOrMessage === "string"
      ? payloadOrMessage
      : message;
  const line = serialize(level, payload, msg);
  const stream = level === "error" ? process.stderr : process.stdout;
  stream.write(`${line}\n`);
};

export const logger = {
  info: (payloadOrMessage?: LogPayload | string, message?: string) =>
    log("info", payloadOrMessage, message),
  warn: (payloadOrMessage?: LogPayload | string, message?: string) =>
    log("warn", payloadOrMessage, message),
  error: (payloadOrMessage?: LogPayload | string, message?: string) =>
    log("error", payloadOrMessage, message)
};
