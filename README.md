# JSON MANIPULATION

### Description:

A utility to manipulate json files.

### Usage

#### Initialization

var jorm = require('json-orm');
var json = {myobj:"this is a object"}
var instance = new jorm(json)

#### Find
Uses a query to find a element , example query:
```
var query = {  
keyName: 'name',  
type: 'normal' (default) or 'regex',  
value: {value} or '*'  
}
```
you can also search with 'and' or 'or' objects:

```
query = { 
	and/or : [{  
		keyName: 'First Name',  
		type: 'normal' (default) or 'regex',  
		value: {value} or '*'  
		},
		{  
		keyName: 'Last Name',  
		type: 'normal' (default) or 'regex',  
		value: {value} or '*'  
	}]
}
```

instance.find(query).then(foundObjects)	// find returns a promise
var foundObjects = instance.findSync(query); // findSync is asynchronous

Returns an array of strings with the objects path within the main json objects, example:
```
['this.that.path.obj.3.this']  
```

#### Update:

Updates a object , using a update object , it may add properties or replace them.
Updates may be conditional , dynamic, example of update object.
Updates are in array format as you can apply several updates to the same object at once.
Update object example:
```
var updateObj = [{  
	keyname: 'name',  
	type: 'normal' (default), 'eval'  
	value: {['John','Jack'],['Mary','Jason']} // dynamic replacement example, will change John to Mary and Jack to Json, will not change otherwize. Values can be object  
	value: 'new Date()' // eval example, adding if needed  
	value: 34 // just setting new value, adding if needed  
	value: {obj: { obj2 : {obj3 : 'a'}}}  
}]  

// for sync execution use updateSync
update(foundObjects[0], updateObj).then()  
```

Objects can also be updated by simply changing properties of a object retrieved by 'getObject' as the object returned is a reference.

#### Insert: 
Inserts are like array operations, we are basically inserting a new element as a brother to our path , by default it inserts after our element, but we can specify
if we want to insert before. 

Example insert object:
```
instance.insert('path for sibling','object to insert','before: boolean').then() // Use insertSync for sync  
```

#### Delete:
Removes a object from the main object
```
instance.remove('path for element to delete')  
```

#### getObject:
Gets the inner object from path. Note that this object is a reference to a inner object from your json object.

```
var element = instance.getObject('path');  
```

### To access the modified json data just access

```
var changedData = instance.data  
```

For better example please see the test flle




