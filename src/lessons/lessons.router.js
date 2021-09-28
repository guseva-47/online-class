const Router = require("express");
const router = new Router();
const moment = require("moment");

const { ValidationError } = require("../error/ValidationError");
const { EmptyPropertyError } = require("../error/EmptyPropertyError");

const lessonsService = require("../lessons/lessons.service");

async function getAll(_, res) {
  const lessons = await lessonsService.findAll();
  res.json(lessons);
}

function _strToFirstDate(str, dateFormat = "YYYY-MM-DD") {
  return _strToDates(str, "firstDate", dateFormat)[0];
}

function _strToDates(str, propTitle, dateFormat = "YYYY-MM-DD") {
  if (typeof str != "string") throw new ValidationError(propTitle, str);

  if (str.length < dateFormat.length) throw new ValidationError(propTitle, str);

  const strs = str.split(",", 3).slice(0, 2);
  const dates = strs.map((date) => moment(date, dateFormat, true));

  const invalidDateIndex = dates.findIndex((date) => !date.isValid());
  if (invalidDateIndex != -1)
    throw new ValidationError(propTitle, strs[invalidDateIndex]);

  if (dates.length > 1 && dates[0] > dates[1])
    throw new ValidationError(propTitle, `${strs[0]} > ${strs[1]}`);

  return dates.map((date) => date.valueOf());
}

function _strToStatus(str) {
  if (str != "0" && str != "1") throw new ValidationError("status", str);
  return Number(str);
}

function _strToStudentsCount(str, propTitle = "studentsCount") {
  if (typeof str != "string")
    throw new ValidationError(propTitle, `typeof ${str} not string`);

  const strs = str.split(",", 3).slice(0, 2);
  const counts = strs.map((str) => (str == "" ? -1 : Number(str)));

  const invalidNumIndex = counts.findIndex(
    (num) => !Number.isInteger(num) || num < 0
  );
  if (invalidNumIndex != -1)
    throw new ValidationError(propTitle, strs[invalidNumIndex]);

  if (counts.length > 1 && counts[0] > counts[1])
    throw new ValidationError(propTitle, `${strs[0]} > ${strs[1]}`);

  return counts;
}

function _strToPage(str) {
  return _strToNaturalNum(str, "page");
}

function _strToLessonsPerPage(str) {
  return _strToNaturalNum(str, "lessonsPerPage");
}

function _strToNaturalNum(str, propTitle) {
  const num = Number(str);
  if (!Number.isInteger(num) || num < 1)
    throw new ValidationError(propTitle, str);
  return num;
}

function _strToTeacherIds(str) {
  const strs = str.split(",");
  const ids = strs.map((str) => Number(str));

  const { isValid, wrongData } = _checkIds(ids);
  if (!isValid) throw new ValidationError("teacherIds", wrongData);

  return ids;
}

function _checkIds(ids) {
  const result = { isValid: true, wrongData: null };

  if (!Array.isArray(ids)) {
    result.isValid = false;
    result.wrongData = ids;
    return result;
  }

  const invalidIdIndex = ids.findIndex((id) => !Number.isInteger(id));

  if (invalidIdIndex != -1 || _haveDupicates(ids)) {
    result.isValid = false;
    result.wrongData = ids[invalidIdIndex];
    return result;
  }

  return result;
}

function _checkDays(days) {
  const result = { isValid: true, wrongData: null };

  if (!Array.isArray(days) || days.length < 1) {
    result.isValid = false;
    result.wrongData = days;
    return result;
  }

  const invalidIdIndex = days.findIndex(
    (day) => !Number.isInteger(day) || day < 0 || day > 6
  );

  if (invalidIdIndex != -1 || _haveDupicates(days)) {
    result.isValid = false;
    result.wrongData = days;
    return result;
  }

  return result;
}

function _strToLessonsCount(str, maxCount) {
  const count = _strToNaturalNum(str, "lessonsCount");
  return count > maxCount ? maxCount : count;
}

function _strToLastDate(
  strFirstDate,
  strLastDate,
  maxDate,
  dateFormat = "YYYY-MM-DD"
) {
  if (!strLastDate) return maxDate;

  const [_, lastDate] = _strToDates(
    `${strFirstDate},${strLastDate}`,
    "lastDate",
    dateFormat
  );

  return lastDate > maxDate ? maxDate : lastDate;
}

function _haveDupicates(arr) {
  const duplArray = arr.filter((item, index) => arr.indexOf(item) != index);
  return 0 < duplArray.length;
}

async function getLessons(req, res) {
  try {
    const params = {
      date: undefined, // str "YYYY-MM-DD" || "YYYY-MM-DD,YYYY-MM-DD"
      status: undefined, // "0" || "1",
      teacherIds: undefined, // "id,id,...",
      studentsCount: undefined, // "x" || "x,y",
      page: 1,
      lessonsPerPage: 5,
    };

    if (req.query.date) params.date = _strToDates(req.query.date, "date");

    if (req.query.status) params.status = _strToStatus(req.query.status);

    if (req.query.teacherIds)
      params.teacherIds = _strToTeacherIds(req.query.teacherIds);

    if (req.query.studentsCount)
      params.studentsCount = _strToStudentsCount(req.query.studentsCount);

    if (req.query.page) params.page = _strToPage(req.query.page);

    if (req.query.lessonsPerPage)
      params.lessonsPerPage = _strToLessonsPerPage(req.query.lessonsPerPage);

    const lessons = await lessonsService.getLessons(params);

    res.json(lessons);
  } catch (err) {
    console.error(err.message);
    if (err instanceof ValidationError) {
      res.status(400).json({ error: JSON.parse(err.message) });
    } else res.status(500).json({ error: err.message });
  }
}

async function postLessons(req, res) {
  try {
    const params = {
      teacherIds: undefined, // Массив чисел. id учителей, ведущих занятия
      title: undefined, // Строка. Тема занятия. Одинаковая на все создаваемые занятия
      days: undefined, // Массив чисел. Дни недели, по которым нужно создать занятия, где 0 - это воскресенье
      firstDate: undefined, // Строка в формате "YYYY-MM-DD". Первая дата, от которой нужно создавать занятия
      lessonsCount: undefined, // Число. Количество занятий для создания
      lastDate: undefined, // Строка в формате "YYYY-MM-DD". Последняя дата, до которой нужно создавать занятия.
    };

    if (req.body.teacherIds) {
      const { isValid, wrongData } = _checkIds(req.body.teacherIds);
      if (!isValid) throw new ValidationError("teacherIds", wrongData);

      params.teacherIds = [...req.body.teacherIds];
    } else {
      params.teacherIds = [];
    }

    if (typeof req.body.title == "string") {
      params.title = req.body.title;
    } else {
      if (req.body.title) throw new ValidationError("title", req.body.title);
      params.title = "";
    }

    if (req.body.days && req.body.days.length > 0) {
      const { isValid, wrongData } = _checkDays(req.body.days);
      if (!isValid) throw new ValidationError("days", wrongData);

      params.days = req.body.days;
    } else throw new EmptyPropertyError("days");

    if (req.body.firstDate)
      params.firstDate = _strToFirstDate(req.body.firstDate);
    else throw new EmptyPropertyError("firstDate");

    if (!req.body.lessonsCount && !req.body.lastDate) {
      const MAX_LESN_COUNT = 300;
      const MAX_PERIOD = { years: 1 };

      params.lessonsCount = MAX_LESN_COUNT;
      params.lastDate = moment(params.firstDate).add(MAX_PERIOD).valueOf();
    } else
      throw new EmptyPropertyError(
        req.body.lastDate ? "lessonsCount" : "lastDate"
      );

    if (req.body.lessonsCount) {
      params.lessonsCount = _strToLessonsCount(
        req.body.lessonsCount,
        params.lessonsCount
      );
    }

    if (req.body.lastDate) {
      params.lastDate = _strToLastDate(
        req.body.firstDate,
        req.body.lastDate,
        params.lastDate
      );
    }

    const idsOfNewLessons = lessonsService.postLessons(params);

    res.json(idsOfNewLessons);

  } catch (err) {
    console.error(err.message);
    if (err instanceof ValidationError || err instanceof EmptyPropertyError) {
      res.status(400).json({ error: JSON.parse(err.message) });
    } else res.status(500).json({ error: err.message });
  }
}

router.get("/lessons", getAll);
router.post("/lessons", postLessons);
router.get("/", getLessons);

module.exports = router;
