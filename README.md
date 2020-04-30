# Important: How to live reload markdown files

Right now, because they are being moved to a separate build file, markdown files will not automatically reload on save. The way around this is to modify the 'path' value of the Docusuarus docs preset to be the parent folder of the file you're editing. So if you are editing lips, change it to 'lips', if you're editing a doc, change it to 'docs'. This way docusuarus will source directly from that folder, and you can live reload during development. Don't forget to change it back!

# Website

This website is built using [Docusaurus 2](https://v2.docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and open up a browser window. Most changes are reflected live without having to restart the server.


### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

```
$ GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
