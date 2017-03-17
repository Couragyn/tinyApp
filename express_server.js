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
  res.redirect("/urls");
});

// gets for urls in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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
    res.status(403).send('Login error');
  } else {
    req.session.user_id = userId;
    res.redirect("/");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  for (user in users) {
    let innerDb = users[user];
    if (innerDb['email'] === req.body.email){
      res.status(400).send('Login error');
    }
  }
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Login error');
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
    let templateVars = { 'user': req.session.user_id};
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

// generates new shortURL, adds new entry to dict, redirects to new entry
app.post("/urls", (req, res) => {
  let rndId = generateRandomString();
  let userCookie = req.session.user_id;
  urlDatabase[rndId] = {
    id: "rndId",
    user_id: req.session.user_id,
    longURL: req.body.longURL
  }
  res.redirect(`/urls`);
});

// gets page with list of all entries
app.get("/urls", (req, res) => {
  let templateVars = { user: req.session.user_id,
    test: 'yo',
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].user_id) {
    delete urlDatabase[req.params.id];
  } else {
    res.status(401).send('Cannot delete URL you did not create');
  }
  res.redirect("/urls");
});

// gets page with individual entry info
app.get("/urls/:id", (req, res) => {
  if (req.params.id in urlDatabase) {
    let templateVars = { user: req.session.user_id,
      shortURL: req.params.id, urls: urlDatabase };
    res.render("urls_show", templateVars);
  }else {
    res.end("There is no shortURL with that address. Please try again.");
  }
});

// gets page with individual entry info
app.post("/urls/:id", (req, res) => {
if (req.session.user_id === urlDatabase[req.params.id].user_id) {
    urlDatabase[req.params.id].longURL = req.body.update;
  } else {
    res.status(401).send('Cannot edit a URL you did not create');
  }
  res.redirect("/urls");
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