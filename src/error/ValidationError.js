class ValidationError extends Error {
  constructor(property, wrongData) {
    const message = JSON.stringify({
      message: `invalid data - ${wrongData}`,
      property: `${property}`,
    });
    super(message);
    this.name = ValidationError;
  }
}

class DateValidationError extends ValidationError {
  constructor(wrongData) {
    super("date", wrongData);
    this.name = DateValidationError;
  }
}

class StatusValidationError extends ValidationError {
  constructor(wrongData) {
    super("status", wrongData);
    this.name = StatusValidationError;
  }
}

class StudentsCountValidationError extends ValidationError {
  constructor(wrongData) {
    super("studentsCount", wrongData);
    this.name = StudentsCountValidationError;
  }
}

class PageValidationError extends ValidationError {
  constructor(wrongData) {
    super("page", wrongData);
    this.name = PageValidationError;
  }
}

class LessonsPerPageValidationError extends ValidationError {
  constructor(wrongData) {
    super("lessonsPerPage", wrongData);
    this.name = LessonsPerPageValidationError;
  }
}

class TeacherIdsValidationError extends ValidationError {
  constructor(wrongData) {
    super("teacherIds", wrongData);
    this.name = TeacherIdsValidationError;
  }
}

module.exports = {
  ValidationError,
  DateValidationError,
  StatusValidationError,
  StudentsCountValidationError,
  PageValidationError,
  LessonsPerPageValidationError,
  TeacherIdsValidationError
};
