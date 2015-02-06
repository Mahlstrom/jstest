/**
 * Created by mahlstrom on 04/02/15.
 */

function return_true(){
    return true;
}
function return_false(){
    return false;
}
function checkNonAlpha(strToCheck){
    var alphaCheck = new RegExp('^[a-zA-Z0-9]+$');
    return alphaCheck.test(strToCheck);
}
function toLower(strToConvert){
    return strToConvert.toLowerCase(strToConvert);
}