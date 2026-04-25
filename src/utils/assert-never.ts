/* istanbul ignore file */
export const assertNever = (value: never): never => {
  throw new Error(`Unhandled value: ${String(value)}`);
};
