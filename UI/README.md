# Monsta FTP

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build project for production deployment

Check the environment.prod.ts for your production settings
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


## Environment required

NodeJS 14.*.* 
NPM 6..14.8

## Build project for production deployment

Check the environment.prod.ts for your production settings
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Deploy the angular server

Unzip the angular-server.zip file then do the following commands

`cd angular-server`
`npm install`
`npm run build`
`cd dist`
`mkdir fe`

After then you copy The build artifacts you have built in step above ## Build project for production deployment
to the `fe` folder just created.

Then run the following command to run the angular server, it will serve the port 9000 as default.

`node app.js`


