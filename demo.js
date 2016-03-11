// Angular JS code
(function () {
    'use-strict';

    angular.module('demoApp', ['ds.objectDiff'])
        .config([
          '$interpolateProvider',
            function ($interpolateProvider) {
                return $interpolateProvider.startSymbol('{(').endSymbol(')}');
          }
        ])
        .controller('DemoController', DemoController);

    DemoController.$inject = ['$scope', 'ObjectDiff'];

    function DemoController($scope, ObjectDiff) {
        $scope.objectOne = "{\n" +
            "   a: {\n" +
            "     b: 1,\n" +
            "     c: [1, 2]\n" +
            "   },\n" +
            "   \"2b\": {\n" +
            "     foo: 'bar'\n" +
            "   }\n" +
            " }";
        $scope.objectTwo = "{\n" +
            "   a: { \n" +
            "     b: 2,\n" +
            "     c: [1, 2, 3]\n" +
            "   },\n" +
            "   x: 1\n" +
            " }";


        function makeDiff() {
            var objectOne, objectTwo, diff;
            try {
                $scope.errorA = false;
                objectOne = eval('(' + $scope.objectOne + ')'); //JSON.parse($scope.objectOne);
            } catch (err) {
                $scope.errorA = true;
            }
            try {
                $scope.errorB = false;
                objectTwo = eval('(' + $scope.objectTwo + ')'); //JSON.parse($scope.objectTwo);
            } catch (err) {
                $scope.errorB = true;
            }

            // you can directly diff your objects if they are not string
            diff = ObjectDiff.diffOwnProperties(objectOne, objectTwo);

            $scope.diffValue = ObjectDiff.toJsonView(diff);
            $scope.diffValueChanges = ObjectDiff.toJsonDiffView(diff);

            $scope.yourObjectOne = objectOne;
            $scope.yourObjectTwo = objectTwo;
        }

        $scope.$watch('objectOne', function (newValue, oldValue) {
            makeDiff();
        });
        $scope.$watch('objectTwo', function (newValue, oldValue) {
            makeDiff();
        });
    }

})();
