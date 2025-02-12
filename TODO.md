# TODO

- **DONE** Home page - Georgi
  - remove chat left overs
  - add h1 "Snake game"
  - two buttons below single player, multi-player
  - model - user: userName, password
  - username should be unique!!!
  - should user have unique id?
  - password atleast 8 symbols
  - hash the password before saving
  - username atleast 3 symbols
  - database mongo db + mongoose
  - login
  - register - creates user if username is not taken

- **DONE** Users - Tone
  - authenticated middleware - only login and register should be accessed by not authenticated users
```js
// error response object
{
  error: {
  "userName": "User name is already taken"
} // map
}
```

- **DONE** Random join - Georgi
  - server gives you opponent
  - both players are redirected to multiplayer page

- **DONE** Host the app - Georgi
  - heroku

- **DONE** Server
  - error handling middleware
  - logging

- display server errors
- guest access
- use webpack

- Game
  - fix end game
    - both players should receive event, currently it only freezes the screen
    - both players should leave the room on the server and but should not be available for new game
  - show winner
    - both players should get end game screen
    - end game screen should have redirect buttons
  - server holds the state synchronized with players state
    - maybe server should always hold the whole state
    - server should send only last move
    - server should determine end game
  - reconnect logic
    - on reconnect - get the state from the server
  - delay logic
    - in case of delay - get the state from the server
    - always show the latest state to the users - send timestamp with the state
  - leave room logic
    - when game ends
    - when user leaves the page!

 - Проверка на всичките кейсове относно сокетите!!!

Bonus:
  - game settings for single player?
    - set step time
    - decrease step time during game
