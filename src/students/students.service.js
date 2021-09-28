const studentsModel = require("../db").students;

class StudentsService {
  async setAll() {
    try {
      const strs = `1	Ivan
      2	Sergey
      3	Maxim
      4	Slava`;

      const lens = strs.split("\n");
      for (let len of lens) {
        const elems = len.split("\t");
        const lesson = {
          id: Number(elems[0]),
          name: elems[1]
        };
        studentsModel.create(lesson);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = new StudentsService();