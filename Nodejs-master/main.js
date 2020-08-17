const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const bodyParser = require('body-parser');
const compression = require('compression');
const { request } = require('express');
const indexRouter = require("./routes/index");
const topicRouter = require("./routes/topic");
const helmet = require('helmet');
app.use(helmet());

//미들웨어는 쉽게 말해서 남들이 만들어 놓은 모듈을 app이라는 변수에서 사용하는 기능?
//bodyparser는 라우팅(get,post 등?)을 할때 request가 body를 가지는 기능.
//compression은 용량이 큰 데이터를 전달시에는 부담이 있기때문에 압축 데이터를 보내고 client는 압축을 풀어서 데이터를 본다.
app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());
//나만의 미들웨어 만들기
//아래 함수 대신 request.list를 사용하면 된다.
//post방식에선 필요없기 때문에 use 대신 get을 하여 get 함수에만 적용하고, *는 모든 요청이라는 의미(첫번째 인자는 경로.)
//이 코드를 보면 아래서 사용한 app.get들이 전부 미들웨어라고 볼수있다.
app.get('*', (request, response, next) => {
  fs.readdir('./data', function(error, filelist){
    request.list = filelist;
    next();
  });
});
//정적인 파일을 사용할때 쓰는 미들 웨어.
//public 폴더안의 static 파일을 찾겠다는 의미.
app.use(express.static('public'));

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// });

/*
지금 이 라우터들이 이전처럼 if, else 로 감싸져있지 않기 때문에 먼저 만난 서비스에서 처리를 해버린다.
그래서 아래에 기능이 있는데 위에서 맞지 않는 서비스로 처리 할수 있기때문에 미들웨어의 순서가 중요하다.
*/
//topic으로 시작하는건 topicRouter를 사용한다.
//즉 routes/topic 파일에서 참조한다.
app.use("/", indexRouter);
app.use("/topic", topicRouter);

//404오류 처리.
//미들웨언데 왜 밑에서 처리를 하냐?
//미들웨어는 순차적으로 진행이 되기 때문에 위에서 일치하는 서비스를 찾지 못하면 아래쪽 까지 내려와서 처리한다.
app.use((request, response, next) => {
  response.status(404).send("Sorry cant find that");
});

//위에서 잘 못된  페이지의 요청이 왔을때 에러 처리 미들웨어
//위에서 next(err) 을 하였을땐 항상 이 미들웨어가 처리하도록 되어있음.(error 인자가 있는 next)
app.use((error, request, response, next) => {
  response.status(500).send("Something broke");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

/*var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        fs.readdir('./data', function(error, filelist){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(filelist);
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      } else {
        fs.readdir('./data', function(error, filelist){
          var filteredId = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            var title = queryData.id;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
              allowedTags:['h1']
            });
            var list = template.list(filelist);
            var html = template.HTML(sanitizedTitle, list,
              `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
              ` <a href="/create">create</a>
                <a href="/update?id=${sanitizedTitle}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`
            );
            response.writeHead(200);
            response.end(html);
          });
        });
      }
    } else if(pathname === '/create'){
      fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        var list = template.list(filelist);
        var html = template.HTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '');
        response.writeHead(200);
        response.end(html);
      });
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description;
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })
      });
    } else if(pathname === '/update'){
      fs.readdir('./data', function(error, filelist){
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.HTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var title = post.title;
          var description = post.description;
          fs.rename(`data/${id}`, `data/${title}`, function(error){
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.writeHead(302, {Location: `/?id=${title}`});
              response.end();
            })
          });
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var filteredId = path.parse(id).base;
          fs.unlink(`data/${filteredId}`, function(error){
            response.writeHead(302, {Location: `/`});
            response.end();
          })
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);*/
