class AstProps {
  constructor() {
    if (AstProps.instance) {
      return AstProps.instance;
    }

    // Your initialization code goes here
    AstProps.instance = this;
  }

  // Other methods and properties go here
  methodIds = {};
  dataIds = {};
  computedIds = {};
  watcherIds = {};

  // Generate Id's
  getMethodId(methodName, type = "member") {
    if (!this.methodIds[methodName]) {
      this.methodIds[methodName] = Object.keys(this.methodIds).length + 1;
    }
    return `method-${type}-${this.methodIds[methodName]}`;
  }
  getDataId(dataName) {
    if (!this.dataIds[dataName]) {
      this.dataIds[dataName] = Object.keys(this.dataIds).length + 1;
    }
    return `data-${this.dataIds[dataName]}`;
  }
  getComputedId(dataName) {
    if (!this.computedIds[dataName]) {
      this.computedIds[dataName] = Object.keys(this.computedIds).length + 1;
    }
    return `computed-${this.computedIds[dataName]}`;
  }
  getWatcherId(dataName) {
    if (!this.watcherIds[dataName]) {
      this.watcherIds[dataName] = Object.keys(this.watcherIds).length + 1;
    }
    return `watch-${this.watcherIds[dataName]}`;
  }

  // get all functions
  getAllMethods() {
    return Object.keys(this.methodIds);
  }
  getAllData() {
    return Object.keys(this.dataIds);
  }
  getAllComputed() {
    return Object.keys(this.computedIds);
  }
  getAllWatchers() {
    return Object.keys(this.watcherIds);
  }
  // identifier functions
  identifyMethods(methodName) {
    // will only work if we set up scripts first
    let methods = this.getAllMethods();
    return this.identifier(methods, methodName);
  }

  identifyData(dataName) {
    // will only work if we set up scripts first
    let datas = this.getAllData();
    return this.identifier(datas, dataName);
  }

  identifyComputed(compName) {
    // will only work if we set up scripts first
    let computed = this.getAllComputed();
    return this.identifier(computed, compName);
  }

  identifier(list, key) {
    let identifiedMethods = [];
    list.forEach((listItem) => {
      const regex = new RegExp(`\\b${listItem}\\b`, "g");
      const matches = key.match(regex);
      if (matches) {
        identifiedMethods.push(matches[0]);
      }
    });
    return identifiedMethods;
  }
}

const instance = new AstProps();
module.exports = instance;
