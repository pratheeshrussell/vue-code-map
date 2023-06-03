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


    getMethodId(methodName,type='member') {
      if (!this.methodIds[methodName]) {
        this.methodIds[methodName] = Object.keys(this.methodIds).length + 1;
      }
      return `method-${type}-${this.methodIds[methodName]}`;
    }

    getAllMethods(){
      return Object.keys(this.methodIds);
    }

    identifyMethods(methodName){
      // will only work if we set up scripts first
      let methods = this.getAllMethods();
      let identifiedMethods=[];
      methods.forEach((method) => {
        const regex = new RegExp(`\\b${method}\\b`, 'g');
        const matches = methodName.match(regex);
        if (matches) {
          identifiedMethods.push(matches[0]);
        }
      });
      return identifiedMethods;
    }

}

const instance = new AstProps();
module.exports = instance;