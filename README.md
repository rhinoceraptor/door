Door System
-----------

#### Overview

This repository contains a Node.js server that will serve a web app frontend, as well as being a REST server for the state of a door (open or closed).

It also contains a web app that will query LDAP on the Computer Club shell server, so that any user with admin access will be able to register or deregister users.

Finally, it contains the software that lives on a Raspberry Pi that controls opening the door, querying the Node.js server over SSL for authentication of magnetic cards swiped at the door, as well as for registering them when the server commands it to.


