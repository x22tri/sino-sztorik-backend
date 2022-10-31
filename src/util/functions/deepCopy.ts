async function deepCopy<T>(value: T): Promise<T> {
  return await JSON.parse(JSON.stringify(value));
}

export { deepCopy };
