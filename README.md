JSON ORM MANIPULATION


Description:

A ORM like interface to manipulate json files. Check the test for examples.


Query language

Find
Searches for matching objects inside a json tree. example query.

[{
keyName: 'name',
type: 'normal' (default), 'eval', 'regex',
value: 'value' * any value
}]

A find result will be a array of objects path for the object , example:
['this.that.path.obj.3.this']

Update:

Updates a object , using a update object , it may add properties or replace them.
Updates may be conditional , dynamic, example of update object

[{
	keyname: 'name',
	type: 'normal' (default), 'eval'
	value: {['John','Jack'],['Mary','Jason']} // dynamic replacement example, will change John to Mary and Jack to Json, will not change otherwize. Values can be object
	value: 'new Date()' // eval example, adding if needed
	value: 34 // just setting new value, adding if needed
}]

Insert: 
Inserts are like array operations, we are basically inserting a new element as a brother to our path , by default it inserts after our element, but we can specify
if we want to insert before. 

Example insert object:
jsonorm.insert('path for sibling','object','before: boolean')

getObject:
Copies a element into another one, if there is input , needs to be in update format as it wil copy and make replacements.
For example, copy and replace a property value into a copied object.
will return a object, you can then use the object at inserts

Delete:
Removes a element from json file










