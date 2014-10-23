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

            function self(map){
                return service.toArray(arguments[0],arguments[1]);
            }

            function toArray(map){
                var result, iter;

                result = [];
                iter = map ? lc.childIterFactory(iteratorFactory, {
                    projectOp: lc.getMap(lc.argsArray(arguments))
                })() : iteratorFactory();
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

            function some(condition,param){
                var filterOp, innerFactory, iter;

                filterOp = lc.getFilter(lc.argsArray(arguments));

                innerFactory = filterOp ? lc.childIterFactory(iteratorFactory,{
                    filterOp: filterOp
                }) : iteratorFactory;

                iter = innerFactory();

                return iter.next();
            }

            function everyFn(condition,param){
                var filterOp, iter;

                filterOp = lc.getFilter(lc.argsArray(arguments));

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

            function hashVal(item){
                return item === undefined ? "undefined"
                    : item === null ? "null"
                    : "val:" + String(item);
            }

            function groupBy(key,group,param){
                var grouper;

                function configFn(){
                    var keys, key, keyHash;

                    function filterOp(item,index){
                        key = grouper.keyMap ? grouper.keyMap(item,index) : item;
                        keyHash = hashVal(key);
                        if (keys[keyHash]){
                            return false;
                        }
                        keys[keyHash] = true;
                        return true;
                    }

                    function breakOp(item,index){
                        return index >= grouper.keyLimitSize;
                    }

                    function projectOp(item,index){
                        function groupFilter(item){
                            var itemKey = grouper.keyMap ? grouper.keyMap(item,index) : item;
                            return hashVal(itemKey) === keyHash;
                        }

                        var groupList =
                            listy(iteratorFactory).filter(groupFilter);

                        if (grouper.groupOp){
                            groupList = grouper.groupOp(groupList);
                        }

                        return {
                            key: grouper.keyProjection ? grouper.keyProjection(item,index) : key,
                            group: groupList
                        };
                    }

                    keys = [];

                    return {
                        filterOp: filterOp,
                        breakOp: grouper.keyLimitSize !== undefined ? breakOp : undefined,
                        projectOp: projectOp
                    };
                }

                grouper = lc.getGrouper(lc.argsArray(arguments));

                return listyFromParent(iteratorFactory,configFn)

            }

            function toGroupArray(keyOp,groupItemMap,groupMap,param){
                var grouper,item,hash,key,groupings,group,keyHash,iter,groupIndex,currentGroupIndex;

                grouper = lc.getArrayGrouper(lc.argsArray(arguments));

                iter = iteratorFactory();
                groupings = [];
                hash = {};
                currentGroupIndex = 0;

                while (iter.next()){
                    item = iter.value();
                    key = grouper.keyMap ? grouper.keyMap(item,iter.index()) : item;
                    keyHash = hashVal(key);
                    groupIndex = hash[keyHash];
                    if (groupIndex === undefined && grouper.keyLimitSize !== undefined && currentGroupIndex === grouper.keyLimitSize){
                        continue;
                    }

                    if (groupIndex === undefined){
                        groupIndex = currentGroupIndex++;
                        hash[keyHash] = groupIndex;
                        group = groupings[groupIndex] = {
                            key: grouper.keyProjection ? grouper.keyProjection(item,groupIndex) : key,
                            group: []
                        };
                    }
                    else{
                        group = groupings[groupIndex];
                    }

                    group.group.push(grouper.groupItemMap ? grouper.groupItemMap(item,group.group.length) : item);
                }

                currentGroupIndex = 0;
                if (grouper.groupMap){
                    for(currentGroupIndex === 0; currentGroupIndex < groupings.length; currentGroupIndex++){
                        group = groupings[currentGroupIndex];
                        groupings[currentGroupIndex] = grouper.groupMap(group,currentGroupIndex);
                    }
                }

                return groupings;
            }

            service = self;
            extend(service,{
                $typeId: typeId,
                createIterator: createIterator,

                toArray: toArray,
                toGroupArray: toGroupArray,

                count: count,
                filter: filter,
                map: map,
                reduce: reduce,
                some: some,
                every: everyFn,
                first: first,
                last: last,
                concat: concat,
                sort: sort,
                groupBy: groupBy

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