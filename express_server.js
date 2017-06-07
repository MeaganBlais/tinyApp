const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
    'b2xVn2': 'http://www.lighthouselabs.ca',
    '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => {
    res.end('Hello!');
});

app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
    res.end('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/register', (req, res) => {
  res.render('register');
})

app.get('/urls', (req, res) => {
    let templateVars = {
      username: req.cookies["username"],
          // username: users[i],
      urls: urlDatabase
    };
    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get('/urls/:id', (req, res) => {
    let templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id],
      username: req.cookies["username"]
    };
    res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  // console.log(88, req.body); //test
  console.log(req.body.email)
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
    let longURL = req.body.longURL;
    let shortURL = generateRandomString();
    urlDatabase [shortURL] = longURL;
    console.log(urlDatabase)
//   console.log(req.body);  // debug statement to see POST parameters
//   res.send("Ok");         // Respond with 'Ok' (we will replace this)
    res.redirect("/urls/" + shortURL);
});

// editting the longURL
app.post("/urls/:shortURL/", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = req.params.shortURL;
  urlDatabase [shortURL] = longURL;
  res.redirect("/urls");
});

// deleting the actual object
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let result = '';
  let charset = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (var i=0; i < 6; i++) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
  return result;
}
generateRandomString()
