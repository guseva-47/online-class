const teachersModel = require("../db").teachers;

class TeachersService {
  async setAll() {
    try {
      const strs = `1	Sveta
      2	Marina
      3	Angelina
      4	Masha`;

      const lens = strs.split("\n");
      for (let len of lens) {
        const elems = len.split("\t");
        const lesson = {
          id: Number(elems[0]),
          name: elems[1]
        };
        teachersModel.create(lesson);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = new TeachersService();