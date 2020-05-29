let a = function () {
  console.log("a");
};
//callback
function slowfunc(callback){
    callback();
}
slowfunc(a);