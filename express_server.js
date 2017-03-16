// requirement and config variables
let express = require("express");
let app = express();
let PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
let cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs")

// object dict that can be edited / parsed
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "asd"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "asd"
  }
};

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
  let userId = '';
  for (user in users) {
    let innerDb = users[user];
    console.log(innerDb);
    if (req.body.email === innerDb.email){
      if (req.body.password !== innerDb.password){
        res.status(403).send('Incorrect Password');
      }
      emailSwitch = 1;
      userId = innerDb.id;
      break;
    }
  }
  if (emailSwitch === 0) {
    res.status(403).send('No account with that Email');
  } else {
    res.cookie("user_id", userId);
    res.redirect("/");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  for (user in users) {
    let innerDb = users[user];
    if (innerDb['email'] === req.body.email){
      res.status(400).send('There is already an account with that email');
    }
  }
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Enter both email and password fields');
  } else {
    let rndId = generateRandomString();
    let newUser = {
      id: rndId,
      email: req.body.email,
      password: req.body.password
    };
    users[rndId] = newUser;
    res.cookie("user_id", rndId);
    res.redirect("/");
  }
});

// gets page for new url creation
app.get("/urls/new", (req, res) => {
  let templateVars = { 'user': users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

// generates new shortURL, adds new entry to dict, redirects to new entry
app.post("/urls", (req, res) => {
  let rndId = generateRandomString();
  urlDatabase[rndId] = req.body.longURL;
  res.redirect(`/urls/${rndId}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// gets page with individual entry info
app.get("/urls/:id", (req, res) => {
  if (req.params.id in urlDatabase) {
    let templateVars = { 'user': users[req.cookies["user_id"]],
      shortURL: req.params.id, urls: urlDatabase };
      console.log(templateVars);
    res.render("urls_show", templateVars);
  }else {
    res.end("There is no shortURL with that address. Please try again.");
  }
});

// gets page with list of all entries
app.get("/urls", (req, res) => {
  let templateVars = { 'user': users[req.cookies["user_id"]],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// redirect to longURL when u/shortURL is typed. 301 code
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
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