const express = require('express');
const router = express.Router();
const path = require('path');
var sanitizeHtml = require('sanitize-html');
const fs = require('fs');
const template = require('../lib/template.js');

//main.js에서 app.use("/topic", topicRouter);
//이렇게 한다면 여기 라우터 경로에서는 /topic을 빼줘야한다.

router.get('/create', (request, response) => {
    var title = 'WEB - create';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
      <form action="/topic/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '');
    response.send(html);
  });
  
  //url에서 받은 parameter를 express가 이용하는 방법
  //nodejs에서 querystring을 express에서는 parameter로 처리
  //예시
  // app.get('/page/:pageId', (request, response) => {
  //   response.send(request.params);
  // });
  
  //기존의 쿼리스트링으로 받던 id를 parameter로 받음.
  router.get('/:pageId', (request, response) => {
      var filteredId = path.parse(request.params.pageId).base;
      fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
        if(err) {
          next(err);
        } else {
          var title = request.params.pageId;
          var sanitizedTitle = sanitizeHtml(title);
          var sanitizedDescription = sanitizeHtml(description, {
            allowedTags:['h1']
          });
          var list = template.list(request.list);
          var html = template.HTML(sanitizedTitle, list,
            `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
            ` <a href="/topic/create">create</a>
              <a href="/topic/update/${sanitizedTitle}">update</a>
              <form action="/topic/delete_process" method="post">
                <input type="hidden" name="id" value="${sanitizedTitle}">
                <input type="submit" value="delete">
              </form>`
          );
          response.send(html);
        }
        
      });
  });
  
  //여기서 방식이 get, post로 서로 다르기 때문에 path가
  //같은 /create라도 방식에 따라서 다른곳으로 전달 된다.
  //get방식의 /create는 위로. post방식의 /create는 밑으로.
  //위의 action이 만약 /create로 같을때.
  router.post('/create_process', (request, response) => {
    //bodyparse를 하면 request에 body라는 속성이 생김.
    var post = request.body;
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
      response.redirect(`/topic/${title}`);
    });
    /*var body = '';
    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          response.writeHead(302, {Location: `/page/${title}`});
          response.end();
        })
    });*/
  });
  
  router.get('/update/:pageId', (request, response) => {
      var filteredId = path.parse(request.params.pageId).base;
      fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
        var title = request.params.pageId;
        var list = template.list(request.list);
        var html = template.HTML(title, list,
          `
          <form action="/topic/update_process" method="post">
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
          `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`
        );
        response.send(html);
      });
  });
  
  router.post('/update_process', (request, response) => {
    var post = request.body;
    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function(error){
      fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        response.redirect(`/topic/${title}`);
      })
    });
  });
  
  router.post('/delete_process', (request, response) => {
    var post = request.body;
    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function(error){
      response.redirect('/');
    });
  });

  module.exports = router;