#! /bin/bash
# Thank you to:
# http://blog.nategood.com/client-side-certificate-authentication-in-ngi
# http://nategood.com/nodejs-ssl-client-cert-auth-api-rest

# Create the CA Key and Certificate for signing Client Certs
openssl genrsa -aes256 -out ca.key 4096
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt

# Create the Server Key, CSR, and Certificate
openssl genrsa -aes256 -out server.key 1024
openssl req -new -key server.key -out server.csr

# We're self signing our own server cert here.  This is a no-no in production.
openssl x509 -req -days 3650 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt

# Create the Client Key and CSR
openssl genrsa -aes256 -out client.key 1024
openssl req -new -key client.key -out client.csr

# Sign the client certificate with our CA cert.  Unlike signing our own server cert, this is what we want to do.
openssl x509 -req -days 3650 -in client.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out client.crt

# Possibly less secure steps here:
# I don't want to enter the server.key and client.key passphrases every time the software starts.
# Therefore, I will generate an unencrypted copy of the server.key and client.key.

# Back up the old keys:
cp server.key server.key.old
cp client.key client.key.old

# Generate the two unencrypted keys
openssl rsa -in server.key -out server.key
openssl rsa -in client.key -out client.key