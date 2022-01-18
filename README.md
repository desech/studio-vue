# Vue plugin for [Desech Studio](https://www.desech.com/)

[www.desech.com](https://www.desech.com/)

## Install

- In Desech Studio
  - Go to Settings > Plugins > Vue and install it
  - Go to File > Project Settings > Export Code Plugin > set to "Vue"

## Test the vue app

- In Desech Studio add an element to the canvas and Save.
- Every time you save, the vue app files will be copied over to the `_export` folder of your desech project.
- There you can run the following, to test the vue app:

```sh
npm install
npm run serve
```

- Now you can access you vue app at `http://localhost:4200/`
- Every time you save inside Desech Studio, it will push updates to the vue app

## Desech Studio integration

### Vue attributes/properties

- Inside Desech Studio there are 2 places where you can add vue attributes/properties:
  - when you click on a component
  - when you click on an html element in the HTML section > Element properties
- Here you can set any vue specific attributes like `:title`, `@click`, `v-for`, etc.
- If you set a `class` property it will be added to the existing classes set by `Desech Studio`

### Tips

- Anywhere inside text you can write code like `{{user.userId}}` and it will be exported as vue js code.

## Plugin Development

- That's it. Ignore the rest if you don't plan on doing development on this plugin.
- It's also probably best to have `Desech Studio` closed during this step.
- If you plan on helping out with code or extend this plugin, do the following:

```sh
cd "/home/<username>/.config/Desech Studio/plugin"
  - this is the plugins folder of `Desech Studio` on Linux
  - on Mac it's `/home/<username>/Library/Application Support/Desech Studio/plugin`
  - on Windows it's `C:/Users/<username>/AppData/Desech Studio/plugin`
rm -rf desech-studio-vue
  - if you have the vue plugin already install, delete it
git clone git@github.com:desech/studio-vue.git desech-studio-vue
  - you might need to use your own fork of this repo on github
cd desech-studio-vue
sudo npm install -g @vue/cli
npm install --force
cd dist
rm -rf *
vue create my-app
  Preset: Vue 3
  Package: NPM
cd my-app
npm install vue-router
vue add router
  Proceed: yes
  History: yes
npx sb init
- open `.storybook/main.js` and add `staticDirs: ['../public']`
rm -rf node_modules public package-lock.json
cd src
rm -rf assets components views router stories
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


## Desech Studio website

 - [www.desech.com](https://www.desech.com/)
