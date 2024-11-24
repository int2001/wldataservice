# wldata

you may adjust the basePath at config.js

## Run as docker-service:

`docker run -d --name wldata -p 80:80 ghcr.io/int2001/wldataservice:latest`

put behind your favourite loadbalancer (haproxy / traefik / whatever)

## Run local
To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.js
```
