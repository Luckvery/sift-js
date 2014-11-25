    var Sift = require("../Sift");
    var _ = require("lodash");
    var testSiftCall;


    beforeEach(function() {
        testSiftCall = function(siftConfig) {
            return function() {var inputObj = Sift(siftConfig); return inputObj;};
        }
    });


    describe("Testing Sift Object\'s Contract Property", function() {
        var contractSiftCall;

        beforeEach(function() {
            contractSiftCall = function(contract) {
                return function() {
                    return Sift({
                        contract: contract,
                        args: [],
                        failOnError: true,
                        rules: {}
                    });
                };
            }
        });

        it("Contract property should not be a string", function() {
            contract = "";
            expect(contractSiftCall("")).toThrow(
                new Error('Sift violation: Contract must be an array')
            );
        });

        it("Contract property must contain at least 1 property", function() {
            expect(contractSiftCall([])).toThrow(
                new Error('Sift violation: Contract must contain at least 1 property')
            );
        });

        it("Contract property should be an array", function() {
            var inputObj = contractSiftCall(["foo", "bar"])();

            expect(inputObj.foo).toBeDefined();
            expect(inputObj.bar).toBeDefined();
            expect(inputObj.foo).toBeFalsy();
            expect(inputObj.bar).toBeFalsy();
            expect(inputObj.foo).toBe("");
            expect(inputObj.bar).toBe("");
        });
    });

    describe("Testing Sift Object\'s Args Property", function() {

        it("Args property may be an Argument object", function() {
            var passingArgsArgumentsObj = function() {
                var inputObj = Sift({
                    contract: ["foo", "bar"],
                    args: arguments,
                    failOnError: true,
                    rules: {}
                });
                return inputObj;
            }
            var inputObj = passingArgsArgumentsObj();

            expect(inputObj.foo).toBe("");
            expect(inputObj.bar).toBe("");
        });

        it("Args property may be an Array", function() {
            var passingArgsArr = function() {
                var inputObj = Sift({
                    contract: ["foo", "bar"],
                    args: [],
                    failOnError: true,
                    rules: {}
                });
                return inputObj;
            }
            var inputObj = passingArgsArr();
            expect(inputObj.foo).toBe("");
            expect(inputObj.bar).toBe("");
        });

        it("Args property may be valid json object of parameter name/value pairs", function() {
            var passingArgsJSON = function() {
                var inputObj = Sift({
                    contract: ["foo", "bar"],
                    args: {"foo":"apple", "bar":"pear"},
                    failOnError: true,
                    rules: {}
                });
                return inputObj;
            }
            var inputObj = passingArgsJSON();
            expect(inputObj.foo).toBe("apple");
            expect(inputObj.bar).toBe("pear");
        });

        it("Order of name/value pairs passed to args does not matter when pairedArgs is true", function() {
            var passingArgsOrder1 = function() {
                var inputObj = Sift({
                    contract: ["foo", "bar"],
                    args: ["foo", "apple", "bar", "pear"],
                    failOnError: true,
                    pairedArgs: true,
                    rules: {}
                });
                return inputObj;
            }

            var passingArgsOrder2 = function() {
                var inputObj = Sift({
                    contract: ["foo", "bar"],
                    args: [ "bar", "pear", "foo", "apple"],
                    failOnError: true,
                    pairedArgs: true,
                    rules: {}
                });
                return inputObj;
            }

            var inputObjOrder1 = passingArgsOrder1();
            var inputObjOrder2 = passingArgsOrder2();

            expect(inputObjOrder1.foo).toEqual("apple");
            expect(inputObjOrder2.foo).toEqual("apple");
            expect(inputObjOrder1.bar).toEqual("pear");
            expect(inputObjOrder2.bar).toEqual("pear");
            expect(inputObjOrder1.foo).toEqual(inputObjOrder2.foo);
            expect(inputObjOrder1.bar).toEqual(inputObjOrder2.bar);
        });


        it("As array Args property must be even number sized", function() {

            var oddSizedArgsSiftCallWithArr = function() {
                return function(){
                    var inputObj = Sift({
                        contract: ["foo", "bar"],
                        args: ["foo", "good", "bar"],
                        failOnError: true,
                        pairedArgs: true,
                        rules: {}
                    });
                };
            }

            expect(oddSizedArgsSiftCallWithArr()).toThrow(
                new Error('Sift violation: Bad argument count, missing value of one argument in set: [foo,bar]')
            );

        });

        it("As arguments object, Args property must be even number sized", function() {
            var oddSizedArgsSiftCallWithArgObj = function() {
                var argumentsOb  = arguments;
                return function(){
                    var inputObj = Sift({
                        contract: ["foo", "bar"],
                        args: argumentsOb,
                        failOnError: true,
                        pairedArgs: true,
                        rules: {}
                    });
                };
            }

            expect(oddSizedArgsSiftCallWithArgObj("foo", "good", "bar")).toThrow(
                new Error('Sift violation: Bad argument count, missing value of one argument in set: [foo,bar]')
            );

        });

        it("As array or arguments object, Even Args elements are names of parameters, odd elements their values: [a,v(a),b,v(b)]", function() {

            var parameterName1 = "foo";
            var parameterValue1 = "WOW";
            var parameterName2 = "bar";
            var parameterValue2 = "AWESOME";

            this.args = [parameterName1, parameterValue1, parameterName2, parameterValue2];

            var inputObj = Sift({
                contract: ["foo", "bar"],
                args: this.args,
                failOnError: true,
                pairedArgs: true,
                rules: {}
            });

            expect(inputObj.foo).toBeDefined();
            expect(inputObj.bar).toBeDefined();

            expect(inputObj.foo).toBe("WOW");
            expect(inputObj.bar).toBe("AWESOME");

            var properlyFormatedArgs = function() {
                return Sift({
                    contract: ["foo", "bar"],
                    args: arguments,
                    failOnError: true,
                    pairedArgs: true,
                    rules: {}
                });
            }
            inputObj = properlyFormatedArgs(parameterName1, parameterValue1, parameterName2, parameterValue2);

            expect(inputObj.foo).toBeDefined();
            expect(inputObj.bar).toBeDefined();

            expect(inputObj.foo).toBe("WOW");
            expect(inputObj.bar).toBe("AWESOME");

        });

        it("Calling Sift with Args as object literal with parameters that are not in the contract will fail", function() {

            var argsOLPropertiesNotInContract = function() {
                var argumentsOb  = arguments;
                return function(){
                    var inputObj = Sift({
                        contract: ["foo", "bar"],
                        args: {"bazz":"apple", "kazz":"pear"},
                        failOnError: true,
                        rules: {}
                    });
                };
            }

            expect(argsOLPropertiesNotInContract()).toThrow(
                new Error('Sift violation: Argument "bazz" is not valid: valid argument(s): [foo,bar]')
            );
        });

        it("Calling Sift with Args as array with parameters that are not in the contract will fail", function() {

            var argsArrayPropertiesNotInContract = function() {
                return function(){
                    var inputObj = Sift({
                        contract: ["foo", "bar"],
                        args: ["bazz","apple", "kazz","pear"],
                        failOnError: true,
                        pairedArgs: true,
                        rules: {}
                    });
                };
            }

            expect(argsArrayPropertiesNotInContract()).toThrow(
                new Error('Sift violation: Argument "bazz" is not valid: valid argument(s): [foo,bar]')
            );
        });

        it("Calling Sift with Args as arguments object with parameters that are not in the contract will fail", function() {

            var argsArgumentsPropertiesNotInContract = function() {
                var argumentsOb  = arguments;
                return function(){
                    var inputObj = Sift({
                        contract: ["foo", "bar"],
                        args: argumentsOb,
                        failOnError: true,
                        pairedArgs: true,
                        rules: {}
                    });
                };
            }

            expect(argsArgumentsPropertiesNotInContract("bazz","apple", "kazz","pear")).toThrow(
                new Error('Sift violation: Argument "bazz" is not valid: valid argument(s): [foo,bar]')
            );
        });

        it("Calling Sift with Args as object literal ommitting Args parameters that are in the contract is ok", function() {
            var passingArgsJSON = function() {
                var inputObj = Sift({
                    contract: ["foo", "bar"],
                    args: {"bar":"pear"},
                    failOnError: true,
                    rules: {}
                });
                return inputObj;
            }
            var inputObj = passingArgsJSON();

            expect(inputObj.foo).toBe("");
            expect(inputObj.bar).toBe("pear");
        });

        it("Calling Sift with Args as array ommitting Args parameters that are in the contract is ok", function() {
            var passingArgsJSON = function() {
                var inputObj = Sift({
                    contract: ["foo", "bar"],
                    args: ["bar", "pear"],
                    failOnError: true,
                    pairedArgs: true,
                    rules: {}
                });
                return inputObj;
            }
            var inputObj = passingArgsJSON();
            expect(inputObj.foo).toBe("");
            expect(inputObj.bar).toBe("pear");
        });

        it("Calling Sift with Args as arguments object ommitting Args parameters that are in the contract is ok", function() {
            var argumentsObjWithLessThanContract = function() {

                var inputObj = Sift({
                    contract: ["foo", "bar"],
                    args:  arguments,
                    pairedArgs: true,
                    failOnError: true,
                    rules: {}
                });
                return inputObj;
            }
            var inputObj = argumentsObjWithLessThanContract("bar", "pear");
            expect(inputObj.foo).toBe("");
            expect(inputObj.bar).toBe("pear");
        });

    });

    describe("Testing Sift Object\'s Rules Property", function() {

        beforeEach(function() {
            SiftObjectWithOutRules = {
                    contract: ["foo", "bar"],
                    args: ["foo", "apple", "bar", "pear"],
                    failOnError: true,
                    pairedArgs: true,
                    rules: {}
                };
        });

        describe("Testing Rules Property format", function() {

            it("Rules property should be an object", function() {
                SiftObjectWithOutRules.rules  = "";
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift violation: Rules must be Object Literal')
                );
            });

            it("Rules property with empty object Ok", function() {
                expect(Sift(SiftObjectWithOutRules)).toBeDefined();
            });

        });


        describe("Testing Sift Object\'s Rules.exclusive Property", function() {
            it("If present Rules.exclusive property should be an array", function() {
                SiftObjectWithOutRules.rules.exclusive  = "";
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.exclusive violation: If present Rules.exclusive property should be an array')
                );
            });

            it("One parameter from rules.exclusive group present in args is ok", function() {
                SiftObjectWithOutRules.rules.exclusive  = [
                    ["foo", "bar"]
                ];
                SiftObjectWithOutRules.args  =  ["foo", "apple"];
                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();

                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe("apple");
                expect(inputObj.bar).toBe("");
            });

            it("More than one parameter from rules.exclusive group present in args and Sift will throw error", function() {
                SiftObjectWithOutRules.rules.exclusive  = [
                    ["foo", "bar"]
                ];

                SiftObjectWithOutRules.args  =  ["foo", "apple", "bar", "pear"];
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error("Sift.rules.exclusive violation: Only 1 argument is allowed in this group: foo,bar")
                );
            });
        });

        describe("Testing Sift Object\'s Rules.requires Property", function() {
            it("Rules.requires property should be an object", function() {
                SiftObjectWithOutRules.rules.requires  = "";
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.requires violation: If present Rules.requires property should be an object')
                );
            });

            it("Rules.requires property created says if foo is present and bar is not present, Sift throws error", function() {

                SiftObjectWithOutRules.rules.requires  =  {
                    "foo": ["bar"]
                };

                SiftObjectWithOutRules.args  =  ["foo", "apple"];
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error("Sift.rules.requires violation: If foo exists as an argument, then bar must be present as an argument")
                );

            });

            it("Rules.requires property created says if foo is present then bar must be present for Sift to be ok", function() {

                SiftObjectWithOutRules.rules.requires  =  {
                    "foo": ["bar"]
                };

                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe("apple");
                expect(inputObj.bar).toBeDefined();
                expect(inputObj.bar).toBe("pear");

            });

        });

        describe("Testing Sift Object\'s Rules.only Property", function() {
            it("Rules.only property should be an object", function() {
                SiftObjectWithOutRules.rules.only  = "";
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.only violation: If present Rules.only property should be an object')
                );
            });

            it("Sift is ok if parameter values passed are not in Rules.only array for each argument", function() {

                SiftObjectWithOutRules.rules.only  = {
                    "foo": ["apple", "orange"],
                    "bar": ["pear", "banana"]
                };

                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();

                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe("apple");
                expect(inputObj.bar).toBeDefined();
                expect(inputObj.bar).toBe("pear");

            });

            it("Sift will throw error if any parameter values passed are not in Rules.only array for each argument", function() {

                SiftObjectWithOutRules.rules.only  = {
                    "foo": ["apple", "orange"],
                    "bar": ["pear", "banana"]
                };
                SiftObjectWithOutRules.args = ["foo", "pineapple"];
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.only violation: pineapple is not valid value for foo. Valid values for foo are: [ apple,orange ]')
                );

            });

        });

        describe("Testing Sift Object\'s Rules.atleastOne Property", function() {
            it("Rules.atleastOne property should be an boolean or undefined", function() {
                SiftObjectWithOutRules.rules.atLeastOne  =  "";
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(new Error('Sift.rules.atLeastOne violation: If present Rules.atLeastOne property should be a boolean'));
            });

            it("Sift OK if Rules.atleastOne property is true and at least one argument in the contract array must be present", function() {
                SiftObjectWithOutRules.rules.atLeastOne  =  true;

                SiftObjectWithOutRules.args  =  ["foo", "apple"];
                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe("apple");

            });

            it("Sift error is thrown if Rules.atleastOne property is true and no argument from the contract array is present", function() {
                SiftObjectWithOutRules.rules.atLeastOne  =  true;

                SiftObjectWithOutRules.args  =  [];
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.atLeastOne violation: At least one argument is required: [foo,bar]')
                );
            });
        });

        describe("Testing Sift Object\'s Rules.type Property", function() {
            it("Rules.type property should be an object", function() {
                SiftObjectWithOutRules.rules.type  =  "";
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.type violation: If present Rules.type property should be an object')
                );
            });

            it("Rules.type property determines type of value passed to each argument", function() {
                SiftObjectWithOutRules.rules.type  = {
                   "foo":["String"],
                   "bar":["Number"]
                };

                SiftObjectWithOutRules.args  =  ["foo", "apple","bar", 10743];
                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();

                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe("apple");
                expect(inputObj.bar).toBeDefined();
                expect(inputObj.bar).toBe(10743);
            });

            it("Sift will throw error if args contains parameters with corresponding types that conflict with Rules.type property", function() {

                SiftObjectWithOutRules.rules.type  = {
                   "foo":["String"],
                   "bar":["Number"]
                };

                SiftObjectWithOutRules.args  =  ["foo", "10743","bar", "apple"];
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.type violation: Type check fail for value apple of bar. Expected type: [Number]')
                );

                SiftObjectWithOutRules.args  =  ["foo", 10743,"bar", "apple"];
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.type violation: Type check fail for value 10743 of foo. Expected type: [String]')
                );
            });

        });

        describe("Testing Sift Object\'s Rules.custom Property", function() {
            it("Rules.custom property should be a function", function() {
                SiftObjectWithOutRules.rules.custom  =  "";
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.custom violation: If present Rules.custom property should be an object')
                );
            });

            it("Parameters will be evaluated against function passed to sub key representing parameter", function() {

                SiftObjectWithOutRules.rules.custom  =
                {
                   "foo":function(value){
                        return !!~value.toLowerCase().indexOf("p");
                    }
                };

                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                var inputObj = testSiftCall(SiftObjectWithOutRules)();

                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe("apple");
            });
        });

        describe("Testing Sift Object\'s Rules.oneForAll Property", function() {
            it("Rules.oneForAll property should be an array", function() {
                SiftObjectWithOutRules.rules.oneForAll  = "";
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.oneForAll violation: If present Rules.oneForAll property should be an array')
                );
            });

            it("If one param in Rules.oneForAll property exists in Sift.args then all params in Rules.oneForAll must be present", function() {
                SiftObjectWithOutRules.rules.oneForAll  = ["foo", "bar"];
                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();

                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe("apple");
                expect(inputObj.bar).toBeDefined();
                expect(inputObj.bar).toBe("pear");
            });

            it("Sift throws error if 1 or more argument in Rules.oneForAll property group is specified and not in Sift.args", function() {
                SiftObjectWithOutRules.rules.oneForAll  = ["foo", "bar"];
                SiftObjectWithOutRules.args  = ["foo", "apple"];
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.oneForAll violation: If 1 argument in this group is specified, they all must be specified: foo,bar')
                );
            });
        });
        describe("Testing Sift Object\'s Rules.collections Property", function() {

            it("Rules.collections property passes when it should", function () {

                var usersCollection = [
                    {"name": "Russell", "email": "russell@gmail.com"},
                    {"name": "David", "email": "david@gmail.com"},
                    {"name": "Paul", "email": "paul@gmail.com"},
                    {"name": "Shawn", "email": "shawn@gmail.com"},
                    {"name": "Fred", "email": "fred@gmail.com"},
                    {"name": "Dennis", "email": "dennis@gmail.com"},
                    {"name": "Andrew", "email": "andrew@gmail.com"}
                ];

                var collectionConfig = {
                    contract: ["name", "email"],
                    failOnError: true,
                    rules: {
                        required: ["name", "email"]
                    }
                };
                var mainConfig = {
                    contract: ["foo", "bar", "users"],
                    args: ["foo", "apple", "bar", "pear", "users", usersCollection],
                    pairedArgs: true,
                    rules: {
                        collections: {
                            "users": collectionConfig
                        }
                    }
                };

                var assertAllObjectsInOriginalCollectionAreReturnedBySift = function (collection) {
                    return _.every(collection, function (obj) {
                        return !_.isEmpty(_.where(usersCollection, obj));
                    }.bind(this));
                };

                var resultObj = Sift(mainConfig);
                expect(resultObj.foo).toBe("apple");
                expect(resultObj.bar).toBe("pear");
                expect(assertAllObjectsInOriginalCollectionAreReturnedBySift(resultObj.users)).toBe(true);

            });
            iit("Rules.collections property fail when it should", function () {
                var resultObj;
                var usersCollection = [
                    {"name": "Russell", "email": "russell@gmail.com"},
                    {"name": "David", "email": "david@gmail.com"},
                    {"name": "Paul", "email": "paul@gmail.com"},
                    {"name": "Shawn"},
                    {"name": "Fred", "email": "fred@gmail.com"},
                    {"name": "Dennis", "email": "dennis@gmail.com"},
                    {"name": "Andrew", "email": "andrew@gmail.com"}
                ];

                var collectionConfigWithFailOnError = {
                    contract: ["name", "email"],
                    failOnError: true,
                    rules: {
                        required: ["name", "email"]
                    }
                };
                var collectionConfigWithoutFailOnError = {
                    contract: ["name", "email"],
                    failOnError: false,
                    rules: {
                        required: ["name", "email"]
                    }
                };
                var mainConfig = {
                    contract: ["foo", "bar", "users"],
                    args: ["foo", "apple", "bar", "pear", "users", usersCollection],
                    pairedArgs: true,
                    rules: {
                        collections: {
                            "users": collectionConfigWithoutFailOnError
                        }
                    }
                };

                resultObj = Sift(mainConfig);
                expect(resultObj).toBe(false);

                mainConfig.rules.collections.users = collectionConfigWithFailOnError;
                expect(function(){ Sift(mainConfig);}).toThrow(
                    new Error(
                        'Sift.rules.required violation: 1 or more required argument(s) missing. Required argument(s): name,email'
                    )
                );

            });
        });

        describe("Testing Sift Object\'s Rules.defaults Property", function() {

            it("Rules.defaults property should be an object", function() {
                SiftObjectWithOutRules.rules.defaults  = "";
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.defaults violation: If present Rules.defaults property should be an object')
                );
            });

            it("Param in Rules.defaults property is applied when param is not present in args array", function() {

                SiftObjectWithOutRules.args            = ["truck", "rough"];
                SiftObjectWithOutRules.contract        = ["truck", "car"];
                SiftObjectWithOutRules.rules.defaults  = {
                    "car": "dogg"
                };

                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                var inputObj = testSiftCall(SiftObjectWithOutRules)();

                expect(inputObj.truck).toBeDefined();
                expect(inputObj.truck).toBe("rough");
                expect(inputObj.car).toBeDefined();
                expect(inputObj.car).toBe("dogg");
            });

            describe("Rules.defaults property is applied BEFORE Rules.map", function() {

                it("Param in Rules.defaults property is applied when param is present in args array", function() {
                    var obviousFunction = function(thing){ return "A pear is green";};

                    SiftObjectWithOutRules.args      = ["truck", "rough",  "car", "dogg"];
                    SiftObjectWithOutRules.contract  = ["truck", "car"];

                    SiftObjectWithOutRules.rules.defaults  = {
                        "car": "dogg"
                    };

                    SiftObjectWithOutRules.rules.map ={
                        "truck": {
                            "rough" : "An apple is red"
                        },
                        "car": {
                            "dogg"  : obviousFunction
                        }
                    }
                    expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                    var inputObj = testSiftCall(SiftObjectWithOutRules)();

                    //"truck" present in Sift.args, "rough" to "An apple is red" map applied
                    expect(inputObj.truck).toBeDefined();
                    expect(inputObj.truck).toBe("An apple is red");

                    //"car" present in Sift.args, "dogg" to "function" map applied
                    expect(inputObj.car).toBeDefined();
                    expect(inputObj.car).toBe(obviousFunction);
                });


                it("Param value in Rules.map property is still applied when param is not present in args array", function() {
                    var obviousFunction = function(thing){ return "A pear is green";};

                    SiftObjectWithOutRules.args      = ["truck", "rough"];
                    SiftObjectWithOutRules.contract  = ["truck", "car"];

                    SiftObjectWithOutRules.rules.defaults  = {
                        "car": "dogg"
                    };

                    SiftObjectWithOutRules.rules.map ={
                        "truck": {
                            "rough" : "An apple is red"
                        },
                        "car": {
                            "dogg"  : obviousFunction
                        }
                    }
                    expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                    var inputObj = testSiftCall(SiftObjectWithOutRules)();

                    //"truck" present in Sift.args, "rough" to "An apple is red" map applied
                    expect(inputObj.truck).toBeDefined();
                    expect(inputObj.truck).toBe("An apple is red");

                    //"car" not present in Sift.args, "dogg" to "function" still applied
                    expect(inputObj.car).toBeDefined();
                    expect(inputObj.car).toBe(obviousFunction);
                });
            });
        });

        describe("Testing Sift Object\'s Rules.required Property", function() {

            it("Rules.required property should be an array", function() {
                SiftObjectWithOutRules.rules.required  =  "";
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.required violation: If present Rules.required property should be an array')
                );
            });

            it("Rules.required property created says if bar is not present, Sift throws error", function() {
                SiftObjectWithOutRules.rules.required = ["bar"] ;
                SiftObjectWithOutRules.args  =  ["foo", "apple"];
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error("Sift.rules.required violation: 1 or more required argument(s) missing. Required argument(s): bar")
                );
            });

            it("Rules.required property created says if bar is not present, Sift throws error", function() {
                SiftObjectWithOutRules.rules.required = ["foo", "bar"] ;

                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe("apple");
                expect(inputObj.bar).toBeDefined();
                expect(inputObj.bar).toBe("pear");
            });

        });

        describe("Testing Sift Object\'s Rules.map Property", function() {
            it("Rules.map property should be an object", function() {
                SiftObjectWithOutRules.rules.map  =  "";
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.map violation: If present Rules.map property should be an object')
                );
            });

            it("Rules.map property does not have to be defined", function() {

                var obviousFunction = function(thing){ return "A pear is green";};

                SiftObjectWithOutRules.rules.map ={
                    "foo": {
                        "apple" : "An apple is red"
                    },
                    "bar": {
                        "pear"  : obviousFunction
                    }
                }
                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe("An apple is red");
                expect(inputObj.bar).toBeDefined();
                expect(inputObj.bar).toBe(obviousFunction);
            });

            it("Rules.map property does not have to be defined in Sift.args", function() {
                var obviousFunction = function(){ return "A pear is green";};
                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                SiftObjectWithOutRules.rules.map ={
                    "kazz": {
                        "apple" : "An apple is red"
                    },
                    "bazz": {
                        "pear"  : obviousFunction
                    }
                }
                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe("apple");
                expect(inputObj.bar).toBeDefined();
                expect(inputObj.bar).toBe("pear");
            });

        });
    });

    describe("Testing Sift Object\'s failOnError Property", function() {
        var SiftObjectWithOutFailOnError;
        var inputObj;

        beforeEach(function() {
            SiftObjectWithOutFailOnError = {
                    contract: ["foo", "bar"],
                    args: ["foo", "apple", "bar", "pear"],
                    pairedArgs : true,
                    rules: {}
                };
        });

        it("Sift.failOnError property does not have to be defined", function() {
            expect(testSiftCall(SiftObjectWithOutFailOnError)).not.toThrow();

            inputObj = testSiftCall(SiftObjectWithOutFailOnError)();
            expect(inputObj.foo).toBeDefined();
            expect(inputObj.foo).toBe("apple");
            expect(inputObj.bar).toBeDefined();
            expect(inputObj.bar).toBe("pear");
        });


        it("Sift.failOnError property should be a boolean", function() {
            SiftObjectWithOutFailOnError.failOnError  =  '';
            expect(testSiftCall(SiftObjectWithOutFailOnError)).toThrow(
                new Error('Sift violation: \'\' not a valid value. If defined failOnError must be a boolean')
            );
            SiftObjectWithOutFailOnError.failOnError  =  3543455;
            expect(testSiftCall(SiftObjectWithOutFailOnError)).toThrow(
                new Error('Sift violation: 3543455 not a valid value. If defined failOnError must be a boolean')
            );
        });

        describe("If Sift.failOnError property is set to false and error condition exists, Sift will return false", function() {

            var exampleSiftObj;

            beforeEach(function() {
                SiftObjectWithOutFailOnError.failOnError  =  false;
                SiftObjectWithOutFailOnError.pairedArgs  =  true;
                exampleSiftObj = SiftObjectWithOutFailOnError;
            });

            it("Sift.args: As array Args property must be even number sized", function() {
                exampleSiftObj.args  =  ["foo", "apple", "bar"];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it("Sift.rules.map: Rules.map property should be an object", function() {
                exampleSiftObj.rules.map  =  "";
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it("Sift.rules.only: Sift will throw error if any parameter values passed are not in Rules.only array for each argument", function() {
                exampleSiftObj.rules.only  = {
                        "foo": ["apple", "orange"],
                        "bar": ["pear", "banana"]
                };
                exampleSiftObj.args = ["foo", "pineapple"];

                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it("Sift.rules.required: Rules.required property created says if bar is not present, Sift throws error", function() {
                exampleSiftObj.rules.required = ["bar"] ;
                exampleSiftObj.args  =  ["foo", "apple"];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it("Sift.rules.exclusive: More than one parameter from rules.exclusive group present in args and Sift will throw error", function() {
                exampleSiftObj.rules.exclusive  = [
                    ["foo", "bar"]
                ];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it("Sift.contract: Contract property must contain at least 1 property", function() {
                exampleSiftObj.contract  =  [];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it("Sift.rules.custom: Parameters will be evaluated against function passed to sub key representing parameter", function() {
                exampleSiftObj.rules.custom  =
                {
                   "foo":function(value){
                        return !!~value.toLowerCase().indexOf('x');
                    }
                };

                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it("Sift.rules.type: Sift will throw error if args contains parameters with corresponding types that conflict with Rules.type property", function() {

                exampleSiftObj.rules.type  = {
                   "foo":["String"],
                   "bar":["Number"]
                };

                exampleSiftObj.args  =  ["foo", "10743","bar", "apple"];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);

                exampleSiftObj.args  =  ["foo", 10743,"bar", "apple"];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it("Sift.rules.atleastOne: Sift error is thrown if Rules.atleastOne property is true and no argument from the contract array is present", function() {
                exampleSiftObj.rules.atLeastOne  =  true;
                exampleSiftObj.args  =  [];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it("Sift.rules.oneForAll: Sift throws error if 1 or more argument in Rules.oneForAll property group is specified and not in Sift.args", function() {
                exampleSiftObj.rules.oneForAll  = ["foo", "bar"];
                exampleSiftObj.args  = ["foo", "apple"];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it("Sift.rules.oneForAll: Rules.defaults property should be an object", function() {
                exampleSiftObj.rules.defaults  = "";
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it("Sift.rules.requires: Rules.requires property created says if foo is present and bar is not present, Sift throws error", function() {

                exampleSiftObj.rules.requires  =  {
                    "foo": ["bar"]
                };

                exampleSiftObj.args  =  ["foo", "apple"];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);

            });

        });
    });

    describe("Testing Siftified Functions", function() {

        it("Passing a config 'fnConfig' and a function 'fn' to Sift should return a function whose parameters will " +
        "be evaluated against 'fnConfig'", function() {

            var cool = function (name, email){
                return name + " can't be reached at " + email;
            };

            var fnConfig = {
              contract: ["name", "email"],
              failOnError: true,
              rules: {
                  required: ["name", "email"]
              }
            };

            var fn = Sift(fnConfig, cool);

            expect(fn instanceof Function).toBe(true);

            expect(function(){ fn(); } ).toThrow(
                new Error('Sift.rules.required violation: 1 or more required argument(s) missing. Required argument(s): name,email')
            );

            expect(function(){ Sift(fnConfig, "You didn't have to cut me off"); } ).toThrow(
                new Error('Expected function to siftify or collection to evaluate')
            );

            expect(function(){
                return fn("Russell", "notreallyrussell@gmail.com");
            }.bind(this)()).toEqual("Russell can't be reached at notreallyrussell@gmail.com");

        });

        it("Passing a config 'fnConfig' and a function 'fn' to Sift should return a function whose parameters will " +
        "be evaluated against 'fnConfig'", function() {

            var cool = function (name, email){
                return name + " can't be reached at " + email;
            };

            var fnConfig = {
                contract: ["name", "email"],
                failOnError: true,
                pairedArgs: true, // :)
                rules: {
                  required: ["name", "email"]
              }
            };

            var fn = Sift(fnConfig, cool);

            expect(fn instanceof Function).toBe(true);

            expect(function(){ fn({}); } ).toThrow(
                new Error('Sift violation: Bad argument count, missing value of one argument in set: [name,email]')
            );

            expect(function(){ fn(); } ).toThrow(
                new Error('Sift.rules.required violation: 1 or more required argument(s) missing. Required argument(s): name,email')
            );

            expect(function(){
                return fn("name", "Russell", "email", "notreallyrussell@gmail.com");
            }.bind(this)()).toEqual("Russell can't be reached at notreallyrussell@gmail.com");

        });

    });

    describe("Testing Siftified Collections", function() {

        it("Given a config 'fnConfig' and a collection 'col' Sift will throw an error if any object in collection " +
            "fails to be validation when evaluated against 'fnConfig'", function() {

            var col = [
                {"name":"Russell", "email":"russell@gmail.com"},
                {"name":"David", "email":"david@gmail.com"},
                {"name":"Paul", "email":"paul@gmail.com"},
                {"name":"Shawn"},
                {"name":"Fred", "email":"fred@gmail.com"},
                {"name":"Dennis", "email":"dennis@gmail.com"},
                {"name":"Andrew", "email":"andrew@gmail.com"}
            ];

            var fnConfig = {
              contract: ["name", "email"],
              failOnError: true,
              rules: {
                  required: ["name", "email"]
              }
            };

            expect(function(){ Sift(fnConfig, col);} ).toThrow(
                new Error('Sift.rules.required violation: 1 or more required argument(s) missing. Required argument(s): name,email')
            );
        });

        it("Given a config 'fnConfig' and a collection 'col' Sift will throw an error if any object in collection " +
            "fails to be validation when evaluated against 'fnConfig'", function() {

            var col = [
                {"name":"Russell", "email":"russell@gmail.com"},
                {"name":"David", "email":"david@gmail.com"},
                {"name":"Paul", "email":"paul@gmail.com"},
                {"name":"Shawn"},
                {"name":"Fred", "email":"fred@gmail.com"},
                {"name":"Dennis", "email":"dennis@gmail.com"},
                {"name":"Andrew", "email":"andrew@gmail.com"}
            ];

            var fnConfig = {
              contract: ["name", "email"],
              failOnError: false,  // :)
              rules: {
                  required: ["name", "email"]
              }
            };

            expect(Sift(fnConfig, col)).toBe(false);
        });

        it("Given a config 'fnConfig' and a collection 'col' Sift will return the collection if all objects " +
            "in collection evaluated against 'fnConfig' are valid", function() {

            var col = [
                {"name":"Russell", "email":"russell@gmail.com"},
                {"name":"David", "email":"david@gmail.com"},
                {"name":"Paul", "email":"paul@gmail.com"},
                {"name":"Shawn", "email":"shawn@gmail.com"},
                {"name":"Fred", "email":"fred@gmail.com"},
                {"name":"Dennis", "email":"dennis@gmail.com"},
                {"name":"Andrew", "email":"andrew@gmail.com"}
            ];

            var fnConfig = {
              contract: ["name", "email"],
              failOnError: true,
              rules: {
                  required: ["name", "email"]
              }
            };

            var assertAllObjectsInOriginalCollectionAreReturnedBySift = function () {
                return _.every(Sift(fnConfig, col), function (obj) {
                    return !_.isEmpty(_.where(col, obj));
                }.bind(this));
            };

            expect(assertAllObjectsInOriginalCollectionAreReturnedBySift()).toBe(true);
        });
    });
//        var fnConfig = {
//            contract: ["name", "email"],
//            failOnError: true,
//            rules: {
//                required: ["name", "email"]
//            }
//        };

//         var inputObj = Sift({
//         contract:["url", "named", "butler", "reconcile", "shell", "config", "year"],
//         args: this.args,
//         failOnError: true,
//         pairedArgs: true,
//         rules:{
//                 exclusive: [
//                     ["url", "named"]
//                 ],
//                 collections: {
//                     "users": fnConfig
//                 },
//                 requires: {
//                     "reconcile": ["butler"]
//                 },
//                 only: {
//                     "shell": ["Terminal", "iTerm"],
//                     "config: ["yes", "no"]
//                 },
//                 defaults: {
//                     "shell": "Terminal"
//                 },
//                 oneForAll: ["module", "butler"],
//                 atLeastOne: true,
//                 required: ["name"],
//                 map: {
//                     "config": {
//                         "yes": true,
//                         "no": false
//                     }
//                 },
//                type:{
//                    "url":["String"],
//                    "year":["number"],
//                    "butler":["String", "regex"]
//                },
//                custom:{
//                    "shell":function(value){
//                       return value.toLowerCase() == "terminal" 
//                          || value.toLowerCase() == "iterm" 
//                          || value.toLowerCase() == "gitbash";
//                     }
//                }        
//             }
//         });  
