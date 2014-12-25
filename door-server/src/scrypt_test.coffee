StringDecoder = require('string_decoder').StringDecoder
scrypt = require('scrypt')
valid = require('validator')

scryptParameters = {"N": 1024, "r": 8, "p": 6}
key = new Buffer("test")
hash = scrypt.kdf(key, scryptParameters, 64)
decode = new StringDecoder('hex')
hex_hash = decode.write(hash.hash)
hex_salt = decode.write(hash.salt)

console.log 'hash is ' + hex_hash
console.log 'salt is ' + hex_salt

salt = new Buffer(hex_salt, "hex")
new_hash = scrypt.kdf(key, scryptParameters, 64, salt)
new_hex_hash = decode.write(new_hash.hash)
new_hex_salt = decode.write(new_hash.salt)

console.log 'hash is ' + new_hex_hash
console.log 'salt is ' + new_hex_salt
