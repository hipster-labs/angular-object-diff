(function () {
    'use strict';

    angular
        .module('ds.objectDiff', [])
        .factory('ObjectDiff', objectDiff)
        .filter('toJsonView', toJsonViewFilter)
        .filter('toJsonDiffView', toJsonDiffViewFilter)
        .filter('objToJsonView', objToJsonViewFilter);

    objectDiff.$inject = ['$sce'];
    toJsonViewFilter.$inject = ['ObjectDiff'];
    toJsonDiffViewFilter.$inject = ['ObjectDiff'];
    objToJsonViewFilter.$inject = ['ObjectDiff'];

    /* service implementation */
    function objectDiff($sce) {

        var openChar = '{',
            closeChar = '}',
            service = {
                setOpenChar: setOpenChar,
                setCloseChar: setCloseChar,
                diff: diff,
                diffOwnProperties: diffOwnProperties,
                toJsonView: formatToJsonXMLString,
                objToJsonView: formatObjToJsonXMLString,
                toJsonDiffView: formatChangesToXMLString
            };

        return service;


        /* service methods */

        /**
         * @param char
         */
        function setOpenChar(char) {
            openChar = char;
        }

        /**
         * @param char
         */
        function setCloseChar(char) {
            closeChar = char;
        }

        /**
         * diff between object a and b
         * @param {Object} a
         * @param {Object} b
         * @param shallow
         * @param isOwn
         * @return {Object}
         */
        function diff(a, b, shallow, isOwn) {

            if (a === b) {
                return equalObj(a);
            }

            var diffValue = {};
            var equal = true;

            for (var key in a) {
                if ((!isOwn && key in b) || (isOwn && typeof b != 'undefined' && b.hasOwnProperty(key))) {
                    if (a[key] === b[key]) {
                        diffValue[key] = equalObj(a[key]);
                    } else {
                        if (!shallow && isValidAttr(a[key], b[key])) {
                            var valueDiff = diff(a[key], b[key], shallow, isOwn);
                            if (valueDiff.changed == 'equal') {
                                diffValue[key] = equalObj(a[key]);
                            } else {
                                equal = false;
                                diffValue[key] = valueDiff;
                            }
                        } else {
                            equal = false;
                            diffValue[key] = {
                                changed: 'primitive change',
                                removed: a[key],
                                added: b[key]
                            }
                        }
                    }
                } else {
                    equal = false;
                    diffValue[key] = {
                        changed: 'removed',
                        value: a[key]
                    }
                }
            }

            for (key in b) {
                if ((!isOwn && !(key in a)) || (isOwn && typeof a != 'undefined' && !a.hasOwnProperty(key))) {
                    equal = false;
                    diffValue[key] = {
                        changed: 'added',
                        value: b[key]
                    }
                }
            }

            if (equal) {
                return equalObj(a);
            } else {
                return {
                    changed: 'object change',
                    value: diffValue
                }
            }
        }


        /**
         * diff between object a and b own properties only
         * @param {Object} a
         * @param {Object} b
         * @return {Object}
         * @param deep
         */
        function diffOwnProperties(a, b, shallow) {
            return diff(a, b, shallow, true);
        }

        /**
         * Convert to a readable xml/html Json structure
         * @param {Object} changes
         * @return {string}
         * @param shallow
         */
        function formatToJsonXMLString(changes, shallow) {
            var properties = [];

            var diff = changes.value;
            if (changes.changed == 'equal') {
                return $sce.trustAsHtml(inspect(diff, shallow));
            }

            for (var key in diff) {
                properties.push(formatChange(key, diff[key], shallow));
            }

            return $sce.trustAsHtml('<span>' + openChar + '</span>\n<div class="diff-level">' + properties.join('<span>,</span>\n') + '\n</div><span>' + closeChar + '</span>');

        }

        /**
         * Convert to a readable xml/html Json structure
         * @return {string}
         * @param obj
         * @param shallow
         */
        function formatObjToJsonXMLString(obj, shallow) {
            return $sce.trustAsHtml(inspect(obj, shallow));
        }

        /**
         * Convert to a readable xml/html Json structure
         * @param {Object} changes
         * @return {string}
         * @param shallow
         */
        function formatChangesToXMLString(changes, shallow) {
            var properties = [];

            if (changes.changed == 'equal') {
                return '';
            }

            var diff = changes.value;

            for (var key in diff) {
                var changed = diff[key].changed;
                if (changed !== 'equal')
                    properties.push(formatChange(key, diff[key], shallow, true));
            }

            return $sce.trustAsHtml('<span>' + openChar + '</span>\n<div class="diff-level">' + properties.join('<span>,</span>\n') + '\n</div><span>' + closeChar + '</span>');

        }

        /**
         * @param obj
         * @returns {{changed: string, value: *}}
         */
        function equalObj(obj) {
            return {
                changed: 'equal',
                value: obj
            }
        }

        /**
         * @param a
         * @param b
         * @returns {*|boolean}
         */
        function isValidAttr(a, b) {
            var typeA = typeof a;
            var typeB = typeof b;
            return (a && b && (typeA == 'object' || typeA == 'function') && (typeB == 'object' || typeB == 'function'));
        }

        /**
         * @param key
         * @param diffItem
         * @returns {*}
         * @param shallow
         * @param diffOnly
         */
        function formatChange(key, diffItem, shallow, diffOnly) {
            var changed = diffItem.changed;
            var property;
            switch (changed) {
                case 'equal':
                    property = (stringifyObjectKey(escapeHTML(key)) + '<span>: </span>' + inspect(diffItem.value));
                    break;

                case 'removed':
                    property = ('<del class="diff">' + stringifyObjectKey(escapeHTML(key)) + '<span>: </span>' + inspect(diffItem.value) + '</del>');
                    break;

                case 'added':
                    property = ('<ins class="diff">' + stringifyObjectKey(escapeHTML(key)) + '<span>: </span>' + inspect(diffItem.value) + '</ins>');
                    break;

                case 'primitive change':
                    var prefix = stringifyObjectKey(escapeHTML(key)) + '<span>: </span>';
                    property = (
                    '<del class="diff diff-key">' + prefix + inspect(diffItem.removed) + '</del><span>,</span>\n' +
                    '<ins class="diff diff-key">' + prefix + inspect(diffItem.added) + '</ins>');
                    break;

                case 'object change':
                    property = shallow ? '' : (stringifyObjectKey(key) + '<span>: </span>' + ( diffOnly ? formatChangesToXMLString(diffItem) : formatToJsonXMLString(diffItem)));
                    break;
            }

            return property;
        }

        /**
         * @param {string} key
         * @return {string}
         */
        function stringifyObjectKey(key) {
            return /^[a-z0-9_$]*$/i.test(key) ?
                key :
                JSON.stringify(key);
        }

        /**
         * @param {string} string
         * @return {string}
         */
        function escapeHTML(string) {
            return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        /**
         * @param {Object} obj
         * @return {string}
         * @param shallow
         */
        function inspect(obj, shallow) {

            return _inspect('', obj, shallow);

            /**
             * @param {string} accumulator
             * @param {object} obj
             * @see http://jsperf.com/continuation-passing-style/3
             * @return {string}
             * @param shallow
             */
            function _inspect(accumulator, obj, shallow) {
                switch (typeof obj) {
                    case 'object':
                        if (!obj) {
                            accumulator += 'null';
                            break;
                        }
                        if (shallow) {
                            accumulator += '[object]';
                            break;
                        }
                        var keys = Object.keys(obj);
                        var length = keys.length;
                        if (length === 0) {
                            accumulator += '<span>' + openChar + closeChar + '</span>';
                        } else {
                            accumulator += '<span>' + openChar + '</span>\n<div class="diff-level">';
                            for (var i = 0; i < length; i++) {
                                var key = keys[i];
                                accumulator = _inspect(accumulator + stringifyObjectKey(escapeHTML(key)) + '<span>: </span>', obj[key]);
                                if (i < length - 1) {
                                    accumulator += '<span>,</span>\n';
                                }
                            }
                            accumulator += '\n</div><span>' + closeChar + '</span>'
                        }
                        break;

                    case 'string':
                        accumulator += JSON.stringify(escapeHTML(obj));
                        break;

                    case 'undefined':
                        accumulator += 'undefined';
                        break;

                    default:
                        accumulator += escapeHTML(String(obj));
                        break;
                }
                return accumulator;
            }
        }
    }

    /* filter implementation */
    function toJsonViewFilter(ObjectDiff) {
        return function (value) {
            return ObjectDiff.toJsonView(value);
        };
    }

    function toJsonDiffViewFilter(ObjectDiff) {
        return function (value) {
            return ObjectDiff.toJsonDiffView(value);
        };
    }

    function objToJsonViewFilter(ObjectDiff) {
        return function (value) {
            return ObjectDiff.objToJsonView(value);
        };
    }
})();
