
![](https://github.com/Luckvery/sift-js/blob/master/img/siftbro.jpg)


# Sift 
*Validations on steriods*
> Run your parameters through the Sift to define rules upfront, simplifying your implementation.

I used this a lot with grunt. I plan on using it in a few other js projects too.  I'd love to hear any feed back on improvements and ways you've used it!


### The Sift Config Object 


#### contract

Type: `array`  

List of valid parameter names.


#### args

Type: `argument object`, `object literal` or `array`  
Default: `true`

List/object of actual parameters. 



#### failOnError

Type: `Boolean`  
Default: `false`

Fail task if it encounters an error. If set to false, any errors will cause Sift to return false.

#### rules

Type: `Object`

Declaratively perform validation on parameters in Sift's contract

|    Name             |   type  | Description                                             |
|:-------------------:|---------|--------------------------------------------------------:|
|atLeastOne|Boolean|At least one argument in contract must have a value|
|custom|Function|Define custom validations with a callback function|
|defaults|Object map|Set default values for arguments in this group that aren't present|
|exclusive|Array of Arrays|Each argument in this group is mutually exclusive|
|map|Boolean|transform user input into some other value you may find more useful|
|only|Boolean|List the only allowable values for an argument|
|oneForAll|Array|If one argument exists, then all arguments in this group must be present|
|required|Array|An array of required arguments|
|requires|Object|Define dependants of an argument|
|type|Object|lodash based type checking| 

### Example usage

#### Contrived grunt worker task
```
module.exports = function(grunt) {
    grunt.registerTask('worker', 'worker task to update files on S3 or DynamoDB', function() {

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
     var inputObj = Sift({
        contract:["url", "named", "butler", "reconcile", "shell", "config", "year"],
        args: this.args,
        failOnError: true,
        rules:{
                exclusive: [
                    ["url", "named"]
                ],
                requires: {
                    "reconcile": ["butler"]
                },
                only: {
                    "shell": ["Terminal", "iTerm"],
                    "config: ["yes", "no"]
                },
                defaults: {
                    "shell": "Terminal"
                },
                oneForAll: ["module", "butler"],
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
                   "butler":["String", "regex"]
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
