var _ = require('lodash');

var SiftUtils = {
    throwError : function(msg,config){
        throw new Error(!!config._col_config ? this.collectionErrMsg(config,msg) : msg);
    },
    collectionErrMsg : function (config,msg) {
        var args = _.isUndefined(config.args) ? config.args : JSON.stringify(config._col_thing);
        return !!config._col_config ?["\nFailing Collection Item:\n"+args+"\nCollection Failure!!\n"+msg].join(" "): "";
    },
    setUpSiftConfigForThingy : function (config, thing) {
        config.args = thing;
        config._col_thing = thing;
        config._col_config = true;
        return config;
    },
    siftify : function (config) {
        return this.processRulesCollections(config) ? Sift(config) : false;
    },
    processSiftifiedCollection: function (config, collection) {
        return _.every(collection, function (thing) {
            return !this.siftify(this.setUpSiftConfigForThingy(config, thing)) === false;
        }.bind(this));
    },
    processRulesCollections : function(mainConfig) {
        if(!this.validateCollectionObj(mainConfig)) return false;
        return _.every(mainConfig.rules.collections, function (formatedArgs, config, key) {
            if (!this.paramPresent(formatedArgs, key)) return true;
            if (this.validCollectionArg(config,formatedArgs, key)) {
                return this.processSiftifiedCollection(config, this.paramValue(formatedArgs, key)) &&
                       this.processRulesCollections(config);
            }
            return false;
        }.bind(this, this.normalizeForUnPairedArguments(mainConfig)));
    },
    getOnlyOddIndexes: function (args) {
        return _.transform(args, function (result, item, index) {
            if (index % 2 !== 0 && !_.isUndefined(item)) {
                result.push(item);
            }
        });
    },
    paramPresent : function (formatedArgs, key) {
        return !!~_.indexOf(formatedArgs, key);
    },
    paramValuePresent : function (formatedArgs, key) {
        return !_.isEmpty(formatedArgs[_.indexOf(formatedArgs, key) + 1]);
    },
    paramValue : function (formatedArgs, key) {
        return formatedArgs[_.indexOf(formatedArgs, key) + 1];
    },
    validateCollectionObj : function (config) {
        if(!_.isUndefined(config.rules.collections) && !_.isPlainObject(config.rules.collections)) {
            return config.failOnError
                ? this.throwError(
                    'Sift.rules.collections violation: If present Rules.collections property should be an object',
                    config
                  )
                : false;
        }
        return this.validateCollectionSubProp(config);
    },
    validateCollectionSubProp : function (config) {
       return _.every(config.rules.collections, function (val) {
            if(!_.isPlainObject(val)){
                return config.failOnError
                ? this.throwError(
                    'Sift.rules.collections violation: Rules.collections sub-properties should be an object',
                    config
                  )
                : false;
            }
           return true;
        }.bind(this));
    },
    validCollectionArg : function (config,formatedArgs, key) {
        if(this.paramValuePresent(formatedArgs, key) && !_.isArray(this.paramValue(formatedArgs, key))){
            return config.failOnError
                ? this.throwError(
                    'Sift.rules.collections violation: Expected argument ' + ' to be an array',
                    config
                  )
                : false;
        }
        return true;
    },
    applyMapValues : function(map, key, value) {
        return (_.contains(_.keys(map), key) && _.has(map[key], value)) ? map[key][value] : value;
    },
    setDefaultsOrEmptyValues : function(config) {
        return _.reduce(
            config.contract,
            function(result, argument) {
                result[argument] = _.isUndefined(result[argument]) ?  "" : result[argument];
                return result;
            },
            _.isEmpty(config.rules.defaults) ? {}: config.rules.defaults
        )
    },
    mapContractToValues : function(contract, args){
        args = this.normalizeForParamValuePairArray(contract,args);
        var result = [];
        _.each(contract, function (item) {
            if(this.paramPresent(args, item)) {
                result.push(item);
                result.push(this.paramValue(args, item));
            }
        }.bind(this));
        return result;
    },
    normalizeForUnPairedArguments : function(config) {
        var args = _.isArguments(config.args) ? Array.prototype.slice.call(config.args) : config.args;
        return config.pairedArgs ? args : this.mapContractToValues(config.contract, args);
    },
    normalizeForParamValuePairArray : function (contract, args) {
        var result = [];
        _.each(contract, function (param, index) {
            if(!_.isNull(args) && !_.isUndefined(args) && !_.isEmpty(args[index])) {
                result.push(param);
                result.push(args[index]);
            }
        });
        return result;
    },
    normalizeForParamValuePairObject : function (config) {
        var result = [];
        _.each(config.args, function (val, param) {
            result.push(param);
            result.push(val);
        });
        return result;
    },
    createResultObj : function(config) {
        var argObj = this.setDefaultsOrEmptyValues(config);
        _(argObj).forEach(function(value, arg) {
            var argPos = _.indexOf(config.args, arg);
            if (!!~argPos) {
                argObj[arg] = this.applyMapValues(config.rules.map, arg, config.args[argPos + 1]);
            }  else if (!_.isEmpty(argObj[arg])){
                argObj[arg] = this.applyMapValues(config.rules.map, arg, argObj[arg]);
            }
        }.bind(this));
        return argObj;
    }
};

var Sift = function(config) {
    var siftValidationObj = {
        validationRule: {
            contract: function() {
                if (!_.isArray(config.contract)) {
                    return config.failOnError
                        ? SiftUtils.throwError('Sift violation: Contract must be an array', config)
                        : false;
                } else if (config.contract.length <= 0) {
                    return config.failOnError
                        ? SiftUtils.throwError('Sift violation: Contract must contain at least 1 property', config)
                        : false;
                }
                return true;
            },
            failOnError: function(){
                if(_.isUndefined(config.failOnError)){
                    config.failOnError = false;
                } else if (!_.isBoolean(config.failOnError)) {
                    return SiftUtils.throwError(
                        'Sift violation: ' +
                        (config.failOnError == "" ? "''" : config.failOnError) +
                        ' not a valid value. If defined failOnError must be a boolean',
                        config
                    );
                }
                return true;
            },
            rules: function() {
                if (!_.isPlainObject(config.rules)) {
                    return config.failOnError
                        ? SiftUtils.throwError('Sift violation: Rules must be Object Literal', config)
                        : false;
                }
                return true;
            },
            args: function() {
                if (!_.isArguments(config.args) && !_.isArray(config.args) && !_.isPlainObject(config.args) ) {
                    return config.failOnError
                        ? SiftUtils.throwError(
                            'Sift violation: Argument list must be an array, argument object or object literal ' +
                            'of argument name/value pairs',
                            config
                          )
                        : false;
                }
                //normalize arguments
                config.args = _.transform(
                    _.isPlainObject(config.args)
                        ? SiftUtils.normalizeForParamValuePairObject(config)
                        : SiftUtils.normalizeForUnPairedArguments(config)
                    ,
                    function(result, val, key) {
                        result[key] = _.isUndefined(val) ? "" : val;
                    }
                );

                if (config.args.length % 2) {
                    return config.failOnError
                        ? SiftUtils.throwError(
                            "Sift violation: Bad argument count, " +
                            "missing value of one argument in set: [" + config.contract + "]",
                            config
                          )
                        : false;
                }

                var j = 0;
                _(config.args).forEach(function(arg) {
                    if ((j % 2 === 0) && !_.contains(config.contract, arg)) {
                        return config.failOnError
                            ? SiftUtils.throwError(
                                "Sift violation: Argument \"" + arg + "\" is not valid: valid argument(s): ["
                                + config.contract + "]",
                                config
                              )
                            : false;
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
                    ? SiftUtils.throwError(
                        "Sift.rules." + rule + " violation: If present Rules." + rule
                        + " property should be " + this.checkMap[rule].shouldBe,
                        config
                      )
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
                        return config.failOnError
                            ? SiftUtils.throwError(
                                "Sift.rules.custom violation: Custom validation for " + arg + " failed.",
                                config
                              )
                            : false;
                    }
                }.bind(this));
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
                        return config.failOnError
                            ? SiftUtils.throwError(
                                "Sift.rules.atLeastOne violation: At least one argument is required: [" +
                                config.contract + "]",
                                config
                              )
                            : false;
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
                             config.failOnError && SiftUtils.throwError(
                                 "Sift.rules.exclusive violation: Only 1 argument is allowed in this group: " +
                                 groupArray,
                                 config
                             );
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
                           config.failOnError && SiftUtils.throwError(
                               "Sift.rules.only violation: "+ valueOfArg +" is not valid value for "
                               + arg  +". Valid values for " + arg + " are: [ " + validValues + " ]",
                               config
                           );
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
                    return config.failOnError
                        ? SiftUtils.throwError(
                            "Sift.rules.oneForAll violation: If 1 argument in this group is specified, " +
                            "they all must be specified: " + config.rules.oneForAll,
                            config
                          )
                        : false;
                }
                return true;
            },
            required: function() {
                var result = true;
                if(!ruleTypeCheckMap.typeValidForRule(config.rules, "required")) return !result;
                _(config.rules.required).forEach(function(arg) {
                    if (result && !_.contains(config.args, arg)){
                        config.failOnError && SiftUtils.throwError(
                            "Sift.rules.required violation: 1 or more required argument(s) missing. " +
                            "Required argument(s): [" + config.rules.required + "]",
                            config
                        );
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
                            config.failOnError && SiftUtils.throwError(
                                "Sift.rules.requires violation: If " + dependantArg + " exists as an argument, then " +
                                requiredArgument + " must be present as an argument",
                                config
                            )
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
                                return config.failOnError
                                    ? SiftUtils.throwError(
                                        "Sift.rules.type violation: " + type +
                                        " is an invalid type. Available types: " + _.keys(typesObj).join(", "),
                                        config
                                      )
                                    : false;
                            }
                            if (_.contains(config.args, argName)) {
                                argValue = config.args[
                                    _.findIndex(config.args, function(targetArg) {return targetArg == argName}) + 1
                                ];
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
                            var error = _.first(resultsCollection, function(errorObj) {
                                return !errorObj.valid;
                            })[0].msg

                            config.failOnError && SiftUtils.throwError(
                                "Sift.rules.type violation: " + error + " Expected " +
                                (types.length > 1 ? "types" : "type") + ": [" + types.join(", ") + "]",
                                config
                            );
                            result =  false;
                        }
                    }
                });

                return result;
            }
        },
        valid: function() {
            var valid = true;
            if (!_.isEmpty(config.rules)) {
                _.forEach(this.validationRule, function(validation, rule) {
                    if (valid && _.has(config.rules, rule)) {
                        if (!validation()) {
                            valid = false;
                            return false;
                        }
                    }
                }.bind(this));
            }
            return valid;
        },
        customValid: function() {
            var parsedObj = SiftUtils.createResultObj(config);
            var valid = true;
            if (!_.isEmpty(config.rules) && !_.isEmpty(config.rules.custom)) {
                _.forEach(this.customValidationRule, function(validation, rule) {
                    if (valid && _.has(config.rules, rule)) {
                        if (!validation(parsedObj)) {
                            valid = false;
                            return false;
                        }
                    }
                });
            }
            this.resultObj = parsedObj;
            return valid;
        },
        resultObj : null
    };

    if(!siftValidationObj.valid() || !argValidationObj.valid() || !argValidationObj.customValid()) {
        return false;
    }

    return argValidationObj.resultObj;
};


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['lodash'], factory);
    } else if (GLOBAL) {
        module.exports =  factory(require('lodash'));
    }
}(this, function(_){
    return function siftifiedFunction (config, thingy) {

        if(_.isFunction(thingy)) {
            return function () {
                config.args = arguments;

                return SiftUtils.siftify(config) === false
                    ? false
                    : thingy.apply(
                        this,
                        config.pairedArgs
                            ? SiftUtils.getOnlyOddIndexes(Array.prototype.slice.call(arguments))
                            : arguments
                      );
            };
        }

        if(_.isArray(thingy)) {
            return SiftUtils.processSiftifiedCollection(config, thingy) ? thingy : false ;
        }

        if(!_.isUndefined(thingy)) {
            (function(){ throw new Error("Expected function to siftify or collection to evaluate"); })();
        }

        return SiftUtils.siftify(config);
    }

}));
