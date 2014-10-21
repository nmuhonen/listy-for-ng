(function(angular,undefined) {
    angular
        .module("listyMod")
        .factory("listyComponents", listyComponentsFactory);
    listyComponentsFactory.$inject = ["$parse"];

    function listyComponentsFactory($parse) {
        var sorterRegEx, groupKeyRegEx;

        function createComparitors(){
            function standardCompare(item,compare){
                if (angular.isString(item) && angular.isString(compare)){
                    return stringCompare(item,compare);
                }
                if (angular.isDate(item) && angular.isDate(compare)){
                    return dateCompare(item,compare);
                }
                return valueCompare(item,compare);
            }

            function dateCompare(item,compare){
                var itemDate = new Date(item).getTime(),
                    compareDate = new Date(compare).getTime(),
                    result;

                result = itemDate < compareDate ? -1 : itemDate > compareDate ? 1 : 0;

                return result;
            }

            function stringCompare(item,value){
                return item.localeCompare(value);
            }

            function valueCompare(item,value){
                return item > value ? 1
                    : item < value ? -1
                    : 0;
            }

            function wrapper(comparitor){
                function innerComp(item,compare){
                    function getStatus(value){
                        return value !== value ? 3 //Nan
                            : value === undefined ? 2
                            : value === null ? 1
                            : exists;
                    }

                    var exists = 0;
                    var itemStatus = getStatus(item);
                    var compareStatus = getStatus(compare);

                    if (itemStatus === exists && compareStatus === exists){
                        return comparitor(item,compare);
                    }

                    return valueCompare(itemStatus,compareStatus);

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

        function parseSorterExpression(expression){
            var exp, desc, comparitor, terminated, parsedSet,match;

            exp = 1;
            desc = 2;
            comparitor = 3;
            terminated = 4;

            parsedSet = [];
            sorterRegEx.lastIndex = 0;

            while(true){
                match = sorterRegEx.exec(expression);
                parsedSet.push({
                    exp: match[exp],
                    reverse: match[desc] !== undefined,
                    comparitor: match[comparitor]
                });

                if (match[terminated] !== undefined){
                    break;
                }
            }

            return parsedSet;
        }

        function createSorterFromSorters(sorters){
            function sort(item,compare){
                var index, length,result;

                length = sorters.length;
                for(index = 0; index < length; index++){
                    result = sorters[index](item,compare);
                    if (result !== 0){
                        return result;
                    }
                }

                return 0;
            }

            return sort;
        }

        function getSorterExpression(args){
            var expression,param,compare,parsedSorters;

            function extractSorter(config){
                var locals, parsedExp, comparitor, compareMap, multiplier;

                function sorter(item,compare){
                    var mappedItem, mappedCompare;

                    mappedItem = map(item);
                    mappedCompare= map(compare);

                    return comparitor(mappedItem,mappedCompare) * multiplier;
                }

                function map(item){
                    locals.$item = item;

                    return parsedExp(item,locals);
                }

                function getLocals(){
                    var locals = {};
                    var comparitors = createComparitors();
                    var prop;

                    for(prop in param){
                        if (!param.hasOwnProperty(prop)){
                            continue;
                        }

                        locals[prop] = param[prop];
                    }

                    for(prop in comparitors){
                        if (!comparitors.hasOwnProperty(prop)){
                            continue;
                        }

                        locals[prop] = comparitors[prop];
                    }

                    locals.$param = param;
                    locals.$compare = comparitors;

                    return locals;
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
            compare = args[2];

            compare = compare || {};
            angular.extend(compare,createComparitors());

            parsedSorters = parseSorterExpression(expression).map(extractSorter);
            return createSorterFromSorters(parsedSorters);
        }

        function getSorterFunction(args){
            var func, direction;

            function reverse(item,compare){
                return func(item,compare) * -1;
            }

            func = args[0];
            direction = args[1];

            if (direction === "desc"){
                return reverse;
            }

            return func;
        }

        function getSorterGroup(args){
            var accumulatedSorters;

            function accumulateConvertedSorter(group){
                var p1;

                p1 = group[0];

                if (angular.isString(p1)){
                    return getSorterExpression(group);
                }

                if (angular.isFunction(p1)){
                    return getSorterFunction(group);
                }

                if (p1 === null || p1 === undefined){
                    return getSorterFunction([createComparitors().$standard,group[1]]);
                }
            }

            accumulatedSorters = args.map(accumulateConvertedSorter);

            return createSorterFromSorters(accumulatedSorters);
        }

        function getSorter(args){
            var p1;
            p1 = args[0];

            if (angular.isString(p1)){
                return getSorterExpression(args);
            }

            if (angular.isFunction(p1)){
                return getSorterFunction(args);
            }

            if (p1 === null || p1 === undefined){
                return getSorterFunction([createComparitors().$standard,args[1]]);
            }

            if (angular.isArray(p1)){
                return getSorterGroup(args);
            }

            return undefined;
        }

        function childIterFactory(innerIteratorFactory,initFunctions){
            function iterator(){
                var innerIterator,value,index,next,funcs,filterOp,projectOp,breakOp;

                function getNext(){
                    next = innerIterator.next();
                    value = innerIterator.value();
                    index = index === undefined ? 0 : index + 1;

                    return next;
                }

                function getNext_break(){
                    if (!next){
                        return false;
                    }

                    next = innerIterator.next();
                    value = innerIterator.value();

                    if (next){
                        if (breakOp(value,innerIterator.index())){
                            next = false;
                        }
                        else{
                            index = index === undefined ? 0 : index + 1;
                        }
                    }

                    return next;
                }


                function getNext_filter(){
                    if (!next){
                        return false;
                    }

                    while(next){
                        next = innerIterator.next();
                        if (next){
                            value = innerIterator.value();
                            if (filterOp(value,innerIterator.index())) {
                                break;
                            }
                        }
                    }

                    if (next){
                        index = index === undefined ? 0 : index + 1;
                    }

                    return next;
                }


                function getNext_filter_break(){
                    if (!next){
                        return false;
                    }

                    while(next){
                        next = innerIterator.next();
                        if (next){
                            value = innerIterator.value();
                            if (filterOp(value,innerIterator.index()))
                                break;
                        }
                    }

                    if (next){
                        if (breakOp(value,innerIterator.index())){
                            next = false;
                        }
                        else{
                            index = index === undefined ? 0 : index + 1;
                        }
                    }

                    return next;
                }

                function getValue(){
                    if (!next){
                        return undefined;
                    }

                    return value;
                }

                function getProjectedValue(){
                    if (!next){
                        return undefined;
                    }

                    return projectOp(value,index);
                }

                function getIndex(){
                    if (!next){
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

        function concatIterFactory(factory1,factory2){
            function iterator(){
                var index, next, isFirstIter, iter;

                function getNext(){
                    if (!next){
                        return false;
                    }

                    next = iter.next();

                    if (!next && isFirstIter){
                        iter = factory2();
                        next = iter.next();
                        isFirstIter = false;
                    }

                    if (next){
                        index = index === undefined ? 0 : index + 1;
                    }

                    return next;
                }

                function getValue(){
                    if (!next){
                        return undefined;
                    }

                    return iter.value();
                }

                function getIndex(){
                    if (!next){
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

        function arrayIterFactory(array){
            function iterator(){
                var length,index,next;

                function getNext(){
                    if (!next){
                        return false;
                    }

                    if (next){
                        index = index === undefined ? 0 : index + 1;
                    }
                    next = index < length;
                    return next;
                }

                function getValue(){
                    if (!next){
                        return undefined;
                    }
                    return array[index];
                }

                function getIndex(){
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

        function getParsedExpression(args){
            var parsedExpression,locals,expression,param;

            function extend(value){
                return angular.extend({},locals.$item,value);
            }



            function evaluate(value,index){
                var result;

                locals.$item =  value;
                locals.$index = index;

                result = parsedExpression(value,locals);
                return result;
            }

            expression = args[0];
            param = args[1];

            if (!(angular.isDefined(expression) && angular.isString(expression))){
                return undefined;
            }

            parsedExpression = $parse(expression);

            locals = {};
            for(var prop in param){
                if (!param.hasOwnProperty(prop)){
                    continue;
                }

                locals[prop] = param[prop];
            };

            locals.$param = param;
            locals.$index = undefined;
            locals.$item = undefined;
            locals.$extend = extend;

            return evaluate;
        }

        function getExpression(args){
            var p1;

            p1 = args[0];

            if (angular.isFunction(p1)){
                return p1;
            }

            if (angular.isString(p1)){
                return getParsedExpression(args);
            }


            return undefined;
        }

        function getFilter(args){
            return getExpression(args);
        }

        function getMap(args){
            return getExpression(args);
        }

        function argsArray(argumentsVal){
            return Array.prototype.slice.call(argumentsVal,0);
        }

        function getReduce(args){
            function getReduceExpression(args){
                var parsedExpression, locals, prop, expression, param, init;

                function reduce(result,current,index){
                    locals.$result = result;
                    locals.$item =  current;
                    locals.$index = index;

                    return parsedExpression(current,locals);
                }

                expression = args[0];
                init = args[1];
                param = args[2];

                locals = {};

                for(prop in param){
                    if (!param.hasOwnProperty(prop)){
                        continue;
                    }

                    locals[prop] = param[prop];
                }


                locals.$param = param;

                parsedExpression = $parse(expression);
                return {
                    reduceOp: reduce,
                    init: init
                }
            }

            var reduceOp;

            reduceOp = args[0];

            if (angular.isFunction(reduceOp)){
                return {
                    reduceOp: reduceOp,
                    init: args[1]
                };
            }

            if (angular.isString(reduceOp)){
                return getReduceExpression(args);
            }
        }

        sorterRegEx = /\s*([\s\S]+?)(?:\s+(?:(?:asc)|(desc)))?(?:\s+with\s+([\s\S]+?))?(?:\s*(?:,|($)))/g;
        groupKeyRegEx = /\s*([\s\S]+?)(\s+(?:(?:asc)|(desc)))?(?:\s+with\s+([\s\S]+?))?(?:\s+as\s+([\s\S]+?))?\s*$/g;

        return {
            arrayIterFactory: arrayIterFactory,
            childIterFactory: childIterFactory,
            concatIterFactory: concatIterFactory,
            getFilter: getFilter,
            getMap: getMap,
            getReduce: getReduce,
            getSorter: getSorter,
            argsArray: argsArray,

            //for testing
            parseSorterExpression: parseSorterExpression,
            createComparitors: createComparitors
        };

    }
})(angular);