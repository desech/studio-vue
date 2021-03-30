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
vue create my-app
  Preset: Vue 3
  Package: NPM
cd my-app
npm install vue-router
vue add router
  Proceed: yes
  History: yes
npm run serve
```

- Cleanup

```sh
rm -rf node_modules public package-lock.json
cd src
rm -rf assets components views router
```

- open `App.vue` and replace everything with:
```html
  <template>
    <router-view/>
  </template>

  <script>
  export default {
    name: 'App'
  }
  </script>
```

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

- Go to [v3.vuejs.org](https://v3.vuejs.org/guide/introduction.html#what-is-vue-js) to read the documentation.
