# TINYAPP

This three-day project will have you building a tiny (pun intended) web app using Node. The app will allow users to shorten long URLs much like TinyURL.com, bit.ly, and the like.

Unlike last project where you build an HTTP Client which makes requests to the GitHub server, this one will have you building the HTTP Server to handle requests from the browser (client).

You'll get introduced to some more advanced JavaScript and node concepts and also learn more about Express, a mini web framework which is extremely popular in the node community.

By the end of the week you will hopefully also have deployed it the "Cloud" so that anyone can use it.

## Functional Requirements

_As an_ avid twitter poster,
_I want_ to be able to shorten links
_so that_ I can fit more non-link text in my tweets.

*   _When_ I visit `http://localhost:3000/`
    _Then_ I see a form which contains a field to submit a URL and a button

*   _When_ I fill in the form with a URL and submit it
    _Then_ I see a page with the original URL, a short URL and link to go back to the submission form

*   _When_ I visit `http://localhost:3000/`
    _Then_ I see a login form

*   _When_ I submit the login form
    _Then_ I am logged in

_As a_ twitter reader,
_I want_ to be able to visit sites via shortened links,
_so that_ I can read interesting content.

*   _When_ I visit a short link
    _Then_ I am redirected to the page corresponding to the short URL's original URL

## Technical Specification

*   `GET /`

    *   if user is logged in:

        *   redirect -> `/urls`
    *   if user is not logged in:

        *   redirect -> `/login`

*   `GET /urls`

    *   if user is not logged in:

        *   returns a 401 response, HTML with a relevant error message and a link to `/login`
    *   if user is logged in:

        *   returns a 200 response, HTML with:
        *   the site header (see below)
        *   a table of urls the user has created, each row:

            *   short url
            *   long url
            *   edit button -> `GET /urls/:id`
            *   delete button -> `POST /urls/:id/delete`
            *   date created (stretch)
            *   number of visits (stretch)
            *   number of unique visits (stretch)
        *   a link to "Create a New Short Link" -> `/urls/new`

*   `GET /urls/new`

    *   if user is not logged in:

        *   returns a 401 response, HTML with:
        *   error message
        *   a link to `/login`
    *   if user is logged in:

        *   returns a 200 response, HTML with:
        *   the site header (see below)
        *   a form, which contains:

            *   text input field for the original URL
            *   submit button -> `POST /urls`

*   `GET /urls/:id`

    *   if url w/ `:id` does not exist:

        *   returns a 404 response, HTML with a relevant error message
    *   if user is not logged in:

        *   returns a 401 response,  HTML with a relevant error message and a link to `/login`
    *   if logged in user does not match the user that owns this url:

        *   returns a 403 response,  HTML with a relevant error message
    *   if all is well:

        *   returns a 200 response, HTML with:
        *   the short url
        *   date created (stretch)
        *   number of visits (stretch)
        *   number of unique visits (stretch)
        *   a form, which contains:

            *   the long url
            *   "update" button -> `POST /urls/:id`
            *   "delete" button -> `POST /urls/:id/delete`

*   `GET /u/:id`

    *   if url with `:id` exists:

        *   redirect -> the corresponding longURL
    *   otherwise:

        *   returns a 404 response, HTML with a relevant error message

*   `POST /urls`

    *   if user is logged in:

        *   generates a shortURL, saves the link and associates it with the user
        *   redirect -> `/urls/:id`
    *   if user is not logged in:

        *   returns a 401 response, HTML with a relevant error message and a link to `/login`

*   `POST /urls/:id`

    *   if url with `:id` does not exist:

        *   returns a 404 response, HTML with a relevant error message
    *   if user is not logged in:

        *   returns a 401 response, HTML with a relevant error message and a link to `/login`
    *   if user does not match the url owner:

        *   returns a 403 response, HTML with a relevant error message
    *   if all is well:

        *   updates the url
        *   redirect -> `/urls/:id`

*   `GET /login`

    *   if user is logged in:

        *   redirect -> `/`
    *   if user is not logged in:

        *   returns a 200 response, HTML with:
        *   a form which contains:

            *   input fields for email and password
            *   submit button -> `POST /login`

*   `GET /register`

    *   if user is logged in:

        *   redirect -> `/`
    *   if user is not logged in:

        *   returns a 200 response, HTML with:
        *   a form, which contains:

            *   input fields for email and password
            *   "register" button -> `POST /register`

*   `POST /register`

    *   if email or password are empty:

        *   returns a 400 response, with a relevant error message
    *   if email already exists:

        *   returns a 400 response, with a relevant error message
    *   if all is well:

        *   creates a user
        *   encrypts their password with `bcrypt`
        *   sets a cookie
        *   redirect -> `/`

*   `POST /login`

    *   if email & password params match an existing user:

        *   sets a cookie
        *   redirect -> `/`
    *   if they don't match:

        *   returns a 401 response, HTML with a relevant error message

*   `POST /logout`

    *   deletes cookie
    *   redirect -> `/`

*   THE SITE HEADER:

    *   if a user is logged in, the header shows:

        *   user's email
        *   "My Links" link -> `/urls`
        *   logout button -> `POST /logout`
    *   if not logged in, the header shows:

        *   a link to the log-in page `/login`
        *   a link to the registration page `/register`

## Stack Requirements

*   _ES6_
*   _Node_
*   _express_
*   _git_ for version control
*   _cookie-session_ for session storage
*   _bcrypt_ for password encryption

## Outcomes
*   can create an http server using a high level library (ex. express, sinatra)
*   can make use of cookies in an HTTP server
*   can use "cookie-parse" middleware to set and retrieve cookies
*   can use curl to issue simple POST requests
*   can use curl for non-trivial requests
*   can use curl to issue a request with a cookie
*   can use CDT to view cookies
*   can use "express" to create a web server
*   can explain what "ejs" does and what it is used for
*   can explain the difference between <% %> and <%= %> in ejs
*   can create and use ejs templates in a web application
*   can configure and use a server-side template engine to generate HTML
*   can explain what "template engines" are and why they are used
*   can explain what "partials" are and why they are used
*   can use partials
*   uses partials when appropriate
*   can use labels in an HTML form
*   can make use of common input field types
*   can create a form to send a POST request
*   can explain what is meant by an HTML "form" and what they are used for
*   can explain the purpose of the action attribute in a form
*   can explain the purpose of the method attribute in a form
*   can explain how a HTTP redirect works and when it could be used
