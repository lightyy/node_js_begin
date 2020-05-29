const http = require("http");
const fs = require("fs");
const url = require("url");
const qs = require("querystring");
const template = require("./lib/template.js");
const path = require("path");
const sanitizeHtml = require("sanitize-html"); //살충제

//request :  요청, response : 응답
const app = http.createServer(function (request, response) {
  //서버생성
  const _url = request.url;
  const queryData = url.parse(_url, true).query; //query string
  const pathname = url.parse(_url, true).pathname;
  if (pathname === "/") {
    if (!queryData.id) {
      //undefined
      fs.readdir("./data", (err, files) => {
        let title = "welecome";
        let data = "Hello ~";
        let list = template.list(files);
        let html = template.html(
          title,
          list,
          `<h2>${title}</h2><p>${data}</p>`, //body
          `<h1><a href="/create">create</a></h1><p>　</p>`
        );
        response.writeHead(200);
        response.end(html);
      });
    } else {
      fs.readdir("./data", (err, files) => {
        const filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, "utf-8", function (err, data) {
          let list = template.list(files);
          let title = queryData.id;
          let sanitizedTitle = sanitizeHtml(title);
          let sanitizedList = sanitizeHtml(list);
          let sanitizedDate = sanitizeHtml(data, {allowedTags: ["h1"]});

          let html = template.html(
            sanitizedTitle,
            sanitizedList,
            `<h2>${sanitizedTitle}</h2><p>${sanitizedDate}</p>`,
            `<h1><a href="/create">create</a></h1> 
            <h3><a href ="/update?id=${sanitizedTitle}">update</a></h3>
            <form action = '/delete_process' method = 'post'>
              <input type ='hidden' name = 'id' value = '${sanitizedTitle}'>
              <input type = 'submit' value = 'delete'>
            </form>
            `
          );
          response.writeHead(200);
          // console.log(__dirname+url);
          //현재 위치하고있는 파일의 경로
          //프로그래밍적으로 사람들에게 전송할 데이터를 생성
          response.end(html);
        });
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", (err, files) => {
      let title = "WEB - CREATE";
      let data = `
      <form action="/create_process" method="post">
        <p>
          <input type="text" name="title" placeholder ="title"/>
        </p>
        <p><textarea name="data" placeholder = "description"></textarea></p>
        <p>
          <input type="submit" />
        </p>
      </form>
      `;
      let list = template.list(files);

      let html = template.html(
        title,
        list,
        `<h2>${title}</h2><p>${data}</p>`,
        ""
      );
      response.writeHead(200);
      response.end(html);
    });
  } else if (pathname === "/create_process") {
    let body = "";
    //get POST data
    request.on("data", (data) => {
      //body에다 콜백이 실행될때마다 데이터를 추가
      body += data;
      //Too much POST data, kill the connection!
      if (body.length > 1e6) request.connection.destroy();
    });
    request.on("end", () => {
      let post = qs.parse(body);
      let title = post.title;
      let data = post.data;
      fs.writeFile(`data/${title}`, data, "utf8", (err) => {
        //redirection //qs.escape() < 한글제목도 가능하게함
        response.writeHead(302, { Location: `/?id=${qs.escape(title)}` });
        response.end();
      });
    });
  } else if (pathname === `/update`) {
    fs.readdir("./data", (err, files) => {
      const filteredId = path.parse(queryData.id).base;
      fs.readFile(`data/${filteredId}`, "utf-8", function (err, data) {
        let list = template.list(files);
        let title = queryData.id;
        let html = template.html(
          title,
          list,
          `
          <form action="/update_process" method="post">
          <input type ="hidden" name ="id" value = '${title}'>
          <p>
            <input type="text" name="title" placeholder ="title" value = "${title}"/>
          </p>
          <p><textarea name="data" placeholder = "description">${data}</textarea></p>
          <p>
            <input type="submit" />
          </p>
          </form>
          `,
          `<h1><a href="/create">create</a></h1> <a href ="/update?id=${title}">update</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (pathname === "/update_process") {
    let body = "";
    request.on("data", (data) => {
      body += data;
      //Too much POST data, kill the connection!
      if (body.length > 1e6) request.connection.destroy();
    });
    request.on("end", () => {
      let post = qs.parse(body);
      let id = post.id;
      let title = post.title;
      let data = post.data;
      fs.rename(`data/${id}`, `data/${title}`, (err) => {
        fs.writeFile(`data/${title}`, data, "utf8", (err) => {
          response.writeHead(302, { Location: `/?id=${qs.escape(title)}` });
          response.end();
        });
      });
      // console.log(post);
    });
  } else if (pathname === "/delete_process") {
    let body = "";
    request.on("data", (data) => {
      body += data;
      //Too much POST data, kill the connection!
      if (body.length > 1e6) request.connection.destroy();
    });
    request.on("end", () => {
      let post = qs.parse(body);
      let id = post.id;
      const filteredId = path.parse(id).base;
      //삭제
      fs.unlink(`./data/${filteredId}`, (err) => {
        response.writeHead(302, { Location: `/` }); //이동
        response.end();
      });
    });
  } else {
    //에러발생
    response.writeHead(404);
    response.end("Not FOUND");
  }
});
app.listen(3000); //포트번호
