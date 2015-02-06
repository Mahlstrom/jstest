/**
 * Created by mahlstrom on 05/02/15.
 */

describe("common.js", function () {
    describe("mkDate", function () {
        it("should return a Date object", function () {
            d = mkDate('2010-11-12 13:14:15');
            expect(d instanceof Date).toBe(true);
        });
    });

    describe("Date Functions", function () {
        beforeEach(function () {
            d = mkDate('2010-11-12 13:14:15');
        });

        describe("getTime", function () {
            it("should return '13:14'", function () {
                expect(getTime(d)).toBe('13:14');
            });

            it("should fail throwing string", function () {
                expect(function () {
                    mkDate('2010-11-12T13:14:15')
                }).toThrow('Invalid date string, Need format YYYY-MM-DD HH:MM:SS. Got "2010-11-12T13:14:15"');

            });
        });

        describe("toISOString", function () {
            it("should return an ISO date string set to UTC", function () {
                expect(d.toISOString()).toBe('2010-11-12T12:14:15.000Z');
            });
        });
    });
});
