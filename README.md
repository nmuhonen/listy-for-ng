listy-for-ng
============

An angular service for doing stuff with arrays.

service listy(array | listy | listyIteratorFactory) => listy
--------
creates a new listy object.

```javascript
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

//with an expression
var source = [{val:1},{val:2},{val:3}];

listy(source).forEach("$index > 1 ? $break : (index = $index)");

expect(source).toBe({index:0,val:1},{val:2},{val:3});
```

method count() => number
--------
returns the number of elements in a listy;

```javascript
var source = [{val:1},{val:2},{val:3}];
var length = listy(source).length();

expect(length).toBe(3);
```




