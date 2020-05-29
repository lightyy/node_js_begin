const fs = require("fs");

//readFileSync return값을 줌 ABC
// console.log('A');
// let result = fs.readFileSync('syntax/sample.txt','utf-8');
// console.log(result);
// console.log('C');

//readFile  성능up  ACB     3번째 인자 콜백함수
console.log("A");
fs.readFile("syntax/sample.txt", "utf-8", (err, files) => {
  console.log(files);
});
console.log("C");
