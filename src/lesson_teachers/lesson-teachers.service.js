const lessonTeachersModel = require("../db").lessonTeachers;

class LessonTeachersService {
  async setAll() {
    try {
      const strs = `1	1
      1	3
      2	1
      2	4
      3	3
      4	4
      6	3
      7	1
      8	4
      8	3
      8	2
      9	3
      10	3`;

      const lens = strs.split("\n");
      for (let len of lens) {
        const elems = len.split("\t");
        const lesson = {
          lesson_id: Number(elems[0]),
          teacher_id: Number(elems[1]),
        };
        lessonTeachersModel.create(lesson);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = new LessonTeachersService();