const express = require("express");
const router = express.Router();
const template = require("../lib/template.js");

//경로가 '/', 즉 홈화면 띄우는 코드.
//아래 app.get = route
router.get('/', function(request, response) {
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(request.list);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}
      <img src = "/images/2.jpg" style="width:300px; display:block; margin-top:10px;"/>`,
      `<a href="/topic/create">create</a>`
    );
    response.send(html);
});

module.exports = router;