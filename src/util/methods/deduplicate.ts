import { Model } from 'sequelize';

function isPropertyKey(value: Model[keyof Model]): value is PropertyKey {
  return (
    (typeof value as PropertyKey) === 'string' ||
    (typeof value as PropertyKey) === 'number' ||
    (typeof value as PropertyKey) === 'symbol'
  );
}

/**
 * In an array of Sequelize model instances, filters out duplicates based on the given field.
 * In other words, for objects where the given field's value is the same, it will only keep the first one found.
 * @param {Object.<Model[], PropertyKey>} parameters
 * @param {Model[]} parameters.array - The array of objects to filter.
 * @param {PropertyKey} parameters.byField - The name of the property based on which to filter.
 * @returns {void} Modifies `array`.
 */
function deduplicate<M extends Model>({
  array,
  byField,
}: {
  array: M[];
  byField: keyof M;
}): void {
  let lookup: Record<PropertyKey, boolean> = {};

  for (let i = 0; i < array.length; i++) {
    const currentValue = array[i][byField];

    if (!isPropertyKey(currentValue)) {
      throw new Error(`This field can't be used to remove duplicates by.`);
    }

    if (lookup[currentValue]) {
      array.splice(i, 1);
    } else {
      lookup[currentValue] = true;
    }
  }

  lookup = {};

  return;
}

export { deduplicate };
