
![](https://github.com/Luckvery/sift-js/blob/master/img/siftbro.jpg)


# Sift
`Sift(config, [ function | collection of objects ])`

*Validations and typing on steriods*
> Run your parameters through the Sift to define rules upfront, simplifying your js implementation.

I use this a lot with grunt. I plan on using it in a few other js projects too.  I'd love to hear any feed back on improvements and ways you've used it!
## Installation

```shell
  npm install siftjs --save
```


### The Sift Config Object


#### <u>contract</u>

Type: `array`  

List of valid parameter names.


#### <u>args</u>

Type: `argument object`, `object literal` or `array`  
Default: `true`

List/object of actual parameters.


#### <u>pairedArgs</u>

Type: `Boolean`  
Default: `false`

When false, Sift uses your contract property to map variable names to values. Order matters, so given a contract 
["foo", "bar"] the first  value of an Arguments obj or array will map to "foo" and the second value will map to "bar".
When pairedArgs is set to true Sift will expect Argument objects and arrays passed to Sift config object property "args"
to be in the form [paramName1, paramName1value, paramName2, paramName2value]. 

**Motivation:**
I did this because I was running into a lot of collisions working with passing values on the command line to grunt. To get
around it I found myself needing to parse something like `grunt task:paramName1:paramName1value:paramName1:paramName2value`
from the command line. In my grunt task this.args would look like [paramName1, paramName1value, paramName2, paramName2value]

#### <u>failOnError</u>

Type: `Boolean`
Default: `false`

Set to true to fail task if Sift encounters an error. If set to false, any errors will cause Sift to return false.

#### <u>rules</u>

Type: `Object`

Declaratively perform validation on parameters in Sift's contract

|    Name             | Description                                              |
|:-------------------:|:--------------------------------------------------------:|
|atLeastOne|At least one argument in contract must have a value|
|collections|Map parameters that are a collections to sift configs to evaluate them|
|custom|Define custom validations with a callback function|
|defaults|Set default values for arguments in this group that aren't present|
|exclusive|Each argument in this group is mutually exclusive|
|map|transform user input into some other value you may find more useful|
|only|List the only allowable values for an argument|
|oneForAll|If one argument exists, then all arguments in this group must be present|
|required|An array of required arguments|
|requires|Define dependants of an argument|
|type|lodash based type checking|

### Optional Second Argument

#### <u>Function to be siftified</u>
 Type: `Function`
 
 When present, Sift will return the function so you might assign it to a variable (for example). After which when this
 function is called, its arguments will be evaluated by Sift. In practice arguments should be key/value object where keys
 are parameter names and values are values for respective parameter names. However, although less useful, it is also possible
 to pass an argument object or an array of alternating key, value pairs in the form, `["foo", "hello", "bar", "world"]`.

#### <u>Collection of objects to be validated</u>
 Type: `Array`
 
 When present Sift will validate each object in the collection, returning the original collection if all objects are good.


### Example usage

#### Siftify that function
```
    var cool = function (name, email){
        return name + " can't be reached at " + email;
    };

    var fn = Sift({
        contract: ["name", "email"],
        failOnError: true,
        rules: {
            required: ["name", "email"]
        }
    }, cool);

    //logs "Russell can't be reached at notreallyrussell@gmail.com"
    console.log(fn("Russell", "notreallyrussell@gmail.com"));

```
#### Use Sift to validate a collection
```
      var col = [
            {"name":"Russell", "email":"russell@gmail.com"},
            {"name":"David", "email":"david@gmail.com"},
            {"name":"Paul", "email":"paul@gmail.com"},
            {"name":"Shawn", "email":"shawn@gmail.com"},
            {"name":"Fred", "email":"fred@gmail.com"},
            {"name":"Dennis", "email":"dennis@gmail.com"},
            {"name":"Andrew", "email":"andrew@gmail.com"}
        ];

        var colConfig = {
          contract: ["name", "email"],
          failOnError: true,
          rules: {
              required: ["name", "email"]
          }
        };

        var assetAllObjectsInOriginalCollectionAreReturnedBySift = function () {
            return _.every(Sift(colConfig, col), function (obj) {
                return !_.isEmpty(_.where(col, obj));
            }.bind(this));
        };

        console.log(assetAllObjectsInOriginalCollectionAreReturnedBySift()); // true!!

```
#### Use Sift to validate a nested collection
Configs for nested collections work as usual. The only thing you have to remember is that the args for nested config
(in the Rules.collections object) will be ignored. Lets clarify this idea with the following code fragment from our
[tests](https://github.com/Luckvery/sift-js/blob/master/spec/SiftSpec.js#L930 "Tests!!! Yay!!!" ):

```
        var captainCollection = [
            {'captain': 'captain1', 'email': 'captain1@gmail.com', wars: 3},
            {'captain': 'captain2', 'email': 'captain2@gmail.com', wars: 3},
            {'captain': 'captain3', 'email': 'captain3@gmail.com'},
            {'captain': 'captain4', 'email': 'captain4@gmail.com', wars: 4},
            {'captain': 'captain5', 'email': 'captain5@gmail.com', wars: 6}
        ];

        var captainCollectionConfig = {
            // process current level in hierarchy
            contract: ['captain', 'wars', 'email'],
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

        var mainConfig = {
            contract: ['planet', 'attempt', 'generals'],
            args: [
                'planet',
                'earth',
                'attempt',
                '3',
                'generals',
                regionalCommanders
            ],
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
                'Sift.rules.required violation: ' +
                '1 or more required argument(s) missing. ' +
                'Required argument(s): [captain,email,wars]'
            )
        );
```
#### Contrived grunt worker task
```
module.exports = function(grunt) {
    grunt.registerTask(
    'worker',
    'worker task to update files on S3 or DynamoDB',
    function() {

        var inputObj = Sift(["update"],
            this.args, {
                only: {
                    "update": ["s3Assets", "dynamoDBAssets"]
                },
                defaults: {
                    "update": "s3Assets"
                },
                map:{
                    "update"{
                        "s3Assets": [
                                      'shell:buildS3AssetsLocally', 
                                      'shell:pushToS3'
                        ],
                        "dynamoDBAssets": [
                                      'shell:buildDynamoAssetsLocally', 
                                      'shell:pushToS3', 
                                      'shell:cleanTempFiles'
                        ]
                    }
                }
            }, true);

        turnOffTaskLogHeader([
            'shell'
        ]);

        grunt.task.run(inputObj["update"]);
    });
};

```
#### Contrived total usage
```
fooBar(){
     var colConfig = {
         contract: ["name", "email"],
         failOnError: true,
         rules: {
             required: ["name", "email"]
         }
     };

     var col = [
        {"name":"Russell", "email":"russell@gmail.com"},
        {"name":"David", "email":"david@gmail.com"},
        {"name":"Paul", "email":"paul@gmail.com"},
        {"name":"Fred", "email":"fred@gmail.com"},
        {"name":"Dennis", "email":"dennis@gmail.com"},
        {"name":"Andrew", "email":"andrew@gmail.com"}
     ];

     var inputObj = Sift({
        contract:[
          "url", "named", "clientId", "reconcile", "shell", "config", "year"
        ],
        args: arguments,
        failOnError: true,
        pairedArgs: true,
        rules:{
                exclusive: [
                    ["url", "named"]
                ],
                collection: {
                    "users": colConfig
                },
                requires: {
                    "reconcile": ["clientId"]
                },
                only: {
                    "shell": ["Terminal", "iTerm"],
                    "config": ["yes", "no"]
                },
                defaults: {
                    "shell": "Terminal"
                },
                oneForAll: ["module", "clientId"],
                atleastOne: true,
                required: ["name"],
                map: {
                    "config": {
                        "yes": true,
                        "no": false
                    }
                },
               type:{
                   "url":["String"],
                   "year":["number"],
                   "clientId":["String", "regex"]
               },
               custom:{
                   "shell":function(value){
                      return value.toLowerCase() == "terminal" 
                         || value.toLowerCase() == "iterm" 
                         || value.toLowerCase() == "gitbash";
                    }
               }        
            }
        });
}
```

#### See Tests for more examples!!
