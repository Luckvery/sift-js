    var Sift = require('../Sift');
    var _ = require('lodash');
    var testSiftCall;

    beforeEach(function() {
        testSiftCall = function(siftConfig) {
            return function() {var inputObj = Sift(siftConfig); return inputObj;};
        }
    });

    describe('Testing Sift Object\'s Contract Property', function() {
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

        it('Contract property should not be a string', function() {
            contract = '';
            expect(contractSiftCall('')).toThrow(
                new Error('Sift violation: Contract must be an array')
            );
        });

        it('Contract property must contain at least 1 property', function() {
            expect(contractSiftCall([])).toThrow(
                new Error('Sift violation: Contract must contain at least 1 property')
            );
        });

        it('Contract property should be an array', function() {
            var inputObj = contractSiftCall(['foo', 'bar'])();

            expect(inputObj.foo).toBeDefined();
            expect(inputObj.bar).toBeDefined();
            expect(inputObj.foo).toBeFalsy();
            expect(inputObj.bar).toBeFalsy();
            expect(inputObj.foo).toBe('');
            expect(inputObj.bar).toBe('');
        });
    });

    describe('Testing Sift Object\'s Args Property', function() {

        it('Args property may be an Argument object', function() {
            var passingArgsArgumentsObj = function() {
                var inputObj = Sift({
                    contract: ['foo', 'bar'],
                    args: arguments,
                    failOnError: true,
                    rules: {}
                });
                return inputObj;
            }
            var inputObj = passingArgsArgumentsObj();

            expect(inputObj.foo).toBe('');
            expect(inputObj.bar).toBe('');
        });

        it('Args property may be an Array', function() {
            var passingArgsArr = function() {
                var inputObj = Sift({
                    contract: ['foo', 'bar'],
                    args: [],
                    failOnError: true,
                    rules: {}
                });
                return inputObj;
            }
            var inputObj = passingArgsArr();
            expect(inputObj.foo).toBe('');
            expect(inputObj.bar).toBe('');
        });

        it('Args property may be valid json object of parameter name/value pairs', function() {
            var passingArgsJSON = function() {
                var inputObj = Sift({
                    contract: ['foo', 'bar'],
                    args: {'foo':'apple', 'bar':'pear'},
                    failOnError: true,
                    rules: {}
                });
                return inputObj;
            }
            var inputObj = passingArgsJSON();
            expect(inputObj.foo).toBe('apple');
            expect(inputObj.bar).toBe('pear');
        });

        it('Order of name/value pairs passed to args does not matter when pairedArgs is true', function() {
            var passingArgsOrder1 = function() {
                var inputObj = Sift({
                    contract: ['foo', 'bar'],
                    args: ['foo', 'apple', 'bar', 'pear'],
                    failOnError: true,
                    pairedArgs: true,
                    rules: {}
                });
                return inputObj;
            }

            var passingArgsOrder2 = function() {
                var inputObj = Sift({
                    contract: ['foo', 'bar'],
                    args: [ 'bar', 'pear', 'foo', 'apple'],
                    failOnError: true,
                    pairedArgs: true,
                    rules: {}
                });
                return inputObj;
            }

            var inputObjOrder1 = passingArgsOrder1();
            var inputObjOrder2 = passingArgsOrder2();

            expect(inputObjOrder1.foo).toEqual('apple');
            expect(inputObjOrder2.foo).toEqual('apple');
            expect(inputObjOrder1.bar).toEqual('pear');
            expect(inputObjOrder2.bar).toEqual('pear');
            expect(inputObjOrder1.foo).toEqual(inputObjOrder2.foo);
            expect(inputObjOrder1.bar).toEqual(inputObjOrder2.bar);
        });


        it('As array Args property must be even number sized', function() {

            var oddSizedArgsSiftCallWithArr = function() {
                return function(){
                    var inputObj = Sift({
                        contract: ['foo', 'bar'],
                        args: ['foo', 'good', 'bar'],
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

        it('As arguments object, Args property must be even number sized', function() {
            var oddSizedArgsSiftCallWithArgObj = function() {
                var argumentsOb  = arguments;
                return function(){
                    var inputObj = Sift({
                        contract: ['foo', 'bar'],
                        args: argumentsOb,
                        failOnError: true,
                        pairedArgs: true,
                        rules: {}
                    });
                };
            }

            expect(oddSizedArgsSiftCallWithArgObj('foo', 'good', 'bar')).toThrow(
                new Error('Sift violation: Bad argument count, missing value of one argument in set: [foo,bar]')
            );

        });

        it('As array or arguments object, Even Args elements are names of parameters, odd elements their values: ' +
        '[a,v(a),b,v(b)]', function() {

            var parameterName1 = 'foo';
            var parameterValue1 = 'WOW';
            var parameterName2 = 'bar';
            var parameterValue2 = 'AWESOME';

            this.args = [parameterName1, parameterValue1, parameterName2, parameterValue2];

            var inputObj = Sift({
                contract: ['foo', 'bar'],
                args: this.args,
                failOnError: true,
                pairedArgs: true,
                rules: {}
            });

            expect(inputObj.foo).toBeDefined();
            expect(inputObj.bar).toBeDefined();

            expect(inputObj.foo).toBe('WOW');
            expect(inputObj.bar).toBe('AWESOME');

            var properlyFormatedArgs = function() {
                return Sift({
                    contract: ['foo', 'bar'],
                    args: arguments,
                    failOnError: true,
                    pairedArgs: true,
                    rules: {}
                });
            }
            inputObj = properlyFormatedArgs(parameterName1, parameterValue1, parameterName2, parameterValue2);

            expect(inputObj.foo).toBeDefined();
            expect(inputObj.bar).toBeDefined();

            expect(inputObj.foo).toBe('WOW');
            expect(inputObj.bar).toBe('AWESOME');

        });

        it('Calling Sift with Args as object literal with parameters that are not in the contract will fail',
            function() {

            var argsOLPropertiesNotInContract = function() {
                var argumentsOb  = arguments;
                return function(){
                    var inputObj = Sift({
                        contract: ['foo', 'bar'],
                        args: {'bazz':'apple', 'kazz':'pear'},
                        failOnError: true,
                        rules: {}
                    });
                };
            }

            expect(argsOLPropertiesNotInContract()).toThrow(
                new Error('Sift violation: Argument "bazz" is not valid: valid argument(s): [foo,bar]')
            );
        });

        it('Calling Sift with Args as array with parameters that are not in the contract will fail', function() {

            var argsArrayPropertiesNotInContract = function() {
                return function(){
                    var inputObj = Sift({
                        contract: ['foo', 'bar'],
                        args: ['bazz','apple', 'kazz','pear'],
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

        it('Calling Sift with Args as arguments object with parameters that are not in the contract will fail',
            function() {

            var argsArgumentsPropertiesNotInContract = function() {
                var argumentsOb  = arguments;
                return function(){
                    var inputObj = Sift({
                        contract: ['foo', 'bar'],
                        args: argumentsOb,
                        failOnError: true,
                        pairedArgs: true,
                        rules: {}
                    });
                };
            }

            expect(argsArgumentsPropertiesNotInContract('bazz','apple', 'kazz','pear')).toThrow(
                new Error('Sift violation: Argument "bazz" is not valid: valid argument(s): [foo,bar]')
            );
        });

        it('Calling Sift with Args as object literal ommitting Args parameters that are in the contract is ok',
            function() {
            var passingArgsJSON = function() {
                var inputObj = Sift({
                    contract: ['foo', 'bar'],
                    args: {'bar':'pear'},
                    failOnError: true,
                    rules: {}
                });
                return inputObj;
            }
            var inputObj = passingArgsJSON();

            expect(inputObj.foo).toBe('');
            expect(inputObj.bar).toBe('pear');
        });

        it('Calling Sift with Args as array ommitting Args parameters that are in the contract is ok', function() {
            var passingArgsJSON = function() {
                var inputObj = Sift({
                    contract: ['foo', 'bar'],
                    args: ['bar', 'pear'],
                    failOnError: true,
                    pairedArgs: true,
                    rules: {}
                });
                return inputObj;
            }
            var inputObj = passingArgsJSON();
            expect(inputObj.foo).toBe('');
            expect(inputObj.bar).toBe('pear');
        });

        it('Calling Sift with Args as arguments object ommitting Args parameters that are in the contract is ok',
            function() {
            var argumentsObjWithLessThanContract = function() {

                var inputObj = Sift({
                    contract: ['foo', 'bar'],
                    args:  arguments,
                    pairedArgs: true,
                    failOnError: true,
                    rules: {}
                });
                return inputObj;
            }
            var inputObj = argumentsObjWithLessThanContract('bar', 'pear');
            expect(inputObj.foo).toBe('');
            expect(inputObj.bar).toBe('pear');
        });

    });

    describe('Testing Sift Object\'s Rules Property', function() {

        beforeEach(function() {
            SiftObjectWithOutRules = {
                    contract: ['foo', 'bar'],
                    args: ['foo', 'apple', 'bar', 'pear'],
                    failOnError: true,
                    pairedArgs: true,
                    rules: {}
                };
        });

        describe('Testing Rules Property format', function() {

            it('Rules property should be an object', function() {
                SiftObjectWithOutRules.rules  = '';
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift violation: Rules must be Object Literal')
                );
            });

            it('Rules property with empty object Ok', function() {
                expect(Sift(SiftObjectWithOutRules)).toBeDefined();
            });

        });

        describe('Testing Sift Object\'s Rules.exclusive Property', function() {
            it('If present Rules.exclusive property should be an array', function() {
                SiftObjectWithOutRules.rules.exclusive  = '';
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.exclusive violation: If present Rules.exclusive property should be an array')
                );
            });

            it('One parameter from rules.exclusive group present in args is ok', function() {
                SiftObjectWithOutRules.rules.exclusive  = [
                    ['foo', 'bar']
                ];
                SiftObjectWithOutRules.args  =  ['foo', 'apple'];
                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();

                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe('apple');
                expect(inputObj.bar).toBe('');
            });

            it('More than one parameter from rules.exclusive group present in args and Sift will throw error',
                function() {
                SiftObjectWithOutRules.rules.exclusive  = [
                    ['foo', 'bar']
                ];

                SiftObjectWithOutRules.args  =  ['foo', 'apple', 'bar', 'pear'];
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.exclusive violation: Only 1 argument is allowed in this group: foo,bar')
                );
            });
        });

        describe('Testing Sift Object\'s Rules.requires Property', function() {
            it('Rules.requires property should be an object', function() {
                SiftObjectWithOutRules.rules.requires  = '';
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.requires violation: If present Rules.requires property should be an object')
                );
            });

            it('Rules.requires property created says if foo is present and bar is not present, Sift throws error',
                function() {

                SiftObjectWithOutRules.rules.requires  =  {
                    'foo': ['bar']
                };

                SiftObjectWithOutRules.args  =  ['foo', 'apple'];
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.requires violation: If foo exists as an argument, ' +
                    'then bar must be present as an argument')
                );

            });

            it('Rules.requires property created says if foo is present then bar must be present for Sift to be ok',
                function() {

                SiftObjectWithOutRules.rules.requires  =  {
                    'foo': ['bar']
                };

                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe('apple');
                expect(inputObj.bar).toBeDefined();
                expect(inputObj.bar).toBe('pear');

            });

        });

        describe('Testing Sift Object\'s Rules.only Property', function() {
            it('Rules.only property should be an object', function() {
                SiftObjectWithOutRules.rules.only  = '';
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.only violation: If present Rules.only property should be an object')
                );
            });

            it('Sift is ok if parameter values passed are not in Rules.only array for each argument', function() {

                SiftObjectWithOutRules.rules.only  = {
                    'foo': ['apple', 'orange'],
                    'bar': ['pear', 'banana']
                };

                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();

                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe('apple');
                expect(inputObj.bar).toBeDefined();
                expect(inputObj.bar).toBe('pear');

            });

            it('Sift will throw error if any parameter values passed are not in Rules.only array for each argument',
                function() {

                SiftObjectWithOutRules.rules.only  = {
                    'foo': ['apple', 'orange'],
                    'bar': ['pear', 'banana']
                };
                SiftObjectWithOutRules.args = ['foo', 'pineapple'];
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.only violation: pineapple is not valid value for foo. ' +
                    'Valid values for foo are: [ apple,orange ]')
                );

            });

        });

        describe('Testing Sift Object\'s Rules.atleastOne Property', function() {
            it('Rules.atleastOne property should be an boolean or undefined', function() {
                SiftObjectWithOutRules.rules.atLeastOne  =  '';
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error(
                        'Sift.rules.atLeastOne violation: If present Rules.atLeastOne property should be a boolean'
                    )
                );
            });

            it('Sift OK if Rules.atleastOne property is true and at least one argument in the contract array must ' +
            'be present', function() {
                SiftObjectWithOutRules.rules.atLeastOne  =  true;

                SiftObjectWithOutRules.args  =  ['foo', 'apple'];
                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe('apple');

            });

            it('Sift error is thrown if Rules.atleastOne property is true and no argument from the contract ' +
            'array is present', function() {
                SiftObjectWithOutRules.rules.atLeastOne  =  true;

                SiftObjectWithOutRules.args  =  [];
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.atLeastOne violation: At least one argument is required: [foo,bar]')
                );
            });
        });

        describe('Testing Sift Object\'s Rules.type Property', function() {
            it('Rules.type property should be an object', function() {
                SiftObjectWithOutRules.rules.type  =  '';
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.type violation: If present Rules.type property should be an object')
                );
            });

            it('Rules.type property determines type of value passed to each argument', function() {
                SiftObjectWithOutRules.rules.type  = {
                   'foo':['String'],
                   'bar':['Number']
                };

                SiftObjectWithOutRules.args  =  ['foo', 'apple','bar', 10743];
                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();

                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe('apple');
                expect(inputObj.bar).toBeDefined();
                expect(inputObj.bar).toBe(10743);
            });

            it('Sift will throw error if args contains parameters with corresponding types that conflict with ' +
            'Rules.type property', function() {

                SiftObjectWithOutRules.rules.type  = {
                   'foo':['String'],
                   'bar':['Number']
                };

                SiftObjectWithOutRules.args  =  ['foo', '10743','bar', 'apple'];
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error(
                        'Sift.rules.type violation: Type check fail for value apple of bar. Expected type: [Number]'
                    )
                );

                SiftObjectWithOutRules.args  =  ['foo', 10743,'bar', 'apple'];
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error(
                        'Sift.rules.type violation: Type check fail for value 10743 of foo. Expected type: [String]'
                    )
                );
            });

        });

        describe('Testing Sift Object\'s Rules.custom Property', function() {
            it('Rules.custom property should be a function', function() {
                SiftObjectWithOutRules.rules.custom  =  '';
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.custom violation: If present Rules.custom property should be an object')
                );
            });

            it('Parameters will be evaluated against function passed to sub key representing parameter', function() {

                SiftObjectWithOutRules.rules.custom  =
                {
                   'foo':function(value){
                        return !!~value.toLowerCase().indexOf('p');
                    }
                };

                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                var inputObj = testSiftCall(SiftObjectWithOutRules)();

                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe('apple');
            });
        });

        describe('Testing Sift Object\'s Rules.oneForAll Property', function() {
            it('Rules.oneForAll property should be an array', function() {
                SiftObjectWithOutRules.rules.oneForAll  = '';
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.oneForAll violation: If present Rules.oneForAll property should be an array')
                );
            });

            it('If one param in Rules.oneForAll property exists in Sift.args then all params in Rules.oneForAll must' +
            ' be present', function() {
                SiftObjectWithOutRules.rules.oneForAll  = ['foo', 'bar'];
                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();

                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe('apple');
                expect(inputObj.bar).toBeDefined();
                expect(inputObj.bar).toBe('pear');
            });

            it('Sift throws error if 1 or more argument in Rules.oneForAll property group is specified ' +
            'and not in Sift.args', function() {
                SiftObjectWithOutRules.rules.oneForAll  = ['foo', 'bar'];
                SiftObjectWithOutRules.args  = ['foo', 'apple'];
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error(
                        'Sift.rules.oneForAll violation: If 1 argument in this group is specified, ' +
                        'they all must be specified: foo,bar'
                    )
                );
            });
        });

        describe('Testing Sift Object\'s Rules.collections Property', function() {

            var assertAllObjectsInOriginalCollectionAreReturnedBySift = function (siftCol, originalCol) {
                return _.every(siftCol, function (obj) {
                    return !_.isEmpty(_.where(originalCol, obj));
                }.bind(this));
            };

            describe('Testing Rules.collections format', function() {
                var mainConfig;
                var usersCollection;

                beforeEach(function() {
                    usersCollection = [
                        {'name': 'Russell', 'email': 'russell@gmail.com'},
                        {'name': 'David', 'email': 'david@gmail.com'},
                        {'name': 'Paul', 'email': 'paul@gmail.com'}
                    ];

                    var collectionConfig = {
                        contract: ['name', 'email'],
                        failOnError: true,
                        rules: {
                            required: ['name', 'email']
                        }
                    };

                    mainConfig = {
                        contract: ['foo', 'bar', 'users'],
                        args: ['foo', 'apple', 'bar', 'pear', 'users', usersCollection],
                        pairedArgs: true,
                        failOnError: true,
                        rules: {
                            collections: {
                                'users' : collectionConfig
                            }
                        }
                    };
                });

                it('Rules.collections property should be an object', function() {
                    expect(function(){ Sift(mainConfig);}).not.toThrow();
                    mainConfig.rules.collections = '';
                    expect(function(){ Sift(mainConfig);}).toThrow(
                        'Sift.rules.collections violation: If present Rules.collections property should be an object'
                    );
                });

                it('Rules.collections sub-properties should be an object', function () {
                    expect(function(){ Sift(mainConfig);}).not.toThrow();
                    mainConfig.rules.collections.users = '';
                    expect(function(){ Sift(mainConfig);}).toThrow(
                        'Sift.rules.collections violation: Rules.collections sub-properties should be an object'
                    );
                });

            });

            describe('Rules.collections property passes', function () {
                it('as expected when collection conforms to validation as defined by collection config', function () {

                    var usersCollection = [
                        {'name': 'Russell', 'email': 'russell@gmail.com'},
                        {'name': 'David', 'email': 'david@gmail.com'},
                        {'name': 'Paul', 'email': 'paul@gmail.com'},
                        {'name': 'Shawn', 'email': 'shawn@gmail.com'},
                        {'name': 'Fred', 'email': 'fred@gmail.com'},
                        {'name': 'Dennis', 'email': 'dennis@gmail.com'},
                        {'name': 'Andrew', 'email': 'andrew@gmail.com'}
                    ];

                    var collectionConfig = {
                        contract: ['name', 'email'],
                        failOnError: true,
                        rules: {
                            required: ['name', 'email']
                        }
                    };

                    var mainConfig = {
                        contract: ['foo', 'bar', 'users'],
                        args: ['foo', 'apple', 'bar', 'pear', 'users', usersCollection],
                        pairedArgs: true,
                        rules: {
                            collections: {
                                'users': collectionConfig
                            }
                        }
                    };

                    var resultObj = Sift(mainConfig);
                    expect(resultObj.foo).toBe('apple');
                    expect(resultObj.bar).toBe('pear');
                    expect(
                        assertAllObjectsInOriginalCollectionAreReturnedBySift(resultObj.users, usersCollection)
                    ).toBe(true);

                });

            });

            describe('Rules.collections property fails', function () {
                it('When collection item is missing a property when it should not', function () {
                    var resultObj;
                    var usersCollection = [
                        {'name': 'Russell', 'email': 'russell@gmail.com'},
                        {'name': 'David', 'email': 'david@gmail.com'},
                        {'name': 'Paul', 'email': 'paul@gmail.com'},
                        {'name': 'Shawn'},
                        {'name': 'Fred', 'email': 'fred@gmail.com'},
                        {'name': 'Dennis', 'email': 'dennis@gmail.com'},
                        {'name': 'Andrew', 'email': 'andrew@gmail.com'}
                    ];

                    var collectionConfigWithFailOnError = {
                        contract: ['name', 'email'],
                        failOnError: true,
                        rules: {
                            required: ['name', 'email']
                        }
                    };
                    var collectionConfigWithoutFailOnError = {
                        contract: ['name', 'email'],
                        failOnError: false,
                        rules: {
                            required: ['name', 'email']
                        }
                    };
                    var mainConfig = {
                        contract: ['foo', 'bar', 'users'],
                        args: ['foo', 'apple', 'bar', 'pear', 'users', usersCollection],
                        pairedArgs: true,
                        rules: {
                            collections: {
                                'users': collectionConfigWithoutFailOnError
                            }
                        }
                    };

                    resultObj = Sift(mainConfig);
                    expect(resultObj).toBe(false);

                    mainConfig.rules.collections.users = collectionConfigWithFailOnError;
                    expect(function(){ Sift(mainConfig);}).toThrow(
                        new Error(
                            '\nFailing Collection Item:\n'+
                            '{\"name\":\"Shawn\"}'+
                            '\nCollection Failure!!\n'+
                            'Sift.rules.required violation: 1 or more required argument(s) missing. ' +
                            'Required argument(s): [name,email]'
                        )
                    );

                });

                it('When collection is missing an object when it should not', function () {
                    var resultObj;
                    var usersCollection = [
                        {'name': 'Russell', 'email': 'russell@gmail.com'},
                        {'name': 'David', 'email': 'david@gmail.com'},
                        {'name': 'Paul', 'email': 'paul@gmail.com'},
                        ,
                        {'name': 'Fred', 'email': 'fred@gmail.com'},
                        {'name': 'Dennis', 'email': 'dennis@gmail.com'},
                        {'name': 'Andrew', 'email': 'andrew@gmail.com'}
                    ];

                    var collectionConfigWithFailOnError = {
                        contract: ['name', 'email'],
                        failOnError: true,
                        rules: {
                            required: ['name', 'email']
                        }
                    };
                    var collectionConfigWithoutFailOnError = {
                        contract: ['name', 'email'],
                        failOnError: false,
                        rules: {
                            required: ['name', 'email']
                        }
                    };
                    var mainConfig = {
                        contract: ['foo', 'bar', 'users'],
                        args: ['foo', 'apple', 'bar', 'pear', 'users', usersCollection],
                        pairedArgs: true,
                        rules: {
                            collections: {
                                'users': collectionConfigWithoutFailOnError
                            }
                        }
                    };

                    resultObj = Sift(mainConfig);
                    expect(resultObj).toBe(false);

                    mainConfig.rules.collections.users = collectionConfigWithFailOnError;
                    expect(function(){ Sift(mainConfig);}).toThrow(
                        new Error(
                            '\nFailing Collection Item:\n'+
                            'undefined'+
                            '\nCollection Failure!!\n'+
                            'Sift violation: Argument list must be an array, ' +
                            'argument object or object literal of argument name/value pairs'
                        )
                    );

                });

                it('When collection contains a null object when it should not', function () {
                    var resultObj;
                    var usersCollection = [
                        {'name': 'Russell', 'email': 'russell@gmail.com'},
                        {'name': 'David', 'email': 'david@gmail.com'},
                        {'name': 'Paul', 'email': 'paul@gmail.com'},
                        null,
                        {'name': 'Fred', 'email': 'fred@gmail.com'},
                        {'name': 'Dennis', 'email': 'dennis@gmail.com'},
                        {'name': 'Andrew', 'email': 'andrew@gmail.com'}
                    ];

                    var collectionConfigWithFailOnError = {
                        contract: ['name', 'email'],
                        failOnError: true,
                        rules: {
                            required: ['name', 'email']
                        }
                    };
                    var collectionConfigWithoutFailOnError = {
                        contract: ['name', 'email'],
                        failOnError: false,
                        rules: {
                            required: ['name', 'email']
                        }
                    };
                    var mainConfig = {
                        contract: ['foo', 'bar', 'users'],
                        args: ['foo', 'apple', 'bar', 'pear', 'users', usersCollection],
                        pairedArgs: true,
                        rules: {
                            collections: {
                                'users': collectionConfigWithoutFailOnError
                            }
                        }
                    };

                    resultObj = Sift(mainConfig);
                    expect(resultObj).toBe(false);

                    mainConfig.rules.collections.users = collectionConfigWithFailOnError;
                    expect(function(){ Sift(mainConfig);}).toThrow(
                        new Error(
                            '\nFailing Collection Item:\n'+
                            'null'+
                            '\nCollection Failure!!\n'+
                            'Sift violation: Argument list must be an array, ' +
                            'argument object or object literal of argument name/value pairs'
                        )
                    );

                });

                it('When collection contains an empty string when it should not', function () {
                    var resultObj;
                    var usersCollection = [
                        {'name': 'Russell', 'email': 'russell@gmail.com'},
                        {'name': 'David', 'email': 'david@gmail.com'},
                        {'name': 'Paul', 'email': 'paul@gmail.com'},
                        '',
                        {'name': 'Fred', 'email': 'fred@gmail.com'},
                        {'name': 'Dennis', 'email': 'dennis@gmail.com'},
                        {'name': 'Andrew', 'email': 'andrew@gmail.com'}
                    ];

                    var collectionConfigWithFailOnError = {
                        contract: ['name', 'email'],
                        failOnError: true,
                        rules: {
                            required: ['name', 'email']
                        }
                    };
                    var collectionConfigWithoutFailOnError = {
                        contract: ['name', 'email'],
                        failOnError: false,
                        rules: {
                            required: ['name', 'email']
                        }
                    };
                    var mainConfig = {
                        contract: ['foo', 'bar', 'users'],
                        args: ['foo', 'apple', 'bar', 'pear', 'users', usersCollection],
                        pairedArgs: true,
                        rules: {
                            collections: {
                                'users': collectionConfigWithoutFailOnError
                            }
                        }
                    };

                    resultObj = Sift(mainConfig);
                    expect(resultObj).toBe(false);

                    mainConfig.rules.collections.users = collectionConfigWithFailOnError;
                    expect(function(){ Sift(mainConfig);}).toThrow(
                        new Error(
                            '\nFailing Collection Item:\n'+
                            '\"\"'+
                            '\nCollection Failure!!\n'+
                            'Sift violation: Argument list must be an array, ' +
                            'argument object or object literal of argument name/value pairs'
                        )
                    );

                });
            });

            describe('Rules.collections nested collections', function () {
                // Configs for nested collections work as usual. The only thing you have to remember is
                // that args for nested config (in the Rules.collections object) will be ignored.
                // Lets clarify this idea with the following example.

                // Aliens from outer space have attacked!! They have taken over several parts of Europe
                // and convinced people that programming languages that use semi colons are wrong. Below
                // is a piece of code that we found where they are using sift to validate a nested
                // collection of their military organization chart. We will use this example to see
                // how we can use sift with nested collections and better understand our enemies.

                var privateCollection;
                var badPrivateCollection;
                var privateCollectionConfig;
                var privateFirstClassCollection;
                var privateFirstClassCollectionConfig;
                var corporalCollection;
                var corporalCollectionConfig;
                var sergeantCollection;
                var sergeantCollectionConfig;
                var lieutenantCollection;
                var lieutenantCollectionConfig;
                var captainCollection;
                var captainCollectionConfig;
                var regionalCommanders;
                var regionalCommandersConfig;
                var mainConfig;

                var alienDataConfig = function(useBadPrivateCollection) {

                    privateCollection = [
                        {
                            'name': 'private1',
                            'seenCombat': 'no',
                            'psychEval': 'athletic',
                            'email': 'private1@gmail.com'
                        },
                        {
                            'name': 'private2',
                            'seenCombat': 'no',
                            'psychEval': 'emotional',
                            'email': 'private2@gmail.com'
                        },
                        {
                            'name': 'private3',
                            'seenCombat': 'yes',
                            'psychEval': 'emotional',
                            'email': 'private3@gmail.com'
                        },
                        {
                            'name': 'private4',
                            'seenCombat': 'no',
                            'psychEval': 'analytic',
                            'email': 'private4@gmail.com'
                        },
                        {
                            'name': 'private5',
                            'seenCombat': 'no',
                            'psychEval': 'intellectual',
                            'email': 'private5@gmail.com'
                        }
                    ];

                    badPrivateCollection = [
                        {
                            'name': 'private1',
                            'seenCombat': 'no',
                            'psychEval': 'athletic',
                            'email': 'private1@gmail.com'
                        },
                        {'name': 'private2', 'seenCombat': 'no', 'psychEval': 'emotional'},
                        {
                            'name': 'private3',
                            'seenCombat': 'yes',
                            'psychEval': 'emotional',
                            'email': 'private3@gmail.com'
                        },
                        {
                            'name': 'private4',
                            'seenCombat': 'no',
                            'psychEval': 'analytic',
                            'email': 'private4@gmail.com'
                        },
                        {
                            'name': 'private5',
                            'seenCombat': 'no',
                            'psychEval': 'intellectual',
                            'email': 'private5@gmail.com'
                        }
                    ];

                    privateCollectionConfig = {
                        contract: ['name', 'email', 'seenCombat', 'psychEval'], // process current level in hierarchy
                        failOnError: true,
                        rules: {
                            required: ['name', 'email', 'seenCombat', 'psychEval'],
                            only: {
                                psychEval: ['athletic', 'intellectual', 'analytic', 'emotional'],
                                seenCombat: ['yes', 'no']
                            },
                            map: {
                                seenCombat: {
                                    'yes': true,
                                    'no': false
                                }
                            }
                        }
                    };

                    privateFirstClassCollection = [
                        {'name': 'privateFC1', 'seenCombat': 'yes', 'email': 'privateFC1@gmail.com'},
                        {'name': 'privateFC2', 'seenCombat': 'no', 'email': 'privateFC2@gmail.com'},
                        {'name': 'privateFC3', 'seenCombat': 'no', 'email': 'privateFC3@gmail.com'},
                        {'name': 'privateFC4', 'seenCombat': 'no', 'email': 'privateFC4@gmail.com'},
                        {'name': 'privateFC5', 'seenCombat': 'yes', 'email': 'privateFC5@gmail.com'}
                    ];

                    privateFirstClassCollectionConfig = {
                        contract: ['name', 'email', 'seenCombat'],  // process current level in hierarchy
                        failOnError: true,
                        rules: {
                            required: ['name', 'email', 'seenCombat'],
                            only: {
                                seenCombat: ['yes', 'no']
                            },
                            map: {
                                'seenCombat': {
                                    'yes': true,
                                    'no': false
                                }
                            },
                            custom:{
                                'email':function(value){
                                    return !!~value.toLowerCase().indexOf('privatefc');
                                }
                            }
                        }
                    };

                    corporalCollection = [
                        {
                            name: 'corporal1',
                            email: 'corporal1@gmail.com',
                            privatesFirstClass: privateFirstClassCollection,
                            privates: useBadPrivateCollection ? badPrivateCollection : privateCollection
                        },
                        {
                            name: 'corporal2',
                            email: 'corporal2@gmail.com',
                            privatesFirstClass: privateFirstClassCollection,
                            privates: useBadPrivateCollection ? badPrivateCollection : privateCollection
                        },
                        {
                            name: 'corporal3',
                            email: 'corporal3@gmail.com',
                            privatesFirstClass: privateFirstClassCollection,
                            privates: useBadPrivateCollection ? badPrivateCollection : privateCollection
                        },
                        {
                            name: 'corporal4',
                            email: 'corporal4@gmail.com',
                            privatesFirstClass: privateFirstClassCollection,
                            privates: useBadPrivateCollection ? badPrivateCollection : privateCollection
                        },
                        {
                            name: 'corporal5',
                            email: 'corporal5@gmail.com',
                            privatesFirstClass: privateFirstClassCollection,
                            privates: useBadPrivateCollection ? badPrivateCollection : privateCollection
                        }
                    ];

                    corporalCollectionConfig = {
                        // process current level in hierarchy
                        contract: ['name', 'email', 'privatesFirstClass', 'privates'],
                        failOnError: true,
                        pairedArgs: true,
                        rules: {
                            required: ['name', 'email', 'privates', 'privatesFirstClass'],
                            // process next level down in hierarchy
                            collections: {
                                'privates': privateCollectionConfig,
                                'privateFirstClass': privateFirstClassCollectionConfig
                            }
                        }
                    };

                    sergeantCollection = [
                        {'name': 'sergeant1', 'email': 'sergeant1@gmail.com', corporals : corporalCollection},
                        {'name': 'sergeant2', 'email': 'sergeant2@gmail.com', corporals : corporalCollection},
                        {'name': 'sergeant3', 'email': 'sergeant3@gmail.com', corporals : corporalCollection},
                        {'name': 'sergeant4', 'email': 'sergeant4@gmail.com', corporals : corporalCollection},
                        {'name': 'sergeant5', 'email': 'sergeant5@gmail.com', corporals : corporalCollection}
                    ];

                    sergeantCollectionConfig = {
                        contract: ['name', 'email', 'corporals'],              // process current level in hierarchy
                        failOnError: true,
                        pairedArgs: true,
                        rules: {
                            required: ['name', 'email', 'corporals'],
                            collections: {
                                'corporals': corporalCollectionConfig          // process next level down in hierarchy
                            }
                        }
                    };

                    lieutenantCollection = [
                        {'lieutenant': 'lieutenant1', 'email': 'lieutenant1@gmail.com', sergeants : sergeantCollection},
                        {'lieutenant': 'lieutenant2', 'email': 'lieutenant2@gmail.com', sergeants : sergeantCollection},
                        {'lieutenant': 'lieutenant3', 'email': 'lieutenant3@gmail.com', sergeants : sergeantCollection},
                        {'lieutenant': 'lieutenant4', 'email': 'lieutenant4@gmail.com', sergeants : sergeantCollection},
                        {'lieutenant': 'lieutenant5', 'email': 'lieutenant5@gmail.com', sergeants : sergeantCollection}
                    ];

                    lieutenantCollectionConfig = {
                        contract: ['lieutenant', 'email', 'sergeants'],        // process current level in hierarchy
                        failOnError: true,
                        pairedArgs: true,
                        rules: {
                            required: ['lieutenant', 'email', 'sergeants'],
                            collections: {
                                'sergeants': sergeantCollectionConfig          // process next level down in hierarchy
                            }

                        }
                    };

                    captainCollection = [
                        {
                            'captain': 'captain1',
                            'email': 'captain1@gmail.com',
                            wars: 3,
                            lieutenants: lieutenantCollection
                        },
                        {
                            'captain': 'captain2',
                            'email': 'captain2@gmail.com',
                            wars: 3,
                            lieutenants: lieutenantCollection
                        },
                        {
                            'captain': 'captain3',
                            'email': 'captain3@gmail.com',
                            wars: 2,
                            lieutenants: lieutenantCollection
                        },
                        {
                            'captain': 'captain4',
                            'email': 'captain4@gmail.com',
                            wars: 4,
                            lieutenants: lieutenantCollection
                        },
                        {
                            'captain': 'captain5',
                            'email': 'captain5@gmail.com',
                            wars: 6,
                            lieutenants: lieutenantCollection
                        }
                    ];

                    captainCollectionConfig = {
                        contract: ['captain', 'wars', 'email', 'lieutenants'], // process current level in hierarchy
                        failOnError: true,
                        pairedArgs: true,
                        rules: {
                            required: ['captain', 'email', 'wars', 'lieutenants'],
                            collections: {
                                'lieutenants': lieutenantCollectionConfig      // process next level down in hierarchy
                            },
                            type:{
                                'wars':['number']
                            }
                        }
                    };

                    regionalCommanders = [
                        {
                            'general': 'Russell',
                            ships: 6,
                            region: 'France',
                            'email': 'russell@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'David',
                            ships: 3,
                            region: 'England',
                            'email': 'david@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Paul',
                            ships: 1,
                            region: 'Spain',
                            'email': 'paul@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Shawn',
                            ships: 3,
                            region: 'Netherlands',
                            'email': 'shawn@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Ryan',
                            ships: 5,
                            region: 'Belgium',
                            'email': 'ryan@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Anthony',
                            ships: 9,
                            region: 'Ireland',
                            'email': 'anthony@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Fred',
                            ships: 7,
                            region: 'Germany',
                            'email': 'fred@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Dennis',
                            ships: 1,
                            region: 'Italy',
                            'email': 'dennis@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Andrew',
                            ships: 7,
                            region: 'Switzerland',
                            'email': 'andrew@gmail.com',
                            captains: captainCollection
                        }
                    ];

                    regionalCommandersConfig = {
                        // process current level in hierarchy
                        contract: ['general', 'ships', 'region', 'email', 'captains'],
                        failOnError: true,
                        pairedArgs: true,
                        rules: {
                            required: ['captains'],
                            // process next level down in hierarchy
                            collections: {
                                'captains': captainCollectionConfig
                            },
                            type:{
                                'ships':['number']
                            }
                        }
                    };

                    mainConfig = {
                        contract: ['planet', 'attempt', 'generals'],
                        args: ['planet', 'earth', 'attempt', '3', 'generals', regionalCommanders],
                        pairedArgs: true,
                        rules: {
                            collections: {
                                'generals': regionalCommandersConfig
                            }
                        }
                    };
                    return mainConfig;
                };

                it(' validation (in hierarchy 6 levels deep) happens as expected', function () {
                    var useBadPrivateCollection = false;
                    var mainConfig = alienDataConfig(useBadPrivateCollection);
                    var resultObj = Sift(mainConfig);
                    expect(resultObj.planet).toBe('earth');
                    expect(resultObj.attempt).toBe('3');
                    expect(_.isPlainObject(resultObj.generals[0])).toBe(true);
                    expect(
                        assertAllObjectsInOriginalCollectionAreReturnedBySift(
                            resultObj.generals[0].captains[0].lieutenants[0].sergeants[0].corporals[0].privates,
                            privateCollection
                        )
                    ).toBe(true);
                });

                it(' validation (in hierarchy 6 levels deep) fails as expected', function () {
                    var useBadPrivateCollection = true;
                    expect(function(){
                        Sift(alienDataConfig(useBadPrivateCollection));
                    }).toThrow(
                        new Error(
                            '\nFailing Collection Item:\n'+
                            '{"name":"private2","seenCombat":"no","psychEval":"emotional"}'+
                            '\nCollection Failure!!\n'+
                            'Sift.rules.required violation: 1 or more required argument(s) missing. ' +
                            'Required argument(s): [name,email,seenCombat,psychEval]'
                        )
                    );
                });

                it(' validation (in hierarchy 2 levels deep) fails as expected', function () {
                    captainCollection = [
                        {'captain': 'captain1', 'email': 'captain1@gmail.com', wars: 3},
                        {'captain': 'captain2', 'email': 'captain2@gmail.com', wars: 3},
                        {'captain': 'captain3', 'email': 'captain3@gmail.com'},
                        {'captain': 'captain4', 'email': 'captain4@gmail.com', wars: 4},
                        {'captain': 'captain5', 'email': 'captain5@gmail.com', wars: 6}
                    ];

                    captainCollectionConfig = {
                        contract: ['captain', 'wars', 'email'],        // process current level in hierarchy
                        failOnError: true,
                        pairedArgs: true,
                        rules: {
                            required: ['captain', 'email', 'wars'],
                            type:{
                                'wars':['number']
                            }
                        }
                    };

                    regionalCommanders = [
                        {
                            'general': 'Russell',
                            ships: 6,
                            region: 'France',
                            'email': 'russell@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'David',
                            ships: 3,
                            region: 'England',
                            'email': 'david@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Paul',
                            ships: 1,
                            region: 'Spain',
                            'email': 'paul@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Shawn',
                            ships: 3,
                            region: 'Netherlands',
                            'email': 'shawn@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Ryan',
                            ships: 5,
                            region: 'Belgium',
                            'email': 'ryan@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Anthony',
                            ships: 9,
                            region: 'Ireland',
                            'email': 'anthony@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Fred',
                            ships: 7,
                            region: 'Germany',
                            'email': 'fred@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Dennis',
                            ships: 1,
                            region: 'Italy',
                            'email': 'dennis@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Andrew',
                            ships: 7,
                            region: 'Switzerland',
                            'email': 'andrew@gmail.com',
                            captains: captainCollection
                        }
                    ];

                    regionalCommandersConfig = {
                        // process current level in hierarchy
                        contract: ['general', 'ships', 'region', 'email', 'captains'],
                        failOnError: true,
                        pairedArgs: true,
                        rules: {
                            required: ['captains'],
                            // process next level down in hierarchy
                            collections: {
                                'captains': captainCollectionConfig
                            },
                            type:{
                                'ships':['number']
                            }
                        }
                    };

                    mainConfig = {
                        contract: ['planet', 'attempt', 'generals'],
                        args: ['planet', 'earth', 'attempt', '3', 'generals', regionalCommanders],
                        pairedArgs: true,
                        rules: {
                            collections: {
                                'generals': regionalCommandersConfig
                            }
                        }
                    };

                    expect(function(){
                        Sift(mainConfig);
                    }).toThrow(
                        new Error(
                            '\nFailing Collection Item:\n'+
                            '{"captain":"captain3","email":"captain3@gmail.com"}'+
                            '\nCollection Failure!!\n'+
                            'Sift.rules.required violation: 1 or more required argument(s) missing. ' +
                            'Required argument(s): [captain,email,wars]'
                        )
                    );
                });

                it(' validation (in hierarchy 2 levels deep) fails as expected', function () {
                    var lieutenantCollection = [
                        {'lieutenant': 'lieutenant1', 'email': 'lieutenant1@gmail.com'},
                        {'lieutenant': 'lieutenant2', 'email': 'lieutenant2@gmail.com'},
                        {'lieutenant': 'lieutenant3', 'email': 'lieutenant3@gmail.com'},
                        {'lieutenant': 'lieutenant4', 'email': 'lieutenant4@gmail.com'},
                        {'lieutenant': 'lieutenant5', 'email': 'lieutenant5@gmail.com'}
                    ];

                    captainCollection = [
                        {
                            'captain': 'captain1',
                            'email': 'captain1@gmail.com',
                            wars: 3,
                            lieutenants: lieutenantCollection
                        },
                        {
                            'captain': 'captain2',
                            'email': 'captain2@gmail.com',
                            wars: 3,
                            lieutenants: lieutenantCollection
                        },
                        {'captain': 'captain3', 'email': 'captain3@gmail.com', lieutenants: lieutenantCollection},
                        {
                            'captain': 'captain4',
                            'email': 'captain4@gmail.com',
                            wars: 4,
                            lieutenants: lieutenantCollection
                        },
                        {
                            'captain': 'captain5',
                            'email': 'captain5@gmail.com',
                            wars: 6,
                            lieutenants: lieutenantCollection
                        }
                    ];

                    captainCollectionConfig = {
                        contract: ['captain', 'wars', 'email', 'lieutenants'],   // process current level in hierarchy
                        failOnError: true,
                        pairedArgs: true,
                        rules: {
                            required: ['captain', 'email', 'wars'],
                            type:{
                                'wars':['number']
                            }
                        }
                    };

                    regionalCommanders = [
                        {
                            'general': 'Russell',
                            ships: 6,
                            region: 'France',
                            'email': 'russell@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'David',
                            ships: 3,
                            region: 'England',
                            'email': 'david@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Paul',
                            ships: 1,
                            region: 'Spain',
                            'email': 'paul@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Shawn',
                            ships: 3,
                            region: 'Netherlands',
                            'email': 'shawn@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Ryan',
                            ships: 5,
                            region: 'Belgium',
                            'email': 'ryan@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Anthony',
                            ships: 9,
                            region: 'Ireland',
                            'email': 'anthony@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Fred',
                            ships: 7,
                            region: 'Germany',
                            'email': 'fred@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Dennis',
                            ships: 1,
                            region: 'Italy',
                            'email': 'dennis@gmail.com',
                            captains: captainCollection
                        },
                        {
                            'general': 'Andrew',
                            ships: 7,
                            region: 'Switzerland',
                            'email': 'andrew@gmail.com',
                            captains: captainCollection
                        }
                    ];

                    regionalCommandersConfig = {
                        // process current level in hierarchy
                        contract: ['general', 'ships', 'region', 'email', 'captains'],
                        failOnError: true,
                        pairedArgs: true,
                        rules: {
                            required: ['captains'],
                            // process next level down in hierarchy
                            collections: {
                                'captains': captainCollectionConfig
                            },
                            type:{
                                'ships':['number']
                            }
                        }
                    };

                    mainConfig = {
                        contract: ['planet', 'attempt', 'generals'],
                        args: ['planet', 'earth', 'attempt', '3', 'generals', regionalCommanders],
                        pairedArgs: true,
                        rules: {
                            collections: {
                                'generals': regionalCommandersConfig
                            }
                        }
                    };
                    expect(function(){ Sift(mainConfig);}).toThrow(
                        new Error(
                            '\nFailing Collection Item:\n'+
                            '{"captain":"captain3","email":"captain3@gmail.com","lieutenants":[' +
                            '{"lieutenant":"lieutenant1","email":"lieutenant1@gmail.com"},' +
                            '{"lieutenant":"lieutenant2","email":"lieutenant2@gmail.com"},' +
                            '{"lieutenant":"lieutenant3","email":"lieutenant3@gmail.com"},' +
                            '{"lieutenant":"lieutenant4","email":"lieutenant4@gmail.com"},' +
                            '{"lieutenant":"lieutenant5","email":"lieutenant5@gmail.com"}]}'+
                            '\nCollection Failure!!\n'+
                            'Sift.rules.required violation: 1 or more required argument(s) missing. ' +
                            'Required argument(s): [captain,email,wars]'
                        )
                    );
                });
            })
        });

        describe('Testing Sift Object\'s Rules.defaults Property', function() {

            it('Rules.defaults property should be an object', function() {
                SiftObjectWithOutRules.rules.defaults  = '';
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.defaults violation: If present Rules.defaults property should be an object')
                );
            });

            it('Param in Rules.defaults property is applied when param is not present in args array', function() {

                SiftObjectWithOutRules.args            = ['truck', 'rough'];
                SiftObjectWithOutRules.contract        = ['truck', 'car'];
                SiftObjectWithOutRules.rules.defaults  = {
                    'car': 'dogg'
                };

                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                var inputObj = testSiftCall(SiftObjectWithOutRules)();

                expect(inputObj.truck).toBeDefined();
                expect(inputObj.truck).toBe('rough');
                expect(inputObj.car).toBeDefined();
                expect(inputObj.car).toBe('dogg');
            });

            describe('Rules.defaults property is applied BEFORE Rules.map', function() {

                it('Param in Rules.defaults property is applied when param is present in args array', function() {
                    var obviousFunction = function(thing){ return 'A pear is green';};

                    SiftObjectWithOutRules.args      = ['truck', 'rough',  'car', 'dogg'];
                    SiftObjectWithOutRules.contract  = ['truck', 'car'];

                    SiftObjectWithOutRules.rules.defaults  = {
                        'car': 'dogg'
                    };

                    SiftObjectWithOutRules.rules.map ={
                        'truck': {
                            'rough' : 'An apple is red'
                        },
                        'car': {
                            'dogg'  : obviousFunction
                        }
                    }
                    expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                    var inputObj = testSiftCall(SiftObjectWithOutRules)();

                    //'truck' present in Sift.args, 'rough' to 'An apple is red' map applied
                    expect(inputObj.truck).toBeDefined();
                    expect(inputObj.truck).toBe('An apple is red');

                    //'car' present in Sift.args, 'dogg' to 'function' map applied
                    expect(inputObj.car).toBeDefined();
                    expect(inputObj.car).toBe(obviousFunction);
                });


                it('Param value in Rules.map property is still applied when param is not present in args array',
                    function() {
                    var obviousFunction = function(thing){ return 'A pear is green';};

                    SiftObjectWithOutRules.args      = ['truck', 'rough'];
                    SiftObjectWithOutRules.contract  = ['truck', 'car'];

                    SiftObjectWithOutRules.rules.defaults  = {
                        'car': 'dogg'
                    };

                    SiftObjectWithOutRules.rules.map ={
                        'truck': {
                            'rough' : 'An apple is red'
                        },
                        'car': {
                            'dogg'  : obviousFunction
                        }
                    }
                    expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                    var inputObj = testSiftCall(SiftObjectWithOutRules)();

                    //'truck' present in Sift.args, 'rough' to 'An apple is red' map applied
                    expect(inputObj.truck).toBeDefined();
                    expect(inputObj.truck).toBe('An apple is red');

                    //'car' not present in Sift.args, 'dogg' to 'function' still applied
                    expect(inputObj.car).toBeDefined();
                    expect(inputObj.car).toBe(obviousFunction);
                });
            });
        });

        describe('Testing Sift Object\'s Rules.required Property', function() {

            it('Rules.required property should be an array', function() {
                SiftObjectWithOutRules.rules.required  =  '';
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.required violation: If present Rules.required property should be an array')
                );
            });

            it('Rules.required property created says if bar is not present, Sift throws error', function() {
                SiftObjectWithOutRules.rules.required = ['bar'] ;
                SiftObjectWithOutRules.args  =  ['foo', 'apple'];
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error(
                        'Sift.rules.required violation: 1 or more required argument(s) missing. ' +
                        'Required argument(s): [bar]'
                    )
                );
            });

            it('Rules.required property created says if bar is not present, Sift throws error', function() {
                SiftObjectWithOutRules.rules.required = ['foo', 'bar'] ;

                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe('apple');
                expect(inputObj.bar).toBeDefined();
                expect(inputObj.bar).toBe('pear');
            });

        });

        describe('Testing Sift Object\'s Rules.map Property', function() {
            it('Rules.map property should be an object', function() {
                SiftObjectWithOutRules.rules.map  =  '';
                expect(testSiftCall(SiftObjectWithOutRules)).toThrow(
                    new Error('Sift.rules.map violation: If present Rules.map property should be an object')
                );
            });

            it('Rules.map property does not have to be defined', function() {

                var obviousFunction = function(thing){ return 'A pear is green';};

                SiftObjectWithOutRules.rules.map ={
                    'foo': {
                        'apple' : 'An apple is red'
                    },
                    'bar': {
                        'pear'  : obviousFunction
                    }
                }
                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe('An apple is red');
                expect(inputObj.bar).toBeDefined();
                expect(inputObj.bar).toBe(obviousFunction);
            });

            it('Rules.map property does not have to be defined in Sift.args', function() {
                var obviousFunction = function(){ return 'A pear is green';};
                expect(testSiftCall(SiftObjectWithOutRules)).not.toThrow();
                SiftObjectWithOutRules.rules.map ={
                    'kazz': {
                        'apple' : 'An apple is red'
                    },
                    'bazz': {
                        'pear'  : obviousFunction
                    }
                }
                var inputObj = testSiftCall(SiftObjectWithOutRules)();
                expect(inputObj.foo).toBeDefined();
                expect(inputObj.foo).toBe('apple');
                expect(inputObj.bar).toBeDefined();
                expect(inputObj.bar).toBe('pear');
            });

        });
    });

    describe('Testing Sift Object\'s failOnError Property', function() {
        var SiftObjectWithOutFailOnError;
        var inputObj;

        beforeEach(function() {
            SiftObjectWithOutFailOnError = {
                    contract: ['foo', 'bar'],
                    args: ['foo', 'apple', 'bar', 'pear'],
                    pairedArgs : true,
                    rules: {}
                };
        });

        it('Sift.failOnError property does not have to be defined', function() {
            expect(testSiftCall(SiftObjectWithOutFailOnError)).not.toThrow();

            inputObj = testSiftCall(SiftObjectWithOutFailOnError)();
            expect(inputObj.foo).toBeDefined();
            expect(inputObj.foo).toBe('apple');
            expect(inputObj.bar).toBeDefined();
            expect(inputObj.bar).toBe('pear');
        });


        it('Sift.failOnError property should be a boolean', function() {
            SiftObjectWithOutFailOnError.failOnError  =  '';
            expect(testSiftCall(SiftObjectWithOutFailOnError)).toThrow(
                new Error('Sift violation: \'\' not a valid value. If defined failOnError must be a boolean')
            );
            SiftObjectWithOutFailOnError.failOnError  =  3543455;
            expect(testSiftCall(SiftObjectWithOutFailOnError)).toThrow(
                new Error('Sift violation: 3543455 not a valid value. If defined failOnError must be a boolean')
            );
        });

        describe('If Sift.failOnError property is set to false and error condition exists, Sift will return false',
            function() {

            var exampleSiftObj;

            beforeEach(function() {
                SiftObjectWithOutFailOnError.failOnError  =  false;
                SiftObjectWithOutFailOnError.pairedArgs  =  true;
                exampleSiftObj = SiftObjectWithOutFailOnError;
            });

            it('Sift.args: As array Args property must be even number sized', function() {
                exampleSiftObj.args  =  ['foo', 'apple', 'bar'];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it('Sift.rules.map: Rules.map property should be an object', function() {
                exampleSiftObj.rules.map  =  '';
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it('Sift.rules.only: Sift will throw error if any parameter values passed are not in Rules.only array' +
            ' for each argument', function() {
                exampleSiftObj.rules.only  = {
                        'foo': ['apple', 'orange'],
                        'bar': ['pear', 'banana']
                };
                exampleSiftObj.args = ['foo', 'pineapple'];

                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it('Sift.rules.required: Rules.required property created says if bar is not present, ' +
            'Sift throws error', function() {
                exampleSiftObj.rules.required = ['bar'] ;
                exampleSiftObj.args  =  ['foo', 'apple'];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it('Sift.rules.exclusive: More than one parameter from rules.exclusive group present in args ' +
            'and Sift will throw error', function() {
                exampleSiftObj.rules.exclusive  = [
                    ['foo', 'bar']
                ];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it('Sift.contract: Contract property must contain at least 1 property', function() {
                exampleSiftObj.contract  =  [];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it('Sift.rules.custom: Parameters will be evaluated against function passed to sub key ' +
            'representing parameter', function() {
                exampleSiftObj.rules.custom  =
                {
                   'foo':function(value){
                        return !!~value.toLowerCase().indexOf('x');
                    }
                };

                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it('Sift.rules.type: Sift will throw error if args contains parameters with corresponding types' +
            ' that conflict with Rules.type property', function() {

                exampleSiftObj.rules.type  = {
                   'foo':['String'],
                   'bar':['Number']
                };

                exampleSiftObj.args  =  ['foo', '10743','bar', 'apple'];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);

                exampleSiftObj.args  =  ['foo', 10743,'bar', 'apple'];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it('Sift.rules.atleastOne: Sift error is thrown if Rules.atleastOne property is true ' +
            'and no argument from the contract array is present', function() {
                exampleSiftObj.rules.atLeastOne  =  true;
                exampleSiftObj.args  =  [];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it('Sift.rules.oneForAll: Sift throws error if 1 or more argument in Rules.oneForAll property group is' +
            ' specified and not in Sift.args', function() {
                exampleSiftObj.rules.oneForAll  = ['foo', 'bar'];
                exampleSiftObj.args  = ['foo', 'apple'];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it('Sift.rules.oneForAll: Rules.defaults property should be an object', function() {
                exampleSiftObj.rules.defaults  = '';
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);
            });

            it('Sift.rules.requires: Rules.requires property created says if foo is present and bar is not present, ' +
            'Sift throws error', function() {

                exampleSiftObj.rules.requires  =  {
                    'foo': ['bar']
                };

                exampleSiftObj.args  =  ['foo', 'apple'];
                inputObj  = testSiftCall(exampleSiftObj)();
                expect(inputObj).toBe(false);

            });

        });
    });

    describe('Testing Siftified Functions', function() {

        it('Passing a config "fnConfig" and a function "fn" to Sift should return a function whose parameters will ' +
        'be evaluated against "fnConfig"', function() {

            var cool = function (name, email){
                return name + ' can\'t be reached at ' + email;
            };

            var fnConfig = {
              contract: ['name', 'email'],
              failOnError: true,
              rules: {
                  required: ['name', 'email']
              }
            };

            var fn = Sift(fnConfig, cool);

            expect(fn instanceof Function).toBe(true);

            expect(function(){ fn(); } ).toThrow(
                new Error('Sift.rules.required violation: 1 or more required argument(s) missing. ' +
                'Required argument(s): [name,email]')
            );

            expect(function(){ Sift(fnConfig, 'You didn\'t have to cut me off'); } ).toThrow(
                new Error('Expected function to siftify or collection to evaluate')
            );

            expect(function(){
                return fn('Russell', 'notreallyrussell@gmail.com');
            }.bind(this)()).toEqual('Russell can\'t be reached at notreallyrussell@gmail.com');

        });

        it('Passing a config "fnConfig" and a function "fn" to Sift should return a function whose parameters will ' +
        'be evaluated against "fnConfig"', function() {

            var cool = function (name, email){
                return name + ' can\'t be reached at ' + email;
            };

            var fnConfig = {
                contract: ['name', 'email'],
                failOnError: true,
                pairedArgs: true, // :)
                rules: {
                  required: ['name', 'email']
              }
            };

            var fn = Sift(fnConfig, cool);

            expect(fn instanceof Function).toBe(true);

            expect(function(){ fn({}); } ).toThrow(
                new Error('Sift violation: Bad argument count, missing value of one argument in set: [name,email]')
            );

            expect(function(){ fn(); } ).toThrow(
                new Error(
                    'Sift.rules.required violation: 1 or more required argument(s) missing. ' +
                    'Required argument(s): [name,email]'
                )
            );

            expect(function(){
                return fn('name', 'Russell', 'email', 'notreallyrussell@gmail.com');
            }.bind(this)()).toEqual('Russell can\'t be reached at notreallyrussell@gmail.com');

        });

    });

    describe('Testing Siftified Collections', function() {

        it('Given a config \'fnConfig\' and a collection \'col\' Sift will throw an error if any object in ' +
            'collection fails to be validation when evaluated against \'fnConfig\'', function() {

            var col = [
                {'name':'Russell', 'email':'russell@gmail.com'},
                {'name':'David', 'email':'david@gmail.com'},
                {'name':'Paul', 'email':'paul@gmail.com'},
                {'name':'Shawn'},
                {'name':'Fred', 'email':'fred@gmail.com'},
                {'name':'Dennis', 'email':'dennis@gmail.com'},
                {'name':'Andrew', 'email':'andrew@gmail.com'}
            ];

            var fnConfig = {
              contract: ['name', 'email'],
              failOnError: true,
              rules: {
                  required: ['name', 'email']
              }
            };

            expect(function(){ Sift(fnConfig, col);} ).toThrow(
                new Error(
                    '\nFailing Collection Item:\n'+
                    '{\"name\":\"Shawn\"}'+
                    '\nCollection Failure!!\n'+
                    'Sift.rules.required violation: 1 or more required argument(s) missing. ' +
                    'Required argument(s): [name,email]'
                )
            );
        });

        it('Given a config \'fnConfig\' and a collection \'col\' Sift will throw an error if any object in ' +
            'collection fails to be validation when evaluated against \'fnConfig\'', function() {

            var col = [
                {'name':'Russell', 'email':'russell@gmail.com'},
                {'name':'David', 'email':'david@gmail.com'},
                {'name':'Paul', 'email':'paul@gmail.com'},
                {'name':'Shawn'},
                {'name':'Fred', 'email':'fred@gmail.com'},
                {'name':'Dennis', 'email':'dennis@gmail.com'},
                {'name':'Andrew', 'email':'andrew@gmail.com'}
            ];

            var fnConfig = {
              contract: ['name', 'email'],
              failOnError: false,  // :)
              rules: {
                  required: ['name', 'email']
              }
            };

            expect(Sift(fnConfig, col)).toBe(false);
        });

        it('Given a config \'fnConfig\' and a collection \'col\' Sift will return the collection if all objects ' +
            'in collection evaluated against \'fnConfig\' are valid', function() {

            var col = [
                {'name':'Russell', 'email':'russell@gmail.com'},
                {'name':'David', 'email':'david@gmail.com'},
                {'name':'Paul', 'email':'paul@gmail.com'},
                {'name':'Shawn', 'email':'shawn@gmail.com'},
                {'name':'Fred', 'email':'fred@gmail.com'},
                {'name':'Dennis', 'email':'dennis@gmail.com'},
                {'name':'Andrew', 'email':'andrew@gmail.com'}
            ];

            var fnConfig = {
              contract: ['name', 'email'],
              failOnError: true,
              rules: {
                  required: ['name', 'email']
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
