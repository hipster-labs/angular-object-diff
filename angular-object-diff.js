(function () {
    'use strict';

    angular
        .module('ds.objectDiff', [])
        .factory('ObjectDiff', objectDiff);

    /* service implementation */
    function objectDiff() {
        var service = {
            diff: diff,
            diffOwnProperties: diffOwnProperties,
            toJsonView: formatToJsonXMLString,
            objToJsonView: formatObjToJsonXMLString,
            toJsonDiffView: formatChangesToXMLString
        };
        return service;

        /* service methods */

        /**
         * diff between object a and b
         * @param {Object} a
         * @param {Object} b
         * @param isOwn
         * @return {Object}
         */
        function diff(a, b, isOwn) {

            if (a === b) {
                return equalObj(a);
            }

            var diffValue = {};
            var equal = true;

            for (var key in a) {
                if ((!isOwn && key in b) || (isOwn && b.hasOwnProperty(key))) {
                    if (a[key] === b[key]) {
                        diffValue[key] = equalObj(a[key]);
                    } else {
                        if (isValidAttr(a[key], b[key])) {
                            var valueDiff = diff(a[key], b[key], isOwn);
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
                if ((!isOwn && !(key in a)) || (isOwn && !a.hasOwnProperty(key))) {
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
         */
        function diffOwnProperties(a, b) {
            return diff(a, b, true);
        }

        /**
         * Convert to a readable xml/html Json structure
         * @param {Object} changes
         * @return {string}
         */
        function formatToJsonXMLString(changes) {
            var properties = [];

            var diff = changes.value;
            if (changes.changed == 'equal') {
                return inspect(diff);
            }

            for (var key in diff) {
                properties.push(formatChange(key, diff[key]));
            }

            return '<span>{</span>\n<div class="diff-level">' + properties.join('<span>,</span>\n') + '\n</div><span>}</span>';

        }

        /**
         * Convert to a readable xml/html Json structure
         * @return {string}
         * @param obj
         */
        function formatObjToJsonXMLString(obj) {
            return inspect(obj);
        }

        /**
         * Convert to a readable xml/html Json structure
         * @param {Object} changes
         * @return {string}
         */
        function formatChangesToXMLString(changes) {
            var properties = [];

            if (changes.changed == 'equal') {
                return '';
            }

            var diff = changes.value;

            for (var key in diff) {
                var changed = diff[key].changed;
                if (changed !== 'equal')
                    properties.push(formatChange(key, diff[key], true));
            }

            return '<span>{</span>\n<div class="diff-level">' + properties.join('<span>,</span>\n') + '\n</div><span>}</span>';

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
         */
        function formatChange(key, diffItem, diffOnly) {
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
                    property = (stringifyObjectKey(key) + '<span>: </span>' + ( diffOnly ? formatChangesToXMLString(diffItem) : formatToJsonXMLString(diffItem)));
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
         */
        function inspect(obj) {

            return _inspect('', obj);

            /**
             * @param {string} accumulator
             * @param {object} obj
             * @see http://jsperf.com/continuation-passing-style/3
             * @return {string}
             */
            function _inspect(accumulator, obj) {
                switch (typeof obj) {
                    case 'object':
                        if (!obj) {
                            accumulator += 'null';
                            break;
                        }
                        var keys = Object.keys(obj);
                        var length = keys.length;
                        if (length === 0) {
                            accumulator += '<span>{}</span>';
                        } else {
                            accumulator += '<span>{</span>\n<div class="diff-level">';
                            for (var i = 0; i < length; i++) {
                                var key = keys[i];
                                accumulator = _inspect(accumulator + stringifyObjectKey(escapeHTML(key)) + '<span>: </span>', obj[key]);
                                if (i < length - 1) {
                                    accumulator += '<span>,</span>\n';
                                }
                            }
                            accumulator += '\n</div><span>}</span>'
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
})();
