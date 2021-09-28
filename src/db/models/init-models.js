var DataTypes = require("sequelize").DataTypes;
var _lesson_students = require("./lesson_students");
var _lesson_teachers = require("./lesson_teachers");
var _lessons = require("./lessons");
var _students = require("./students");
var _teachers = require("./teachers");

function initModels(sequelize) {
  var lessonStudents = _lesson_students(sequelize, DataTypes);
  var lessonTeachers = _lesson_teachers(sequelize, DataTypes);
  var lessons = _lessons(sequelize, DataTypes);
  var students = _students(sequelize, DataTypes);
  var teachers = _teachers(sequelize, DataTypes);

  // lessons <-> students
  lessons.belongsToMany(students, {
    through: lessonStudents,
    foreignKey: "lesson_id",
    otherKey: "student_id",
  });
  students.belongsToMany(lessons, {
    through: lessonStudents,
    foreignKey: "student_id",
    otherKey: "lesson_id",
  });

  lessonStudents.belongsTo(lessons, { as: "lesson", foreignKey: "lesson_id" });
  lessons.hasMany(lessonStudents, {
    as: "lesson_students_om",
    foreignKey: "lesson_id",
  });
  lessonStudents.belongsTo(students, {
    as: "student",
    foreignKey: "student_id",
  });
  students.hasMany(lessonStudents, {
    as: "lesson_students_om",
    foreignKey: "student_id",
  });

  // lessons <-> teachers
  lessons.belongsToMany(teachers, {
    through: lessonTeachers,
    foreignKey: "lesson_id",
    otherKey: "teacher_id"
  });
  teachers.belongsToMany(lessons, {
    through: lessonTeachers,
    foreignKey: "teacher_id",
    otherKey: "lesson_id"
  });

  lessons.hasMany(lessonTeachers, {
    as: "lesson_teachers_om",
    foreignKey: "lesson_id",
  });
  lessonTeachers.belongsTo(lessons, { as: "lesson", foreignKey: "lesson_id" });
  teachers.hasMany(lessonTeachers, {
    as: "lesson_teachers_om",
    foreignKey: "teacher_id",
  });
  lessonTeachers.belongsTo(teachers, {
    as: "teacher",
    foreignKey: "teacher_id",
  });

  return {
    lessonStudents,
    lessonTeachers,
    lessons,
    students,
    teachers,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
