const request = require("supertest");
const app = require("../src/app");

const lessonsService = require("../src/lessons/lessons.service");

jest.mock("../src/lessons/lessons.service");
global.console.error = jest.fn();

describe("POST /api/lessons", () => {
  // const params = {
  //   teacherIds: undefined, // Массив чисел. id учителей, ведущих занятия
  //   title: undefined, // Строка. Тема занятия. Одинаковая на все создаваемые занятия
  //   days: undefined, // Массив чисел. Дни недели, по которым нужно создать занятия, где 0 - это воскресенье
  //   firstDate: undefined, // Строка в формате "YYYY-MM-DD". Первая дата, от которой нужно создавать занятия
  //   lessonsCount: undefined, // Число. Количество занятий для создания
  //   lastDate: undefined, // Строка в формате "YYYY-MM-DD". Последняя дата, до которой нужно создавать занятия.
  // };

  beforeEach(() => {
    lessonsService.task2.mockClear();
  });

  function getValidReqObject() {
    const params = {
      teacherIds: [1], // Массив чисел. id учителей, ведущих занятия
      title: "Brand new title", // Строка. Тема занятия. Одинаковая на все создаваемые занятия
      days: [0], // Массив чисел. Дни недели, по которым нужно создать занятия, где 0 - это воскресенье
      firstDate: "2021-01-01", // Строка в формате "YYYY-MM-DD". Первая дата, от которой нужно создавать занятия
      lessonsCount: 10, // Число. Количество занятий для создания
      lastDate: "2021-02-02", // Строка в формате "YYYY-MM-DD". Последняя дата, до которой нужно создавать занятия.
    };
    return params;
  }

  describe("TeacherIds check", () => {
    it("Undefined teacherIds ---> 200 OK", async () => {
      const obj = getValidReqObject();
      obj.teacherIds = undefined;

      const res = await request(app)
        .post("/api/lessons")
        .send(obj)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(res.body).toEqual(expect.arrayContaining([]));
      expect(lessonsService.task2.mock.calls.length).toBe(1);
    });

    it("Invalid data in teacherIds ---> 400 Bad Request", async () => {
      const invalidIds = [
        ["lala"],
        [new Date()],
        [null],
        "lala",
        1,
        [1, 1],
        [1, "lala", 3],
        ["1"],
      ];
      const obj = getValidReqObject();
      for (let data of invalidIds) {
        obj.teacherIds = data;

        await request(app)
          .post("/api/lessons")
          .send(obj)
          .expect(400)
          .expect("Content-Type", /json/);
      }

      expect(lessonsService.task2.mock.calls.length).toBe(0);
    });

    it("Valid data in teacherIds ---> 200 OK", async () => {
      const validIds = [[1, 2], [1], []];
      const obj = getValidReqObject();
      for (let data of validIds) {
        obj.teacherIds = data;

        const res = await request(app)
          .post("/api/lessons")
          .send(obj)
          .expect(200)
          .expect("Content-Type", /json/);

        expect(res.body).toEqual(expect.arrayContaining([]));
      }
      expect(lessonsService.task2.mock.calls.length).toBe(validIds.length);
    });
  });

  // describe("Title check", () => {
  //   it("Undefined title ---> 200 OK", async () => {
  //     const obj = getValidReqObject();
  //     obj.title = undefined;

  //     const res = await request(app)
  //       .post("/api/lessons")
  //       .send(obj)
  //       .expect(200)
  //       .expect("Content-Type", /json/);
  //     expect(res.body).toEqual(expect.arrayContaining([]));
  //     expect(lessonsService.task2.mock.calls.length).toBe(1);
  //   });

  //   it("Invalid data in title ---> 400 Bad Request", async () => {
  //     const invalidTitle = [1, [1, 1], ["1"]];
  //     const obj = getValidReqObject();
  //     for (let data of invalidTitle) {
  //       obj.title = data;

  //       await request(app)
  //         .post("/api/lessons")
  //         .send(obj)
  //         .expect(400)
  //         .expect("Content-Type", /json/);
  //     }

  //     expect(lessonsService.task2.mock.calls.length).toBe(0);
  //   });

  //   it("Valid data in title ---> 200 OK", async () => {
  //     const validTitle = ["Title", "", "Valid title", null];
  //     const obj = getValidReqObject();
  //     for (let data of validTitle) {
  //       obj.title = data;

  //       const res = await request(app)
  //         .post("/api/lessons")
  //         .send(obj)
  //         .expect(200)
  //         .expect("Content-Type", /json/);

  //       expect(res.body).toEqual(expect.arrayContaining([]));
  //     }
  //     expect(lessonsService.task2.mock.calls.length).toBe(validTitle.length);
  //   });
  // });

  // describe("First Date check", () => {
  //   it("Undefined firstDate ---> 400 Bad Request", async () => {
  //     const obj = getValidReqObject();
  //     obj.firstDate = undefined;

  //     await request(app)
  //       .post("/api/lessons")
  //       .send(obj)
  //       .expect(400)
  //       .expect("Content-Type", /json/);

  //     expect(lessonsService.task2.mock.calls.length).toBe(0);
  //   });

  //   it("Invalid data in firstDate ---> 400 Bad Request", async () => {
  //     const invalidDate = [
  //       1,
  //       null,
  //       new Date(),
  //       "",
  //       "lala",
  //       "2010.10.29",
  //       "2010-13-39",
  //     ];
  //     const obj = getValidReqObject();

  //     for (let data of invalidDate) {
  //       obj.firstDate = data;

  //       await request(app)
  //         .post("/api/lessons")
  //         .send(obj)
  //         .expect(400)
  //         .expect("Content-Type", /json/);
  //     }

  //     expect(lessonsService.task2.mock.calls.length).toBe(0);
  //   });

  //   it("Valid data in firstDate ---> 200 OK", async () => {
  //     const validDate = ["2010-01-01", "2020-12-31"];
  //     const obj = getValidReqObject();
  //     for (let data of validDate) {
  //       obj.firstDate = data;

  //       const res = await request(app)
  //         .post("/api/lessons")
  //         .send(obj)
  //         .expect(200)
  //         .expect("Content-Type", /json/);

  //       expect(res.body).toEqual(expect.arrayContaining([]));
  //     }
  //     expect(lessonsService.task2.mock.calls.length).toBe(validDate.length);
  //   });
  // });

  // describe("Days check", () => {
  //   it("Empty array in days ---> 400 Bad request", async () => {
  //     const obj = getValidReqObject();
  //     obj.days = [];

  //     await request(app)
  //       .post("/api/lessons")
  //       .send(obj)
  //       .expect(400)
  //       .expect("Content-Type", /json/);

  //     expect(lessonsService.task2.mock.calls.length).toBe(0);
  //   });

  //   it("Undefined days ---> 400 Bad Request", async () => {
  //     const obj = getValidReqObject();
  //     obj.days = undefined;

  //     await request(app)
  //       .post("/api/lessons")
  //       .send(obj)
  //       .expect(400)
  //       .expect("Content-Type", /json/);

  //     expect(lessonsService.task2.mock.calls.length).toBe(0);
  //   });

  //   it("Invalid data in days ---> 400 Bad Request", async () => {
  //     const invalidDays = [
  //       [1, 7],
  //       ["lala"],
  //       [new Date()],
  //       [null],
  //       "lala",
  //       1,
  //       [1, 1],
  //       [1, "lala", 3],
  //       ["1"],
  //     ];
  //     const obj = getValidReqObject();
  //     for (let data of invalidDays) {
  //       obj.days = data;

  //       await request(app)
  //         .post("/api/lessons")
  //         .send(obj)
  //         .expect(400)
  //         .expect("Content-Type", /json/);
  //     }

  //     expect(lessonsService.task2.mock.calls.length).toBe(0);
  //   });

  //   it("Valid data in days ---> 200 OK", async () => {
  //     const validDays = [[1, 2, 0, 3, 4, 5, 6], [0]];
  //     const obj = getValidReqObject();
  //     for (let data of validDays) {
  //       obj.days = data;

  //       const res = await request(app)
  //         .post("/api/lessons")
  //         .send(obj)
  //         .expect(200)
  //         .expect("Content-Type", /json/);

  //       expect(res.body).toEqual(expect.arrayContaining([]));
  //     }
  //     expect(lessonsService.task2.mock.calls.length).toBe(validDays.length);
  //   });
  // });

  // describe("Lessons Count check, if Last Date is undefined", () => {
  //   it("Undefined lessonsCount ---> 400 Bad Request", async () => {
  //     const obj = getValidReqObject();
  //     obj.lastDate = undefined;
  //     obj.lessonsCount = undefined;

  //     await request(app)
  //       .post("/api/lessons")
  //       .send(obj)
  //       .expect(400)
  //       .expect("Content-Type", /json/);

  //     expect(lessonsService.task2.mock.calls.length).toBe(0);
  //   });

  //   it("Invalid data in lessonsCount ---> 400 Bad Request", async () => {
  //     const invalidLessonsCount = [null, "lala", -1, 0, [1, 2], 1.2];
  //     const obj = getValidReqObject();
  //     obj.lastDate = undefined;

  //     for (let data of invalidLessonsCount) {
  //       obj.lessonsCount = data;

  //       await request(app)
  //         .post("/api/lessons")
  //         .send(obj)
  //         .expect(400)
  //         .expect("Content-Type", /json/);
  //     }

  //     expect(lessonsService.task2.mock.calls.length).toBe(0);
  //   });

  //   it("Valid data in lessonsCount ---> 200 OK", async () => {
  //     const validLC = [1, 10000, [1]];
  //     const obj = getValidReqObject();
  //     obj.lastDate = undefined;

  //     for (let data of validLC) {
  //       obj.lessonsCount = data;

  //       const res = await request(app)
  //         .post("/api/lessons")
  //         .send(obj)
  //         .expect(200)
  //         .expect("Content-Type", /json/);

  //       expect(res.body).toEqual(expect.arrayContaining([]));
  //     }
  //     expect(lessonsService.task2.mock.calls.length).toBe(validLC.length);
  //   });
  // });

  // describe("Last Date check, if Lessons Count undefined", () => {
  //   it("Undefined lastDate ---> 400 Bad Request", async () => {
  //     const obj = getValidReqObject();
  //     obj.lessonsCount = undefined;
  //     obj.lastDate = undefined;

  //     await request(app)
  //       .post("/api/lessons")
  //       .send(obj)
  //       .expect(400)
  //       .expect("Content-Type", /json/);

  //     expect(lessonsService.task2.mock.calls.length).toBe(0);
  //   });

  //   it("Invalid data in lastDate ---> 400 Bad Request", async () => {
  //     const invalidDate = [
  //       1,
  //       null,
  //       new Date(),
  //       "",
  //       "lala",
  //       "2010.10.29",
  //       "2010-13-39",
  //     ];
  //     const obj = getValidReqObject();
  //     obj.lessonsCount = undefined;

  //     for (let data of invalidDate) {
  //       obj.lastDate = data;

  //       await request(app)
  //         .post("/api/lessons")
  //         .send(obj)
  //         .expect(400)
  //         .expect("Content-Type", /json/);
  //     }

  //     expect(lessonsService.task2.mock.calls.length).toBe(0);
  //   });

  //   it("Last Date < First Date ---> 400 Bad Request", async () => {
  //     const obj = getValidReqObject();
  //     obj.lessonsCount = undefined;
  //     obj.firstDate = "2021-02-02";
  //     obj.lastDate = "2021-01-01";

  //     await request(app)
  //       .post("/api/lessons")
  //       .send(obj)
  //       .expect(400)
  //       .expect("Content-Type", /json/);

  //     expect(lessonsService.task2.mock.calls.length).toBe(0);
  //   });

  //   it("Valid data in lastDate ---> 200 OK", async () => {
  //     const validDate = ["2021-01-01", "2021-12-31"];
  //     const obj = getValidReqObject();
  //     obj.lessonsCount = undefined;
  //     obj.firstDate = "2021-01-01"
      
  //     for (let data of validDate) {
  //       obj.lastDate = data;

  //       const res = await request(app)
  //         .post("/api/lessons")
  //         .send(obj)
  //         .expect(200)
  //         .expect("Content-Type", /json/);

  //       expect(res.body).toEqual(expect.arrayContaining([]));
  //     }
  //     expect(lessonsService.task2.mock.calls.length).toBe(validDate.length);
  //   });
  // });
});
