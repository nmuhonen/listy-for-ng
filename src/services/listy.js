(function(angular,undefined){
    angular
        .module("listyMod")
        .factory("listy",listyFactory);

    listyFactory.$inject = ["listyComponents"];

    function listyFactory(listyComponents){
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


        function createBaseService(iteratorFactory,lc){
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
                },lc)
            }

            function map(map,param){
                var mapOp;

                mapOp = lc.getMap(lc.argsArray(arguments));

                return listyFromParent(iteratorFactory,{
                    projectOp: mapOp
                },lc);
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

                return listyFact(createSortIterator,lc);
            }

            function concat(source){
                var sourceListy, newIterator;

                sourceListy = listyFact(source,lc);

                newIterator = lc.concatIterFactory(iteratorFactory,sourceListy.createIterator);
                return listyFact(newIterator,lc);

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
                            listyFact(iteratorFactory,lc).filter(groupFilter);

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

                return listyFromParent(iteratorFactory,configFn,lc)

            }

            function letFn(params){
                return listyFact(iteratorFactory,lc.child(params));
            }

            function unique(keyOp,param){
                var uniqueOps;

                function childIterFactory(){
                    var hash;

                    function filter(item,index){
                        var key, keyHash;

                        key = uniqueOps.keyMap ? uniqueOps.keyMap(item,index) : item;
                        keyHash = hashVal(key);
                        if (!hash[keyHash]){
                            hash[keyHash] = true;
                            return true;
                        }
                        return false;
                    }

                    function project(item,index){
                        return uniqueOps.keyProjection(item,index);
                    }

                    function breakOp(item,index){
                        return index >= uniqueOps.keyLimitSize;
                    }

                    hash = {};

                    return {
                        filterOp: filter,
                        projectOp: uniqueOps.keyProjection ? project : undefined,
                        breakOp: uniqueOps.keyLimitSize !== undefined ? breakOp : undefined
                    };
                }

                uniqueOps = lc.getUnique(lc.argsArray(arguments));

                return listyFromParent(iteratorFactory,childIterFactory,lc);
            }

            function uniqueSet(keyOp,param){
                var uniqueOps;

                function childIterFactory(){
                    var hash,key;

                    function filter(item,index){
                        var keyHash;

                        key = uniqueOps.keyMap ? uniqueOps.keyMap(item,index) : item;
                        keyHash = hashVal(key);
                        if (!hash[keyHash]){
                            hash[keyHash] = true;
                            return true;
                        }
                        return false;
                    }

                    function project_key(){
                        return key;
                    }

                    function project_keyProjection(item,index){
                        return uniqueOps.keyProjection(item,index);
                    }

                    function breakOp(item,index){
                        return index >= uniqueOps.keyLimitSize;
                    }

                    hash = {};

                    return {
                        filterOp: filter,
                        projectOp: uniqueOps.keyProjection ? project_keyProjection : project_key,
                        breakOp: uniqueOps.keyLimitSize !== undefined ? breakOp : undefined
                    };
                }

                uniqueOps = lc.getUnique(lc.argsArray(arguments));

                return listyFromParent(iteratorFactory,childIterFactory,lc);
            }


            function toHash(key,value,p){
                function hashFn(key){
                    var keyHash = hashVal(key);
                    var hashItem = hash[keyHash];
                    if (hashItem){
                        return hashItem.val;
                    }
                    return undefined;
                }

                function contains(key){
                    return hash[hashVal(key)] !== undefined;
                }

                function count(){
                    return hashKeyIndex;
                }

                var keyOp = angular.isArray(key) ? lc.getMap(key) : lc.getMap([key,p]);
                var valueOp = angular.isArray(value) ? lc.getMap(value) : lc.getMap([value,p]);
                var iter = iteratorFactory();
                var hash = {};
                var index = 0;
                var hashKeyIndex = 0;
                var keyHash;
                var key;
                var value;
                var item;
                var result;

                while(iter.next()){
                    index = iter.index();
                    item = iter.value();
                    key = keyOp(item,index);
                    keyHash = hashVal(key);
                    value = hash[keyHash];

                    if (value === undefined){
                        value = {
                            val: valueOp(item,hashKeyIndex++)
                        };

                        hash[keyHash] = value;
                    }
                }

                result = hashFn;
                result.contains = contains;
                result.count = count;

                return result;
            }

            function skip(amount){
                function skipFilter(item,index){
                    return index >= amount;
                }

                return listyFromParent(iteratorFactory,{
                    filterOp: skipFilter
                },lc);
            }

            function take(amount){
                function takeBreak(item,index){
                    return index >= amount;
                }

                return listyFromParent(iteratorFactory,{
                    breakOp: takeBreak
                },lc);
            }

            function forEach(action){
                var result, ctx, iter, actionOp = lc.getForEach(lc.argsArray(arguments));

                if (!actionOp){
                    return service;
                }

                ctx = lc.getForEachCtx();
                iter = iteratorFactory();

                while(iter.next()){
                    result = actionOp(iter.value(),iter.index(),ctx.subCtx);
                    if (result === ctx.breakValue){
                        break;
                    }
                }

                return service;
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
                toHash: toHash,

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
                groupBy: groupBy,
                unique: unique,
                uniqueSet: uniqueSet,
                skip: skip,
                take: take,
                forEach: forEach,
                let: letFn
            });

            return service;
        }

        function extendWithArrayFunctions(service,array,lc){

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

        function listyFromParent(innerIterator,config,lc){
            var iteratorFactory = lc.childIterFactory(innerIterator,config);
            return listyFact(iteratorFactory,lc);
        }

        function listyFact(source,lc){
            var isArray,iterator,service;

            if (source.$typeId && source.$typeId === typeId){
                return source;
            }

            isArray = angular.isArray(source);
            iterator = isArray ? lc.arrayIterFactory(source) : source;


            service = createBaseService(iterator,lc);
            if (isArray){
                extendWithArrayFunctions(service,source,lc);
            }

            return service;
        }

        function listy(source,letParams){
            return listyFact(source,listyComponents(letParams));
        }

        return listy;
    }
})(angular);