#!/bin/bash
#
# Generates a self-signed certificate for development.
#

C=${C:-DE}
ST=${ST:-NRW}
L=${L:-Aachen}
O=${O:-LaxarJS}
OU=${OU:-}
CN=${CN:-localhost}

set -e
echo "Generating self-signed certificate"
openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.crt -nodes -days 365 -subj "/C=$C/ST=$ST/L=$L/O=$O/OU=$OU/CN=$CN"
cp server.crt ca.crt
openssl x509 -noout -text -in server.crt
