(function(angular,undefined){
    angular
        .module("listyMod")
        .factory("listy",listyFactory);

    listyFactory.$inject = ["listyComponents"];

    function listyFactory(lc){
        function typeId(){
            return {
                typeId: "listy"
            };
        }

        function extend(source,target){
            Object.getOwnPropertyNames(target).forEach(function(name){
                source[name] = target[name];
            });
        }

        function shallowCopy(source){
            var target = {};

            extend(target,source);
            return target;
        }


        function createForEachCtx(){
            var hostCtx, subCtx;

            function final(value){
                hostCtx.final = true;
                return value;
            }


            subCtx = {
                final: final
            };

            hostCtx = {
                final: false,
                subCtx: subCtx
            };

            return hostCtx;
        }


        function createBaseService(iteratorFactory){
            var service;

            function self(filter,map,sort){
                var listee = service;

                if (arguments.length === 1){
                    map = filter;
                    filter = undefined;
                }

                if (filter){
                    listee = listee.filter(filter);
                }

                if (map){
                    listee = listee.map(map);
                }

                if (sort){
                    listee = listee.sort(sort);
                }
                
                return listee.toArray();
            }

            function toArray(){
                var result, iter;

                result = [];
                iter = iteratorFactory();
                while(iter.next()){
                    result.push(iter.value());
                }
                return result;
            }

            function filter(filter,param){
                var filterOp;

                filterOp = lc.getFilter(lc.argsArray(arguments));

                return listyFromParent(iteratorFactory,{
                    filterOp: filterOp
                })
            }

            function map(map,param){
                var mapOp;

                mapOp = lc.getMap(lc.argsArray(arguments));

                return listyFromParent(iteratorFactory,{
                    projectOp: mapOp
                });
            }

            function reduce(reduceFn,args,first){
                var reduceCtx;
                var iterator;
                var reduceOp;
                var result;
                var forEachCtx;

                reduceCtx = lc.getReduce(lc.argsArray(arguments));
                reduceOp = reduceCtx.reduceOp;
                result = reduceCtx.init;

                iterator = iteratorFactory();
                forEachCtx = createForEachCtx();

                while(iterator.next()){
                    result = reduceOp(result,iterator.value(),iterator.index(),forEachCtx.subCtx);
                    if (forEachCtx.final){
                        break;
                    }
                }

                return result;
            }

            function some(condition){
                var filterOp, innerFactory, iter;

                filterOp = lc.getFilter(condition);

                innerFactory = filterOp ? lc.childIterFactory(iteratorFactory,{
                    filterOp: filterOp
                }) : iteratorFactory;

                iter = innerFactory();

                return iter.next();
            }

            function everyFn(condition){
                var filterOp, iter;

                filterOp = lc.getFilter(condition);

                iter = iteratorFactory();

                while (iter.next()){
                    if (!filterOp(iter.value(),iter.index())){
                        return false;
                    }
                }

                return true;
            }

            function createSet(){
                var hashSet;

                function getKey(keyValue){
                    if (keyValue === undefined){
                        return "undefined";
                    }

                    if (keyValue === null){
                        return "null";
                    }

                    if (keyValue !== keyValue){
                        return "NaN";
                    }

                    return "=>" + String(keyValue);
                }

                function availableAndSet(keyVal){
                    var key = getKey(keyVal);

                    if (hashSet[key]){
                        return false;
                    }

                    hashSet[key] = true;
                    return true;
                }

                function sameKeys(key1,key2){
                    return getKey(key1) === getKey(key2);
                }

                hashSet = {};
                return {
                    availableAndSet: availableAndSet,
                    sameKeys: sameKeys
                }
            }

            function count(){
                var iter,result;

                iter = iteratorFactory();
                result = 0;
                while(iter.next()){
                    result++;
                }
                return result;
            }

            function createIterator(){
                return iteratorFactory();
            }

            function first(map,param){
                var iterator, mapOp, value;

                mapOp = lc.getMap(lc.argsArray(arguments));

                iterator = iteratorFactory();

                if (iterator.next()){
                    value = iterator.value();
                    return mapOp ? mapOp(value,0) : value;
                }

                return undefined;
            }

            function last(map,param){
                var iterator, mapOp, index, value;

                mapOp = lc.getMap(lc.argsArray(arguments));

                iterator = iteratorFactory();

                while (iterator.next()){
                    value = iterator.value();
                    index = iterator.index();
                }

                return index === undefined ?
                    undefined : mapOp ? mapOp(value) : value;
            }

            function sort(sorter,param){
                function createSortIterator(){
                    var targetArray, innerIterator;

                    targetArray = service.toArray();
                    targetArray.sort(sortOp);

                    innerIterator = lc.arrayIterFactory(targetArray);

                    return innerIterator();
                }

                var sortOp;

                sortOp = lc.getSorter(lc.argsArray(arguments));

                return listy(createSortIterator);
            }

            function concat(source){
                var sourceListy, newIterator;

                sourceListy = listy(source);

                newIterator = lc.concatIterFactory(iteratorFactory,sourceListy.createIterator);
                return listy(newIterator);

            }

            service = self;
            extend(service,{
                $typeId: typeId,
                createIterator: createIterator,

                toArray: toArray,
                count: count,
                filter: filter,
                map: map,
                reduce: reduce,
                some: some,
                every: everyFn,
                first: first,
                last: last,
                concat: concat,
                sort: sort
            });

            return service;
        }

        function extendWithArrayFunctions(service,array){

            function toArray(map,params){
                var mapOp, resultArray;

                resultArray = array.slice();

                mapOp = lc.getMap(lc.argsArray(arguments));

                if (mapOp){
                    resultArray = resultArray.map(mapOp);
                }

                return resultArray;
            }

            function last(){
                var result,length, lastIndex;

                length = array.length;

                if (length === 0){
                    return undefined;
                }

                lastIndex = length - 1;
                result = array[lastIndex];

                return result;
            }

            function count(){
                return array.length;
            }

            extend(service,{
                toArray: toArray,
                last: last,
                count: count
            });
        }

        function listyFromParent(innerIterator,config){
            var iteratorFactory = lc.childIterFactory(innerIterator,config);
            return listy(iteratorFactory);
        }


        function listy(source){
            var isArray,iterator,service;

            if (source.$typeId && source.$typeId === typeId){
                return source;
            }

            isArray = angular.isArray(source);
            iterator = isArray ? lc.arrayIterFactory(source) : source;


            service = createBaseService(iterator);
            if (isArray){
                extendWithArrayFunctions(service,source);
            }

            return service;
        }

        return listy;
    }

})(angular);