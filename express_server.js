// requirement and config variables
let express = require("express");
let app = express();
let PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")

app.use(cookieSession({
  name: 'session',
  keys: ["Development"]
}));

// object dict for users and the  links they create
const urlDatabase = {};
const users = {};

// gets default home view (will change in furute iterations)
app.get("/", (req, res) => {
  if (req.session.user_id){
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.post("/login", (req, res) => {
  let emailSwitch = 0;
  let passSwitch = 0;
  let userId = '';
  for (user in users) {
    let innerDb = users[user];
    if (req.body.email === innerDb.email){
      emailSwitch = 1;
      userId = innerDb.id;
      if (bcrypt.compareSync(req.body.password, innerDb.password)){
        passSwitch = 1;
      }
      break;
    }
  }
  if (emailSwitch === 0 || passSwitch === 0) {
    res.status(403).send('Error 403: Login error');
  } else {
    req.session.user_id = userId;
    res.redirect("/");
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id){
    res.redirect("/");
  } else {
    let templateVars = { user: req.session.user_id,
      users: users };
    res.render("login", templateVars);
  }
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.get("/register", (req, res) => {
  if (req.session.user_id){
    res.redirect("/");
  } else {
    let templateVars = { user: req.session.user_id,
      users: users };
    res.render("register", templateVars);
  }
});

app.post("/register", (req, res) => {
  for (user in users) {
    let innerDb = users[user];
    if (innerDb['email'] === req.body.email){
      res.status(400).send('Error 400: Email already exists');
    }
  }
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Error 400: Register error');
  } else {
    let rndId = generateRandomString();
    const password = req.body.password;
    const hashed_password = bcrypt.hashSync(password, 10);
    let newUser = {
      id: rndId,
      email: req.body.email,
      password: hashed_password
    };
    users[rndId] = newUser;
    req.session.user_id = rndId;
    res.redirect("/");
  }
});

// gets page for new url creation
app.get("/urls/new", (req, res) => {
  if (req.session.user_id){
    let templateVars = { 'user': req.session.user_id,
    users: users };
    res.render("urls_new", templateVars);
  } else {
    res.status(401).send('Error 401: You need to <a href=/login>login</a>');
  }
});

// gets page with list of all entries
app.get("/urls", (req, res) => {
  if (req.session.user_id){
    let templateVars = { user: req.session.user_id,
      users: users,
      urls: urlDatabase
    };
    res.status(200).render("urls_index", templateVars);
  } else {
    res.status(401).send('Error 401: You need to <a href=/login>login</a>');
  }
});

// generates new shortURL, adds new entry to dict, redirects to new entry
app.post("/urls", (req, res) => {
  if (req.session.user_id){
    let rndId = generateRandomString();
    urlDatabase[rndId] = {
      id: "rndId",
      user_id: req.session.user_id,
      longURL: req.body.longURL
    }
    res.redirect('/urls/'+rndId);
  } else {
    res.status(401).send('Error 401: You need to <a href=/login>login</a>');
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].user_id) {
    delete urlDatabase[req.params.id];
  } else {
    res.status(401).send('Error 401: Cannot delete URL you did not create');
  }
  res.redirect("/urls");
});

// gets page with individual entry info
app.get("/urls/:id", (req, res) => {
  if (req.session.user_id){
    if (req.params.id in urlDatabase) {
      if (req.session.user_id === urlDatabase[req.params.id].user_id) {
        let templateVars = { user: req.session.user_id,
          users: users,
          shortURL: req.params.id,
          urls: urlDatabase };
        res.render("urls_show", templateVars);
      }else {
        res.status(403).send('Error 403: You do not own this URL');
      }
    } else {
      res.status(404).send('Error 404: URL not found');
    }
  } else {
    res.status(401).send('Error 401: You need to <a href=/login>login</a>');
  }
});

// gets page with individual entry info
app.post("/urls/:id", (req, res) => {
  if (req.session.user_id){
    if (req.params.id in urlDatabase) {
      if (req.session.user_id === urlDatabase[req.params.id].user_id) {
        urlDatabase[req.params.id].longURL = req.body.update;
        res.redirect("/urls/" + req.params.id);
      }else {
        res.status(403).send('Error 403: You do not own this URL');
      }
    } else {
      res.status(404).send('Error 404: URL not found');
    }
  } else {
    res.status(401).send('Error 401: You need to <a href=/login>login</a>');
  }
});

// redirect to longURL when u/shortURL is typed.
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// starts server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//function to generate random string used in shortURL
function generateRandomString() {
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  let rand = '';

  for (let i = 0; i < 6; i ++) {
    rand += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return rand;
}