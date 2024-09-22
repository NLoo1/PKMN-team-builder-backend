# Pokemon Team Builder

**This is the backend of Pokemon Team Builder. For the frontend, see [here.](https://github.com/NLoo1/PKMN-team-builder-frontend)**

## What is Pokemon Team Builder?
Pokemon Team Builder is a passion project I designed using React and Express. The backend and frontend interact through a custom API. This project contains two servers: one for the backend, and one for the frontend.

The team builder is complete with user accounts and team creation. 

**Users are able to:**
- Create, delete, and modify their own account
- Create a team
	- **Modify that team (WIP)**
	- Delete team
- View a table of all Pokemon
	- Search that table for Pokemon
- View their own teams and a list of all teams created by other users

Pokemon Team Builder also includes granting admin privileges to certain users. **Administrators are able to do everything users can, but can also completely modify other users' details and teams.**

On initialization, `testadmin` is the only account with administrative privileges.

- The frontend port defaults to **3000**.
- The backend port defaults to **3001**.

## Setup & Installation
1. Fork or clone BOTH this repository and the backend.
2. For both of these repos, you will need to use a command-line shell to install required packages. I personally used Git Bash.  
3. Navigate to each folder and run `npm i`. 
4. After installing required packages in each folder, navigate back to the backend. In order to run the backend, you will need to use PostgreSQL to store user data.
5. In PostgreSQL, create a database called `pokeapi`. You may choose to name it whatever you want, but be sure to change `DB_NAME` in the next step accordingly.
6. You'll need to create an `.env` file in the backend. It should be formatted
`DB_USERNAME= `
`DB_PASSWORD=`
`DB_NAME=pokeapi`

The .env file should have credentials for Express to access your database by itself and commit any transactions. This is in the root folder.
1. In the backend, run `psql -f pokeapi.sql` and press `Enter` or `Return`when prompted. This will create the required tables and schema for Pokemon Team Builder, while creating a `testuser`, `testadmin`, and `test-team` with Bulbasaur, Ivysaur, Charizard, Charmander, Charmeleon, and Charizard (the first 6 Pokemon).
2. Open two CLI shells, one for the backend server and one for the frontend server. On one of the shells, route back to the backend folder and run `npm start`. Do the same with the shell for the frontend.
3. Confirm there aren't any errors. If everything works as expected, your browser should automatically open up the home page.

##     Models
Pokemon Team Builder's data is split between three tables: `User`, `Team`, and `teams_pokemon`. In the backend, a model and route for each table is given and actively used in the API. 

## Tests
Run tests with `npm test` or `jest -i`. 

**Given the nature of the test setup, running tests in parallel will always fail due to deadlocking.**

You'll need to make an .env.test file, similar to the .env file. Make sure to add `NODE_ENV=test`.

## Routes
The team builder's frontend operates on these routes:
- GET / 
- GET /pokemon 
- GET, POST /login
- GET, POST /signup
- GET /profile
- GET /logout
- GET /users/:username
- GET, POST /users/:username/edit
- GET, DELETE /users/:username/delete
- GET /teams/:id
- GET, POST /teams/:id/edit
- GET, DELETE /teams/:id/delete
- GET /my-teams - **gets teams that the currenty logged in user created**
## Endpoints
The API (`frontend/src/api.js`) uses the following methods:
- login(username, password)
- getUser(username, token)
- getUsers(token)
- register({username, password, email})
- postUserAdmin({user, token})
- filterUsers(username, token)
- patchUser(data, username, token)
- deleteUser(username, token)
- getAllPokemon(offset  =  0, limit  =  100)
- getPokemonSpriteByURL(url)
- getAllTeams(token)
- getTeamById(id, token)
- createTeam(data, token)
- patchTeam(id, data, token)
- addPokemonToTeam(id, data, token)
- getAllPokemonInTeam(id, token)
- getAllUserTeams(token)

For more details on exact usage, refer to `api.js` and documentation.

## Credits
All Pokemon data is sourced directly from the free open-source Pokemon database API, <a  href="https://pokeapi.co/">PokeAPI.</a> 

Pokemon Team Builder was originally designed as my capstone project for Springboard's [Software Engineering Bootcamp](https://www.springboard.com/courses/software-engineering-career-track/), partnered with Stony Brook University. The bootcamp is a 9-month, self-paced program that teaches both frontend and backend development for web developers. 