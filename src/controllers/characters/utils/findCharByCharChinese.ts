import { findBareCharacter } from './findBareCharacter.js';
import { addSupplements } from './addSupplements.js';
import { TIER_OR_LESSON_NOT_NUMBER_ERROR } from '../../../util/string-literals.js';
import { throwError } from '../../../util/functions/throwError.js';
import { FullCharacter, Progress } from '../../../util/interfaces.js';

/**
 * Takes the user's current progress and character string and finds the character object for the character
 * based on what the user is eligible to see.
 * The supplementsNeeded flag determines if supplemental information such as phrases with the requested character should be queried.
 *
 * @param charString - The character string we're querying.
 * @param userProgress - The user's current progress in the course.
 * @returns The character object.
 */
async function findCharByCharChinese(
  charString: string,
  userProgress: Progress
): Promise<FullCharacter | void> {
  if (isNaN(userProgress.tier) || isNaN(userProgress.lessonNumber)) {
    throwError({ message: TIER_OR_LESSON_NOT_NUMBER_ERROR, code: 400 });
  }

  const bareCharacter = await findBareCharacter(charString, userProgress);

  if (!bareCharacter) {
    return;
  }

  const characterWithSupplements = await addSupplements(bareCharacter);

  return characterWithSupplements;
}

export { findCharByCharChinese };
