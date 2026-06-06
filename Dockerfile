# Static server for the Orchestration Console design artifacts.
# These are self-contained HTML/CSS mockups — NO backend, NO Neo4j, NO build needed.
# (Fonts/icons load from CDNs, so the running container needs internet to render them.)
FROM nginx:alpine

# serve the repo at the web root (see .dockerignore for what's excluded)
COPY . /usr/share/nginx/html/

EXPOSE 80
# nginx:alpine already runs `nginx -g 'daemon off;'` by default
