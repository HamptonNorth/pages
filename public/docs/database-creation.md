# Database Creation
If the SQLite database does not exist, running the app (server.js) fails with the following message:
```

❌ CRITICAL ERROR: Database not found at /home/rcollins/code/bun-starter/data/app3.db
   Please run the setup script first. This creates an empty database and creates all the
   empty tables for authentication and adds the default admin user.

   Ensure the variables ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD and BETTER_AUTH_SECRET are set in .env and then:

   From the terminal run:      node scripts/setup.js
   
```


The outline sequence to create a new database is as follows:

1) delete the database from './data' - currently 'app3.db'.
2) Check .env varaibles for ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD and BETTER_AUTH_SECRET are set in .env
3) Run the script `node --env-file=.env public/scripts/setup.js`
