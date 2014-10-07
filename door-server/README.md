Computer Club Door Server
-------------------------

This server is responsible for the following:
- REST interface for ```GET```ing the door state
- This interface will also let the raspberry pi on the door to ```POST``` to it with that state.
- Serving a web app for users, authed through yakko LDAP, so that they can:
	- view their registered card, it's description
	- revoke access to their cards if needed
- Authing with LDAP with also allow the server to reject users that are not paid up on their accounts.
