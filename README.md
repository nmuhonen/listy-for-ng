listy-for-ng
============

An angular service for doing stuff with arrays.

service:
--------
listy(array | listy | listyIteratorFactory) => listy

```javascript
angular.run([
  "listy",
  function(listy){
    var listee = listy([1,2,3,4,5]); // creates a listy from an array
    
    var listee2 = listy(listy.createIterator); // creates a listy from
    
    var listee3 = listy(listee);
  })
]);
```




