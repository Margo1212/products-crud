# Nodejs Project

### https://t2ic0mzgj9.execute-api.eu-north-1.amazonaws.com/prod/products/

# Pre-requisites

- Install [Node.js](https://nodejs.org/en/) version 14.0.0 or above.

# Getting started

- Clone the repository

```
git clone  <git lab template url> <project_name>
```

- Install dependencies

```
cd <project_name>
npm install
```

## Getting TypeScript

Add Typescript to project `npm`.

```
npm install -D typescript
```

## Project Structure

The folder structure of this app is explained below:

| Name | Description |
| ---- | ----------- |

|  
| **node_modules** | Contains all npm dependencies |
| **src** | Contains source code that will be compiled to the dist dir |
|
| \*\*src/api | Handlers define functions to serve various routes.
| |
| package.json | Contains npm dependencies

### Configuring TypeScript compilation

```json
{
  "compilerOptions": {
    "preserveConstEnums": true,
    "strictNullChecks": true,
    "sourceMap": true,
    "allowJs": true,
    "target": "es2017",
    "outDir": ".build",
    "moduleResolution": "node",
    "lib": ["es2017"],
    "rootDir": "./",
    "strict": true,
    "module": "Node16",
    "esModuleInterop": true
  },
  "include": ["**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```