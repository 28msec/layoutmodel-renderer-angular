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

Make sure the required scripts are imported in your index.html:
```
<script src="/bower_components/layoutmodel-renderer-angular/app/directive/layoutmodel.js"></script>
<script src="/bower_components/layoutmodel-renderer-angular/app/directive/layoutmodeltemplate.js"></script>
```

Import the LESS file into your own LESS file:
```
@import "/bower_components/layoutmodel-renderer-angular/app/directive/layoutmodel.less";
```

Using the directive in a HTML page looks like that:
```
<div class="preview-style">
   <layoutmodel model="mymodel"
                labelidx="labelidx"
                constraints="constraints"
                truncate="truncate"
                checks="checks"
                headerclick="onheaderclick(header)"
                dataclick="ondataclick(data)">
   </layoutmodel>
</div>
```

The LESS file for the directive predefines 3 styles that can be used to style the report. To use one of them wrap the directive into a DIV element with one of these CSS classes:
* preview-style : Most refined style
* document-style : A style for printing
* plain-style : Simple style for testing

You can override the colors by redefining some or all of the LESS variables defined in app/directive/layoutmodel.less

The directive itself has multiple parameters:
* model : The scope variable containing the JSON model to be layouted.
* labelidx : The index of the labels to be used.
* constraints : Boolean variable. if 'true' slicers are shown, if 'false' slicers are hidden. 
* truncate : Boolean variable. If 'true' text blocks are shortenend.
* checks : Boolean variable. If 'true' validation checks are shown.


