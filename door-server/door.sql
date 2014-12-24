PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
user text not null,
hash text not null,
date text not null,
registrar text not null
);
CREATE TABLE swipes (
date text not null,
hash text not null,
user text not null
);
CREATE TABLE door (
state int not null,
date text not null
);
COMMIT;
