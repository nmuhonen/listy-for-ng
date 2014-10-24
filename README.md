listy-for-ng
============

An angular service for doing stuff with arrays.

service listy(array | listy | listyIteratorFactory) => listy
--------
creates a new listy object.

```javascript
angular.module("listyMod",[]);
angular.run([
  "listy",
  function(listy){
    var listee = listy([1,2,3,4,5]); // creates a listy from an array
    
    var listee2 = listy(listy.createIterator); // creates a listy from
    
    var listee3 = listy(listee); // pass through -> listee === listee3
  })
]);
```

method forEach(actionFn,param?) => listy
--------
iterates through a listy.

```javascript
//with a closure
var source = [{val:1},{val:2},{val:3}];

listy(source).forEach(function(item,index,ctx){
  if (index > 1){
    return ctx.break;
  }
  item.index = index;
});

expect(source).toBe({index:0,val:1},{val:2},{val:3});

//with an expression using an optional parameter
var source = [{val:1},{val:2},{val:3}];

listy(source).forEach("$index > val ? $break : (index = $index)",{val:1});

expect(source).toBe({index:0,val:1},{val:2},{val:3});
```

method count() => number
--------
returns the number of elements in a listy.

```javascript
var source = [{val:1},{val:2},{val:3}];
var length = listy(source).length();

expect(length).toBe(3);
```

method filter(filterOp,param?) => listy
--------
filters a result set from a listy.

```javascript
//with a closure
var source = [{val:1},{val:2},{val:3}];

var result = listy(source).filter(function(item,index){
  return index < 1 || item.val === 3
});

expect(result()).toEqual([{val:1},{val:3}]);

//with an expression using an optional parameter
var source = [{val:1},{val:2},{val:3}];

var result = listy(source).filter("$index < targetIndex || val === targetVal",{targetIndex:1,targetVal:3});
});

expect(result()).toEqual([{val:1},{val:3}]);
```

method map(mapOp,param?) => listy
--------
maps a result set from a listy.

```javascript
//with a closure
var source = [1,2];

var result = listy(source).map(function(item,index){
  return {val:item, index: index};
});

expect(result()).toEqual([{val:1,index:0},{val:2,index:1}]);

//with an expression using an optional parameter
var source = [1,2];

function getExpr(item,index){
  return index + ":" + item;
}

var result = listy(source).map("{item:$item,index:$index,expr:getExpr($item,$index)}",{getExpr:getExpr});

expect(result()).toEqual([{val:1,index:0,expr:"0:1"},{val:2,index:1,expr:"0:2"}]);
```

method reduce(reduceOp,init?,param?) => var
--------
reduces a result set from a listy.

```javascript
//with a closure
var source = [1,2];

listy(source).reduce(function(result,item,index){
  return result + item;
},0);

expect(source).toEqual(3);

//with an expression using an optional parameter
var source = [1,2];

function add(item1,item2){
  return item1 + item2
}

listy(source).map("add($item,$result)",0,{add:add});
});

expect(source).toEqual(3);
```

method sort(sortExpression,...) => var
--------
reduces a result set from a listy.

```javascript
var source = [
  {state: "CA", city: "Los Angeles", age:68}, 
  {state: "OR", city: "Portland", age:57}, 
  {state: "CA", city: "San Francisco", age:78}, 
  {state: "CA", city: "Los Angeles", age:31}, 
  {state: "OR", city: "Eugene", age:57}
  {state: "OR", city: "Eugene", age:56}, 
];

function compareState(item,compare){
  return item.state.localeCompare(compare.state);
}

function strCmp(item,compare){
  return item.localeCompare(compare);
}

//with closures
var result = listy(source).sort(compareState,"desc");

//with expression
var result = listy(source).sort("state desc");

//with complex expression using a custom sorter
var result = listy(source).sort("state desc, city with strCmp, age",{strCmp: strCmp});

//with all of the above
var result = listy(source).sort([compareState,"desc"],["city with strCmp",{strCmp: strCmp}],["age"]);
```



