/**
 * Created by hwong on 10/20/2016.
 */
/**
 * Created by rtholmes on 2016-10-04.
 */

import fs = require('fs');
import Log from "../src/Util";
import {expect} from 'chai';
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";
import {QueryRequest} from "../src/controller/QueryController";

describe("InsightFacade", function () {

    var zipFileContents: string = null;
    var facade: InsightFacade = null;
    before(function () {
        Log.info('InsightController::before() - start');
        // this zip might be in a different spot for you
        zipFileContents = new Buffer(fs.readFileSync('310courses.1.0.zip')).toString('base64');
        try {
            // what you delete here is going to depend on your impl, just make sure
            // all of your temporary files and directories are deleted
            fs.unlinkSync('./data/courses');
        } catch (err) {
            // silently fail, but don't crash; this is fine
            Log.warn('InsightController::before() - id.json not removed (probably not present)');
        }
        Log.info('InsightController::before() - done');
    });

    beforeEach(function () {
        facade = new InsightFacade();
    });

    it("Should be able to add a add a new dataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', zipFileContents).then(function (response: InsightResponse) {
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Should be able to update an existing dataset (201)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', zipFileContents).then(function (response: InsightResponse) {
            expect(response.code).to.equal(201);
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(201);
        });
    });

    it("Should be able to validate a valid query: D2 DOWN MIN", function () {

        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MIN": "courses_fail"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail();
        });

    });

    it("Should be able to validate a valid query: D2 DOWN MAX", function () {

        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail();
        });

    });

    it("Should be able to validate a valid query: D2 UP COUNT", function () {

        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail();
        });

    });

    it("Should be able to validate a valid query: D2 DOWN COUNT NEW", function () {

        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail();
        });

    });

    it("Should be able to validate a valid query: D1", function () {

        let query: QueryRequest =  {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {"LT": {"courses_avg": 70}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail();
        });

    });

    it("Should be able to validate a valid query: D1", function () {

        let query: QueryRequest =  {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "OR": [
                    {"AND": [
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"courses_dept": "adhe"}}
                    ]},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"

        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail();
        });

    });

    it("Should be able to validate a valid query: D1 NOT", function () {

        let query: QueryRequest =  {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "NOT": [
                    {"AND": [
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"courses_dept": "adhe"}}
                    ]},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"

        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail();
        });

    });



    it("Should be able to invalidate an invalid query: D1 Not valid id GT ", function () {

        let query: QueryRequest =  {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "OR": [
                    {"AND": [
                        {"GT": {"cour_avg": 70}},
                        {"IS": {"courses_dept": "adhe"}}
                    ]},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"

        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
        });

    });

    it("Should be able to invalidate an invalid query: D1 Not valid id EQ", function () {

        let query: QueryRequest =  {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "OR": [
                    {"AND": [
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"courses_dept": "adhe"}}
                    ]},
                    {"EQ": {"cour_avg": 90}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"

        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
        });

    });

    it("Should be able to invalidate an invalid query: D1 Not valid id IS", function () {

        let query: QueryRequest =  {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "OR": [
                    {"AND": [
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"cour_dept": "adhe"}}
                    ]},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"

        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
        });

    });


    it("Should be able to invalidate an invalid query: D1 Not valid id LT", function () {

        let query: QueryRequest =  {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {"LT": {"cous_avg": 70}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
        });

    });


    it("Should be able to validate a valid query: D1 all keys in ORDER has to be in GET", function () {

        let query: QueryRequest =  {
            "GET": ["courses_dept"],
            "WHERE": {"LT": {"cous_avg": 70}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
        });

    });

    it("Should be able to validate a valid query: D2 all keys in ORDER has to be in GET NEW", function () {

        let query: QueryRequest =  {
            "GET": ["courses_dept", "courses_id", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
        });

    });


    it("Should be able to invalidate an invalid query: D2 GROUP is missing", function () {

        let query: QueryRequest =  {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},

            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MIN": "courses_fail"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });

    });

    it("Should be able to invalidate an invalid query: D2 APPLY has _ NEW", function () {

        let query: QueryRequest =  {
            "GET": ["courses_dept", "courses_id", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"max_Fail": {"MIN": "courses_fail"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });

    });

    it("Should be able to invalidate an invalid query: D2 APPLY has _ NEW2", function () {

        let query: QueryRequest =  {
            "GET": ["courses_dept", "courses_id", "max_Fail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"max_Fail": {"MIN": "courses_fail"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["max_Fail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });

    });


    it("Should be able to invalidate an invalid query: D2 invalid key in GROUP", function () {

        let query: QueryRequest =  {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_xxx", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MIN": "courses_fail"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });

    });


    it("Should be able to invalidate an invalid query: D2 APPLY's key course_Average has _", function () {

        let query: QueryRequest =  {
            "GET": ["courses_dept", "courses_id", "course_Average", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"course_Average": {"AVG": "courses_avg"}}, {"maxFail": {"MIN": "courses_fail"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });

    });


    it("Should be able to invalidate an invalid query: D2 GROUP's key coursesdept does not have _", function () {

        let query: QueryRequest =  {
            "GET": ["coursesdept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [ "coursesdept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MIN": "courses_fail"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });

    });


    it("Should be able to invalidate an invalid query: D2 APPLY is not unique", function () {

        let query: QueryRequest =  {
            "GET": ["courses_dept", "courses_id", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"maxFail": {"AVG": "courses_avg"}}, {"maxFail": {"MIN": "courses_fail"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });

    });


    it("Should be able to invalidate an invalid query: D2 GROUP is empty", function () {

        let query: QueryRequest =  {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MIN": "courses_fail"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });

    });
    /*
     it("Should be able to invalidate an invalid query: D2 ", function () {

     let query: QueryRequest =  {
     "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
     "WHERE": {},
     "GROUP": [ "courses_dept", "courses_id" ],
     "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MIN": "courses_fail"}} ],
     "ORDER": { "dir": "DOWN", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
     "AS":"TABLE"
     };
     return facade.performQuery(query).then(function (response: InsightResponse) {
     expect.fail();
     }).catch(function (response: InsightResponse) {
     expect(response.code).to.equal(400);
     });

     });
     */

    it("Should not be able to add an invalid dataset (400)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.addDataset('courses', 'some random bytes').then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });
    /*
     it("Should be able to update an existing dataset (201)", function () {
     var that = this;
     Log.trace("Starting test: " + that.test.title);
     return facade.addDataset('courses', zipFileContents).then(function (response: InsightResponse) {
     expect(response.code).to.equal(201);
     }).catch(function (response: InsightResponse) {
     expect(response.code).to.equal(201);
     });
     });
     */

    it("Should be able to removeDataset (204)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.removeDataset('courses').then(function (response: InsightResponse) {
            expect(response.code).to.equal(204);
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(404);

        });

    });



    it("Should not be able to removeDataset (404)", function () {
        var that = this;
        Log.trace("Starting test: " + that.test.title);
        return facade.removeDataset('course').then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(404);
        });
    });

});