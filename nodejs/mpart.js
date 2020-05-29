let M = {
  v: "v",
  f: function () {
    console.log(this.v);
  },
};
//M이 갖고있는 기능을 밖에서 사용가능하게 해줌
module.exports = M;
