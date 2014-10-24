describe("listy service",function() {
    describe("dependencies",function(){
        describe("listyComponents service", function () {
            var listyComponents;

            function accumulate(iteratorFactory) {
                var resultArray, iterator;

                iterator = iteratorFactory();
                resultArray = [];
                while (iterator.next()) {
                    resultArray.push({index: iterator.index(), value: iterator.value()});
                }

                return resultArray;
            }

            beforeEach(function () {
                module('listyMod');
                inject(function ($injector) {
                    listyComponents = $injector.get("listyComponents")();
                })
            });

            it("should create an iterator from an array", function () {
                var iteratorFactory;

                iteratorFactory = listyComponents.arrayIterFactory([]);

                expect(iteratorFactory).toBeDefined();
            });

            it("should accumlulate appropriatedly", function () {
                var iteratorFactory, resultArray;

                iteratorFactory = listyComponents.arrayIterFactory([1, 4, 3, 2]);

                resultArray = accumulate(iteratorFactory);

                expect(resultArray).toEqual([
                    {index: 0, value: 1},
                    {index: 1, value: 4},
                    {index: 2, value: 3},
                    {index: 3, value: 2}
                ]);
            });

            it("should create an iterator from parent", function () {

                var innerIteratorFactory, iteratorFactory;

                innerIteratorFactory = listyComponents.arrayIterFactory([]);
                iteratorFactory = listyComponents.childIterFactory(innerIteratorFactory);

                expect(iteratorFactory).toBeDefined();
            });


            it("should create an iterator from parent that filters", function () {

                var innerIteratorFactory, iteratorFactory, resultArray;

                innerIteratorFactory = listyComponents.arrayIterFactory([1, 4, 3, 2]);
                iteratorFactory = listyComponents.childIterFactory(innerIteratorFactory, {filterOp: function (value, index) {
                    return value > 2 && index > 0;
                }});

                resultArray = accumulate(iteratorFactory);

                expect(resultArray).toEqual([
                    {index: 0, value: 4},
                    {index: 1, value: 3},
                ]);
            });


            it("should create an iterator from parent that breaks", function () {

                var innerIteratorFactory, iteratorFactory, resultArray;

                innerIteratorFactory = listyComponents.arrayIterFactory([4, 1, 2, 3]);
                iteratorFactory = listyComponents.childIterFactory(innerIteratorFactory, {breakOp: function (value, index) {
                    return value === index;
                }});

                resultArray = accumulate(iteratorFactory);

                expect(resultArray).toEqual([
                    {index: 0, value: 4}
                ]);
            });


            it("should create an iterator from parent that filters and breaks", function () {

                var innerIteratorFactory, iteratorFactory, resultArray;

                innerIteratorFactory = listyComponents.arrayIterFactory([4, 2, 1, 3]);
                iteratorFactory = listyComponents.childIterFactory(innerIteratorFactory, {
                    breakOp: function (value, index) {
                        return value === index;
                    },

                    filterOp: function (value, index) {
                        return value <= 3 && index > 1;
                    }
                });

                resultArray = accumulate(iteratorFactory);

                expect(resultArray).toEqual([
                    {index: 0, value: 1}
                ]);
            });

            it("should create an iterator from parent that projects", function () {

                var innerIteratorFactory, iteratorFactory, resultArray;

                innerIteratorFactory = listyComponents.arrayIterFactory([4, 2, 1, 3]);
                iteratorFactory = listyComponents.childIterFactory(innerIteratorFactory, {
                    projectOp: function (value, index) {
                        return "value " + value + " at index " + index;
                    }
                });

                resultArray = accumulate(iteratorFactory);

                expect(resultArray).toEqual([
                    {index: 0, value: "value 4 at index 0"},
                    {index: 1, value: "value 2 at index 1"},
                    {index: 2, value: "value 1 at index 2"},
                    {index: 3, value: "value 3 at index 3"}
                ]);
            });

            it("should create an iterator from parent that filters and projects", function () {

                var innerIteratorFactory, iteratorFactory, resultArray;

                innerIteratorFactory = listyComponents.arrayIterFactory([4, 2, 1, 3]);
                iteratorFactory = listyComponents.childIterFactory(innerIteratorFactory, {
                    filterOp: function (value, index) {
                        return value <= 2 && index >= 1;
                    },

                    projectOp: function (value, index) {
                        return "value " + value + " at index " + index;
                    }
                });

                resultArray = accumulate(iteratorFactory);

                expect(resultArray).toEqual([
                    {index: 0, value: "value 2 at index 0"},
                    {index: 1, value: "value 1 at index 1"},
                ]);
            });

            it("should create an iterator from parent that filters and breaks", function () {

                var innerIteratorFactory, iteratorFactory, resultArray;

                innerIteratorFactory = listyComponents.arrayIterFactory([4, 2, 1, 3]);
                iteratorFactory = listyComponents.childIterFactory(innerIteratorFactory, {
                    breakOp: function (value, index) {
                        return value === index;
                    },

                    filterOp: function (value, index) {
                        return value <= 3 && index > 1;
                    },

                    projectOp: function (value, index) {
                        return "value " + value + " at index " + index;
                    }
                });

                resultArray = accumulate(iteratorFactory);

                expect(resultArray).toEqual([
                    {index: 0, value: "value 1 at index 0"}
                ]);
            });


            it("should parse sort expressions", function () {
                var result = listyComponents.parseSorterExpression("id");
                expect(result).toEqual([
                    {
                        exp: "id",
                        reverse: false,
                        comparitor: undefined
                    }
                ]);

                result = listyComponents.parseSorterExpression("id + name desc");
                expect(result).toEqual([
                    {
                        exp: "id + name",
                        reverse: true,
                        comparitor: undefined
                    }
                ]);

                result = listyComponents.parseSorterExpression("id + name with $compare");
                expect(result).toEqual([
                    {
                        exp: "id + name",
                        reverse: false,
                        comparitor: "$compare"
                    }
                ]);

                result = listyComponents.parseSorterExpression("id + name with $compare, place desc");
                expect(result).toEqual([
                    {
                        exp: "id + name",
                        reverse: false,
                        comparitor: "$compare"
                    },
                    {
                        exp: "place",
                        reverse: true,
                        comparitor: undefined
                    }
                ]);

                result = listyComponents.parseSorterExpression(
                        "id + name asc with $compare"
                        + ", place desc"
                        + ", time"
                        + ", other with $compare"
                        + ", doit(now) asc");
                expect(result).toEqual([
                    {
                        exp: "id + name",
                        reverse: false,
                        comparitor: "$compare"
                    },
                    {
                        exp: "place",
                        reverse: true,
                        comparitor: undefined
                    },
                    {
                        exp: "time",
                        reverse: false,
                        comparitor: undefined
                    },
                    {
                        exp: "other",
                        reverse: false,
                        comparitor: "$compare"
                    },
                    {
                        exp: "doit(now)",
                        reverse: false,
                        comparitor: undefined
                    },
                ]);


                result = listyComponents.parseSorterExpression("id + name desc with $compare");
                expect(result).toEqual([
                    {
                        exp: "id + name",
                        reverse: true,
                        comparitor: "$compare"
                    }
                ]);
            });

            it("should create functioning comparitors", function () {
                var comparitors = listyComponents.createComparitors();

                function desc(comp) {
                    function reverse(item, compare) {
                        return comp(item, compare) * -1;
                    }

                    return reverse;
                }


                expect([null, null, "B", "A"].sort(comparitors.$standard))
                    .toEqual(["A", "B", null, null]);

                expect([null, null, "B", "A"].sort(comparitors.$standard))
                    .toEqual(["A", "B", null, null]);

                expect([null, null, null, null, "B", "A"].sort(comparitors.$standard))
                    .toEqual(["A", "B", null, null, null, null]);

                expect([null, null, "B", null, "A", null].sort(comparitors.$standard))
                    .toEqual(["A", "B", null, null, null, null]);

                expect([null, null, new Date(2004, 3, 1), new Date(2003, 1, 2)].sort(comparitors.$standard))
                    .toEqual([new Date(2003, 1, 2), new Date(2004, 3, 1), null, null]);

                expect([null, null, 1, 2].sort(comparitors.$standard))
                    .toEqual([1, 2, null, null]);

                expect([null, 2, 1].sort(desc(comparitors.$value)))
                    .toEqual([null, 2, 1]);
            });
        });
    });
});