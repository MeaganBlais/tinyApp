const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const urlDatabase = {
    'b2xVn2': 'http://www.lighthouselabs.ca',
    '9sm5xK': 'http://www.google.com'
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

const getUsername = function (userId) {
  if (userId === undefined) {
    return undefined;
  } else {
    return users[userId].email;
  }
}

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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
      urls: urlDatabase,
      username: getUsername(req.cookies["userId"])
    };
    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: getUsername(req.cookies["userId"])
    // username: users[req.cookies["userId"]].email
  };
  res.render("urls_new", templateVars);
});

app.get('/urls/:id', (req, res) => {
    let templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id],
      username: getUsername(req.cookies["userId"])
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

// app.post('/register', (req, res) => {
//   console.log(req.body.email)
//   res.redirect('/urls');
// });

app.post('/register', (req, res) => {
    let user_id = generateRandomString();

    for (x in users) {
      if (users[x].email === req.body.email) {
          return res.status(400).send('Email address already in system.');
      } else if (req.body.email === "" || req.body.password === "") {
          return res.status(400).send('Please enter BOTH email and password.');
      } else {
          users[user_id] = {
            id: user_id,
            email: req.body.email,
            password: req.body.password
          }
          res.cookie("userId", user_id);
      };
    }
    console.log(users);
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
