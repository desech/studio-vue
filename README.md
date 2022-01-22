# Vue plugin for [Desech Studio](https://www.desech.com/)

[www.desech.com](https://www.desech.com/)

## Install

- In Desech Studio
  - Go to Settings > Plugins > Vue and install it
  - Go to File > Project Settings > Export Code Plugin > set to "Vue"

## Test the vue app

- In Desech Studio add an element and Save.
- Every time you save, the vue app files will be copied over to the `_export` folder of your desech project.
- Know that while `Desech Studio` creates new vue component files and only updates the named sections, it will not cleanup components that you have removed/moved/renamed. This also applies to storybook files. You will have to manually remove the unneeded vue files.
- There you can run the following, to test the vue app:

```sh
npm install --force
export NODE_OPTIONS=--openssl-legacy-provider # linux / mac os only
set NODE_OPTIONS=--openssl-legacy-provider # windows only
npm run serve
```

- Now you can access your vue app at `http://localhost:4200/`
- Every time you save inside Desech Studio, it will push updates to the vue app

## Storybook integration

- Check the [docs](https://storybook.js.org/docs/vue/writing-stories/introduction) for further reading

```sh
export NODE_OPTIONS=--openssl-legacy-provider # linux / mac os only
set NODE_OPTIONS=--openssl-legacy-provider # windows only
npm run storybook
```

- Check the `_export/src/stories` folder for the actual stories

## Desech Studio integration

### Tips

- Anchor links need to follow this format `/contact.html` with a backslash at the beginning and an `.html` extension at the end
  - `<a>` elements are not converted to `<router-link>` because how overrides work. You will have to add your own page history code to the application.
- Anywhere inside text you can write code like `{{user.userId}}` and it will be exported as vue js code. If you don't want that, then add the property [`v-pre`](https://v3.vuejs.org/api/directives.html#v-pre) without a value, to the element.
  - Element attributes and properties are not converted to code. You need to use properties like [`:foo`](https://v3.vuejs.org/api/directives.html#v-bind) to make sure the value is rendered as code.
  - If you add it as a component override, then it will no longer be parsed as code.
  - This happens because when dealing with html text, we use `v-html` and this doesn't render js code inside.
- Inside Desech Studio you can add vue directives in the Programming properties for both elements and components, like `:title`, `@click`, `v-for`, etc.
  - Although we do allow any property name, if you use something like `foo$:@{_` and it obviously throws an error in vue, that's on you to handle.
  - In components, you can't overrides directives like `v-if`, `v-bind:` etc.
- `unrender` uses `v-if`, so you can't have `v-if` of `v-for` with unrendered elements

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

- Now `Desech Studio` will use this git repository for the vue plugin instead of the standard one.
- Warning: Make sure you don't touch the version in the `package.json` file, because Desech Studio will try to upgrade and it will delete everything and re-download the new version of this plugin.
  - Only update the version when you git push everything and you are done with development

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
