PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
name text not null,
hash text not null
);
CREATE TABLE swipes (
date text not null,
user text not null
);
COMMIT;
