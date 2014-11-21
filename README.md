layoutmodel-renderer-angular
============================

This repository contains of two parts:
* AngularJS directive for rendering JSON XBRL layoutmodels ( in /app/directive )
* an example app to showcase the directive (in /app )

## Automatic Deployment

The master branch of this repository is automatically deployed to
http://rendering.secxbrl.info/

## To work with the example app:

Checkout this repository execute in the project directory:
```
npm install
bower install
grunt server
```

## To use the directive:

Add
```
 "layoutmodel-renderer-angular": "https://github.com/28msec/layoutmodel-renderer-angular.git"
```
to your bower.json file.

Make sure the required scripts are imported:
```
<script src="/bower_components/layoutmodel-renderer-angular/app/directive/layoutmodel.js"></script>
<script src="/bower_components/layoutmodel-renderer-angular/app/directive/layoutmodeltemplate.js"></script>
```

Import the LESS file into your own LESS file:
```
@import "/bower_components/layoutmodel-renderer-angular/app/directive/layoutmodel.less";
```



