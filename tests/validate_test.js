/**
 * Created by mahlstrom on 04/02/15.
 */

describe("test shit", function (){
    it("should pass",function () {

    });

    it("should not pass",function (){
        var ma=return_false();
        expect(ma).toBe(false);
    });
});

describe("checkNonAlpha", function (){
    it("should return true when the string has non-alpha",function(){
        expect(checkNonAlpha("ABD")).toBe(true);
    });
    it("should return false when the string has non-alpha",function(){
        expect(checkNonAlpha("ABC$D")).toBe(false);
    });

});


describe("toLower",function(){
    it("shoud return 'magnus'",function(){
        expect(toLower("MagNuS")).toBe('magnus');
    });
});

