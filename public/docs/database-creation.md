# Database Creation
If the SQLite database does not exist, running the app creates a new database and populates the `test_countries` and the `test_products` tables. 

It **does not create** the tables (account, session, user and verification) used by the better-auth library used for authentication. This is a design choice so bunstarter can continue to use the setup and migration scripts supplied as part of better-auth. This may be and overhead on nitial set but should make future maintance easier as better-auth library gets updated.

The outline sequence to create a new database is as follows:
1) delete the database from './data' - currently 'app3.db'.
2) from the terminal 'run bun dev' - this will create a new database with the 'test_*` tables created and populated.
3) In the terminal run `npx @better-auth/cli generate --config ./src/auth.js` - this will create a new directory `./better-auth-migrations` containing a dtaetime labelled `*.sql` script that creates/migrates the `account`, `session`, `user` and `verification` tables used by better-auth
4) To execute the migration script `npx @better-auth/cli migrate --config ./src/auth.js`
5) To test 
``` bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Password123",
    "name": "Test User"
  }'
  ```
