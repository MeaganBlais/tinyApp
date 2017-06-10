const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
// const password = req.body.password;
// const hashed_password = bcrypt.hashSync(password, 10);

const urlDatabase = {
  'user_id':
    {'b2xVn2': 'http://www.lighthouselabs.ca', 'dsfsgg': 'http://www.google.com'},
  'user_id_2':
    {'9sm5xK': 'http://www.google.com'}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "a"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  'xbUeyZ': {
    id: 'xbUeyZ',
    email: 'test1@test.com',
    password: 'test1' }
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

app.use(cookieSession({
  name: 'session',
  keys: ['super-secret-key'],
  // keys: [/*secret keys*/],
   // cookie options -- expirations? -- apparently the formula below is 24 hrs
  maxAge: 24 * 60 * 60 * 1000
}));

app.get('/', (req, res) => {
    res.end('Hello!');
});

app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
    res.end('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/login', (req, res) => {
  res.render('login');
})

app.get('/register', (req, res) => {
  res.render('register');
})

app.get('/urls', (req, res) => {
  // if (req.cookies.user_id === undefined) {
  if (req.session.user_id === undefined) {
    let templateVars = {
      username: 'guest'
    }
    res.render('urls_index', templateVars);
  } else {
    let templateVars = {
      user_id: urlDatabase,
      // req.session.user_id: urlDatabase,
      username: getUsername(req.session["user_id"]),
      email: users[req.session.user_id].email
    };
    // console.log('ln 69' + templateVars)
    res.render('urls_index', templateVars);
  }
});

app.get('/urls/new', (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect('/login');
  } else {
    let templateVars = {
      user_id: urlDatabase,
      username: getUsername(req.session["user_id"]),
      email: users[req.session.user_id].email
    }
    res.render("urls_new", templateVars);
  }
});


app.get('/urls/:id', (req, res) => {
  if (req.session.user_id === undefined) {
    let templateVars = {
      username: 'guest'
    }
    res.render('urls_show', templateVars);
  } else {
    let templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id],
      username: getUsername(req.session["user_id"]),
      email: users[req.session.user_id].email
    };
    res.render('urls_show', templateVars);
  }
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/register', (req, res) => {
    let user_id = generateRandomString();

    for (x in users) {
      if (users[x].email === req.body.email) {
        return res.status(400).send('Email address already in system.');
      } else if (req.body.email === "" || req.body.password === "") {
        return res.status(400).send('Please enter BOTH email and password.');
      } else {
        // console.log('testing loop')
          users[user_id] = {
            id: user_id,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10)
          }
          console.log(users); //ensuring registration occurs
          // res.session("user_id", user_id);
          req.session.user_id = user_id;
      };
    }
    // console.log(users);
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
    let user;

    if (req.body.email === "" || req.body.password === "") {
        return res.status(400).send('Please enter BOTH email and password.');
    } else {
      for (x in users) { // user instead of x
      if (users[x].email === req.body.email && bcrypt.compareSync(req.body.password, users[x].password)) {
          // res.session("user_id", users[x].id);
          req.session.user_id = users[x].id;
          // console.log('login' + users) // use to double check passwords
          res.redirect('/urls');
        } else if (users[x].email === req.body.email && !bcrypt.compareSync(req.body.password, users[x].password)) {
            return res.status(403).send('Your email does not match our records.');
        // } else {
        //   return undefined;
          // res.redirect('/register')
        }
      };
    };
  });

app.post('/logout', (req, res) => {
  // res.clearCookie('user_id');
  req.session = null;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
    let longURL = req.body.longURL;
    let shortURL = generateRandomString();
    urlDatabase [shortURL] = longURL;
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
