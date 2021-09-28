const lessonStudentsModel = require("../db/").lessonStudents;

class LessonStudentsService {
  async setAll() {
    try {
      const strs = `1	1	t
      1	2	t
      1	3	f
      2	2	t
      2	3	t
      4	1	t
      4	2	t
      4	3	t
      4	4	t
      5	4	f
      5	2	f
      6	1	f
      6	3	f
      7	2	t
      7	1	t
      8	1	f
      8	4	t
      8	2	t
      9	2	f
      10	1	f
      10	3	t`;

      const lens = strs.split("\n");
      for (let len of lens) {
        const elems = len.split("\t");
        const lesson = {
          lesson_id: Number(elems[0]),
          student_id: Number(elems[1]),
          visit: elems[2] == 't',
        };
        lessonStudentsModel.create(lesson);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = new LessonStudentsService();