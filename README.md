# A Barebones Notion Clone

A React Typescript project built by [Brian Nguyen](https://notbriann.com).

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Overview

This is a frontend application consisting of React + Typescript that is meant to replicate some features of Notion.

It uses `react-contenteditable` to handle some of the lower level functions of `ContentEditable` 

The data structure was mostly modelled after [Notions actual data model.](https://www.notion.so/blog/data-model-behind-notion)

### Features

* Create new lines by pressing `Enter`
* Edit existing text and delete lines
* Indent lines with `Tab` and `Shift+Tab`
* Shift focus up and down with arrow keys


## Consuming for local development

You will need `Node` installed.

1. Clone the repo and navigate into it

```
$ git clone https://github.com/notbrian/barebones-notion-clone.git
$ cd barebones-notion-clone
```

2. Install dependencies

```
npm install
```
3. Launch development server

```
npm start
```
The page will reload if you make edits.\
You will also see any lint errors in the console.

4. It should open automatically, but if not access the site at: http://localhost:3000/


## Consuming for local production

Perform the same steps as above but run `npm run build` instead. This will build the frontend (`npm run build`) to the `build` folder which then can be served lwith `serve -s build` or through your favorite server.

The app will be served at http://localhost:3000/

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in the interactive watch mode.\

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.
