Computer Club Door Server
-------------------------

### Server Responsibilities
- ```GET``` ```/door``` for the door state
- ```POST``` ```/door``` for storing the door state
- ```POST``` ```/door-auth``` for opening the door, as well as for registering cards
  - The server will control which of those is happening. In either case, the Raspberry Pi, if given a 200 OK header will open the door.
- Storing the door state, as well as registered users and card swipe events in a sqlite3 database
- Serving a web app for users (through express), authed through yakko LDAP, so that they can:
  - view their registered card, it's description (hint to users which card they registered)
  - revoke access to their cards if needed
- Authing with LDAP with also allow the server to reject users that are not paid up on their accounts
- A user will also have to first be manually added through the web app interface by an admin

### SQLite3 layout
- Table ```door```:
- ```state```: text field used to store 0 or 1
- ```date```: text field used to store the output of the ```date``` command for a timestamp
- Table ```users```:
- ```user```: username of the user (from LDAP)
- ```hash```: contains the SHA521 hex digest for their card
- ```card_desc```: The user's text hint for which card they registered to open the door
- ```date```: ```date``` command timestamp for their registration
- ```registrar```: username of who registered the user (from LDAP)
- Table ```swipes```:
- ```date```: ```date``` timestamp of the swipe attempt
- ```hash```: contains the SHA512 hex digest of the attempted card
- ```granted```: whether or not the server granted access to this card swipe attempt
- ```user```: may contain the username of the swipe-ee, if they have been granted access