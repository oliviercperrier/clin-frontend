#!/bin/bash

envsubst '${DOMAIN}' < /var/www/html/index.html > /var/www/html/index.html

exec "$@"