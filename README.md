Door System
-----------

#### Overview

Please see each project's README.md for a more detailed overview.

[door-server](door-server/README.md) is a Node.js server that serves a web app frontend, as well as being a REST server for the state of a door (open or closed).

[door-magstripe](door-magstripe/README.md) contains Node.js scripts for a Raspberry Pi that controls opening the door, querying the Node.js server over SSL for authentication of magnetic cards swiped at the door, as well as for registering them when the server commands it to.
