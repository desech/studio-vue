# Vue plugin for Desech Studio

## Install

- In Desech Studio
  - Go to Settings > Plugins, search for "Vue" and install it
  - Go to File > Project Settings > Export Code Plugin > set to "Vue"
- Using a design system works with this plugin, because we copy over all the css/js files.

## Test the vue app

- In Desech Studio add an element to the canvas and Save.
- Every time you save, the vue app files will be copied over to the `_export` folder of your desech project.
- There you can run the following, to test the vue app:

```sh
npm install
ng serve --open
```

- Now you can access you vue app at `http://localhost:4200/`
- Every time you save inside Desech Studio, it will push updates to the vue app

## Desech Studio integration

### Vue attributes/properties

- Inside Desech Studio there are 2 places where you can add vue attributes/properties:
  - when you click on a component
  - when you click on an html element in the HTML section > Element properties
- Here you can set any vue specific attributes like `[ngClass]`, `(click)`, `*ngIf`, etc.

### Tips

- Make sure to name your components as verbose as possible. For example instead of `header` use `page-header` because `header` is an actual html tag, and you might create infinite loops.
- Anywhere inside text you can write code like `{{user.userId}}` and it will be exported as vue js code.

- That's it. Ignore the rest if you don't plan on doing development on this plugin.

## Plugin Development

If you plan on helping out with code or extend this plugin, do the following:

- delete everything in the `dist` folder so we can restart the build process

```sh
cd /~/user/.config/Electron/plugin/desech-studio-vue
npm install -g @vue/cli
npm install
cd dist
vue upgrade --next
  Strict Mode: yes
  Routing: yes
  Style: CSS
cd my-app
ng serve --open
rm -rf node_modules public package-lock.json
cd src
rm -rf assets index.html favicon.ico app/app.component.css app/app.module.ts app/app-routing.module.ts
```

- open `vue.json` and replace `"src/assets"` with `"src/asset", "src/font"`
- open `src/app/app.component.html` and delete everything except `<router-outlet></router-outlet>`
- open `src/app/app.component.ts` and delete the `styleUrls: ['./app.component.css']` line

## Included npm packages

All Desech Studio plugins have access to the following npm libraries, because they come with the application:
- `lib.AdmZip` [adm-zip](https://www.npmjs.com/package/adm-zip)
- `lib.archiver` [archiver](https://www.npmjs.com/package/archiver)
- `lib.fse` [fs-extra](https://www.npmjs.com/package/fs-extra)
- `lib.jimp` [jimp](https://www.npmjs.com/package/jimp)
- `lib.beautify` [js-beautify](https://www.npmjs.com/package/js-beautify)
- `lib.jsdom` [jsdom](https://www.npmjs.com/package/jsdom)
- `lib.fetch` [node-fetch](https://www.npmjs.com/package/node-fetch)

## Other Documentation

- Go to [vue.io](https://vue.io/guide/setup-local) to read the documentation.
