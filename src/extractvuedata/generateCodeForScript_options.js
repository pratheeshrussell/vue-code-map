const parser = require('@babel/parser');
const AstPropsModel =  require('./AstPropsModel.js');
const { utilFunc } = require('./utils.js');

function generateCodeForScript(scriptContent) { 
    const ast = parser.parse(scriptContent, {
      sourceType: 'module',
      plugins: ['jsx']
    });
    // Get methods
    let processedMethods = traverseMethods(ast); 
    let methodsGraph = 'subgraph Methods\n' + getMermaidGraphForMethods(processedMethods,'method') + 'end\n';

    let dataList = extractDataProperties(ast);
    let datasGraph = 'subgraph Data\n' + getMermaidGraphForData(dataList) + 'end\n';

    let computedPropsList = extractComputedProperties(ast);
    let computedGraph = 'subgraph Computed\n' + getMermaidGraphForComputed(computedPropsList) + 'end\n';

    let watchersList = extractWatchers(ast);
    let watcherGraph = 'subgraph Watchers\n' + getMermaidGraphForMethods(watchersList,'method') + 'end\n';
    
    return methodsGraph + datasGraph + computedGraph + watcherGraph;
  }



function traverseMethods(ast) {
  return  utilFunc.getCodeFlowObjects(ast,'methods');
}


function extractDataProperties(scriptAST) {
  return utilFunc.extractReturnKeys(scriptAST,'data');
}

function extractComputedProperties(scriptAST) {
  return utilFunc.extractKeyNames(scriptAST,'computed');
}

function extractWatchers(scriptAST) {
  return  utilFunc.getCodeFlowObjects(scriptAST,'watch');
  //return utilFunc.extractKeyNames(scriptAST,'watch');
}


function getMermaidGraphForMethods(flowChart,type='method') {
  let graphCode = '';
  let genIdFunc = getMethodId;
  flowChart.forEach((method, index) => {
    const methodName = Object.keys(method)[0];
    const methodCalls = method[methodName];

    graphCode += `${genIdFunc(methodName)}["${methodName}"];\n`;

    methodCalls.forEach(call => {
      if (call.type === 'if' || call.type === 'switch') {
        call.to.forEach((calledMethod, i) => {
          if(call.type === 'switch' && call.condition ==null)
          {call.condition ='default case';}
          graphCode += `${genIdFunc(methodName)} -->|"${call.type}(${call.condition})"| ${genIdFunc(calledMethod.name,calledMethod.type)}["${calledMethod.name}"]\n`;
        });
      } else if (call.type === 'else' ) {
        call.to.forEach((calledMethod, i) => {
          graphCode += `${genIdFunc(methodName)} -->|else| ${genIdFunc(calledMethod.name,calledMethod.type)}["${calledMethod.name}"]\n`;
        });
      }  else {
        graphCode += `${genIdFunc(methodName)} --> ${genIdFunc(call.to.name,call.to.type)}["${call.to.name}"]\n`;
      }
    });
  });

  return graphCode;
}

function getMermaidGraphForData(flowChart) {
  let graphCode = '';
  flowChart.forEach((data) => {
    graphCode += `${getDataId(data)}["${data}"];\n`;
  });
  return graphCode;
}

function getMermaidGraphForComputed(flowChart) {
  let graphCode = '';
  flowChart.forEach((data) => {
    graphCode += `${getComputedId(data)}["${data}"];\n`;
  });
  return graphCode;
}

function getMethodId(methodName,type='member') {
  return AstPropsModel.getMethodId(methodName,type);
}

function getDataId(dataName) {
  return AstPropsModel.getDataId(dataName);
}

function getComputedId(dataName) {
  return AstPropsModel.getComputedId(dataName);
}

module.exports = {
  generateCodeForOptionsScript:generateCodeForScript
};