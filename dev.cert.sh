mkdir -p ./certs/client ./certs/api

openssl req -x509 -newkey rsa:4096 -keyout certs/client/key.pem -out certs/client/cert.pem -sha256 -days 365 -nodes -subj "/CN=localhost"
openssl req -x509 -newkey rsa:4096 -keyout certs/api/key.pem -out certs/api/cert.pem -sha256 -days 365 -nodes -subj "/CN=localhost"