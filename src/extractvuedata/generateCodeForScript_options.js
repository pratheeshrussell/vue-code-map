const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const AstPropsModel =  require('./AstPropsModel.js')

function generateCodeForScript(scriptContent) { 
    let processedMethods = traverseMethods(scriptContent); 
    return 'subgraph Script\n' + generateMermaidGraph(processedMethods) + 'end';
}


function traverseMethods(scriptContent) {
  const ast = parser.parse(scriptContent, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  const flowChart = [];

  traverse(ast, {
    ObjectMethod(path) {
      const methodName = path.node.key.name;
      const methodCalls = [];
      const visitedCalls = new Set();//to avoid duplicates
     
      path.traverse({
        IfStatement(innerPath) {
          const ifBranch = innerPath.get('consequent');
          const elseBranch = innerPath.get('alternate');

          const ifBody = ifBranch.isBlockStatement() ? ifBranch.node.body : [ifBranch.node];
          const elseBody = elseBranch && elseBranch.isBlockStatement() ? elseBranch.node.body : [elseBranch.node];

          const ifCalls = extractMethodCalls(ifBody,visitedCalls);
          const elseCalls = extractMethodCalls(elseBody,visitedCalls);
          
          // no valid way to differentiate else-if
          if(ifCalls.length > 0){
            //let methodType = 'if';
            
            methodCalls.push({
                type: 'if',
                to: ifCalls,
                condition:innerPath.get('test').toString()
            });
  
           }
           if(elseCalls.length > 0){
            methodCalls.push({
                type: 'else',
                to: elseCalls,
                condition:null
              });
            }
          
         
        },
        SwitchStatement(innerPath) {
          const switchNode = innerPath.node;
          const cases = switchNode.cases.map(caseNode => {
            const caseCalls = extractMethodCalls(caseNode.consequent,visitedCalls);
            return {
              case: caseNode?.test?.value,
              calls: caseCalls
            };
          });

          // const defaultCase = switchNode.cases.find(caseNode => caseNode.test === null);
          // const defaultCalls = defaultCase ? extractMethodCalls(defaultCase.consequent,visitedCalls) : [];

          cases.forEach(caseItem => {
              // the undefined check is for default case
              if(caseItem.calls.length > 0){
                methodCalls.push({
                  type: 'switch',
                  to: caseItem.calls,
                  condition: caseItem != undefined ? caseItem.case : null
                });
              }
          });
        },
        CallExpression(innerPath) {
          // avoid duplicate addition
          const { start, end } = innerPath.node;
          if (!visitedCalls.has(`${start}-${end}`)) {
            visitedCalls.add(`${start}-${end}`);
          }else{
            return;
          }
          // checks to confirm functions are of type this.Function
          // to add others type identifier innerPath.node.callee.type
          if (innerPath.node.callee.type === 'MemberExpression' && 
          innerPath.node.callee.object.type === 'ThisExpression') {
            const calledMethod = innerPath.node.callee.property.name;
            methodCalls.push({
              type: 'memberfunction',
              to: {name:calledMethod,type: 'member' },
              condition:  null
              });
          } else if (innerPath.node.callee.type === 'Identifier'){
            const calledMethod = innerPath.node.callee.name;
            methodCalls.push({
              type: 'externalfunction',
              to: {name:calledMethod,type: 'external' },
              condition:  null
              });
          } 
        }
      });
      if(methodName !== 'data'){
        flowChart.push({ [methodName]: methodCalls });
      }
    }
  });

  return flowChart;
}

function extractMethodCalls(nodes,visitedCalls) {
  const methodCalls = [];
  nodes.forEach(node => { 
    if (node && node.type === 'ExpressionStatement' && node.expression?.type === 'CallExpression') {
      let calledMethod = {};
      if (node && node.type === 'ExpressionStatement' && node.expression?.type === 'CallExpression') {
        const { start, end } = node.expression;
        const callKey = `${start}-${end}`;
  
        if (!visitedCalls.has(callKey)) {
          visitedCalls.add(callKey);
        }
        
        const callee = node.expression.callee;
  
        if (callee.type === 'MemberExpression') {
          calledMethod = { name: callee.property.name, type:'member' };
        } else if (callee.type === 'Identifier') {
          calledMethod = { name: callee.name, type:'external' };
        }
      }
  
      if (calledMethod) {
        methodCalls.push(calledMethod);
      }
    }
  });

  return methodCalls;
}


function generateMermaidGraph(flowChart) {
  let graphCode = '';

  flowChart.forEach((method, index) => {
    const methodName = Object.keys(method)[0];
    const methodCalls = method[methodName];

    graphCode += `${getMethodId(methodName)}["${methodName}"];\n`;

    methodCalls.forEach(call => {
      if (call.type === 'if' || call.type === 'switch') {
        call.to.forEach((calledMethod, i) => {
          if(call.type === 'switch' && call.condition ==null)
          {call.condition ='default case';}
          graphCode += `${getMethodId(methodName)} -->|"${call.type}(${call.condition})"| ${getMethodId(calledMethod.name,calledMethod.type)}["${calledMethod.name}"]\n`;
        });
      } else if (call.type === 'else' ) {
        call.to.forEach((calledMethod, i) => {
          graphCode += `${getMethodId(methodName)} -->|else| ${getMethodId(calledMethod.name,calledMethod.type)}["${calledMethod.name}"]\n`;
        });
      }  else {
        graphCode += `${getMethodId(methodName)} --> ${getMethodId(call.to.name,call.to.type)}["${call.to.name}"]\n`;
      }
    });
  });

  return graphCode;
}

function getMethodId(methodName,type='member') {
  return AstPropsModel.getMethodId(methodName,type);
}

module.exports = {
  generateCodeForOptionsScript:generateCodeForScript
};