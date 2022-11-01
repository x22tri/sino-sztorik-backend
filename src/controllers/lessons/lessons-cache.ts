import Lesson from '../../models/lessons.js';

const lessonsCache: {
  data: Lesson[] | undefined;
  save(data: Lesson[]): void;
  get(): Lesson[] | undefined;
  clear(): void;
} = {
  data: undefined,

  save(data) {
    this.data = data;
    return;
  },

  get() {
    return this.data;
  },

  clear() {
    this.data = undefined;
  },
};

export default lessonsCache;
