# bunstarter
## What's it for

Every time one starts a new web based application there are the same building blocks needed before you get to the new code specific to the app. Almost every application needs menus, headers, footer, hamburger menus on small viewports, account sub menus, authentication, a reset password function and so on.

This project provides a scaffolded fully working application that ships with most of the needed base functionality. It includes:
- Example HTML pages served by Bun
- Example Bun server with api to the back end with GET, POST, PUT and DELETE calls
- Strucured back end with routes, controllers and models
- Persistent back end storage using Bun SQLite connector
- Authentication using the better-auth library with example email/password, Google and GitHub sign in workflows
- Example components built with Lit, Javascript and Tailwind CSS
- Set up scripts to create database, create and populate better-auth tables and sample test data tables
- Responsive UI, works on mobile but examples designed for desktop apps

My hope is, faced with a new web application, I can clone this stater template, hack out the bits that are not need then add the missing user requirements. If it's quicker than starting from scratch, I'll take that as a win.

## Software stack
- Javascript with ES6 node_modules
- Bun 1.3+
- Lit to reduce custom component boilerplate code
- Tailwind CSS 
- SQLite
- Better-auth library for authentication


## Development set up
To clone that repository into your `~/code` directory:
1. Navigate to your working directory
```bash
cd ~/code
```
2. Clone the repository
```bash
git clone https://github.com/HamptonNorth/bun-starter.git
```
This creates a new folder called `bun-starter` inside `~/code`, containing all the repository files and Git history. Your project will be at `~/code/bun-starter`.

After cloning, you'd typically `cd bun-starter` and run `bun install` to fetch dependencies.

Then to run the app in development:
```bash
bun run dev
```

## Directory structure
Project directory - not all code files are shown. Brief notes showing what's where. Using terminal, from the project root, run `tree -L 3 -I "node_modules|temp|.git|build|dist|__pycache__"~` to get the project structure

```

.
├── better-auth_migrations                       <-- setup/migration scripts used by better-auth
├── bun.lock
├── data
│   ├── app3.db                                  <-- SQLite database
├── dev.js
├── eslint.config.js
├── favicon.ico
├── package.json
├── package-lock.json
├── public
│   ├── components
│   │   └── client-components.js                 <-- built form custom components by server.js
│   ├── docs
│   │   └── roadmap.md
│   ├── index.html                               <-- Home page
│   ├── lib
│   ├── media
│   │   └── redmug_logo_316x316.png
│   ├── scripts                                  <-- scripts for client pages
│   │   ├── countries.js
│   │   ├── setup.js
│   │   └── users-list.js
│   ├── styles
│   │   ├── input.css
│   │   ├── output.css
│   │   └── rm.css                               <-- any custom CSS
│   └── views                                    <-- client pages
│       ├── 404.html
│       ├── about.html                           
│       
├── README.md
├── server
│   └── api
│       └── admin-routes.js
└── src
    ├── auth-client.js
    ├── auth.js                                  <-- main auth code
    ├── auth-options.js
    ├── auth-validation.js
    ├── client-components-build.js
    ├── components                               <-- custom components
    │   ├── rm-add-user-modal.js
    │   ├── rm-button.js
    │   ├── rm-colour-swatch.js
    │   ├── rm-default-container.js               
    │   
    ├── controllers                              <-- controllers
    │   ├── testCountries.controller.js
    │   └── testProducts.controller.js
    ├── db-setup.js
    ├── models                                   <-- models (all SQL data access)
    │   ├── testCountries.model.js
    │   └── testProducts.model.js
    ├── routes                                   <-- api routes
    │   └── api.js
    ├── server.js                                <-- combined bun serve for front & back end
    └── utils.js                                     

```

## Database initial set up
Set up your database credentials in `.env` in the root directory. Here is an example:
```bash
# .env
PORT=3000
ADMIN_NAME=jsmith
ADMIN_EMAIL=jsmith@gmail.com
# ADMIN_PASSWORD must be at least 8 characters, contain at least 1 uppercase letter and at least 1 number
ADMIN_PASSWORD=Asd23bjh7
BETTER_AUTH_SECRET=******************

TEMP_PASSWORD_LAPSE_HOURS=48

GOOGLE_CLIENT_ID=************************
GOOGLE_CLIENT_SECRET=************

GITHUB_CLIENT_ID=************
GITHUB_CLIENT_SECRET=****************
```
Then run the script 
```javascript
node --env-file=.env public/scripts/setup.js
```

Note this is a `node` script rather that a `bun x` script. This is due to known differences between `bun cli` and `node` that will cause the `better-auth migration` scripts to fail if run using `bun x` (issue as at Dec 2025)

## Authentication workflow+
The authentication workflow is designed for a gated setup where an admin user creates new users with a one time temporary password valid for 48 hrs.

The new user must then change their password on first sign in.

Once signed in, users my use Google or Github as alternative to their email/password.

An admin user may rest passwords and delete users.

Password rules may easily be changed. By default they are set uo for 8 or more characters, at Least 1 upppercase letter and at lease 1 number. Character set control does not allow o0il etc to avoid confusion. Again this is easliy changed

## Naming standards used

API Layer:  e.g., getAllTestProducts, addTestUser in the controllers. 

Data Layer: e.g., getAllTestProductsData, addTestUserData in the models.  

Client-Side: e.g., getAllProducts, addProduct mirrors the API, which is a perfect pattern. 

Data/HTML: Use snakeCase (user_id, first_name) for data payloads and HTML form names. 

JS Variables: Use camelCase for JavaScript variables (userName)  

URIs: Lower case and hyphens (i.e kebab case) e.g /api/order-items

## Custom components

There are a (growing) collection of comonents. The are in the directory `./src/components`. The list as at release 0.8.1 consists of:

- <rm-head>               #consistent meta data for views
- <rm-nav-header>         # logo, title, header navigation, waffle menu, 3 dot menu and hamburger menu for samll viewports
- <rm-footer>             # a simple footer
- <rm-default-container>  # a container for page content so responsive break points are consistent across views
- <rm-button>             # consistently styled button with multiple sizes, secondary, error and disabled settings
- <rm-login>              # sign in/sign out authentication UI

The components are combined into a single `js` file `./public/components/client-components.js` as part of the `server.js` code,

**Note:** If you modify any components ensure to restart your `server.js` if it is running as a `systemctl` process. If you don't you'll continu to see stale code. 


## Production deployment

## Roadmap
1) Improve mail:to links for communicating sign in details to new users or password reset details to existing users
2) Add role based access control
3) Add middleware to bun server to 'guard' specified routes

On a longer timescale, adding a blog (auto index from page header yaml front matter, auto build pages from markdown files in known directory)
