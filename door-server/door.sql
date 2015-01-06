PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
user text not null,
hash text not null,
card_desc text not null,
reg_date text not null,
registrar text not null
);
CREATE TABLE admins (
user text not null,
salt text not null,
hash text not null,
reg_date text not null
);
CREATE TABLE swipes (
swipe_date text not null,
hash text not null,
granted text not null,
user text not null
);
CREATE TABLE door (
state int not null,
timestamp text not null
);
COMMIT;
