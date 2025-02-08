# TODO

```js
// error response object
{
  error: {
  "userName": "User name is already taken"
} // map
}
```

- Users
  - model - user: userName, password
  - database mongo db + mongoose
  - login
  - register - creates user if username is not taken
  - authenticated middleware - only login and register should be accessed by not authenticated users
- Random join
- Host the app

- Game
  - fix end game
  - show winner
  - game settings for single player?
  - server holds the state synchronized with players state
  - reconnect logic
  - delay logic
