# Lasso: urban soundscape cartography

Access Lasso's maps: (https://ouestware.github.io/lasso/)[https://ouestware.github.io/lasso/]

## Edit projects data

Projects data are listed in the `data` folder. One folder for each project.
Please read carefully the [data folder documentation](./data/README.md) which provides examples.

## Deploy

The project is deployed automatically on [github pages](https://ouestware.github.io/lasso/).

If you need to deploy the project elsewhere, the easiest way to deploy Lasso cartography is to use docker.

```bash
cd docker
docker compose -p Lasso -f docker-compose.yml up
```

## Development

For enhancing the code, one can also use docker to run the stack locally:

```bash
 docker compose -p lasso up
```

The override open access to the client port if needs be to bypass the nginx configuration.

## Internationalization

We use Transiflex to ease translation of the interface.
