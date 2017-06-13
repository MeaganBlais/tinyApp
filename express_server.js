const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

//setting dependencies
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['super-secret-key'],
  // cookie options -- expirations? -- apparently the formula below is 24 hrs
  maxAge: 24 * 60 * 60 * 1000
}));


// setting up databases
const urlDatabase = {};

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

  // FUNCTIONS

  function generateRandomString() {
    let result = '';
    let charset = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i=0; i < 6; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
    return result;
  }

  const getUsername = function (user_id) {
    if (user_id === undefined) {
      return undefined;
    } else {
      return users[user_id];
    }
  }

  function urlsForUser(id) {
    let filteredDB = [];
    if ( urlDatabase[id] )
    filteredDB = urlDatabase[id].urls;
    return filteredDB;
  }

  function mapShortToLong(short) {
    let longURL = "";
    for (userId in urlDatabase) {
      let urlArr = urlDatabase[userId].urls;
      for (let i = 0; i < urlArr.length; i++) {
        if (urlArr[i].shortURL === short.toString()) {
          longURL = urlArr[i].longURL;
          break;
        }
      }
      return longURL;
    }
  }

  //ROUTING

  app.get('/', (req, res) => {
    res.end('Hello!');
  });

  // ============================
  // check route
  // =============================

  app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
  });

  // ====================================
  // // check if necessary
  // ====================================

  app.get('/hello', (req, res) => {
    res.end('<html><body>Hello <b>World</b></body></html>\n');
  });

  // REGISTER
  app.get('/register', (req, res) => {
    res.render('register');
  })

  app.post('/register', (req, res) => {
    let user_id = generateRandomString();

    for (x in users) {
      if (users[x].email === req.body.email) {
        return res.status(400).send('Email address already in system.');
      } else if (req.body.email === "" || req.body.password === "") {
        return res.status(400).send('Please enter BOTH email and password.');
        // create new user
      } else {
        users[user_id] = {
          id: user_id,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 10)
        }
        req.session.user_id = user_id;
      };
    }
    res.redirect('/urls');
  });

  // LOGIN
  app.get('/login', (req, res) => {
    res.render('login');
  })

  app.post('/login', (req, res) => {
    let user;

    if (req.body.email === "" || req.body.password === "") {
      return res.status(400).send('Please enter BOTH email and password.');
    } else {
      for (x in users) {
        // match user email
        if (users[x].email === req.body.email) {
          user = users[x];
        }
      }
      // if email doesn't exist
      if (!user) {
        return res.status(403).send('Your email does not match our records.');
      }
      // if email exists, match user password
      if (bcrypt.compareSync(req.body.password, user.password)) {
        req.session.user_id = user.id;
        return res.redirect('/urls');
      }
      // if password doesn't match
      return res.status(403).send('Your password does not match our records.');
    };
  });

  // logout and clear session
  app.post('/logout', (req, res) => {
    req.session = null;
    res.redirect('/urls');
  });

  app.get('/urls', (req, res) => {
    // check if logged in
    if (req.session.user_id === undefined) {
      let templateVars = {
        username: 'guest'
      }
      res.render('urls_index', templateVars);
      // display personal urls
    } else {
      let templateVars = {
        urls: urlsForUser(req.session.user_id),
        user_id: users[req.session.user_id].id,
        username: getUsername(req.session["user_id"]),
        email: users[req.session.user_id].email
      };
      res.render('urls_index', templateVars);
    }
  });

  // displaying user_id specific urls
  app.post("/urls", (req, res) => {
    let longURL = req.body.longURL;
    let shortURL = generateRandomString();
    let user_id = req.session.user_id

    //check if users[user_id] owns shortened urls
    if (!urlDatabase[user_id]) {
      urlDatabase[user_id] = { urls:[],}
    }
    let newUrl = {
      user: user_id,
      shortURL: shortURL,
      longURL: req.body.longURL
    };

    urlDatabase[user_id].urls.push(newUrl)

    res.redirect("/urls/" + shortURL);
  });


  app.get('/urls/new', (req, res) => {
    // check if logged in
    if (req.session.user_id === undefined) {
      res.redirect('/login');
      // create new shortURL
    } else {
      let user_id = req.session.user_id; //new add
      let templateVars = {
        username: getUsername(req.session.user_id),
        email: users[req.session.user_id].email
      };
      res.render("urls_new", templateVars);
    }
  });

  // sending display information to the short page
  app.get('/urls/:id', (req, res) => {
    if (req.session.user_id === undefined) {
      let templateVars = {
        username: 'guest'
      }
      res.render('urls_show', templateVars);
    } else {
      let templateVars = {
        shortURL: req.params.id,
        longURL: mapShortToLong(req.params.id),
        username: getUsername(req.session["user_id"]),
        email: users[req.session.user_id].email
      };
      res.render('urls_show', templateVars);
    }
  });

  // find and redirect to longURL
  app.get('/u/:shortURL', (req, res) => {
    let url = mapShortToLong(req.params.shortURL);

    if(url != "")
    res.redirect("http://"+url);
    else{
      return res.status(404).send('Address not found.');
    }
  });

  // editting the longURL
  app.post("/urls/:shortURL/", (req, res) => {

    let longURL = req.body.longURL;
    let shortURL = req.params.shortURL;
    let user_id = req.session.user_id;

    for (url in urlDatabase[user_id].urls) {
      if(urlDatabase[user_id].urls[url].shortURL === shortURL){
        urlDatabase[user_id].urls[url].longURL = longURL;
        break;
      }
    }
    res.redirect("/urls");
  });

  // deleting the shortened URL
  app.post("/urls/:id/delete", (req, res) => {
    let shortURL = req.params.shortURL;
    let user_id = req.session.user_id;
    let itemKey;
    // loop through the urlDB urls for given user
    for (url in urlDatabase[user_id].urls) {
      // when shortUrl matches the form submission, save the index of the url
      if(urlDatabase[user_id].urls[url].shortURL === shortURL){
        itemKey = url;
        break;
      }
    }
    // delete url from array using the splice() command with the saved index as a parameter
    urlDatabase[user_id].urls.splice([itemKey],1);
    res.redirect("/urls");
  });

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });
