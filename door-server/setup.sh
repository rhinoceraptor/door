#!/bin/bash

sqlite3 door.db < door.sql
date=$(date)
sqlite3 door.db "INSERT INTO door VALUES(0, \"$(date)\")"