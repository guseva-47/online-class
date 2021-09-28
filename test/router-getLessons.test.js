const request = require("supertest");
const app = require("../src/app");
const moment = require("moment");

const lessonsService = require("../src/lessons/lessons.service");

jest.mock("../src/lessons/lessons.service");
global.console.error = jest.fn();

describe("GET /api/", () => {
  //    date: undefined, // str "YYYY-MM-DD" || "YYYY-MM-DD,YYYY-MM-DD"
  //    status: undefined, // "0" || "1",
  //    teacherIds: undefined, // "id,id,...",
  //    studentsCount: undefined, // "x" || "x,y",
  //    page: 1,
  //    lessonsPerPage: 5,

  beforeEach(() => {
    lessonsService.getLessons.mockClear();
  });

  describe("Query param: teacherIds", () => {

    it("Teachers id is not number ---> 400 Bad request", async () => {
      await request(app)
        .get("/api/")
        .query({ teacherIds: "a" })
        .expect(400)
        .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(0);
    });

    it("One of teachers id is not number ---> 400 Bad request", async () => {
      await request(app)
        .get("/api/")
        .query({ teacherIds: "1,a,4" })
        .expect(400)
        .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(0);
    });

    it("Only comma ---> 400 Bad request", async () => {
      await request(app)
        .get("/api/")
        .query({ teacherIds: "," })
        .expect(400)
        .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(0);
    });

    it("Id separator is not comma ---> 400 Bad request", async () => {
      await request(app)
        .get("/api/")
        .query({ teacherIds: "12 23" })
        .expect(400)
        .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(0);
    });

    it("Multiple id ---> 200 OK", async () => {
      const res = await request(app)
        .get("/api/")
        .query({ teacherIds: "1,100" })
        .expect(200)
        .expect("Content-Type", /json/);

      expect(res.body).toEqual(expect.arrayContaining([]));
      expect(lessonsService.getLessons.mock.calls.length).toBe(1);
    });

    it("Id <= 0 ---> 200 OK", async () => {
      const res = await request(app)
        .get("/api/")
        .query({ teacherIds: "0,-1" })
        .expect(200)
        .expect("Content-Type", /json/);

      expect(res.body).toEqual(expect.arrayContaining([]));
      expect(lessonsService.getLessons.mock.calls.length).toBe(1);
    });

    it("Empty ids ---> 200 OK", async () => {
      const res = await request(app)
        .get("/api/")
        .query({ teacherIds: "" })
        .expect(200)
        .expect("Content-Type", /json/);

      expect(res.body).toEqual(expect.arrayContaining([]));
      expect(lessonsService.getLessons.mock.calls.length).toBe(1);
    });
  });

  describe("Date check", () => {
    it("Not date ---> 400 Bad request", async () => {
      const dates = [
        { date: "12" },
        { date: "lalala" },
        { date: new Date() },
        { date: moment().format("YYYY.MM.DD") },
        { date: "2010-13-29" },
      ];
      for (date of dates)
        await request(app)
          .get("/api/")
          .query(date)
          .expect(400)
          .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(0);
    });

    it("Valid and invalid date ---> 400 Bad request", async () => {
      await request(app)
        .get("/api/")
        .query({ date: "2010-01-01,2010.13.29" })
        .expect(400)
        .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(0);
    });

    it("Valid dates with wrong separator ---> 400 Bad request", async () => {
      await request(app)
        .get("/api/")
        .query({ date: "2010-01-01.2010-02-02" })
        .expect(400)
        .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(0);
    });

    it("The first date > second ---> 400 Bad request", async () => {
      await request(app)
        .get("/api/")
        .query({ date: "2010-02-01,2010-01-01" })
        .expect(400)
        .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(0);
    });

    it("One valid date ---> 200 OK", async () => {
      const res = await request(app)
        .get("/api/")
        .query({ date: moment().format("YYYY-MM-DD") })
        .expect(200)
        .expect("Content-Type", /json/);

      expect(res.body).toEqual(expect.arrayContaining([]));
      expect(lessonsService.getLessons.mock.calls.length).toBe(1);
    });

    it("Two valid date ---> 200 OK", async () => {
      const dates = [
        { date: "2010-01-01,2010-01-01" },
        { date: "2010-01-01,2010-02-01" },
      ];

      for (let dateObj of dates) {
        const res = await request(app)
          .get("/api/")
          .query(dateObj)
          .expect(200)
          .expect("Content-Type", /json/);

        expect(res.body).toEqual(expect.arrayContaining([]));
      }
      expect(lessonsService.getLessons.mock.calls.length).toBe(dates.length);
    });

    it("Date is empty string ---> 200 OK", async () => {
      const res = await request(app)
        .get("/api/")
        .query({ date: "" })
        .expect(200)
        .expect("Content-Type", /json/);

      expect(res.body).toEqual(expect.arrayContaining([]));
      expect(lessonsService.getLessons.mock.calls.length).toBe(1);
    });
  });

  describe("Status check", () => {
    it("Not '0' or '1' ---> 400 Bad request", async () => {
      const statuses = [
        { status: "-0" },
        { status: "-1" },
        { status: "true" },
        { status: true },
        { status: "01" },
      ];
      for (let status of statuses)
        await request(app)
          .get("/api/")
          .query(status)
          .expect(400)
          .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(0);
    });

    it("Valid status ---> 200 OK", async () => {
      const statuses = [{ status: "0" }, { status: "1" }];
      for (let statusObj of statuses) {
        const res = await request(app)
          .get("/api/")
          .query(statusObj)
          .expect(200)
          .expect("Content-Type", /json/);

        expect(res.body).toEqual(expect.arrayContaining([]));
      }

      expect(lessonsService.getLessons.mock.calls.length).toBe(statuses.length);
    });

    it("Status is empty string ---> 200 OK", async () => {
      const res = await request(app)
        .get("/api/")
        .query({ status: "" })
        .expect(200)
        .expect("Content-Type", /json/);

      expect(res.body).toEqual(expect.arrayContaining([]));
      expect(lessonsService.getLessons.mock.calls.length).toBe(1);
    });
  });

  describe("StudentsCount check", () => {
    it("Invalid namber ---> 400 Bad request", async () => {
      const studentsCounts = [
        { studentsCount: "lalala" },
        { studentsCount: new Date() },
        { studentsCount: "12.21" },
        { studentsCount: -1 },
      ];
      for (let studsCount of studentsCounts)
        await request(app)
          .get("/api/")
          .query(studsCount)
          .expect(400)
          .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(0);
    });

    it("Valid and invalid namber ---> 400 Bad request", async () => {
      const studentsCounts = [
        { studentsCount: "12,lala" },
        { studentsCount: "12," },
        { studentsCount: ",12" },
      ];
      for (let studsCount of studentsCounts)
        await request(app)
          .get("/api/")
          .query(studsCount)
          .expect(400)
          .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(0);
    });

    it("Valid numbers with wrong separator ---> 400 Bad request", async () => {
      const studentsCounts = [
        { studentsCount: "12.13" },
        { studentsCount: "12 14" },
      ];
      for (let studsCount of studentsCounts)
        await request(app)
          .get("/api/")
          .query(studsCount)
          .expect(400)
          .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(0);
    });

    it("The first number is biger than the second ---> 400 Bad request", async () => {
      const studentsCounts = [
        { studentsCount: "2,1" },
        { studentsCount: "1,0" },
      ];
      for (let studsCount of studentsCounts)
        await request(app)
          .get("/api/")
          .query(studsCount)
          .expect(400)
          .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(0);
    });

    it("One valid number ---> 400 Bad request", async () => {
      const studentsCounts = [
        { studentsCount: "1" },
        { studentsCount: 1 },
        { studentsCount: "0xFF" },
        { studentsCount: "0b1111111" },
      ];
      for (let studsCount of studentsCounts) {
        const res = await request(app)
          .get("/api/")
          .query(studsCount)
          .expect(200)
          .expect("Content-Type", /json/);

        expect(res.body).toEqual(expect.arrayContaining([]));
      }

      expect(lessonsService.getLessons.mock.calls.length).toBe(
        studentsCounts.length
      );
    });

    it("Two valid numbers ---> 400 Bad request", async () => {
      const studentsCounts = [
        { studentsCount: "1,2" },
        { studentsCount: "100,0xFF" },
      ];
      for (let studsCount of studentsCounts) {
        const res = await request(app)
          .get("/api/")
          .query(studsCount)
          .expect(200)
          .expect("Content-Type", /json/);

        expect(res.body).toEqual(expect.arrayContaining([]));
      }

      expect(lessonsService.getLessons.mock.calls.length).toBe(
        studentsCounts.length
      );
    });

    it("Empty string ---> 200 OK", async () => {
      const res = await request(app)
        .get("/api/")
        .query({ studentsCount: "" })
        .expect(200)
        .expect("Content-Type", /json/);

      expect(res.body).toEqual(expect.arrayContaining([]));
      expect(lessonsService.getLessons.mock.calls.length).toBe(1);
    });
  });

  describe("Page check", () => {
    it("Invalid namber ---> 400 Bad request", async () => {
      const pages = [
        { page: "lalala" },
        { page: new Date() },
        { page: "12.21" },
        { page: "12,21" },
        { page: -1 },
        { page: 0 },
      ];
      for (let page of pages)
        await request(app)
          .get("/api/")
          .query(page)
          .expect(400)
          .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(0);
    });

    it("Valid number ---> 200 OK", async () => {
      const pages = [{ page: "1" }, { page: "0xA" }];
      for (let page of pages) {
        const res = await request(app)
          .get("/api/")
          .query(page)
          .expect(200)
          .expect("Content-Type", /json/);

        expect(res.body).toEqual(expect.arrayContaining([]));
      }

      expect(lessonsService.getLessons.mock.calls.length).toBe(pages.length);
    });

    it("Empty string ---> 200 OK", async () => {
      await request(app)
        .get("/api/")
        .query({ page: "" })
        .expect(200)
        .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(1);
    });
  });

  describe("LessonsPerPage check", () => {
    it("Invalid namber ---> 400 Bad request", async () => {
      const lessonsPerPages = [
        { lessonsPerPage: "lalala" },
        { lessonsPerPage: new Date() },
        { lessonsPerPage: "12.21" },
        { lessonsPerPage: "12,21" },
        { lessonsPerPage: -1 },
        { lessonsPerPage: 0 },
      ];
      for (let page of lessonsPerPages)
        await request(app)
          .get("/api/")
          .query(page)
          .expect(400)
          .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(0);
    });

    it("Valid number ---> 200 OK", async () => {
      const lessonsPerPages = [
        { lessonsPerPage: "1" },
        { lessonsPerPage: "0xA" },
      ];
      for (let page of lessonsPerPages) {
        const res = await request(app)
          .get("/api/")
          .query(page)
          .expect(200)
          .expect("Content-Type", /json/);

        expect(res.body).toEqual(expect.arrayContaining([]));
      }

      expect(lessonsService.getLessons.mock.calls.length).toBe(
        lessonsPerPages.length
      );
    });

    it("Empty string ---> 200 OK", async () => {
      await request(app)
        .get("/api/")
        .query({ lessonsPerPage: "" })
        .expect(200)
        .expect("Content-Type", /json/);

      expect(lessonsService.getLessons.mock.calls.length).toBe(1);
    });
  });

  describe("Multi-parameter query", () => {
    it("Empty ---> 200 OK", async () => {
      const res = await request(app)
        .get("/api/")
        .query({})
        .expect(200)
        .expect("Content-Type", /json/);

      expect(res.body).toEqual(expect.arrayContaining([]));
      expect(lessonsService.getLessons.mock.calls.length).toBe(1);
    });

    it("Some valid params ---> 200 OK", async () => {
      const params = [
        {
          teacherIds: "1,2",
          status: "1",
        },
        {
          date: "2020-10-10,2021-10-10",
          status: "0",
          teacherIds: "1,20",
          studentsCount: "10,20",
          page: 2,
          lessonsPerPage: 50,
        },
      ];
      for (let param of params) {
        const res = await request(app)
          .get("/api/")
          .query(param)
          .expect(200)
          .expect("Content-Type", /json/);

        expect(res.body).toEqual(expect.arrayContaining([]));
      }
      expect(lessonsService.getLessons.mock.calls.length).toBe(params.length);
    });

    it("Valid and invalid params in request ---> 400 Bad request", async () => {
      const params = [
        {
          teacherIds: "1,2",
          status: "lalala",
          page: "2",
        },
        {
          teacherIds: "lalala",
          status: "1",
          page: "2",
        },
        {
          teacherIds: "lalala",
          status: "1",
          page: "lalala",
        },
        {
          teacherIds: "lalala",
          status: "lalalala",
          page: "lalala",
        },
      ];
      for (let param of params) {
        await request(app)
          .get("/api/")
          .query(param)
          .expect(400)
          .expect("Content-Type", /json/);
      }
      expect(lessonsService.getLessons.mock.calls.length).toBe(0);
    });
  });
});