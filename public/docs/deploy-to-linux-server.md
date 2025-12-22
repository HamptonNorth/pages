# Deploy to Linux server
The notes cover moving code from a Ubuntu Worksation development set up and deplying on a Ubuntu Server. At the time of writing the Ubuntu Workstation was running Ubuntu 25.10 whilst the server was running Ubuntu 24.10.

```bash
# Do a build on the dev workstation
cd ~/code/bun-starter
bun run build

```

Open a terminal session on the remote server.

```bash

ssh rcollins@nuc2023

```

Stop the relevant `systemctl` (probably set up to autostart on boot and failure)

```bash

# To list services 
# systemctl list-units --type=service
# or if you know the name:
sudo systemctl stop bun-starter.service

```

Set up FTP from dev to server (Filezilla to make it easy) and transfer all the directories and files shown from the development set up to the target server:

```text
# Essentially everthing but the /node_modules directory
.
├── better-auth_migrations
│   ├── 2025-12-21T19-23-45.320Z.sql
│   └── 2025-12-22T07-37-15.011Z.sql
├── bun.lock
├── data
│   ├── app3.db
│   ├── app3.db-shm
│   └── app3.db-wal
├── dev.js
├── eslint.config.js
├── favicon.ico
├── package.json
├── package-lock.json
├── public
│   ├── components
│   ├── data
│   ├── docs
│   ├── index.html
│   ├── media
│   ├── pages
│   ├── scripts
│   ├── styles
│   └── views
├── README.md
└── src
    ├── auth-client.js
    ├── auth.js
    ├── auth-options.js
    ├── auth-validation.js
    ├── client-components-build.js
    ├── components
    ├── controllers
    ├── db-setup.js
    ├── models
    ├── routes
    ├── server.js
    └── utils.js

```

Then set file attributes as follows:

```bash

# Assuming your app runs as your user account
chmod 755 /path/to/app
chmod 755 /path/to/app/node_modules

find /path/to/app -type d -exec chmod 755 {} \;
find /path/to/app -type f -exec chmod 644 {} \;

chmod 600 .env

```

Then edit the `.env` file to ensure the social better-auth logins for Google and GitHub are pointing to the server rather than localhost.

You can now run the application in dev mode on the server:

```bash

bun run dev

```

If this is a new setup, the app may stop and ask you to run `node --env-file=.env public/scripts/setup.js` to create the better-auth empty SQLite tables and the default admin user. The setting for the default admin user are in `.env`

If the app runs okay, close the bun run dev using `ctrl+C` and the restart the `systemctl`

```bash

sudo systemctl start bun-starter.service

```
