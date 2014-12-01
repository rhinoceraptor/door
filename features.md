Features to implement for door
------------------------------

#### Door Web App
- Any admin in yakko ldap can log in and register or deregister people
  - They will log in, these credentials are verified against ldap
  - Registration events are logged - date, time, admin user and registree
- Admins can also search opening and register logs
- Those registered can deregister their cards, in the case that they lose them

#### Door Backend Server
- Serves the Web App on some port (eg, visit https://yakko.cs.wmich.edu:109001)
- Provides ```put``` interface on that URL for the raspberry pi for the door state
- Provides ```post``` interface on that URL for the raspberry pi to authenticate card hashes
  - Returns 200 on authorized
  - Returns 403 on unauthorized
- Provides ```get``` interface on that URL for IRC bots
- Provides registration logic for the system, details as follows:
  - Admin initiates registration through web app
  - The server now knows that the next authentication request from the rasberry pi is actually a registration. Since the raspberry pi is probably within the office network, it is behind NAT so it is easier not to try to connect back to it to initiate registration.
    - The registree will enter their ldap credentials to verify
    - The server will store the card hash, shell username, real name, email and phone number of registree in SQLite
    - The server will send back 200 as usual
    - At any time in the process, the registration can be canceled.

#### Raspberry Pi
- Authentication:
  - Waits for a card to be swiped
  - Upon card swipe, the string on the card is hashed.
  - This hash is ```post```ed to the door backend server, using self signed SSL for the raspberry pi and the server
  - If the server returns 200, open the door
  - If the server returns 403, do not open the door
- Door state
  - The magnetic latch on the door is polled, upon change the raspberry pi will ```put``` the door state to the server using the self signed SSL.