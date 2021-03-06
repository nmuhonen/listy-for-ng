describe("listy service",function() {
    var listy;

    beforeEach(function () {
        module('listyMod');
        inject(function ($injector) {
            listy = $injector.get("listy");
        })
    });

    describe("constructor listy(array | iteratorFactory | listy)", function () {
        it("creates the listy service", function () {
            expect(listy).toBeDefined();
        });

        it("creates a listy from an array", function () {
            var array, list;

            array = [1, 2, 3, 4, 5, 6];
            list = listy(array);

            expect(list).toBeDefined();
            expect(list.toArray).toBeDefined();
        });

        it("creates the same listy from a created listy", function () {
            var list1, list2;

            list1 = listy([]);
            list2 = listy(list1);

            expect(list1).toBe(list2);
        });
    });

    describe("method createIterator()", function () {
        it("creates an iterator from an array listy", function () {
            function accumulate(iterator) {
                var result;

                result = [];

                while (iterator.next()) {
                    result.push(iterator.value());
                }

                return result;
            }


            var arrayListy;
            arrayListy = listy([1, 2, 3, 4, 5]);

            expect(accumulate(arrayListy.createIterator())).toEqual([1, 2, 3, 4, 5]);

        });

        it("creates an iterator from an iterator listy", function () {
            function accumulate(iterator) {
                var result;

                result = [];

                while (iterator.next()) {
                    result.push(iterator.value());
                }

                return result;
            }


            var arrayListy, iteratorListy;
            arrayListy = listy([1, 2, 3, 4, 5]);
            iteratorListy = listy(arrayListy.createIterator);

            expect(accumulate(iteratorListy.createIterator())).toEqual([1, 2, 3, 4, 5]);

        });
    });


    describe("method count()", function () {
        it("returns the count from an array listy", function () {
            var arrayListy;
            arrayListy = listy([1, 2, 3, 4, 5]);

            expect(arrayListy.count()).toBe(5);

        });

        it("return the count from an iterator listy", function () {

            var arrayListy, iteratorListy;
            arrayListy = listy([1, 2, 3, 4, 5]);
            iteratorListy = listy(arrayListy.createIterator);

            expect(iteratorListy.count()).toBe(5);
        });
    });

    describe("method first()", function () {
        it("returns the first value from an array listy", function () {
            var arrayListy;
            arrayListy = listy([1, 2, 3, 4, 5]);

            expect(arrayListy.first()).toBe(1);

        });

        it("return the first value from an iterator listy", function () {

            var arrayListy, iteratorListy;
            arrayListy = listy([1, 2, 3, 4, 5]);
            iteratorListy = listy(arrayListy.createIterator);

            expect(iteratorListy.first()).toBe(1);
        });

        it("returns undefined from an empty array listy", function () {
            var arrayListy;
            arrayListy = listy([]);

            expect(arrayListy.first()).toBe(undefined);

        });

        it("return undefined from an empty iterator listy", function () {
            var arrayListy, iteratorListy;
            arrayListy = listy([]);
            iteratorListy = listy(arrayListy.createIterator);

            expect(iteratorListy.first()).toBe(undefined);
        });
    });

    describe("method last()", function () {
        it("returns the last value from an array listy", function () {
            var arrayListy;
            arrayListy = listy([1, 2, 3, 4, 5]);

            expect(arrayListy.last()).toBe(5);

        });

        it("return the last value from an iterator listy", function () {

            var arrayListy, iteratorListy;
            arrayListy = listy([1, 2, 3, 4, 5]);
            iteratorListy = listy(arrayListy.createIterator);

            expect(iteratorListy.last()).toBe(5);
        });

        it("returns undefined from an empty array listy", function () {
            var arrayListy;
            arrayListy = listy([]);

            expect(arrayListy.last()).toBe(undefined);

        });

        it("return undefined from an empty iterator listy", function () {

            var arrayListy, iteratorListy;
            arrayListy = listy([]);
            iteratorListy = listy(arrayListy.createIterator);

            expect(iteratorListy.last()).toBe(undefined);
        });
    });

    describe("method filter(filter,param?)", function(){
        it("should perform a filter on an simple array with a closure",function(){
            function check(item,index){
                return index > 0 && item < 2;
            }

            var listee = listy([1,2,3,0,1]);
            var result = listee.filter(check);
            expect(result()).toEqual([0,1]);
        });

        it("should perform a filter on an array with objects with a closure",function(){
            function check(item,index){
                return index > 0 && item.name[0] === "N" && item.lastName === "Muhonen";
            }

            var listee = listy([
                {name:"Ned", lastName: "Muhonen"},
                {name:"Nancy", lastName: "Muhonen"},
                {name:"Nick", lastName: "Muhonen"},
                {name:"Ann", lastName: "Muhonen"},
                {name:"Ann", lastName: "Rice"}

            ]);
            var result = listee.filter(check);
            expect(result()).toEqual([
                {name:"Nancy", lastName: "Muhonen"},
                {name:"Nick", lastName: "Muhonen"}
            ]);
        });


        it("should perform a filter on an simple array with an expression",function(){
            var listee = listy([1,2,3,0,1]);
            var result = listee.filter("$index > 0 && $item < 2");
            expect(result()).toEqual([0,1]);
        });

        it("should perform a filter on an array with objects an expression",function(){
            var listee = listy([
                {name:"Ned", lastName: "Muhonen"},
                {name:"Nancy", lastName: "Muhonen"},
                {name:"Nick", lastName: "Muhonen"},
                {name:"Ann", lastName: "Muhonen"},
                {name:"Ann", lastName: "Rice"}

            ]);
            var result = listee.filter("$index > 0 && name[0] === 'N' && lastName === 'Muhonen'");
            expect(result()).toEqual([
                {name:"Nancy", lastName: "Muhonen"},
                {name:"Nick", lastName: "Muhonen"}
            ]);
        });

        it("should perform a filter on an simple array with an expression with a parameter",function(){
            var listee = listy([1,2,3,0,1]);
            var result = listee.filter("$index > 0 && $item < $param",2);
            expect(result()).toEqual([0,1]);
        });

        it("should perform a filter on an array with objects with an expression with a parameter",function(){
            var listee = listy([
                {name:"Ned", lastName: "Muhonen"},
                {name:"Nancy", lastName: "Muhonen"},
                {name:"Nick", lastName: "Muhonen"},
                {name:"Ann", lastName: "Muhonen"},
                {name:"Ann", lastName: "Rice"}

            ]);
            var result = listee.filter("$index > 0 && name[0] === 'N' && lastName === $param","Muhonen");
            expect(result()).toEqual([
                {name:"Nancy", lastName: "Muhonen"},
                {name:"Nick", lastName: "Muhonen"}
            ]);
        });

        it("should perform a filter on an simple array with an expression and a parameter property",function(){
            var listee = listy([1,2,3,0,1]);
            var result = listee.filter("$index > 0 && $item < value",{value:2});
            expect(result()).toEqual([0,1]);
        });

        it("should perform a filter on an array with objects with an expression and a parameter property",function(){
            var listee = listy([
                {name:"Ned", lastName: "Muhonen"},
                {name:"Nancy", lastName: "Muhonen"},
                {name:"Nick", lastName: "Muhonen"},
                {name:"Ann", lastName: "Muhonen"},
                {name:"Ann", lastName: "Rice"}

            ]);
            var result = listee.filter("$index > 0 && name[0] === 'N' && lastName === value",{value:"Muhonen"});
            expect(result()).toEqual([
                {name:"Nancy", lastName: "Muhonen"},
                {name:"Nick", lastName: "Muhonen"}
            ]);
        });
    });


    describe("method map(projection,param?)", function(){
        it("should project from a simple array using a closure",function(){
            function project(item,index){
                return{index:index, item: item, isOddIndex: index % 2 === 1};
            }

            var listee = listy(["Nick Muhonen","John Doe","Nancy Riley"]);
            var result = listee.map(project);

            expect(result()).toEqual([
                {index: 0, item: "Nick Muhonen", isOddIndex: false},
                {index: 1, item: "John Doe", isOddIndex: true},
                {index: 2, item: "Nancy Riley", isOddIndex: false},
            ]);
        });

        it("should project from a array of objects using a closure",function(){
            function project(item,index){
                return{index:index, item: item.first + " " + item.last, isOddIndex: index % 2 === 1};
            }

            var listee = listy([
                {first: "Nick", last: "Muhonen"},
                {first: "John", last: "Doe"},
                {first: "Nancy", last: "Riley"},
            ]);
            var result = listee.map(project);

            expect(result()).toEqual([
                {index: 0, item: "Nick Muhonen", isOddIndex: false},
                {index: 1, item: "John Doe", isOddIndex: true},
                {index: 2, item: "Nancy Riley", isOddIndex: false},
            ]);
        });

        it("should project from a simple array using an expression",function(){
            var listee = listy(["Nick Muhonen","John Doe","Nancy Riley"]);
            var result = listee.map("{index:$index, item: $item, isOddIndex: $index % 2 === 1}");

            expect(result()).toEqual([
                {index: 0, item: "Nick Muhonen", isOddIndex: false},
                {index: 1, item: "John Doe", isOddIndex: true},
                {index: 2, item: "Nancy Riley", isOddIndex: false},
            ]);
        });

        it("should project from a array of objects using an expression",function(){
            var listee = listy([
                {first: "Nick", last: "Muhonen"},
                {first: "John", last: "Doe"},
                {first: "Nancy", last: "Riley"},
            ]);
            var result = listee.map("{index:$index, item: $item.first + ' ' + $item.last, isOddIndex: $index % 2 === 1}");

            expect(result()).toEqual([
                {index: 0, item: "Nick Muhonen", isOddIndex: false},
                {index: 1, item: "John Doe", isOddIndex: true},
                {index: 2, item: "Nancy Riley", isOddIndex: false},
            ]);
        });

        it("should project from a array using an expression and a parameter",function(){
            function isOdd(num){
                return num % 2 == 1;
            }

            var listee = listy([
                {first: "Nick", last: "Muhonen"},
                {first: "John", last: "Doe"},
                {first: "Nancy", last: "Riley"},
            ]);
            var result = listee.map("{index:$index, item: $item.first + ' ' + $item.last, isOddIndex: $param($index)}",isOdd);

            expect(result()).toEqual([
                {index: 0, item: "Nick Muhonen", isOddIndex: false},
                {index: 1, item: "John Doe", isOddIndex: true},
                {index: 2, item: "Nancy Riley", isOddIndex: false},
            ]);
        });

        it("should project from a array using an expression and a parameter",function(){
            function isOdd(num){
                return num % 2 == 1;
            }

            var listee = listy([
                {first: "Nick", last: "Muhonen"},
                {first: "John", last: "Doe"},
                {first: "Nancy", last: "Riley"},
            ]);
            var result = listee.map("{index:$index, item: $item.first + ' ' + $item.last, isOddIndex: isOdd($index)}",{isOdd:isOdd});

            expect(result()).toEqual([
                {index: 0, item: "Nick Muhonen", isOddIndex: false},
                {index: 1, item: "John Doe", isOddIndex: true},
                {index: 2, item: "Nancy Riley", isOddIndex: false},
            ]);
        });

        it("should project from a array using an expression with $extend and a parameter",function(){
            function isOdd(num){
                return num % 2 == 1;
            }

            var listee = listy([
                {first: "Nick", last: "Muhonen"},
                {first: "John", last: "Doe"},
                {first: "Nancy", last: "Riley"},
            ]);
            var result = listee.map("$extend({isOddIndex: isOdd($index)})",{isOdd:isOdd});

            expect(result()).toEqual([
                {first: "Nick", last: "Muhonen", isOddIndex: false},
                {first: "John", last: "Doe", isOddIndex: true},
                {first: "Nancy", last: "Riley", isOddIndex: false},
            ]);
        });
    });

    describe("method reduce(reduceOp,init?,param?)", function(){
        it("should reduce a simple array with a closure",function(){
            function factorial(result,item,index){
                return result === undefined ? {indexTotal: index, total: item}
                    : {indexTotal: result.indexTotal + index, total: result.total + item};
            }

            var result = listy([1,2,3,4]).reduce(factorial);

            expect(result).toEqual({indexTotal: 6, total: 10});
        });

        it("should reduce a array with a closure and a seed",function(){
            function factorial(result,item,index){
                return {indexTotal: result.indexTotal + index, total: result.total + item};
            }

            var result = listy([1,2,3,4]).reduce(factorial,{indexTotal: 0, total: 0});

            expect(result).toEqual({indexTotal: 6, total: 10});
        });
        it("should reduce a simple array with an expression",function(){

            var result = listy([1,2,3,4]).reduce("$result === undefined ? {indexTotal: $index, total: $item}: {indexTotal: $result.indexTotal + $index, total: $result.total + $item}");

            expect(result).toEqual({indexTotal: 6, total: 10});
        });

        it("should reduce a simple array with an expression and a seed",function(){
            var result = listy([1,2,3,4]).reduce("{indexTotal: $result.indexTotal + $index, total: $result.total + $item}",{indexTotal: 0, total: 0});

            expect(result).toEqual({indexTotal: 6, total: 10});
        });

        it("should reduce a simple array with an expression and a param",function(){
            function factorial(result,item,index){
                return result === undefined ? {indexTotal: index, total: item}
                    : {indexTotal: result.indexTotal + index, total: result.total + item};
            }

            var result = listy([1,2,3,4]).reduce("$param($result,$item,$index)",undefined,factorial);

            expect(result).toEqual({indexTotal: 6, total: 10});
        });

        it("should reduce a simple array with an expression, a seed, and a param",function(){
            function factorial(result,item,index){
                return {indexTotal: result.indexTotal + index, total: result.total + item};
            }

            var result = listy([1,2,3,4]).reduce("$param($result,$item,$index)",{indexTotal: 0, total: 0},factorial);

            expect(result).toEqual({indexTotal: 6, total: 10});
        });
         it("should reduce a simple array with an expression and a param property",function(){
            function factorial(result,item,index){
                return result === undefined ? {indexTotal: index, total: item}
                    : {indexTotal: result.indexTotal + index, total: result.total + item};
            }

            var result = listy([1,2,3,4]).reduce("fact($result,$item,$index)",undefined,{fact:factorial});

            expect(result).toEqual({indexTotal: 6, total: 10});
        });

        it("should reduce a simple array with an expression, a seed, and a param property",function(){
            function factorial(result,item,index){
                return {indexTotal: result.indexTotal + index, total: result.total + item};
            }

            var result = listy([1,2,3,4]).reduce("fact($result,$item,$index)",{indexTotal: 0, total: 0},{fact:factorial});

            expect(result).toEqual({indexTotal: 6, total: 10});
        });
    });

    describe("method sort(sorter,param?)", function(){
        it("should do a simple sort on a simple array",function(){
            var result = listy([null,4,2,5,3,1]).sort();

            expect(result()).toEqual([1,2,3,4,5,null]);
        });

        it("should do a sort with a closure on a simple array",function(){
            function sorter(item,compare){
                return item === compare ? 0
                    : item === null ? 1
                    : compare === null ? -1
                    : item > compare ? 1
                    : -1;
            }

            var result = listy([null,4,2,5,3,1]).sort(sorter);

            expect(result()).toEqual([1,2,3,4,5,null]);
        });

        it("should do a descending sort with a closure on a simple array",function(){
            function sorter(item,compare){
                return item === compare ? 0
                    : item === null ? 1
                    : compare === null ? -1
                    : item > compare ? 1
                    : -1;
            }

            var result = listy([null,4,2,5,3,1]).sort(sorter,"desc");

            expect(result()).toEqual([null,5,4,3,2,1]);
        });

        it("should do a sort with a closure on an array of objects",function() {
            function sorter(item, compare) {
                item = item.age;
                compare = compare.age;

                return item === compare ? 0
                    : item === null ? 1
                    : compare === null ? -1
                    : item > compare ? 1
                    : -1;
            }

            var listee = listy([
                {state: "MD", hairColor: "brown", age: 41},
                {state: "MD", hairColor: "green", age: 2},
                {state: "CA", hairColor: "brown", age: 3},
                {state: "MD", hairColor: "green", age: 2}
            ]);

            var result = listee.sort(sorter);

            expect(result()).toEqual([
                {state: "MD", hairColor: "green", age: 2},
                {state: "MD", hairColor: "green", age: 2},
                {state: "CA", hairColor: "brown", age: 3},
                {state: "MD", hairColor: "brown", age: 41}
            ]);
        });

        it("should do a descending sort with a closure on an array of objects",function() {
            function sorter(item, compare) {
                item = item.age;
                compare = compare.age;

                return item === compare ? 0
                    : item === null ? 1
                    : compare === null ? -1
                    : item > compare ? 1
                    : -1;
            }

            var listee = listy([
                {state: "MD", hairColor: "brown", age: 41},
                {state: "MD", hairColor: "green", age: 2},
                {state: "CA", hairColor: "brown", age: 3},
                {state: "MD", hairColor: "green", age: 2}
            ]);

            var result = listee.sort(sorter,"desc");

            expect(result()).toEqual([
                {state: "MD", hairColor: "brown", age: 41},
                {state: "CA", hairColor: "brown", age: 3},
                {state: "MD", hairColor: "green", age: 2},
                {state: "MD", hairColor: "green", age: 2},
            ]);
        });

        it("should do a sort with an expression on a simple array",function(){
            var result = listy([null,4,2,5,3,1]).sort("$item");

            expect(result()).toEqual([1,2,3,4,5,null]);
        });

        it("should do a descending sort with an expression on a simple array",function(){
            var result = listy([null,4,2,5,3,1]).sort("$item desc");

            expect(result()).toEqual([null,5,4,3,2,1]);
        });

        it("should do a sort with an expression on an array of objects",function() {
            var listee = listy([
                {state: "MD", hairColor: "brown", age: 41},
                {state: "MD", hairColor: "green", age: 2},
                {state: "CA", hairColor: "brown", age: 3},
                {state: "MD", hairColor: "green", age: 2}
            ]);

            var result = listee.sort("age");

            expect(result()).toEqual([
                {state: "MD", hairColor: "green", age: 2},
                {state: "MD", hairColor: "green", age: 2},
                {state: "CA", hairColor: "brown", age: 3},
                {state: "MD", hairColor: "brown", age: 41}
            ]);
        });

        it("should do a descending sort with an expression on an array of objects",function() {
            var listee = listy([
                {state: "MD", hairColor: "brown", age: 41},
                {state: "MD", hairColor: "green", age: 2},
                {state: "CA", hairColor: "brown", age: 3},
                {state: "MD", hairColor: "green", age: 2}
            ]);

            var result = listee.sort("age desc");

            expect(result()).toEqual([
                {state: "MD", hairColor: "brown", age: 41},
                {state: "CA", hairColor: "brown", age: 3},
                {state: "MD", hairColor: "green", age: 2},
                {state: "MD", hairColor: "green", age: 2},
            ]);
        });

        it("should do a sort with an expression with a comparitor param on an array of objects",function() {
            function sorter(item, compare) {
                item = item.age;
                compare = compare.age;

                return item === compare ? 0
                    : item === null ? 1
                    : compare === null ? -1
                    : item > compare ? 1
                    : -1;
            }

            var listee = listy([
                {state: "MD", hairColor: "brown", age: 41},
                {state: "MD", hairColor: "green", age: 2},
                {state: "CA", hairColor: "brown", age: 3},
                {state: "MD", hairColor: "green", age: 2}
            ]);

            var result = listee.sort("$item with $param",sorter);

            expect(result()).toEqual([
                {state: "MD", hairColor: "green", age: 2},
                {state: "MD", hairColor: "green", age: 2},
                {state: "CA", hairColor: "brown", age: 3},
                {state: "MD", hairColor: "brown", age: 41}
            ]);
        });

        it("should do a descending sort with a comparitor param an expression on an array of objects",function() {
            function sorter(item, compare) {
                item = item.age;
                compare = compare.age;

                return item === compare ? 0
                    : item === null ? 1
                    : compare === null ? -1
                    : item > compare ? 1
                    : -1;
            }

            var listee = listy([
                {state: "MD", hairColor: "brown", age: 41},
                {state: "MD", hairColor: "green", age: 2},
                {state: "CA", hairColor: "brown", age: 3},
                {state: "MD", hairColor: "green", age: 2}
            ]);

            var result = listee.sort("$item desc with $param",sorter);

            expect(result()).toEqual([
                {state: "MD", hairColor: "brown", age: 41},
                {state: "CA", hairColor: "brown", age: 3},
                {state: "MD", hairColor: "green", age: 2},
                {state: "MD", hairColor: "green", age: 2},
            ]);
        });

        it("should do a descending sort with a comparitor param property an expression on an array of objects",function() {
            function sorter(item, compare) {
                item = item.age;
                compare = compare.age;

                return item === compare ? 0
                    : item === null ? 1
                    : compare === null ? -1
                    : item > compare ? 1
                    : -1;
            }

            var listee = listy([
                {state: "MD", hairColor: "brown", age: 41},
                {state: "MD", hairColor: "green", age: 2},
                {state: "CA", hairColor: "brown", age: 3},
                {state: "MD", hairColor: "green", age: 2}
            ]);

            var result = listee.sort("$item desc with ageCompare",{ageCompare:sorter});

            expect(result()).toEqual([
                {state: "MD", hairColor: "brown", age: 41},
                {state: "CA", hairColor: "brown", age: 3},
                {state: "MD", hairColor: "green", age: 2},
                {state: "MD", hairColor: "green", age: 2},
            ]);
        });

        it("should do a complex sort with a comparitor param property an expression on an array of objects",function() {
            function sorter(item, compare) {
                item = item.hairColor;
                compare = compare.hairColor;

                return item === compare ? 0
                    : item === null ? 1
                    : compare === null ? -1
                    : item.localeCompare(compare);
            }

            function getState(item){
                return item.state;
            }

            var listee = listy([
                {state: "MD", hairColor: "brown", age: 2},
                {state: "CA", hairColor: "brown", age: 6},
                {state: "MD", hairColor: "red", age: 3},
                {state: "MD", hairColor: "brown", age: 4},
                {state: "MD", hairColor: "brown", age: 1}
            ]);

            var result = listee.sort("getState($item), $item desc with hairCompare, age asc",{hairCompare:sorter,getState:getState});

            expect(result()).toEqual([
                {state: "CA", hairColor: "brown", age: 6},
                {state: "MD", hairColor: "red", age: 3},
                {state: "MD", hairColor: "brown", age: 1},
                {state: "MD", hairColor: "brown", age: 2},
                {state: "MD", hairColor: "brown", age: 4}
            ]);
        });

        it("should do a sort with a group of sorters with a comparitor param property an expression on an array of objects",function() {
            function ageCompare(item, compare) {
                item = item.age;
                compare = compare.age;

                return item === compare ? 0
                    : item === null ? 1
                    : compare === null ? -1
                    : item > compare ? 1
                    : -1;
            }

            function hairCompare(item, compare) {
                item = item.hairColor;
                compare = compare.hairColor;

                return item === compare ? 0
                    : item === null ? 1
                    : compare === null ? -1
                    : item.localeCompare(compare);
            }

            function getState(item){
                return item.state;
            }

            var listee = listy([
                {state: "MD", hairColor: "brown", age: 2},
                {state: "CA", hairColor: "brown", age: 6},
                {state: "MD", hairColor: "red", age: 3},
                {state: "MD", hairColor: "brown", age: 4},
                {state: "MD", hairColor: "brown", age: 1}
            ]);

            var result = listee.sort(
                ["getState($item), $item desc with hairCompare",{hairCompare:hairCompare,getState:getState}],
                [ageCompare,"desc"]
            );

            expect(result()).toEqual([
                {state: "CA", hairColor: "brown", age: 6},
                {state: "MD", hairColor: "red", age: 3},
                {state: "MD", hairColor: "brown", age: 4},
                {state: "MD", hairColor: "brown", age: 2},
                {state: "MD", hairColor: "brown", age: 1}
            ]);

            listee = listy([
                {state: "MD", hairColor: "brown", age: 2},
                {state: "CA", hairColor: "brown", age: 6},
                {state: "MD", hairColor: "red", age: 3},
                {state: "MD", hairColor: "brown", age: 4},
                {state: "MD", hairColor: "brown", age: 1}
            ]);

            result = listee.sort(
                ["getState($item) asc",{getState:getState}],
                ["$item desc with hairCompare",{hairCompare:hairCompare}],
                [ageCompare,"desc"]
            );

            expect(result()).toEqual([
                {state: "CA", hairColor: "brown", age: 6},
                {state: "MD", hairColor: "red", age: 3},
                {state: "MD", hairColor: "brown", age: 4},
                {state: "MD", hairColor: "brown", age: 2},
                {state: "MD", hairColor: "brown", age: 1}
            ]);
        });

        it("should do a sort with a group of sorters with a comparitor param property an expression on an array of objects",function() {
            function ageCompare(item, compare) {
                item = item.age;
                compare = compare.age;

                return item === compare ? 0
                    : item === null ? 1
                    : compare === null ? -1
                    : item > compare ? 1
                    : -1;
            }

            function hairCompare(item, compare) {
                item = item.hairColor;
                compare = compare.hairColor;

                return item === compare ? 0
                    : item === null ? 1
                    : compare === null ? -1
                    : item.localeCompare(compare);
            }

            function getState(item){
                return item.state;
            }

            var listee = listy([
                {state: "MD", hairColor: "brown", age: 2},
                {state: "CA", hairColor: "brown", age: 6},
                {state: "MD", hairColor: "red", age: 3},
                {state: "MD", hairColor: "brown", age: 4},
                {state: "MD", hairColor: "brown", age: 1}
            ]);

            var result = listee.sort(
                ["getState($item), $item desc with hairCompare",{hairCompare:hairCompare,getState:getState}],
                [ageCompare,"desc"]
            );

            expect(result()).toEqual([
                {state: "CA", hairColor: "brown", age: 6},
                {state: "MD", hairColor: "red", age: 3},
                {state: "MD", hairColor: "brown", age: 4},
                {state: "MD", hairColor: "brown", age: 2},
                {state: "MD", hairColor: "brown", age: 1}
            ]);

            listee = listy([
                {state: "MD", hairColor: "brown", age: 2},
                {state: "CA", hairColor: "brown", age: 6},
                {state: "MD", hairColor: "red", age: 3},
                {state: "MD", hairColor: "brown", age: 4},
                {state: "MD", hairColor: "brown", age: 1}
            ]);

            result = listee.sort(
                ["getState($item) asc",{getState:getState}],
                ["$item desc with hairCompare",{hairCompare:hairCompare}],
                [ageCompare,"desc"]
            );

            expect(result()).toEqual([
                {state: "CA", hairColor: "brown", age: 6},
                {state: "MD", hairColor: "red", age: 3},
                {state: "MD", hairColor: "brown", age: 4},
                {state: "MD", hairColor: "brown", age: 2},
                {state: "MD", hairColor: "brown", age: 1}
            ]);
        });
    });


    describe("method some(filter,param?)", function(){
        it("should notify on a simple array for one match filtered by a closure",function(){
            function matcher(item){
                return item > 3;
            }

            var listee = listy([1,4,5,3,1,7,2]);
            var result = listee.some(matcher);

            expect(result).toBe(true);

            listee = listy([1,2,1,0]);
            result = listee.some(matcher);

            expect(result).toBe(false);
        });

        it("should notify on a array of objects for one match filtered by a closure",function(){
            function matcher(item){
                return item.value > 3;
            }

            var listee = listy([{value:1},{value:4},{value:5},{value:3},{value:1},{value:7},{value:2}]);
            var result = listee.some(matcher);

            expect(result).toBe(true);

            listee = listy([1,2,1,0]);
            result = listee.some(matcher);

            expect(result).toBe(false);
        });

        it("should notify on a simple array for one match filtered by an expression",function(){
            var listee = listy([1,4,5,3,1,7,2]);
            var result = listee.some("$item > 3");

            expect(result).toBe(true);

            listee = listy([1,2,1,0]);
            result = listee.some("$item > 3");

            expect(result).toBe(false);
        });

        it("should notify on a simple array for one match filtered by an expression and a parameter",function(){
            var listee = listy([1,4,5,3,1,7,2]);
            var result = listee.some("$item > $param",3);

            expect(result).toBe(true);

            listee = listy([1,2,1,0]);
            result = listee.some("$item > $param",3);

            expect(result).toBe(false);
        });

        it("should notify on a simple array for one match filtered by an expression and a parameter property",function(){
            var listee = listy([1,4,5,3,1,7,2]);
            var result = listee.some("$item > val",{val:3});

            expect(result).toBe(true);

            listee = listy([1,2,1,0]);
            result = listee.some("$item > val",{val:3});

            expect(result).toBe(false);
        });

        it("should notify on a array of objects for one match filtered by an expression",function(){
            var listee = listy([{value:1},{value:4},{value:5},{value:3},{value:1},{value:7},{value:2}]);
            var result = listee.some("value > 3");

            expect(result).toBe(true);

            listee = listy([{value:1},{value:2},{value:1},{value:0}]);
            result = listee.some("value > 3");

            expect(result).toBe(false);
        });

        it("should notify on a array of objects for one match filtered by an expression and a parameter",function(){
            var listee = listy([{value:1},{value:4},{value:5},{value:3},{value:1},{value:7},{value:2}]);
            var result = listee.some("value > $param",3);

            expect(result).toBe(true);

            listee = listy([{value:1},{value:2},{value:1},{value:0}]);
            result = listee.some("value > $param",3);

            expect(result).toBe(false);
        });

        it("should notify on a array of objects for one match filtered by an expression and a parameter property",function(){
            var listee = listy([{value:1},{value:4},{value:5},{value:3},{value:1},{value:7},{value:2}]);
            var result = listee.some("value > val",{val:3});

            expect(result).toBe(true);

            listee = listy([{value:1},{value:2},{value:1},{value:0}]);
            result = listee.some("value > val",{val:3});

            expect(result).toBe(false);
        });
    });

    describe("method every(filter,param?)", function(){
        it("should notify on a simple array for one match filtered by a closure",function(){
            function matcher(item){
                return item <= 3;
            }

            var listee = listy([1,4,5,3,1,7,2]);
            var result = listee.every(matcher);

            expect(result).toBe(false);

            listee = listy([1,2,1,0]);
            result = listee.every(matcher);

            expect(result).toBe(true);
        });

        it("should notify on a array of objects for one match filtered by a closure",function(){
            function matcher(item){
                return item.value <= 3;
            }

            var listee = listy([{value:1},{value:4},{value:5},{value:3},{value:1},{value:7},{value:2}]);
            var result = listee.every(matcher);

            expect(result).toBe(false);

            listee = listy([{value:1},{value:2},{value:1},{value:0}]);
            result = listee.every(matcher);

            expect(result).toBe(true);
        });

        it("should notify on a simple array for one match filtered by an expression",function(){
            var listee = listy([1,4,5,3,1,7,2]);
            var result = listee.every("$item <= 3");

            expect(result).toBe(false);

            listee = listy([1,2,1,0]);
            result = listee.every("$item <= 3");

            expect(result).toBe(true);
        });

        it("should notify on a simple array for one match filtered by an expression and a parameter",function(){
            var listee = listy([1,4,5,3,1,7,2]);
            var result = listee.every("$item <= $param",3);

            expect(result).toBe(false);

            listee = listy([1,2,1,0]);
            result = listee.every("$item <= $param",3);

            expect(result).toBe(true);
        });

        it("should notify on a simple array for one match filtered by an expression and a parameter property",function(){
            var listee = listy([1,4,5,3,1,7,2]);
            var result = listee.every("$item <= val",{val:3});

            expect(result).toBe(false);

            listee = listy([1,2,1,0]);
            result = listee.every("$item <= val",{val:3});

            expect(result).toBe(true);
        });

        it("should notify on an array of objects for one match filtered by an expression",function(){
            var listee = listy([{value:1},{value:4},{value:5},{value:3},{value:1},{value:7},{value:2}]);
            var result = listee.every("value <= 3");

            expect(result).toBe(false);

            listee = listy([{value:1},{value:2},{value:1},{value:0}]);
            result = listee.every("value <= 3");

            expect(result).toBe(true);
        });

        it("should notify on an array of objects for one match filtered by an expression and a parameter",function(){
            var listee = listy([{value:1},{value:4},{value:5},{value:3},{value:1},{value:7},{value:2}]);
            var result = listee.every("value <= $param",3);

            expect(result).toBe(false);

            listee = listy([{value:1},{value:2},{value:1},{value:0}]);
            result = listee.every("value <= $param",3);

            expect(result).toBe(true);
        });

        it("should notify on an array of objects for one match filtered by an expression and a parameter property",function(){
            var listee = listy([{value:1},{value:4},{value:5},{value:3},{value:1},{value:7},{value:2}]);
            var result = listee.every("value <= val",{val:3});

            expect(result).toBe(false);

            listee = listy([{value:1},{value:2},{value:1},{value:0}]);
            result = listee.every("value <= val",{val:3});

            expect(result).toBe(true);
        });
    });


    describe("method groupBy(key,grouping?,param?)",function(){
        it("should group on a simple array",function(){
            var result = listy([1,2,4,2,1,5]).groupBy()("key");

            expect(result).toEqual([1,2,4,5]);

        });

        it("should group on an array with a key closure",function(){
            function key(item){
                return item.location;
            }

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).groupBy(key)("{location:key, items:group()}");
            expect(result).toEqual([
                {
                    location: "Oregon",
                    items: [
                        {location: "Oregon", person: "Archibald"},
                        {location: "Oregon", person: "Natalie"},
                        {location: "Oregon", person: "Isabel"}
                    ]
                },
                {
                    location: "Seattle",
                    items: [
                        {location: "Seattle", person: "Jake"},
                        {location: "Seattle", person: "John"}
                    ]
                }
            ]);
        });

        it("should group on an array with a key and key projection closure",function(){
            function key(item){
                return item.location;
            }

            function keyProjection(item,index){
                return {
                    location: item.location,
                    index: index
                };
            }

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).groupBy([key,keyProjection])("{location:key, items:group()}");
            expect(result).toEqual([
                {
                    location: {index:0, location:"Oregon"},
                    items: [
                        {location: "Oregon", person: "Archibald"},
                        {location: "Oregon", person: "Natalie"},
                        {location: "Oregon", person: "Isabel"}
                    ]
                },
                {
                    location: {index:1, location:"Seattle"},
                    items: [
                        {location: "Seattle", person: "Jake"},
                        {location: "Seattle", person: "John"}
                    ]
                }
            ]);
        });

        it("should group on an array with a key and key projection closure, limiting number of groups",function(){
            function key(item){
                return item.location;
            }

            function keyProjection(item,index){
                return {
                    location: item.location,
                    index: index
                };
            }

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).groupBy([key,keyProjection,1])("{location:key, items:group()}");
            expect(result).toEqual([
                {
                    location: {index:0, location:"Oregon"},
                    items: [
                        {location: "Oregon", person: "Archibald"},
                        {location: "Oregon", person: "Natalie"},
                        {location: "Oregon", person: "Isabel"}
                    ]
                }
            ]);
        });

        it("should group on a simple array with an expression",function(){
            var result = listy([1,2,4,2,1,5]).groupBy("$item")("key");

            expect(result).toEqual([1,2,4,5]);

        });

        it("should group on an array with a key expression",function(){
            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).groupBy("location")("{location:key, items:group()}");
            expect(result).toEqual([
                {
                    location: "Oregon",
                    items: [
                        {location: "Oregon", person: "Archibald"},
                        {location: "Oregon", person: "Natalie"},
                        {location: "Oregon", person: "Isabel"}
                    ]
                },
                {
                    location: "Seattle",
                    items: [
                        {location: "Seattle", person: "Jake"},
                        {location: "Seattle", person: "John"}
                    ]
                }
            ]);
        });

        it("should group on an array with a key and key projection expression",function(){
            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).groupBy("location as {location:location, index:$index}")("{location:key, items:group()}");
            expect(result).toEqual([
                {
                    location: {index:0, location:"Oregon"},
                    items: [
                        {location: "Oregon", person: "Archibald"},
                        {location: "Oregon", person: "Natalie"},
                        {location: "Oregon", person: "Isabel"}
                    ]
                },
                {
                    location: {index:1, location:"Seattle"},
                    items: [
                        {location: "Seattle", person: "Jake"},
                        {location: "Seattle", person: "John"}
                    ]
                }
            ]);
        });

        it("should group on an array with a key and key projection expression, limiting number of groups",function(){
            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).groupBy("location as {location:location, index:$index} limit 1")("{location:key, items:group()}");
            expect(result).toEqual([
                {
                    location: {index:0, location:"Oregon"},
                    items: [
                        {location: "Oregon", person: "Archibald"},
                        {location: "Oregon", person: "Natalie"},
                        {location: "Oregon", person: "Isabel"}
                    ]
                }
            ]);
        });

        it("should group on an array with a key and key projection expression, limiting number of groups as well as projecting the group items with a closure",function(){
            function groupOp(group){
                return group.map("person");
            }

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).groupBy("location as {location:location, index:$index} limit 1",groupOp)("{location:key, people:group()}");
            expect(result).toEqual([
                {
                    location: {index:0, location:"Oregon"},
                    people: ["Archibald","Natalie","Isabel"]
                }
            ]);
        });

        it("should group on an array with a key and key projection expression, limiting number of groups as well as projecting the group items with an expression",function(){
            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).groupBy("location as {location:location, index:$index} limit 1","person")("{location:key, people:group()}");
            expect(result).toEqual([
                {
                    location: {index:0, location:"Oregon"},
                    people: ["Archibald","Natalie","Isabel"]
                }
            ]);
        });


        it("should group on an array with a key and key projection expression, limiting number of groups as well as projecting the group items with an expression and a parameter",function(){
            function same(item){
                return item;
            }

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).groupBy("$param(location) as {location:location, index:$param($index)} limit 1","$param(person)",same)("{location:key, people:group()}");
            expect(result).toEqual([
                {
                    location: {index:0, location:"Oregon"},
                    people: ["Archibald","Natalie","Isabel"]
                }
            ]);
        });

        it("should group on an array with a key and key projection expression, limiting number of groups as well as projecting the group items with an expression and a parameter property",function(){
            function same(item){
                return item;
            }

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source)
                .groupBy("same(location) as {location:location, index:same($index)} limit same(1)","same(person)",{same: same})
                .toArray("{location:key, people:group()}");
            expect(result).toEqual([
                {
                    location: {index:0, location:"Oregon"},
                    people: ["Archibald","Natalie","Isabel"]
                }
            ]);
        });

        it("should group on an array with a key and key projection parameterized expression, limiting number of groups as well as projecting the group items with a closure and a parameter property",function() {
            function groupOp(group){
                return group.map("person");
            }

            function same(item) {
                return item;
            }

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source)
                .groupBy(["same(location) as {location:location, index:same($index)} limit same(1)", {same: same}], groupOp)
                .toArray("{location:key, people:group()}");

            expect(result).toEqual([
                {
                    location: {index: 0, location: "Oregon"},
                    people: ["Archibald", "Natalie", "Isabel"]
                }
            ]);
        });
    });


    describe("method toGroupArray(key,itemMap?,groupMap?,p?)",function(){
        it("should group a simple array",function(){
            var result = listy([1,2,3,1,4,3,2]).toGroupArray();

            expect(result).toEqual([
                {
                    key: 1,
                    group: [
                        1,
                        1
                    ]
                },
                {
                    key: 2,
                    group: [
                        2,
                        2
                    ]
                },
                {
                    key: 3,
                    group: [
                        3,
                        3
                    ]
                },
                {
                    key: 4,
                    group: [
                        4
                    ]
                }
            ]);
        });

        it("should group an array of objects with a closure",function(){
            function byLocation(item){
                return item.location;
            }

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).toGroupArray(byLocation);

            expect(result).toEqual([
                {
                    key: "Oregon",
                    group: [
                        {location: "Oregon", person: "Archibald"},
                        {location: "Oregon", person: "Natalie"},
                        {location: "Oregon", person: "Isabel"}
                    ]
                },
                {
                    key: "Seattle",
                    group: [
                        {location: "Seattle", person: "Jake"},
                        {location: "Seattle", person: "John"}
                    ]
                }
            ]);
        });

        it("should group an array of objects projecting the key value with closures",function(){
            function byLocationId(item){
                return item.locationId;
            }

            function asLocation(item){
                return item.location;
            }

            var source = [
                {locationId: 1, location: "Oregon", person: "Archibald"},
                {locationId: 1, location: "Oregon", person: "Natalie"},
                {locationId: 2, location: "Seattle", person: "Jake"},
                {locationId: 1, location: "Oregon", person: "Isabel"},
                {locationId: 2, location: "Seattle", person: "John"}
            ];

            var result = listy(source).toGroupArray([byLocationId,asLocation]);

            expect(result).toEqual([
                {
                    key: "Oregon",
                    group: [
                        {locationId: 1, location: "Oregon", person: "Archibald"},
                        {locationId: 1, location: "Oregon", person: "Natalie"},
                        {locationId: 1, location: "Oregon", person: "Isabel"}
                    ]
                },
                {
                    key: "Seattle",
                    group: [
                        {locationId: 2, location: "Seattle", person: "Jake"},
                        {locationId: 2, location: "Seattle", person: "John"}
                    ]
                }
            ]);
        });

        it("should group an array of objects projecting the key value with closures, limiting the numbe of results",function(){
            function byLocationId(item){
                return item.locationId;
            }

            function asLocation(item){
                return item.location;
            }

            var source = [
                {locationId: 1, location: "Oregon", person: "Archibald"},
                {locationId: 1, location: "Oregon", person: "Natalie"},
                {locationId: 2, location: "Seattle", person: "Jake"},
                {locationId: 1, location: "Oregon", person: "Isabel"},
                {locationId: 2, location: "Seattle", person: "John"}
            ];

            var result = listy(source).toGroupArray([byLocationId,asLocation,1]);

            expect(result).toEqual([
                {
                    key: "Oregon",
                    group: [
                        {locationId: 1, location: "Oregon", person: "Archibald"},
                        {locationId: 1, location: "Oregon", person: "Natalie"},
                        {locationId: 1, location: "Oregon", person: "Isabel"}
                    ]
                }
            ]);
        });

        it("should group an array of objects with an expression",function(){

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).toGroupArray("location");

            expect(result).toEqual([
                {
                    key: "Oregon",
                    group: [
                        {location: "Oregon", person: "Archibald"},
                        {location: "Oregon", person: "Natalie"},
                        {location: "Oregon", person: "Isabel"}
                    ]
                },
                {
                    key: "Seattle",
                    group: [
                        {location: "Seattle", person: "Jake"},
                        {location: "Seattle", person: "John"}
                    ]
                }
            ]);
        });

        it("should group an array of objects projecting the key value with closures",function(){
            var source = [
                {locationId: 1, location: "Oregon", person: "Archibald"},
                {locationId: 1, location: "Oregon", person: "Natalie"},
                {locationId: 2, location: "Seattle", person: "Jake"},
                {locationId: 1, location: "Oregon", person: "Isabel"},
                {locationId: 2, location: "Seattle", person: "John"}
            ];

            var result = listy(source).toGroupArray("locationId as location");

            expect(result).toEqual([
                {
                    key: "Oregon",
                    group: [
                        {locationId: 1, location: "Oregon", person: "Archibald"},
                        {locationId: 1, location: "Oregon", person: "Natalie"},
                        {locationId: 1, location: "Oregon", person: "Isabel"}
                    ]
                },
                {
                    key: "Seattle",
                    group: [
                        {locationId: 2, location: "Seattle", person: "Jake"},
                        {locationId: 2, location: "Seattle", person: "John"}
                    ]
                }
            ]);
        });

        it("should group an array of objects projecting the key value with an expression, limiting the number of results",function(){
            var source = [
                {locationId: 1, location: "Oregon", person: "Archibald"},
                {locationId: 1, location: "Oregon", person: "Natalie"},
                {locationId: 2, location: "Seattle", person: "Jake"},
                {locationId: 1, location: "Oregon", person: "Isabel"},
                {locationId: 2, location: "Seattle", person: "John"}
            ];

            var result = listy(source).toGroupArray("locationId as location limit 1");

            expect(result).toEqual([
                {
                    key: "Oregon",
                    group: [
                        {locationId: 1, location: "Oregon", person: "Archibald"},
                        {locationId: 1, location: "Oregon", person: "Natalie"},
                        {locationId: 1, location: "Oregon", person: "Isabel"}
                    ]
                }
            ]);
        });

        it("should group an array of objects with an expression projecting the group item values with a closure, limiting the number of results",function(){
            function asPerson(item){
                return item.person;
            }

            var source = [
                {locationId: 1, location: "Oregon", person: "Archibald"},
                {locationId: 1, location: "Oregon", person: "Natalie"},
                {locationId: 2, location: "Seattle", person: "Jake"},
                {locationId: 1, location: "Oregon", person: "Isabel"},
                {locationId: 2, location: "Seattle", person: "John"}
            ];

            var result = listy(source).toGroupArray("locationId as location limit 1",asPerson);

            expect(result).toEqual([
                {
                    key: "Oregon",
                    group: ["Archibald", "Natalie", "Isabel"]
                }
            ]);
        });

        it("should group an array of objects with an expression projecting the group item values with a closure, limiting the number of results",function(){
            function asPerson(item){
                return item.person;
            }

            var source = [
                {locationId: 1, location: "Oregon", person: "Archibald"},
                {locationId: 1, location: "Oregon", person: "Natalie"},
                {locationId: 2, location: "Seattle", person: "Jake"},
                {locationId: 1, location: "Oregon", person: "Isabel"},
                {locationId: 2, location: "Seattle", person: "John"}
            ];

            var result = listy(source).toGroupArray("locationId as location limit 1",asPerson);

            expect(result).toEqual([
                {
                    key: "Oregon",
                    group: ["Archibald", "Natalie", "Isabel"]
                }
            ]);
        });

        it("should group an array of objects with an expression projecting the group item values with an expression, limiting the number of results",function(){
            var source = [
                {locationId: 1, location: "Oregon", person: "Archibald"},
                {locationId: 1, location: "Oregon", person: "Natalie"},
                {locationId: 2, location: "Seattle", person: "Jake"},
                {locationId: 1, location: "Oregon", person: "Isabel"},
                {locationId: 2, location: "Seattle", person: "John"}
            ];

            var result = listy(source).toGroupArray("locationId as location limit 1","person");

            expect(result).toEqual([
                {
                    key: "Oregon",
                    group: ["Archibald", "Natalie", "Isabel"]
                }
            ]);
        });

        it("should group an array of objects with an expression projecting the group result with an expression using global parameters, limiting the number of results",function(){
            var source = [
                {locationId: 1, location: "Oregon", person: "Archibald"},
                {locationId: 1, location: "Oregon", person: "Natalie"},
                {locationId: 2, location: "Seattle", person: "Jake"},
                {locationId: 1, location: "Oregon", person: "Isabel"},
                {locationId: 2, location: "Seattle", person: "John"}
            ];

            var result = listy(source).toGroupArray("locationIdOf($item) as locationOf($item) limit limitSize","personOf($item)","{location:key,people:sorted(group)}",{
                locationIdOf: function(item){
                    return item.locationId;
                },
                locationOf: function(item){
                    return item.location;
                },
                personOf: function(item){
                    return item.person;
                },
                sorted: function(group){
                    return listy(group).sort()();
                },
                limitSize: 1
            });

            expect(result).toEqual([
                {
                    location: "Oregon",
                    people: ["Archibald", "Isabel", "Natalie"]
                }
            ]);
        });

        it("should group an array of objects with an expression projecting the group result with an expression using global parameters, limiting the number of results",function(){
            var source = [
                {locationId: 1, location: "Oregon", person: "Archibald"},
                {locationId: 1, location: "Oregon", person: "Natalie"},
                {locationId: 2, location: "Seattle", person: "Jake"},
                {locationId: 1, location: "Oregon", person: "Isabel"},
                {locationId: 2, location: "Seattle", person: "John"}
            ];

            var params = {
                locationIdOf: function(item){
                    return item.locationId;
                },
                locationOf: function(item){
                    return item.location;
                },
                personOf: function(item){
                    return item.person;
                },
                sorted: function(group){
                    return listy(group).sort()();
                },
                limitSize: 1
            };

            var result = listy(source).toGroupArray(
                ["locationIdOf($item) as locationOf($item) limit limitSize",params],
                ["personOf($item)",params],
                ["{location:key,people:sorted(group)}",params]);

            expect(result).toEqual([
                {
                    location: "Oregon",
                    people: ["Archibald", "Isabel", "Natalie"]
                }
            ]);
        });
    });

    describe("method skip(amount)",function(){
        it("should skip the amount given", function(){
            expect(listy([1,2,3,4,5]).skip(2)()).toEqual([3,4,5]);
        })
    });

    describe("method take(amount)",function(){
        it("should take the amount given", function(){
            expect(listy([1,2,3,4,5]).take(2)()).toEqual([1,2]);
        })
    });


    describe("method hash(key,value,params?)",function(){
        it ("should create a hash with a key and value closure",function(){
            function fromId(item){
                return item.id;
            }

            function asName(item){
                return item.name;
            }

            var source = [
                {id: 1, name: "Nick"},
                {id: 2, name: "Jennifer"},
                {id: 3, name: "Jessica"},
            ];

            var hash = listy(source).toHash(fromId,asName);

            expect(hash.count()).toBe(3);
            expect(hash(1)).toBe("Nick");
            expect(hash.contains(1)).toBe(true);
            expect(hash(2)).toBe("Jennifer");
            expect(hash.contains(2)).toBe(true);
            expect(hash(3)).toBe("Jessica");
            expect(hash.contains(3)).toBe(true);
            expect(hash(4)).toBe(undefined);
            expect(hash.contains(4)).toBe(false);
        });

        it ("should create a hash with a key and value expression",function(){
            var source = [
                {id: 1, name: "Nick"},
                {id: 2, name: "Jennifer"},
                {id: 3, name: "Jessica"},
            ];

            var hash = listy(source).toHash("id","name");

            expect(hash.count()).toBe(3);
            expect(hash(1)).toBe("Nick");
            expect(hash.contains(1)).toBe(true);
            expect(hash(2)).toBe("Jennifer");
            expect(hash.contains(2)).toBe(true);
            expect(hash(3)).toBe("Jessica");
            expect(hash.contains(3)).toBe(true);
            expect(hash(4)).toBe(undefined);
            expect(hash.contains(4)).toBe(false);
        });

        it ("should create a hash with a key and value expression",function(){
            var source = [
                {id: 1, name: "Nick"},
                {id: 2, name: "Jennifer"},
                {id: 3, name: "Jessica"},
            ];

            var hash = listy(source).toHash("id","name");

            expect(hash.count()).toBe(3);
            expect(hash(1)).toBe("Nick");
            expect(hash.contains(1)).toBe(true);
            expect(hash(2)).toBe("Jennifer");
            expect(hash.contains(2)).toBe(true);
            expect(hash(3)).toBe("Jessica");
            expect(hash.contains(3)).toBe(true);
            expect(hash(4)).toBe(undefined);
            expect(hash.contains(4)).toBe(false);
        });

        it("should create a hash with a globally parameterized key and value expression",function(){
            function idFrom(item){
                return item.id;
            }

            function nameFrom(item){
                return item.name;
            }

            var source = [
                {id: 1, name: "Nick"},
                {id: 2, name: "Jennifer"},
                {id: 3, name: "Jessica"},
            ];
            var params = {idFrom:idFrom,nameFrom: nameFrom}

            var hash = listy(source).toHash("idFrom($item)","nameFrom($item)",params);

            expect(hash.count()).toBe(3);
            expect(hash(1)).toBe("Nick");
            expect(hash.contains(1)).toBe(true);
            expect(hash(2)).toBe("Jennifer");
            expect(hash.contains(2)).toBe(true);
            expect(hash(3)).toBe("Jessica");
            expect(hash.contains(3)).toBe(true);
            expect(hash(4)).toBe(undefined);
            expect(hash.contains(4)).toBe(false);
        });

        it("should create a hash with a locally parameterized key and value expression",function(){
            function idFrom(item){
                return item.id;
            }

            function nameFrom(item){
                return item.name;
            }

            var source = [
                {id: 1, name: "Nick"},
                {id: 2, name: "Jennifer"},
                {id: 3, name: "Jessica"},
            ];
            var params = {idFrom:idFrom,nameFrom: nameFrom}

            var hash = listy(source).toHash(["idFrom($item)",params],["nameFrom($item)",params]);

            expect(hash.count()).toBe(3);
            expect(hash(1)).toBe("Nick");
            expect(hash.contains(1)).toBe(true);
            expect(hash(2)).toBe("Jennifer");
            expect(hash.contains(2)).toBe(true);
            expect(hash(3)).toBe("Jessica");
            expect(hash.contains(3)).toBe(true);
            expect(hash(4)).toBe(undefined);
            expect(hash.contains(4)).toBe(false);
        });
    });

    describe("method unique(key,params?)",function(){

        it ("should filter unique values from a simple array", function(){
            expect(listy([1,2,1,1,3,5,6]).unique()()).toEqual([1,2,3,5,6]);
        });

        it ("should filter unique values from an array of objects using a closure", function(){
            function asLocation(item){
                return item.location;
            }

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).unique(asLocation);

            expect(result()).toEqual([
                {location: "Oregon", person: "Archibald"},
                {location: "Seattle", person: "Jake"},
            ]);
        });

        it ("should filter unique values from an array of objects using closures for key and projection", function(){
            function asLocation(item){
                return item.location;
            }

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).unique(asLocation,asLocation);

            expect(result()).toEqual(["Oregon","Seattle"]);
        });

        it ("should filter unique values from an array of objects using closures for key and projection with a limit", function(){
            function asLocation(item){
                return item.location;
            }

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).unique(asLocation,asLocation,1);

            expect(result()).toEqual(["Oregon"]);
        });

        it ("should filter unique values from an array of objects using an expression", function(){
            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).unique("location");

            expect(result()).toEqual([
                {location: "Oregon", person: "Archibald"},
                {location: "Seattle", person: "Jake"},
            ]);
        });

        it ("should filter unique values from an array of objects using an expression for key and projection", function(){
            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).unique("location as location");

            expect(result()).toEqual(["Oregon","Seattle"]);
        });

        it ("should filter unique values from an array of objects using an expression for key and projection with a limit", function(){

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).unique("location as location limit 1");

            expect(result()).toEqual(["Oregon"]);
        });

        it ("should filter unique values from an array of objects using a parameterized expression", function(){
            function locationFor(item){
                return item.location;
            }

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).unique("locationFor($item) as locationFor($item) limit limitSize",{locationFor: locationFor, limitSize: 1});

            expect(result()).toEqual(["Oregon"]);
        });
    });

    describe("method uniqueSet(key,params?)",function(){

        it ("should filter unique values from a simple array", function(){
            expect(listy([1,2,1,1,3,5,6]).uniqueSet()()).toEqual([1,2,3,5,6]);
        });

        it ("should filter unique values from an array of objects using a closure", function(){
            function asLocation(item){
                return item.location;
            }

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).uniqueSet(asLocation);

            expect(result()).toEqual(["Oregon","Seattle"]);
        });

        it ("should filter unique values from an array of objects using closures for key and projection", function(){
            function asLocation(item){
                return item.location;
            }

            function asItem(item){
                return item;
            }

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).uniqueSet(asLocation,asItem);

            expect(result()).toEqual([
                {location: "Oregon", person: "Archibald"},
                {location: "Seattle", person: "Jake"},
            ]);
        });

        it ("should filter unique values from an array of objects using closures for key and projection with a limit", function(){
            function asLocation(item){
                return item.location;
            }

            function asItem(item){
                return item;
            }

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).uniqueSet(asLocation,asItem,1);

            expect(result()).toEqual([{location: "Oregon", person: "Archibald"}]);
        });

        it ("should filter unique values from an array of objects using an expression", function(){
            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).uniqueSet("location");

            expect(result()).toEqual(["Oregon","Seattle"]);
        });

        it ("should filter unique values from an array of objects using an expression for key and projection", function(){
            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).uniqueSet("location as $item");

            expect(result()).toEqual([
                {location: "Oregon", person: "Archibald"},
                {location: "Seattle", person: "Jake"},
            ]);
        });

        it ("should filter unique values from an array of objects using an expression for key and projection with a limit", function(){

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).uniqueSet("location as $item limit 1");

            expect(result()).toEqual([
                {location: "Oregon", person: "Archibald"}
            ]);
        });

        it ("should filter unique values from an array of objects using a parameterized expression", function(){
            function locationFor(item){
                return item.location;
            }

            function itemFor(item){
                return item;
            }

            var source = [
                {location: "Oregon", person: "Archibald"},
                {location: "Oregon", person: "Natalie"},
                {location: "Seattle", person: "Jake"},
                {location: "Oregon", person: "Isabel"},
                {location: "Seattle", person: "John"}
            ];

            var result = listy(source).uniqueSet("locationFor($item) as itemFor($item) limit limitSize",{locationFor: locationFor, itemFor: itemFor, limitSize: 1});

            expect(result()).toEqual([
                {location: "Oregon", person: "Archibald"}
            ]);
        });
    });

    describe("method toArray(map?)",function(){
        it("should return an array from an array sourced listy",function(){
            var source = [1,2,3,4,5];
            var result = listy(source).toArray();

            expect(result).toEqual([1,2,3,4,5]);
            expect(source).not.toBe(result);
        });

        it("should return an array from an iterator sourced listy",function(){
            var source = [1,2,3,4,5];
            var result = listy(listy(source).createIterator).toArray();

            expect(result).toEqual([1,2,3,4,5]);
            expect(source).not.toBe(result);
        });

        it("should return an closure mapped array from an array sourced listy",function(){
            var source = [1,2,3,4,5];
            var result = listy(source).toArray(String);

            expect(result).toEqual(['1','2','3','4','5']);
            expect(source).not.toBe(result);
        });

        it("should return an closure mapped array from an iterator sourced listy",function(){
            var source = [1,2,3,4,5];
            var result = listy(listy(source).createIterator).toArray(String);

            expect(result).toEqual(['1','2','3','4','5']);
            expect(source).not.toBe(result);
        });

        it("should return an expression mapped array from an array sourced listy",function(){
            var source = [1,2,3,4,5];
            var result = listy(source).toArray("'' + $item + ''");

            expect(result).toEqual(['1','2','3','4','5']);
            expect(source).not.toBe(result);
        });

        it("should return an expression mapped array from an iterator sourced listy",function(){
            var source = [1,2,3,4,5];
            var result = listy(listy(source).createIterator).toArray("'' + $item + ''");

            expect(result).toEqual(['1','2','3','4','5']);
            expect(source).not.toBe(result);
        });

        it("should return a parameterized expression mapped array from an array sourced listy",function(){
            var source = [1,2,3,4,5];
            var result = listy(source).toArray("str($item)",{str:String});

            expect(result).toEqual(['1','2','3','4','5']);
            expect(source).not.toBe(result);
        });

        it("should return an expression mapped array from an iterator sourced listy",function(){
            var source = [1,2,3,4,5];
            var result = listy(listy(source).createIterator).toArray("str($item)",{str:String});

            expect(result).toEqual(['1','2','3','4','5']);
            expect(source).not.toBe(result);
        });
    });

    describe("implicit method (map?)",function(){
        it("should return an array from an array sourced listy",function(){
            var source = [1,2,3,4,5];
            var result = listy(source)();

            expect(result).toEqual([1,2,3,4,5]);
            expect(source).not.toBe(result);
        });

        it("should return an array from an iterator sourced listy",function(){
            var source = [1,2,3,4,5];
            var result = listy(listy(source).createIterator)();

            expect(result).toEqual([1,2,3,4,5]);
            expect(source).not.toBe(result);
        });

        it("should return an closure mapped array from an array sourced listy",function(){
            var source = [1,2,3,4,5];
            var result = listy(source)(String);

            expect(result).toEqual(['1','2','3','4','5']);
            expect(source).not.toBe(result);
        });

        it("should return an closure mapped array from an iterator sourced listy",function(){
            var source = [1,2,3,4,5];
            var result = listy(listy(source).createIterator)(String);

            expect(result).toEqual(['1','2','3','4','5']);
            expect(source).not.toBe(result);
        });

        it("should return an expression mapped array from an array sourced listy",function(){
            var source = [1,2,3,4,5];
            var result = listy(source)("'' + $item + ''");

            expect(result).toEqual(['1','2','3','4','5']);
            expect(source).not.toBe(result);
        });

        it("should return an expression mapped array from an iterator sourced listy",function(){
            var source = [1,2,3,4,5];
            var result = listy(listy(source).createIterator)("'' + $item + ''");

            expect(result).toEqual(['1','2','3','4','5']);
            expect(source).not.toBe(result);
        });

        it("should return a parameterized expression mapped array from an array sourced listy",function(){
            var source = [1,2,3,4,5];
            var result = listy(source)("str($item)",{str:String});

            expect(result).toEqual(['1','2','3','4','5']);
            expect(source).not.toBe(result);
        });

        it("should return an expression mapped array from an iterator sourced listy",function(){
            var source = [1,2,3,4,5];
            var result = listy(listy(source).createIterator)("str($item)",{str:String});

            expect(result).toEqual(['1','2','3','4','5']);
            expect(source).not.toBe(result);
        });
    });

    describe("method forEach(action,param?)",function(){
        it("should operate on a closure", function(){
            var source = [
                {val: 1},
                {val: 5},
                {val: 3},
                {val: 4},
                {val: 2}
            ];

            var listee = listy(source);

            var result = listee.forEach(function(item,index){
                item.index = index;
            });

            expect(result).toBe(listee);
            expect(source).toEqual([
                {val: 1, index:0},
                {val: 5, index:1},
                {val: 3, index:2},
                {val: 4, index:3},
                {val: 2, index:4}
            ]);
        });

        it("should operate on a closure and break", function(){
            var source = [
                {val: 1},
                {val: 5},
                {val: 3},
                {val: 4},
                {val: 2}
            ];

            var listee = listy(source);

            var result = listee.forEach(function(item,index,ctx){
                if (index > 2){
                    return ctx.break;
                }

                item.index = index;
            });

            expect(result).toBe(listee);
            expect(source).toEqual([
                {val: 1, index:0},
                {val: 5, index:1},
                {val: 3, index:2},
                {val: 4},
                {val: 2}
            ]);
        });

        it("should operate on an expression", function(){
            var source = [
                {val: 1},
                {val: 5},
                {val: 3},
                {val: 4},
                {val: 2}
            ];

            var listee = listy(source);

            var result = listee.forEach("index = $index");

            expect(result).toBe(listee);
            expect(source).toEqual([
                {val: 1, index:0},
                {val: 5, index:1},
                {val: 3, index:2},
                {val: 4, index:3},
                {val: 2, index:4}
            ]);
        });

        it("should operate on an expression and break", function(){
            var source = [
                {val: 1},
                {val: 5},
                {val: 3},
                {val: 4},
                {val: 2}
            ];

            var listee = listy(source);

            var result = listee.forEach("$index > 2 ? $break : (index = $index)");

            expect(result).toBe(listee);
            expect(source).toEqual([
                {val: 1, index:0},
                {val: 5, index:1},
                {val: 3, index:2},
                {val: 4},
                {val: 2}
            ]);
        });

        it("should operate on a parameterized expression and break", function(){
            var source = [
                {val: 1},
                {val: 5},
                {val: 3},
                {val: 4},
                {val: 2}
            ];

            var listee = listy(source);

            var result = listee.forEach("$index > maxIndex ? $break : (index = $index)",{maxIndex: 2});

            expect(result).toBe(listee);
            expect(source).toEqual([
                {val: 1, index:0},
                {val: 5, index:1},
                {val: 3, index:2},
                {val: 4},
                {val: 2}
            ]);
        });
    });

    describe("method let(params)",function(){
        it("should set let params",function(){
            function getLocation(item){
                return item.location
            }

            function getPerson(item){
                return item.person
            }


            var source = [
                {locationId: 1, location: "Oregon", person: "Archibald"},
                {locationId: 1, location: "Oregon", person: "Natalie"},
                {locationId: 2, location: "Seattle", person: "Jake"},
                {locationId: 1, location: "Oregon", person: "Isabel"},
                {locationId: 2, location: "Seattle", person: "John"}
            ];

            var result = listy(source,{locationOf:getLocation,personOf:getPerson})
                .sort("locationOf($item) desc, person")
                .groupBy("locationId as locationOf($item)","personOf($item)")
                .toArray("{location: key, people: group()}");

            expect(result).toEqual([
                {
                    location: "Seattle",
                    people: ["Jake","John"]
                },
                {
                    location: "Oregon",
                    people: ["Archibald","Isabel","Natalie"]
                }
            ]);
        });

        it("should override let params",function(){
            function getLocation(item){
                return item.location
            }

            function getKeyLocation(item){
                return item.locationId + ":" + item.location;
            }

            function getPerson(item){
                return item.person
            }

            var source = [
                {locationId: 2, location: "Oregon", person: "Archibald"},
                {locationId: 2, location: "Oregon", person: "Natalie"},
                {locationId: 1, location: "Seattle", person: "Jake"},
                {locationId: 2, location: "Oregon", person: "Isabel"},
                {locationId: 1, location: "Seattle", person: "John"}
            ];

            var result = listy(source,{locationOf:getLocation, personOf:getPerson})
                .sort("locationOf($item) desc, person")
                .let({locationOf:getKeyLocation})
                .groupBy("locationId as locationOf($item)","personOf($item)")
                .toArray("{location: key, people: group()}");

            expect(result).toEqual([
                {
                    location: "1:Seattle",
                    people: ["Jake","John"]
                },
                {
                    location: "2:Oregon",
                    people: ["Archibald","Isabel","Natalie"]
                }
            ]);
        });
    });
});
