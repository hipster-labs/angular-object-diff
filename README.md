# angular-diff
An Angular JS plugin to compare and show object differences in JSON format. [Demo](http://hipster-labs.github.io/angular-object-diff/)

![Screenshot](/screenshot.png)
# Installation

with bower
```
bower install angular-object-diff --save
```

```
<link type="text/css" href="bower_components/dist/angular-object-diff.css" rel='stylesheet'>
<script type="text/javascript" src="bower_components/dist/angular-object-diff.js"></script>
```

or with npm
```
npm i angular-object-diff
```

# Available methods on `ObjectDiff` service


`setOpenChar`: set the opening character for the view, default is `{`

`setCloseChar`: set the closing character for the view, default is `}`

`diff`: compare and build all the difference of two objects including prototype properties

`diffOwnProperties`: compare and build the difference of two objects taking only its own properties into account

`toJsonView`: format a diff object to a full JSON formatted object view

`toJsonDiffView`: format a diff object to a JSON formatted view with only changes

`objToJsonView`: format any javascript object to a JSON formatted view


# Available filters

`toJsonView`: format a diff object to a full JSON formatted object view

`toJsonDiffView`: format a diff object to a JSON formatted view with only changes

`objToJsonView`: format any javascript object to a JSON formatted view


# Usage

Declare the dependency
```
angular.module('myModule', ['ds.objectDiff']);

```

Inject the service

```javascript
angular.module('myModule')
    .controller('MyController', ['$scope', 'ObjectDiff', function($scope, ObjectDiff){
        $scope.yourObjectOne = {//all your object attributes and values here};
        $scope.yourObjectTwo = {//all your object attributes and values here};

        // This is required only if you want to show a JSON formatted view of your object without using a filter
        $scope.yourObjectOneJsonView = ObjectDiff.objToJsonView($scope.yourObjectOne);
        $scope.yourObjectTwoJsonView = ObjectDiff.objToJsonView($scope.yourObjectTwo);

        // you can directly diff your objects js now or parse a Json to object and diff
        var diff = ObjectDiff.diffOwnProperties($scope.yourObjectOne, $scope.yourObjectTwo);
        
        // you can directly diff your objects including prototype properties and inherited properties using `diff` method
        var diffAll = ObjectDiff.diff($scope.yourObjectOne, $scope.yourObjectTwo);

        // gives a full object view with Diff highlighted
        $scope.diffValue = ObjectDiff.toJsonView(diff);
        
        // gives object view with onlys Diff highlighted
        $scope.diffValueChanges = ObjectDiff.toJsonDiffView(diff);
    
    }]);
```

Bind the variables directly in your html using the `ng-bind-html` angular directive.
Use a `<pre>` element for better results

```html
<pre ng-bind-html="diffValue"></pre>
<pre ng-bind-html="diffValueChanges"></pre>
<pre ng-bind-html="yourObjectOneJsonView"></pre>
<pre ng-bind-html="yourObjectTwoJsonView"></pre>
```

The same can be done with filters as well

```javascript
angular.module('myModule')
    .controller('MyController', ['$scope', 'ObjectDiff', function($scope, ObjectDiff){
        $scope.yourObjectOne = {//all your object attributes and values here};
        $scope.yourObjectTwo = {//all your object attributes and values here};

        // you can directly diff your objects js now or parse a Json to object and diff
        var diff = ObjectDiff.diffOwnProperties($scope.yourObjectOne, $scope.yourObjectTwo);
        
        // you can directly diff your objects including prototype properties and inherited properties using `diff` method
        var diffAll = ObjectDiff.diff($scope.yourObjectOne, $scope.yourObjectTwo);
    
    }]);
```

Bind the variables directly in your html using the `ng-bind-html` angular directive.
Use a `<pre>` element for better results

```html
<pre ng-bind-html="diffValue | toJsonView"></pre>
<pre ng-bind-html="diffValueChanges | toJsonDiffView"></pre>
<pre ng-bind-html="yourObjectOneJsonView | objToJsonView"></pre>
<pre ng-bind-html="yourObjectTwoJsonView | objToJsonView"></pre>
```

Inspired from https://github.com/NV/objectDiff.js
