#!/usr/bin/env bash

# Set default prefect_ui_settings if
# env vars not present
if [[ -z ${PREFECT_AUTH_PROXY_URL} ]]
then
    echo "Missing the PREFECT_AUTH_PROXY_URL environment variable.  Using default"
    PREFECT_AUTH_PROXY_URL="http://localhost:4200/graphql"
else
    echo "Using the PREFECT_AUTH_PROXY_URL environment variable: $PREFECT_AUTH_PROXY_URL"
fi

# Replace env vars in files served by NGINX
ROOT_DIR=/var/www
for file in $ROOT_DIR/js/*.js* $ROOT_DIR/index.html $ROOT_DIR/precache-manifest*.js;
do
    sed -i 's|VUE_APP_SERVER_URL_PLACEHOLDER|'${PREFECT_AUTH_PROXY_URL}'|g' $file
done

echo "👾👾👾 UI running at localhost:8080 👾👾👾"

nginx -g "daemon off;"
