/**
 * In an array of lesson objects (with lesson numbers and names), finds the name of the lesson
 * with the same lesson number as the user's current progress state.
 *
 * @param {Lesson[]} lessonArray - An array of lessons.
 * @param {number} currentLesson - The user's current progress.
 * @returns {string} The name of the found lesson.
 */
function findCurrentLessonName(lessonArray, currentLesson) {
  return lessonArray.find(lesson => lesson.lessonNumber === currentLesson).name;
}

export { findCurrentLessonName };
