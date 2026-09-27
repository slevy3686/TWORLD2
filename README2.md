# TWORLD2 - How to Access Early-Stage Wrapper Functions (& Underlying API Calls and Backend)

# Step 0 - Prerequisites

1. **MySQL**
   1. Download & install:
      1. [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
         1. Open & run the installer.
         2. Set root password: `(choose your root password)`

2. **Node.js**
   1. [https://nodejs.org/en/download](https://nodejs.org/en/download)
      1. Verify download version:
         1. In terminal: `node -v`

# Step 1 - Setting Up the Database

1. Go to **System Preferences -> MySQL**
   1. Click **Start MySQL Server**.
   2. (Here is also where you can uninstall MySQL.)

2. **Create the database**
   1. (If MySQL was installed for all users)
      1. Via terminal, navigate to:
         `/usr/local/mysql/bin/mysql -u root -p`
      2. Enter the password you set during installation: `(your chosen password)`
      3. Once inside the MySQL prompt, you should see something like:
         `mysql>`
      4. From there, enter:
         1. `create database mydatabase;`
         2. `use mydatabase;`
      5. Enter the following to return to terminal:
         `exit`

3. **Load database schema**
   1. Navigate via terminal to the folder containing the SQL files:
      1. `Tiger-World -> group5_backend -> db -> ddl_01_tables`
   2. Re-enter MySQL
      1. (If MySQL was installed for all users)
         1. Via terminal, navigate to:
            `/usr/local/mysql/bin/mysql -u root -p`
         2. Enter the password you set during installation: `(your chosen password)`
         3. Once inside the MySQL prompt, you should see something like:
            `mysql>`
            1. Enter the following command:
               `use mydatabase;`
            2. (First time only) From there, run each SQL file in order to create tables and any initial data:
               1. `source 01a_mastertable.sql;`
                  1. Tables are added to the master table as they are created, tested, etc.

4. **Verify environment variables match**
   1. Environment variables live in:
      1. `(cloned) repository -> group5_backend -> node -> .env`
   2. If you followed the following instructions, this step is not necessary:
      1. Set root password: `(your chosen password)`
      2. Create database `mydatabase`

# Step 2 - Start the Backend Server

1. Navigate via terminal to:
   1. `Tiger-World -> group5_backend -> node`

2. (First time only) Download dependencies (`node_modules`) by entering the following into the terminal:
   `npm install`
   1. ^ You will have to run `npm install` for the front end and the back end, only once each.

3. Start the server by entering either into the terminal:
   1. `node index.js`
      1. Starts the server automatically.
      2. No auto-reload.
      3. If you edit backend code, you must stop it and run it again.
   2. `npm run dev`
      1. Uses nodemon.
      2. Automatically restarts the server when backend files change.

4. The console should say:
   `server running on port 3000`

5. When finished/to close the server:
   `ctrl + c`

# Step 3 - Start the Frontend Server

1. Navigate via terminal to:
   1. `Tiger-World -> group5_frontend`

2. (First time only) Download dependencies (`node_modules`) by entering the following into the terminal:
   `npm install`
   1. ^ You will have to run `npm install` for the front end and the back end, only once each.

3. Start the front end server by entering the following into the terminal:
   `npm run dev`

# Step 4 - Command-Line Interface

1. Open a new terminal window or tab.
   1. **Window**
      1. `command + n` (Mac)
      2. `file -> new window`
   2. **Tab**
      1. `command + t`

2. Via the terminal, navigate to:
   1. `Tiger-World -> group5_frontend -> src`
   2. Enter the following into the terminal:
      `node frontend_CLI.js`
      1. Running it with node prints a menu in the terminal, **NOT in the browser**.

3. You should be able to use the given kit (a printed menu).
