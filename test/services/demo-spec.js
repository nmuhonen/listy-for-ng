describe("listy service demo test",function(){
    var listy;

    beforeEach(function () {
        module('listyMod');
        inject(function ($injector) {
            listy = $injector.get("listy");
        })
    });

    it("should show a demo",function(){
        var source = [
            {state: "OR", city: "Medford", person: "Mike"},
            {state: "WA", city: "Spokane", person: "Jennifer"},
            {state: "WA", city: "Spokane", person: "Gerald"},
            {state: "OR", city: "Eugene", person: "Jason"},
            {state: "OR", city: "Eugene", person: "Gerald"},
            {state: "OR", city: "Portland", person: "Eric"},
            {state: "OR", city: "Portland", person: "Isabel"},
            {state: "WA", city: " Seattle", person: "Elizabeth"},
            {state: "OR", city: "Portland", person: "Sally"},
            {state: "WA", city: " Seattle", person: "Isabel"}
        ];

        var states = [
            {id: "OR", description: "Oregon"},
            {id: "WA", description: "Washington"},
        ]

        var result = listy(source).sort(function(item,compare){return item.person.localeCompare(compare.person);});
        var array = result("person");

        result = listy(source).sort("person");
        array = result("person");

        result = listy(source).sort("getState($item) desc, city, person",{getState:function(item){return item.state}});
        array = result("$extend({index: $index})");

        array = listy(source,{getState:function(item){return item.state;}})
            .sort("getState($item) desc, city, person")
            .groupBy("getState($item)","{city:city, person:person}")
            .toArray("{state:key, cityPeople:group.take(2)()}");

        array = listy(source)
            .let({
                getState:function(item){return item.state;},
                stateDesc: listy(states).toHash("id","description")
            })
            .sort("getState($item) desc, city, person")
            .groupBy("getState($item) as stateDesc(state)","{city:city, person:person}")
            .toArray("{state:key, cityPeople:group.take(2)()}");

        var arrayString = JSON.stringify(array,null,4);

        var end = "the end";
    });
});