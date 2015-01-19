#!/bin/bash

door_file="door.db"
if [ -f "$door_file" ]
then
	echo "Error! An old door.db exists. Remove it or back it up, and then try again."
	exit 0
fi

sqlite3 door.db < door.sql
date=$(date)
# Initial door state is closed, pass in the output of date command, and start id autoincrement at 1
sqlite3 door.db "INSERT INTO door (id, state, timestamp) VALUES(1, 1, \"$(date)\")"
