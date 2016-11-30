function jsonorm(json) {
    var path = require('path');
    var common = require(path.join(__dirname, 'controllers/common.js'));
    var _find = require(path.join(__dirname, 'controllers/find.js'));
    var _insert = require(path.join(__dirname, 'controllers/insert.js'));
    var _remove = require(path.join(__dirname, 'controllers/remove.js'));
    var _update = require(path.join(__dirname, 'controllers/update.js'));

    var object = {};
    this.data = json ? JSON.parse(json) : null;

    var foundObjects = [];

    /**
     * Finds the key path of the ojbect(s) being queried
     * @param  {Object} query The search query
     * @return {Array} Array of path references to the objects
     */
    this.find = function(query) {
        if(!this.data){
            throw("You need to load the json first");
        }
        this.foundObjects = _find(this.data, query);
        return this.foundObjects;
    };

    /**
     * Updates the object with the new object
     * @param  {String} path   The object path to update
     * @param  {Object} newObj The new object/value
     * @return {Boolean}       Boolean return
     */
    this.update = function(path, newObj) {
        if(!this.data){
            throw("You need to load the json first");
        }
        this.data = _update(this.data, path, newObj);
    };

    /**
     * Inserts a new object before or after our path object
     * @param  {String} path   The path for our reference object
     * @param  {Object} newObj The new Object to insert
     * @param  {Boolean} before Before or After (default)
     * @return {Boolean} If insert is successfull
     */
    this.insert = function(path, newObj, before) {
        if(!this.data){
            throw("You need to load the json first");
        }
        this.data = _insert(this.data, path, newObj, before);
    };

    /**
     * Inserts a new object before or after our path object
     * @param  {String} path   The path for our reference object
     * @param  {Object} newObj The new Object to insert
     * @param  {Boolean} before Before or After (default)
     * @return {Boolean} If insert is successfull
     */
    this.remove = function(path) {
        if(!this.data){
            throw("You need to load the json first");
        }
        this.data = _remove(this.data, path);
    };

    /**
     * Gets the json object from a given path
     * @param  {String} path Path for the object
     * @return {Object}      The object
     */
    this.getObject = function(path) {
        if(!this.data){
            throw("You need to load the json first");
        }
        return common.getObjectFromPath(this.data, path);
    };
    return this;
}

module.exports = jsonorm;
