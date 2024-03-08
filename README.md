# Lasso: urban soundscape cartography

Access Lasso's maps: https://universite-gustave-eiffel.github.io/lasso/

## Edit projects data

Projects data are listed in the `data` folder. One folder for each project.
Please read carefully the [data folder documentation](./data/README.md) which provides examples.

## Architecture

**Serverless**
Lasso is a Single Page Web application with no server.
The data are "compiled" by a node script which prepare everything the web client software needs.

**Maplibre-gl**
Lasso client uses [maplibre-gl](https://maplibre.org/maplibre-gl-js-docs/api/) at its core.
The maps are all rendered through maplibre letting map editor a great flexibility in rendering.

## Deploy

The project is deployed automatically on [github pages](https://universite-gustave-eiffel.github.io/lasso/).

If you need to deploy the project elsewhere, the easiest way to deploy Lasso cartography is to use docker.

```bash
cd docker
docker compose -p Lasso -f docker-compose.yml up
```

## Development

### with node

First you need node and npm. We recommend using [`nvm`](https://github.com/nvm-sh/nvm#install--update-script) to handle node/npm versions.
Once nvm is installed, set up the dev environnement:

```
nvm install 18
nvm use 18
npm i
```

Start the project:

```
npm run start
```

This command starts the dataprep and the client in watch mode. The project is automatically rebuilt/restarted at each file modification.

Once started the project is available at [http://localhost:3000](http://localhost:3000)

### docker

For enhancing the code, one can also use docker to run the stack locally:

```bash
 docker compose -p lasso up
```

The override open access to the client port if needs be to bypass the nginx configuration.

## Internationalization

We use [Transifex](https://www.transifex.com/LAE/lasso-2) to ease translation of the interface.
