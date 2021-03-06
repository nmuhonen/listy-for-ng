(function(angular,undefined) {
    angular
        .module("listyMod")
        .factory("listyComponents", listyComponentsFactory);
    listyComponentsFactory.$inject = ["$parse"];

    function listyComponentsFactory($parse) {
        var sorterRegEx, groupKeyRegEx;

        function createComponents(letParam) {
            function createComparitors() {
                function standardCompare(item, compare) {
                    if (angular.isString(item) && angular.isString(compare)) {
                        return stringCompare(item, compare);
                    }
                    if (angular.isDate(item) && angular.isDate(compare)) {
                        return dateCompare(item, compare);
                    }
                    return valueCompare(item, compare);
                }

                function dateCompare(item, compare) {
                    var itemDate = new Date(item).getTime(),
                        compareDate = new Date(compare).getTime(),
                        result;

                    result = itemDate < compareDate ? -1 : itemDate > compareDate ? 1 : 0;

                    return result;
                }

                function stringCompare(item, value) {
                    return item.localeCompare(value);
                }

                function valueCompare(item, value) {
                    return item > value ? 1
                        : item < value ? -1
                        : 0;
                }

                function wrapper(comparitor) {
                    function innerComp(item, compare) {
                        function getStatus(value) {
                            return value !== value ? 3 //Nan
                                : value === undefined ? 2
                                : value === null ? 1
                                : exists;
                        }

                        var exists = 0;
                        var itemStatus = getStatus(item);
                        var compareStatus = getStatus(compare);

                        if (itemStatus === exists && compareStatus === exists) {
                            return comparitor(item, compare);
                        }

                        return valueCompare(itemStatus, compareStatus);

                    }

                    return innerComp;
                }

                return {
                    $standard: wrapper(standardCompare),
                    $string: wrapper(stringCompare),
                    $dateCompare: wrapper(dateCompare),
                    $value: wrapper(valueCompare)
                };
            }

            function extend(target, extensions) {
                var prop;

                for (prop in extensions) {
                    if (!extensions.hasOwnProperty(prop)) {
                        continue;
                    }

                    target[prop] = extensions[prop];
                }
            }

            function getLocalsFromParam(param, otherSettings) {
                var locals = {};
                param = param || letParam;

                if (param) {
                    extend(locals, param);
                }

                if (otherSettings) {
                    otherSettings(locals);
                }

                locals.$param = param;

                return locals;
            }

            function getIterLocals(param, otherSettings) {
                var locals = getLocalsFromParam(param, otherSettings);
                locals.$item = undefined;
                locals.$index = undefined;
                return locals;
            }


            function parseSorterExpression(expression) {
                var exp, desc, comparitor, terminated, parsedSet, match;

                exp = 1;
                desc = 2;
                comparitor = 3;
                terminated = 4;

                parsedSet = [];
                sorterRegEx.lastIndex = 0;

                while (true) {
                    match = sorterRegEx.exec(expression);
                    parsedSet.push({
                        exp: match[exp],
                        reverse: match[desc] !== undefined,
                        comparitor: match[comparitor]
                    });

                    if (match[terminated] !== undefined) {
                        break;
                    }
                }

                return parsedSet;
            }

            function createSorterFromSorters(sorters) {
                function sort(item, compare) {
                    var index, length, result;

                    length = sorters.length;
                    for (index = 0; index < length; index++) {
                        result = sorters[index](item, compare);
                        if (result !== 0) {
                            return result;
                        }
                    }

                    return 0;
                }

                return sort;
            }

            function getSorterExpression(args) {
                var expression, param, compare, parsedSorters;

                function extractSorter(config) {
                    var locals, parsedExp, comparitor, compareMap, multiplier;

                    function sorter(item, compare) {
                        var mappedItem, mappedCompare;

                        mappedItem = map(item);
                        mappedCompare = map(compare);

                        return comparitor(mappedItem, mappedCompare) * multiplier;
                    }

                    function map(item) {
                        locals.$item = item;

                        return parsedExp(item, locals);
                    }

                    function getLocals() {
                        var comparitors = createComparitors();

                        function extendLocals(locals) {
                            extend(locals, comparitors);
                            locals.$compare = comparitors;
                        }

                        return  getLocalsFromParam(param, extendLocals);
                    }

                    parsedExp = $parse(config.exp);
                    locals = getLocals();
                    multiplier = config.reverse ? -1 : 1;
                    compareMap = $parse(config.comparitor);
                    comparitor = compareMap(locals);

                    locals.$index = undefined;
                    locals.$item = undefined;
                    comparitor = comparitor || compare.$standard;

                    return sorter;
                }

                expression = args[0];
                param = args[1];
                compare = {};
                angular.extend(compare, createComparitors());

                parsedSorters = parseSorterExpression(expression).map(extractSorter);
                return createSorterFromSorters(parsedSorters);
            }

            function getSorterFunction(args) {
                var func, direction;

                function reverse(item, compare) {
                    return func(item, compare) * -1;
                }

                func = args[0];
                direction = args[1];

                if (direction === "desc") {
                    return reverse;
                }

                return func;
            }

            function getSorterGroup(args) {
                var accumulatedSorters;

                function accumulateConvertedSorter(group) {
                    var p1;

                    p1 = group[0];

                    if (angular.isString(p1)) {
                        return getSorterExpression(group);
                    }

                    if (angular.isFunction(p1)) {
                        return getSorterFunction(group);
                    }

                    if (p1 === null || p1 === undefined) {
                        return getSorterFunction([createComparitors().$standard, group[1]]);
                    }
                }

                accumulatedSorters = args.map(accumulateConvertedSorter);

                return createSorterFromSorters(accumulatedSorters);
            }

            function getSorter(args) {
                var p1;
                p1 = args[0];

                if (angular.isString(p1)) {
                    return getSorterExpression(args);
                }

                if (angular.isFunction(p1)) {
                    return getSorterFunction(args);
                }

                if (p1 === null || p1 === undefined) {
                    return getSorterFunction([createComparitors().$standard, args[1]]);
                }

                if (angular.isArray(p1)) {
                    return getSorterGroup(args);
                }

                return undefined;
            }

            function childIterFactory(innerIteratorFactory, initFunctions) {
                function iterator() {
                    var innerIterator, value, index, next, funcs, filterOp, projectOp, breakOp;

                    function getNext() {
                        next = innerIterator.next();
                        value = innerIterator.value();
                        index = index === undefined ? 0 : index + 1;

                        return next;
                    }

                    function getNext_break() {
                        if (!next) {
                            return false;
                        }

                        next = innerIterator.next();
                        value = innerIterator.value();

                        if (next) {
                            if (breakOp(value, innerIterator.index())) {
                                next = false;
                            }
                            else {
                                index = index === undefined ? 0 : index + 1;
                            }
                        }

                        return next;
                    }


                    function getNext_filter() {
                        if (!next) {
                            return false;
                        }

                        while (next) {
                            next = innerIterator.next();
                            if (next) {
                                value = innerIterator.value();
                                if (filterOp(value, innerIterator.index())) {
                                    break;
                                }
                            }
                        }

                        if (next) {
                            index = index === undefined ? 0 : index + 1;
                        }

                        return next;
                    }


                    function getNext_filter_break() {
                        if (!next) {
                            return false;
                        }

                        while (next) {
                            next = innerIterator.next();
                            if (next) {
                                value = innerIterator.value();
                                if (filterOp(value, innerIterator.index()))
                                    break;
                            }
                        }

                        if (next) {
                            if (breakOp(value, innerIterator.index())) {
                                next = false;
                            }
                            else {
                                index = index === undefined ? 0 : index + 1;
                            }
                        }

                        return next;
                    }

                    function getValue() {
                        if (!next) {
                            return undefined;
                        }

                        return value;
                    }

                    function getProjectedValue() {
                        if (!next) {
                            return undefined;
                        }

                        return projectOp(value, index);
                    }

                    function getIndex() {
                        if (!next) {
                            return undefined;
                        }

                        return index;
                    }


                    funcs = angular.isFunction(initFunctions) ? initFunctions() :
                        angular.isDefined(initFunctions) ? initFunctions :
                        {};
                    filterOp = funcs.filterOp;
                    projectOp = funcs.projectOp;
                    breakOp = funcs.breakOp;
                    next = true;
                    index = undefined;
                    value = undefined;
                    innerIterator = innerIteratorFactory();

                    return {
                        value: projectOp ? getProjectedValue : getValue,
                        next: filterOp && breakOp ? getNext_filter_break
                            : filterOp ? getNext_filter
                            : breakOp ? getNext_break
                            : getNext,
                        index: getIndex
                    };
                }

                return iterator;
            }

            function concatIterFactory(factory1, factory2) {
                function iterator() {
                    var index, next, isFirstIter, iter;

                    function getNext() {
                        if (!next) {
                            return false;
                        }

                        next = iter.next();

                        if (!next && isFirstIter) {
                            iter = factory2();
                            next = iter.next();
                            isFirstIter = false;
                        }

                        if (next) {
                            index = index === undefined ? 0 : index + 1;
                        }

                        return next;
                    }

                    function getValue() {
                        if (!next) {
                            return undefined;
                        }

                        return iter.value();
                    }

                    function getIndex() {
                        if (!next) {
                            return undefined;
                        }

                        return index;
                    }

                    isFirstIter = true;
                    iter = factory1();
                    index = undefined;
                    next = true;

                    return {
                        index: getIndex,
                        value: getValue,
                        next: getNext
                    };
                }

                return iterator;
            }

            function arrayIterFactory(array) {
                function iterator() {
                    var length, index, next;

                    function getNext() {
                        if (!next) {
                            return false;
                        }

                        if (next) {
                            index = index === undefined ? 0 : index + 1;
                        }
                        next = index < length;
                        return next;
                    }

                    function getValue() {
                        if (!next) {
                            return undefined;
                        }
                        return array[index];
                    }

                    function getIndex() {
                        return index;
                    }

                    length = array.length;
                    next = true;
                    index = undefined;

                    return {
                        next: getNext,
                        value: getValue,
                        index: getIndex
                    };
                }

                return iterator;
            }

            function getParsedExpression(args) {
                var parsedExpression, locals, expression, param;

                function extend(value) {
                    return angular.extend({}, locals.$item, value);
                }

                function evaluate(value, index) {
                    var result;

                    locals.$item = value;
                    locals.$index = index;

                    result = parsedExpression(value, locals);
                    return result;
                }

                expression = args[0];
                param = args[1];

                if (!(angular.isDefined(expression) && angular.isString(expression))) {
                    return undefined;
                }

                parsedExpression = $parse(expression);

                locals = getIterLocals(param);
                locals.$extend = extend;

                return evaluate;
            }

            function getExpression(args) {
                var p1;

                p1 = args[0];

                if (angular.isFunction(p1)) {
                    return p1;
                }

                if (angular.isString(p1)) {
                    return getParsedExpression(args);
                }


                return undefined;
            }

            function getFilter(args) {
                return getExpression(args);
            }

            function getMap(args) {
                return getExpression(args);
            }

            function argsArray(argumentsVal) {
                return Array.prototype.slice.call(argumentsVal, 0);
            }

            function getReduce(args) {
                function getReduceExpression(args) {
                    var parsedExpression, locals, prop, expression, param, init;

                    function reduce(result, current, index) {
                        locals.$result = result;
                        locals.$item = current;
                        locals.$index = index;

                        return parsedExpression(current, locals);
                    }

                    expression = args[0];
                    init = args[1];
                    param = args[2];

                    locals = getIterLocals(param);
                    locals.$result = undefined;

                    parsedExpression = $parse(expression);
                    return {
                        reduceOp: reduce,
                        init: init
                    }
                }

                var reduceOp;

                reduceOp = args[0];

                if (angular.isFunction(reduceOp)) {
                    return {
                        reduceOp: reduceOp,
                        init: args[1]
                    };
                }

                if (angular.isString(reduceOp)) {
                    return getReduceExpression(args);
                }
            }


            function parseKeyExpression(expression) {
                var match, keyMatch, projectMatch, limitMatch;

                keyMatch = 1;
                projectMatch = 2;
                limitMatch = 3;

                groupKeyRegEx.lastIndex = 0;

                match = groupKeyRegEx.exec(expression);
                return {
                    mapExpression: match[keyMatch],
                    projectionExpression: match[projectMatch],
                    limitExpression: match[limitMatch]
                }
            }

            function getLimitFromExpression(expression, param) {
                var map, locals, prop;

                map = $parse(expression);

                locals = {};

                for (prop in param) {
                    if (!param.hasOwnProperty(prop)) {
                        continue;
                    }

                    locals[prop] = param[prop];
                }

                locals.$param = param;

                return map(locals);
            }

            function getKeyExpression(args) {
                var expression, param, parsedValues;

                expression = args[0];
                param = args[1];
                parsedValues = parseKeyExpression(expression);

                return {
                    map: parsedValues.mapExpression !== undefined ? getExpression([parsedValues.mapExpression, param]) : undefined,
                    projection: parsedValues.projectionExpression !== undefined ? getExpression([parsedValues.projectionExpression, param]) : undefined,
                    limitSize: parsedValues.limitExpression !== undefined ? getLimitFromExpression(parsedValues.limitExpression, param) : undefined
                };
            }

            function getGroupKey(key, param) {
                var p1;

                if (angular.isString(key)) {
                    return getKeyExpression([key, param]);
                }
                if (angular.isFunction(key)) {
                    return {
                        map: key,
                        projection: undefined,
                        limitSize: undefined
                    };
                }
                if (angular.isArray(key)) {
                    p1 = key[0];
                    if (angular.isString(p1)) {
                        return getKeyExpression(key);
                    }
                    if (angular.isFunction(p1)) {
                        return {
                            map: key[0],
                            projection: key[1],
                            limitSize: key[2]
                        };
                    }
                }
                return {};
            }

            function getGroupOp(args) {
                function groupMap(group) {
                    return group.map(map);
                }

                var p1, map;

                p1 = args[0];

                if (angular.isString(p1)) {
                    map = getParsedExpression(args);
                    return groupMap;
                }
                if (angular.isFunction(p1)) {
                    return p1;
                }
                return undefined;
            }

            function getGrouper(args) {
                var keyOut;

                keyOut = getGroupKey(args[0], args[2]);

                return {
                    keyMap: keyOut.map,
                    keyProjection: keyOut.projection,
                    keyLimitSize: keyOut.limitSize,
                    groupOp: getGroupOp([args[1], args[2]])
                }
            }

            function getArrayGrouper(args) {
                var keyMap, groupItemMap, groupMap, param, keyOut;

                keyMap = args[0];
                groupItemMap = args[1];
                groupMap = args[2];
                param = args[3];

                groupItemMap = angular.isArray(groupItemMap) ? groupItemMap : [groupItemMap, param];
                groupMap = angular.isArray(groupMap) ? groupMap : [groupMap, param];


                keyOut = getGroupKey(keyMap, param);

                return {
                    keyMap: keyOut.map,
                    keyProjection: keyOut.projection,
                    keyLimitSize: keyOut.limitSize,
                    groupItemMap: getMap(groupItemMap),
                    groupMap: getMap(groupMap)
                }
            }

            function getUnique(args) {
                var uniqueOps = getGroupKey(args, null);

                return {
                    keyMap: uniqueOps.map,
                    keyProjection: uniqueOps.projection,
                    keyLimitSize: uniqueOps.limitSize
                };
            }

            function getForEachCtx() {
                var breakValue = {};

                return {
                    subCtx: {
                        break: breakValue
                    },

                    breakValue: breakValue
                };

            }


            function getForEachExpression(args) {
                var locals, param, prop, expression, parsedExpression, cnt, brk;

                function action(item, index, ctx) {
                    var result;

                    locals.$item = item;
                    locals.$index = index;

                    result = parsedExpression(item, locals);

                    if (result === brk) {
                        return ctx.break;
                    }

                    return result;
                }

                cnt = {};
                brk = {};
                expression = args[0];
                param = args[1];

                locals = getIterLocals(param);
                locals.$continue = cnt;
                locals.$break = brk;

                parsedExpression = $parse(expression);

                return action;
            }

            function getForEach(args) {
                if (angular.isFunction(args[0])) {
                    return args[0];
                }

                if (angular.isString(args[0])) {
                    return getForEachExpression(args);
                }

                return undefined;
            }

            function child(param){
                var p1 = letParam;
                if (p1) {
                    extend(p1, param);
                }
                else{
                    p1 = param;
                }
                return createComponents(p1);
            }

            return {
                arrayIterFactory: arrayIterFactory,
                childIterFactory: childIterFactory,
                concatIterFactory: concatIterFactory,
                getFilter: getFilter,
                getMap: getMap,
                getReduce: getReduce,
                getSorter: getSorter,
                getGrouper: getGrouper,
                getArrayGrouper: getArrayGrouper,
                getUnique: getUnique,
                getForEach: getForEach,
                getForEachCtx: getForEachCtx,

                argsArray: argsArray,


                //for testing
                child: child,
                parseSorterExpression: parseSorterExpression,
                createComparitors: createComparitors
            };
        }

        sorterRegEx = /\s*([\s\S]+?)(?:\s+(?:(?:asc)|(desc)))?(?:\s+with\s+([\s\S]+?))?(?:\s*(?:,|($)))/g;
        groupKeyRegEx = /\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+limit\s+([\s\S]+?))?\s*$/g;

        return createComponents;

    }
})(angular);