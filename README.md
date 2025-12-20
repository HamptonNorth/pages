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
Project directory - not all code files are shown. Brief notes showing what's where. Using terminal, from the project root, run `tree -L 3 -I "node_modules|temp|.git|build|dist|__pycache__"~` to get the project structure. Use `tree -d -L 3 -I "node_modules|temp|.git|build|dist|__pycache__"~` to get directories only.bun run build

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
    ├── server.js                                <-- combined bun serve and front end (entry point)
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
BETTER_AUTH_URL=https://bunstarter.redmug.dev  # change for dev/production
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

Obviously dependent of your set up. These are my notes for porting to a Linux server attached to my local network publicalyy accessed using Cloudflare tunnels. 

To force the set up of a new database, delete the existing server side database.

On dev system run:
```bash
bun run build
```

Move from dev (`~/code/bun-starter` dev root to `~/code/bun_starter` nuc2023 root) - note naming discrepency should be fixed!

```text
==== dev ====                            ==== prod ====
/dist/serever.js               to      /dist/server.js
/public                        to      /public
/src                           to      /src
.env                           to      .env 
favicon.ico                    to      favicon.ico
```

Do not move any node directories/files from dev to production server. This would probaby cause version issues.

Using `ssh rcollins@nuc2023` login to production server.

Then stop the auto running the current server code by running `sudo systemctl stop bun-starter.service`

Then cd to `~code/bun_starter` and to create a new database then run:
```bash
node --env-file=.env public/scripts/setup.js
```

It would be wise to ensure bi=oth dev and prouduction are running same versions,to run `bun update` followed by `bun upgrade` on both dev and production.

Ensure .env contains `BETTER_AUTH_URL=https://bunstarter.redmug.dev`

Ensure bothe Google and GitHub have the Authorised Javascript Origins and the Authorised redirect URI's set for the production server. (https://console.cloud.google.com and GitHub then Settings > Developer Settings > OAuth Apps.)

Note that using standard GitHub OAuth App (the most common type for login), you cannot simply "add" a second URL to the same application as you can with Google. GitHub limits standard OAuth Apps to exactly one Authorization callback URL. Create a new GitHub Oauth app e.g bun-starter-production and the have 2 sets of .env variables, commenting out as appropriate.

```bash
# for dev http://localhost:3000/
GITHUB_CLIENT_ID=*************
GITHUB_CLIENT_SECRET=**********************************

# for production https://bunstarter.redmug.dev/
#GITHUB_CLIENT_ID=***********
#GITHUB_CLIENT_SECRET=*************************************
```

On Cloudfalre, sign in and then for the domain, set dev mode = true and purge all cache (resets itself after 3 hrs fetch)

Test
## Roadmap
1) Improve mail:to links for communicating sign in details to new users or password reset details to existing users
2) Add role based access control
3) Add middleware to bun server to 'guard' specified routes

On a longer timescale, adding a blog (auto index from page header yaml front matter, auto build pages from markdown files in known directory)


# 🐧 Linux Terminal Cheat Sheet

A concise reference for the 50 most used Linux commands, text editors, scripting, and automation.

---


### File & Directory Navigation
1. **`ls`** — List directory contents.
   * `ls -la` (All files + details) 
   * `ls -lh` (Human-readable sizes)
2. **`cd`** — Change directory.
   * `cd /path` 
   * `cd ..` (Up one level) 
   * `cd ~` (Home)
3. **`pwd`** — Print Working Directory (show current path).
4. **`mkdir`** — Make directory.
   * `mkdir folder` 
   * `mkdir -p parent/child` (Nested)

### File Manipulation
5. **`cp`** — Copy.
   * `cp file.txt copy.txt` 
   * `cp -r folder1 folder2` (Recursive)
6. **`mv`** — Move or Rename.
   * `mv old.txt new.txt` 
   * `mv file.txt /dest/`
7. **`rm`** — Remove.
   * `rm file.txt` 
   * `rm -i file` (Ask confirm) 
   * ⚠️ `rm -rf folder` (Force delete)
8. **`touch`** — Create empty file or update timestamp.
9. **`ln`** — Create links.
   * `ln -s file link` (Symbolic link/Shortcut)
10. **`cat`** — Display content.
    * `cat file.txt` 
    * `cat a.txt b.txt > combined.txt`

### Text Processing
11. **`grep`** — Search text.
    * `grep "error" log.txt` 
    * `grep -r "text" .` (Recursive)
12. **`echo`** — Print text.
    * `echo "Hi"` | `echo "Log" >> file.txt` (Append)
13. **`less`** — View text page-by-page (`q` to quit).
14. **`head`** — First 10 lines. (`head -n 5 file.txt`)
15. **`tail`** — Last 10 lines.
    * `tail -f log.txt` (Watch file grow in real-time)
16. **`wc`** — Count words/lines. (`wc -l file.txt`)
17. **`sort`** — Sort lines.
    * `sort file.txt` (Alpha) 
    * `sort -n nums.txt` (Numeric)
18. **`uniq`** — Filter duplicates (use after `sort`).
19. **`diff`** — Compare files line-by-line.
20. **`sed`** — Text replacement.
    * `sed 's/old/new/g' file.txt` (Print modified output)
21. **`awk`** — Text processing.
    * `awk '{print $1}' file.txt` (Print 1st column)
22. **`tee`** — Redirect to file AND screen.
    * `echo "Hi" | tee -a log.txt`

### System Info & Management
23. **`sudo`** — Execute as admin.
24. **`uname`** — System info (`uname -a`).
25. **`whoami`** — Current user.
26. **`top` / `htop`** — View active processes.
27. **`ps`** — Process snapshot (`ps aux`).
28. **`kill`** — Terminate process.
    * `kill PID` 
    * `kill -9 PID` (Force kill)
29. **`shutdown`** — Power mgmt.
    * `shutdown now` 
    * `shutdown -r now` (Reboot)
30. **`systemctl`** — Control services.
    * `sudo systemctl start/stop/status service_name`
31. **`date`** — Show/set date.
32. **`which`** — Locate command path (`which python`).

### Disk & Hardware
33. **`df`** — Disk free space (`df -h`).
34. **`du`** — Folder usage (`du -sh folder`).
35. **`mount` / `umount`** — Mount/Unmount drives.

### Permissions
36. **`chmod`** — Change mode.
    * `chmod +x script.sh` (Make executable) 
    * `chmod 755 folder`
37. **`chown`** — Change owner.
    * `chown user:group file`

### Networking
38. **`ping`** — Check connectivity.
39. **`ip`** — Show IP (`ip a`).
40. **`curl`** — Transfer data (`curl https://site.com`).
41. **`wget`** — Download file (`wget url/file.zip`).
42. **`ssh`** — Remote login (`ssh user@host`).
43. **`scp`** — Remote copy (`scp file user@host:/path`).
44. **`ss`** — Socket stats (`ss -tuln` for open ports).

### Archives & Search
45. **`tar`** — Archives.
    * `tar -czvf arc.tar.gz folder` (Compress) 
    * `tar -xzvf arc.tar.gz` (Extract)
46. **`zip` / `unzip`** — Zip format.
47. **`find`** — Search files (`find . -name "*.log"`).
48. **`locate`** — Fast file search (`locate file.txt`).

### Misc
49. **`history`** — Command history.
50. **`alias`** — Shortcuts (`alias ll='ls -la'`).

---

## Nano Editor Shortcuts
Run with: `nano filename`

| Key | Action | Description |
| :--- | :--- | :--- |
| **`Ctrl + O`** | Write Out | Save file. |
| **`Ctrl + X`** | Exit | Close editor. |
| **`Ctrl + W`** | Where Is | Search text. |
| **`Ctrl + K`** | Cut | Delete line. |
| **`Ctrl + U`** | Uncut | Paste line. |

---

## Piping & Redirection
Combine commands to create workflows.

| Operator | Name | Example |
| :--- | :--- | :--- |
| **`\|`** | Pipe | `cat logs.txt \| grep "Error"` (Pass output to next command) |
| **`>`** | Overwrite | `ls > list.txt` (Save output to file) |
| **`>>`** | Append | `echo "End" >> log.txt` (Add to end of file) |
| **`<`** | Input | `sort < names.txt` (Feed file into command) |
| **`&&`** | AND | `mkdir A && cd A` (Run 2nd only if 1st succeeds) |

---


# Heading
This is some test markdown to check HTML rendering

### Lists
* `rm file.txt` 
* `rm -i file` (Ask confirm) 
* ⚠️ `rm -rf folder` (Force delete) 

1. Numbered list
21. **`awk`** — Text processing.
    * `awk '{print $1}' file.txt` (Print 1st column)
