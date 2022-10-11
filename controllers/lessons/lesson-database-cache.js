const lessonsCache = {
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
