  var Sift = function(config) {

    var _ = require('lodash');
    var resultObj = {};
    var regex = {};
    var throwError = function(msg){
         throw new Error(msg);
    };
    var createResultObj = function() {
        var map = config.rules.map;
        var argPos;
        var argObj

        var applyMapValues = function(key, value) {
            return (_.contains(_.keys(map), key) && _.has(map[key], value)) ? map[key][value] : value;
        }

        var setDefaultsOrEmptyValues = function() {
            return _.reduce(
                    config.contract,
                    function(result, argument) {
                        result[argument] = _.isUndefined(result[argument]) ?  "" : result[argument];
                        return result;
                    },
                    _.isEmpty(config.rules.defaults) ? {}: config.rules.defaults
            )

        }
        argObj = setDefaultsOrEmptyValues();

        _(argObj).forEach(function(value, arg) {

            argPos = _.indexOf(config.args, arg);
            if (!!~argPos) {
                argObj[arg] = applyMapValues(arg, config.args[argPos + 1]);
            }  else if (!_.isEmpty(argObj[arg])){
                argObj[arg] = applyMapValues(arg, argObj[arg]);
            }

        });

        resultObj = argObj;
        return true
    }

    var siftValidationObj = {
        validationRule: {
            contract: function() {
                if (!_.isArray(config.contract)) {
                    return config.failOnError ? throwError('Sift violation: Contract must be an array') : false;
                } else if (config.contract.length <= 0) {
                    return config.failOnError ? throwError('Sift violation: Contract must contain at least 1 property') : false;
                }
                return true;
            },
            failOnError: function(){
                if(_.isUndefined(config.failOnError)){
                    config.failOnError = false;
                } else if (!_.isBoolean(config.failOnError)) {
                    return throwError('Sift violation: ' + (config.failOnError == "" ? "''" : config.failOnError) +' not a valid value. If defined failOnError must be a boolean');
                }
                return true;
            },
            rules: function() {
                if (!_.isPlainObject(config.rules)) {
                    return config.failOnError ? throwError('Sift violation: Rules must be Object Literal') : false;
                }
                return true;
            },
            args: function() {
                if (!_.isArguments(config.args) && !_.isArray(config.args) && !_.isPlainObject(config.args) ) {
                    return config.failOnError ? throwError('Sift violation: Argument list must be an array, argument object or object literal of argument name/value pairs') : false;
                }

                var mapContractToValues = function(arg){
                    return _.transform(config.contract, function (result, item, index) {
                        if(!_.isEmpty(arg[index])) {
                            result.push(item);
                            result.push(arg[index]);
                        }
                    });
                };

                var normalizeForUnPairedArguments = function (args) {
                    args = _.flatten(args);
                    return config.pairedArgs ? args : mapContractToValues(args);
                };

                var normalizeForParamValuePairObject = function (args) {
                    return _.flatten(_.pairs(args));
                };

                //normalize arguments
                config.args = _.transform(
                    _.isPlainObject(config.args)
                        ? normalizeForParamValuePairObject(config.args)
                        : normalizeForUnPairedArguments(config.args)
                    ,
                    function(result, val, key) {
                        result[key] = _.isUndefined(val) ? "" : val;
                    }
                );

                if (config.args.length % 2) {
                    return config.failOnError ? throwError("Sift violation: Bad argument count, missing value of one argument in set: [" + config.contract + "]") : false;
                }

                var j = 0;
                _(config.args).forEach(function(arg) {
                    if ((j % 2 === 0) && !_.contains(config.contract, arg)) {
                        return config.failOnError ? throwError("Sift violation: Argument \"" + arg + "\" is not valid: valid argument(s): [" + config.contract + "]") : false;
                    }
                    j++;
                });

                return true;
            }
        },
        valid: function() {
            var that = this;
            return (function() {
                var valid = true;
                _.forEach(that.validationRule, function(validation) {
                    if (valid && !validation()) {
                        valid = false;
                        return false;
                    }
                });
                return valid;
            })()
        }
    };

    var ruleTypeCheckMap = {
        checkMap  : {
          exclusive  :  { check : _.isArray ,       shouldBe : "an array"  },
          requires   :  { check : _.isPlainObject , shouldBe : "an object" },
          only       :  { check : _.isPlainObject , shouldBe : "an object" },
          defaults   :  { check : _.isPlainObject , shouldBe : "an object" },
          oneForAll  :  { check : _.isArray ,       shouldBe : "an array"  },
          atLeastOne :  { check : _.isBoolean ,     shouldBe : "a boolean" },
          required   :  { check : _.isArray ,       shouldBe : "an array"  },
          map        :  { check : _.isPlainObject , shouldBe : "an object" },
          type       :  { check : _.isPlainObject , shouldBe : "an object" },
          custom     :  { check : _.isPlainObject , shouldBe : "an object" },
        },
        typeValidForRule :   function(rulesObj, rule){
            if(_.has( rulesObj, rule) && !this.checkMap[rule].check(rulesObj[rule])){
                    return config.failOnError
                        ? throwError("Sift.rules." + rule + " violation: If present Rules."+ rule + " property should be " + this.checkMap[rule].shouldBe)
                        : false;
            }
            return true;
        }
    };

    var argValidationObj = {
        customValidationRule:{
            custom: function(parsedObj){
                //  Process custom validation after all arguments have been parsed, defaults set and values mapped
                var customValidationFalure = false;
                _(config.rules.custom).forEach(function(cb, arg) {
                    if (_.contains(config.args, arg) && !cb(parsedObj[arg])) {
                        customValidationFalure = true;
                        return config.failOnError ? throwError("Sift.rules.custom violation: Custom validation for " + arg + " failed.") : false;
                    }
                });
                return !customValidationFalure;
            }
        },
        validationRule: {
            atLeastOne: function() {
                if(!ruleTypeCheckMap.typeValidForRule(config.rules, "atLeastOne")) return false;
                if (config.rules.atLeastOne) {
                    var count = 0;
                    _(config.contract).forEach(function(contractArg) {
                        if (_.contains(config.args, contractArg)) {
                            count++;
                        }
                    });
                    if (count == 0) {
                        return config.failOnError ? throwError("Sift.rules.atLeastOne violation: At least one argument is required: [" + config.contract + "]") : false;
                    }
                }
                return true;
            },
            custom: function() {
                if(!ruleTypeCheckMap.typeValidForRule(config.rules, "custom")) return false;
                //defer custom validation until all validations are complete and mappings and defaults are set
                return true;
            },
            defaults: function() {
                if(!ruleTypeCheckMap.typeValidForRule(config.rules, "defaults")) return false;
                //defer apply defaults until all validations are complete
                return true;
            },
            exclusive: function() {
                var result = true;
                if(!ruleTypeCheckMap.typeValidForRule(config.rules, "exclusive")) return !result;

                _(config.rules.exclusive).forEach(function(groupArray) {
                  if(result){
                        var count = 0;
                        _(groupArray).forEach(function(arg) {
                            if (_.contains(config.args, arg)) {
                                count++;
                            }
                        });
                        if (count > 1) {
                             config.failOnError && throwError("Sift.rules.exclusive violation: Only 1 argument is allowed in this group: " + groupArray);
                             result = false;
                        }
                    }
                });
                return result;
            },
            map: function() {
                if(!ruleTypeCheckMap.typeValidForRule(config.rules, "map")) return false;

                map = config.rules.map;

                return true;
            },
            only: function() {
                var result = true;
                if(!ruleTypeCheckMap.typeValidForRule(config.rules, "only")) return !result;
                if ((_.intersection(_.keys(config.rules.only, config.args)).length > 0)) {
                    result && _(config.rules.only).forEach(function(validValues, arg) {
                        var valueOfArg = config.args[
                            _.findIndex(
                                config.args,
                                function(element) {
                                    return element == arg;
                                }
                            ) + 1
                        ];
                        if (_.contains(config.args, arg) && !_.contains(validValues, valueOfArg)){
                           config.failOnError && throwError("Sift.rules.only violation: "+ valueOfArg +" is not valid value for " + arg  +". Valid values for " + arg + " are: [ " + validValues + " ]");
                           result = false;
                        }
                    });
                }
                return result;
            },
            oneForAll: function() {
                if(!ruleTypeCheckMap.typeValidForRule(config.rules, "oneForAll")) return false;
                var count = 0;
                _(config.rules.oneForAll).forEach(function(arg) {
                    if (_.contains(config.args, arg)) {
                        count++;
                    }
                });
                if (count != 0 && count != config.rules.oneForAll.length) {
                    return config.failOnError ? throwError("Sift.rules.oneForAll violation: If 1 argument in this group is specified, they all must be specified: " + config.rules.oneForAll) : false;
                }
                return true;
            },
            required: function() {
                var result = true;
                if(!ruleTypeCheckMap.typeValidForRule(config.rules, "required")) return !result;
                _(config.rules.required).forEach(function(arg) {
                    if (result && !_.contains(config.args, arg)){
                        config.failOnError && throwError("Sift.rules.required violation: 1 or more required argument(s) missing. Required argument(s): " + config.rules.required);
                        result = false;
                    }
                });
                return result;
            },
            requires: function() {
                var result = true;
                if(!ruleTypeCheckMap.typeValidForRule(config.rules, "requires")) return !result;
                _(config.rules.requires).forEach(function(arrOfRequired, dependantArg){
                    result && _(arrOfRequired).forEach(function(requiredArgument) {
                        if (_.contains(config.args, dependantArg)&& !_.contains(config.args, requiredArgument) ){
                            config.failOnError && throwError("Sift.rules.requires violation: If " + dependantArg + " exists as an argument, then " + requiredArgument + " must be present as an argument")
                            result = false;
                        }
                    });
                });
                return result;
            },
            type: function() {
                var result = true;
                if(!ruleTypeCheckMap.typeValidForRule(config.rules, "type")) return !result;
                var typesObj = {
                    array: _.isArray,
                    boolean: _.isBoolean,
                    date: _.isDate,
                    element: _.isElement,
                    function: _.isFunction,
                    number: _.isNumber,
                    finite: _.isFinite,
                    object: _.isObject,
                    plainObject: _.isPlainObject,
                    regexp: _.isRegExp,
                    string: _.isString
                };

                _(config.rules.type).forEach(function(types, argName) {
                    if(result){
                        var resultsCollection = [];
                        var argValue;
                        _(types).forEach(function(type) {
                            if (!_.has(typesObj, type.toLowerCase())) {
                                return config.failOnError ? throwError("Sift.rules.type violation: " + type + " is an invalid type. Available types: " + _.keys(typesObj).join(", ")) : false;
                            }
                            if (_.contains(config.args, argName)) {
                                argValue = config.args[_.findIndex(config.args, function(targetArg) {return targetArg == argName}) + 1];
                                if (typesObj[type.toLowerCase()](argValue)) {
                                    resultsCollection.push({
                                        valid: true
                                    });
                                } else {
                                    resultsCollection.push({
                                        valid: false,
                                        msg: "Type check fail for value " + argValue + " of " + argName + "."
                                    });
                                }
                            }
                        });

                        if (!_.isEmpty(resultsCollection) && !_.some(resultsCollection, 'valid')) {

                            var error = _.first(resultsCollection, function(resultObj) {
                                return !resultObj.valid;
                            })[0].msg

                             config.failOnError && throwError("Sift.rules.type violation: " + error + " Expected " + (types.length > 1 ? "types" : "type") + ": [" + types.join(", ") + "]");

                             result =  false;
                        }
                    }

                });

                return result;

            }
        },
        valid: function() {
            var that = this;
            return (function() {
                var valid = true;
                if (!_.isEmpty(config.rules)) {
                    _.forEach(that.validationRule, function(validation, rule) {
                        if (valid && _.has(config.rules, rule)) {
                            if (!validation()) {
                                valid = false;
                                return false;
                            }
                        }
                    });
                }
                return valid;
            })()
        },
        customValid: function(parsedObj) {
            var that = this;
            return (function() {
                var valid = true;
                if (!_.isEmpty(config.rules) && !_.isEmpty(config.rules.custom)) {
                    _.forEach(that.customValidationRule, function(validation, rule) {
                        if (valid && _.has(config.rules, rule)) {
                            if (!validation(parsedObj)) {
                                valid = false;
                                return false;
                            }
                        }
                    });
                }
                return valid;
            })()
        }
    };


    if(     !siftValidationObj.valid()
        ||  !argValidationObj.valid()
        ||  (
            createResultObj() && !argValidationObj.customValid(resultObj)
            )
    ){
        return false;
    }

    return resultObj
};


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['lodash'], factory);
    } else if (GLOBAL) {
        module.exports =  factory(require('lodash'));
    }
}(this, function(_){
    return function siftifiedFunction (config, thingy) {

        var getOnlyOddIndexes = function (args) {
            return _.transform(args, function (result, item, index) {
                if(index % 2 !== 0 && !_.isUndefined(item) ) {
                    result.push(item);
                }
            });
        };

        if(_.isFunction(thingy)) {
            return function () {
                config.args = arguments;
                Sift(config);
                return thingy.apply(
                    this,
                    config.pairedArgs
                        ? getOnlyOddIndexes(_.flatten(arguments))
                        : arguments
                );
            };
        }

        if(_.isArray(thingy)) {
            _.each(thingy, function (thing) {
                    config.args = thing;
                    Sift(config);
                }
            );
            return thingy;
        }

        if(!_.isUndefined(thingy)) {
            (function(){ throw new Error("Expected function to siftify or collection to evaluate"); })();
        }

        return  Sift(config);
    }

}));


        