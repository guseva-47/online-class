const lessonsModel = require("../db").lessons;
const teachersModel = require("../db").teachers;
const studentsModel = require("../db").students;
const lessonTeachersModel = require("../db").lessonTeachers;

const sequelize = require("sequelize");
const moment = require("moment");

class LessonsService {

  async setAll() {
    try {
      const strs = `2	2019-09-02	Red Color	0
      5	2019-05-10	Purple Color	0
      7	2019-06-17	White Color	0
      10	2019-06-24	Brown Color	0
      9	2019-06-20	Yellow Color	1
      1	2019-09-01	Green Color	1
      3	2019-09-03	Orange Color	1
      4	2019-09-04	Blue Color	1
      6	2019-05-15	Red Color	1
      8	2019-06-17	Black Color	1`;

      const lens = strs.split("\n");
      for (let len of lens) {
        const elems = len.split("\t");
        const lesson = {
          id: Number(elems[0]),
          date: elems[1],
          title: elems[2],
          status: elems[3],
        };
        return lessonsModel.create(lesson);
      }
    } catch (err) {
      console.error(err);
    }
  }

  _getAttributes() {
    const attributes = {
      include: [
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM lesson_students
            WHERE lesson_students.lesson_id = lessons.id
              AND lesson_students.visit
            )`),
          "visitCount",
        ],
      ],
    };
    return attributes;
  }

  _getInclude(teachersIds) {
    const _getTeacherQuery = (teachersIds) => {
      const teacherParam = {
        model: teachersModel,
        through: {
          attributes: [],
        },
        where: {},
      };

      if (teachersIds) {
        teacherParam.where = {
          id: { [sequelize.Op.in]: teachersIds },
        };
      }
      return teacherParam;
    };

    const studentsQuery = {
      model: studentsModel,
      attributes: {
        include: [
          [
            sequelize.literal(`(
              select ls.visit
              from lesson_students as ls
              where ls.lesson_id = lessons.id
                AND ls.student_id = students.id
              LIMIT 1
            )`),
            "visit",
          ],
        ],
      },
      through: {
        attributes: [],
      },
    };

    return [_getTeacherQuery(teachersIds), studentsQuery];
  }

  _getWhere(dates, status, studentsCount) {
    const _getWhereStudCount = (studentsCount) => {
      if (studentsCount.length > 1) {
        return {
          [sequelize.Op.or]: [
            sequelize.where(
              sequelize.literal(`(
              SELECT COUNT(*)
              FROM lesson_students
              WHERE lesson_students.lesson_id = lessons.id
            )`),
              { [sequelize.Op.between]: studentsCount }
            ),
          ],
        };
      }
      return {
        [sequelize.Op.or]: [
          sequelize.where(
            sequelize.literal(`(
            SELECT COUNT(*)
            FROM lesson_students
            WHERE lesson_students.lesson_id = lessons.id
          )`),
            { [sequelize.Op.eq]: studentsCount[0] }
          ),
        ],
      };
    };

    const where = studentsCount ? _getWhereStudCount(studentsCount) : {};

    if (dates) {
      if (dates.length > 1)
        where.date = { [sequelize.Op.between]: [dates[0], dates[1]] };
      else where.date = { [sequelize.Op.gte]: dates[0] };
    }

    if (status) {
      where.status = { [sequelize.Op.eq]: status };
    }

    return where;
  }

  async getLessons(params) {
    const query = {
      attributes: this._getAttributes(),
      where: this._getWhere(params.date, params.status, params.studentsCount),
      include: this._getInclude(params.teacherIds),

      offset: params.lessonsPerPage * (params.page - 1),
      limit: params.lessonsPerPage,
    };

    const lessons = await lessonsModel
      .findAndCountAll(query)
      .catch((err) => console.error(`1 Err in Task 1: ${err.message}`));
    return lessons;
  }

  *_dayGenerator(timetable, dayOfFirst) {
    const len = timetable.length;

    let iDayOfFirst = timetable.findIndex((day) => day >= dayOfFirst);
    if (iDayOfFirst == -1) iDayOfFirst = len;

    for (let count = iDayOfFirst; ; count++) {
      const i = count % len;
      const isZeroInd = i == 0 && count > 0;

      yield timetable[i] + Number(isZeroInd) * 7;
    }
  }

  _getDatesList(firstDate, lastDate, lessonsCount, days) {
    const timetable = [...days].sort((a, b) => a - b);

    const dateMt = moment(firstDate);
    const dayGenerator = this._dayGenerator(timetable, dateMt.day());

    const datesList = [];
    dateMt.day(dayGenerator.next().value);
    for (let i = 0; i < lessonsCount && dateMt.valueOf() <= lastDate; i++) {
      datesList.push(dateMt.valueOf());

      dateMt.day(dayGenerator.next().value);
    }

    return datesList;
  }

  _getRecords(title, dates, teacherIds) {
    return dates.map((date) => {
      return {
        date: date,
        title: title,
        lesson_teachers_om: teacherIds.map((id) => {
          return { teacher_id: id };
        }),
      };
    });
  }

  async postLessons(params) {
    // надо проверить и удалить дубликаты мб
    const a = await teachersModel.findAndCountAll({
      where: { id: params.teacherIds },
      limit: params.teacherIds.length,
    });

    if (a.count != params.teacherIds.length);

    const datesList = this._getDatesList(
      params.firstDate,
      params.lastDate,
      params.lessonsCount,
      params.days
    );

    const records = this._getRecords(params.title, datesList, params.teacherIds);
    let ids = [];
    await lessonsModel
      .bulkCreate(records, {
        include: { model: lessonTeachersModel, as: "lesson_teachers_om" },
        returning: true,
      })
      .then((res) => {
        ids = res.map((lessons) => lessons.dataValues.id);
        console.log(res);
      })
      .catch((err) => {
        console.log(`Error in Task 2: ${err}`);
      });

    return ids;
  }
}

module.exports = new LessonsService();
