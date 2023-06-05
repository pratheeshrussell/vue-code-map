const traverse = require("@babel/traverse").default;
class UtilityFunctions {
  constructor() {}
  // # Options Utils
  getNodeByName(ast, keyName) {
    // keyName = 'methods'
    let parentPath = null;
    let scope = null;
    let methodsObject = null;
    traverse(ast, {
      ExportDefaultDeclaration(path) {
        const declaration = path.get("declaration");
        if (declaration.isObjectExpression()) {
          declaration.traverse({
            Property(propertyPath) {
              const propertyName = propertyPath.node.key.name;
              if (propertyName === keyName) {
                methodsObject = propertyPath.node.value;
                parentPath = path.parentPath;
                scope = path.scope;
              }
            },
          });
        }
      },
    });

    return { methodsObject, parentPath, scope };
  }

  extractMethodCalls(nodes, visitedCalls) {
    const methodCalls = [];
    nodes.forEach((node) => {
      if (
        node &&
        node.type === "ExpressionStatement" &&
        node.expression?.type === "CallExpression"
      ) {
        let calledMethod = {};
        if (
          node &&
          node.type === "ExpressionStatement" &&
          node.expression?.type === "CallExpression"
        ) {
          const { start, end } = node.expression;
          const callKey = `${start}-${end}`;

          if (!visitedCalls.has(callKey)) {
            visitedCalls.add(callKey);
          }

          const callee = node.expression.callee;

          if (callee.type === "MemberExpression") {
            calledMethod = { name: callee.property.name, type: "member" };
          } else if (callee.type === "Identifier") {
            calledMethod = { name: callee.name, type: "external" };
          }
        }

        if (calledMethod) {
          methodCalls.push(calledMethod);
        }
      }
    });

    return methodCalls;
  }

  getCodeFlowObjects(ast, keyname) {
    const { methodsObject, parentPath, scope } = 
    this.getNodeByName( ast,  keyname);
    if (methodsObject === null) {
      return [];
    }
    if(keyname == 'watch'){
        return this.traverseWatchers(methodsObject, parentPath, scope);
    }


    // use for 'methods' and others by default
    // watchers and computed must be handled differently
    return this.traverseMethods(methodsObject, parentPath, scope);
  }

  traverseMethods(methodsObject, parentPath, scope){
    // used to handle methods key
    // where everything inside would be function expressions
    const currentInstance = this;
    const flowChart = [];
    // @ts-ignore
    traverse(methodsObject,
      {
        ObjectMethod(path) {
          const methodName = path.node.key.name;
          const methodCalls = currentInstance.processJumpsAndCalls(path,currentInstance);
          flowChart.push({ [methodName]: methodCalls });
        },
      },
      scope,
      parentPath
    );
    return flowChart;
  }

  traverseWatchers(methodsObject, parentPath, scope){
    // used to handle methods key
    // where everything inside would be function expressions
    const currentInstance = this;
    const flowChart = [];
    // @ts-ignore
    traverse(methodsObject,
      {
        ObjectMethod(path) {
          const methodName = path.node.key.name;
          
          const methodCalls = currentInstance.processJumpsAndCalls(path,currentInstance);
          if(methodName == 'handler'){
            const containerkey = path.parentPath.container?.key;
            const parentKey = containerkey.name ? containerkey.name : containerkey.value;
            flowChart.push({ [parentKey]: methodCalls });
          }else{
            flowChart.push({ [methodName]: methodCalls });
          }
          
        },
      },
      scope,
      parentPath
    );
    return flowChart;
  }

  processJumpsAndCalls(path,currentInstance){
    // this extracts all jumps and calls
    // and adds them to an array so we know 
    // which functions are called from where
    const methodCalls = [];
    const visitedCalls = new Set(); //to avoid duplicates
    path.traverse({
        IfStatement(innerPath) {
          const ifBranch = innerPath.get("consequent");
          const elseBranch = innerPath.get("alternate");

          const ifBody = ifBranch.isBlockStatement()
            ? ifBranch.node.body
            : [ifBranch.node];
          const elseBody =
            elseBranch && elseBranch.isBlockStatement()
              ? elseBranch.node.body
              : [elseBranch.node];

          const ifCalls = currentInstance.extractMethodCalls(
            ifBody,
            visitedCalls
          );
          const elseCalls = currentInstance.extractMethodCalls(
            elseBody,
            visitedCalls
          );

          // no valid way to differentiate else-if
          if (ifCalls.length > 0) {
            //let methodType = 'if';

            methodCalls.push({
              type: "if",
              to: ifCalls,
              condition: innerPath.get("test").toString(),
            });
          }
          if (elseCalls.length > 0) {
            methodCalls.push({
              type: "else",
              to: elseCalls,
              condition: null,
            });
          }
        },
        SwitchStatement(innerPath) {
          const switchNode = innerPath.node;
          const cases = switchNode.cases.map((caseNode) => {
            const caseCalls = currentInstance.extractMethodCalls(
              caseNode.consequent,
              visitedCalls
            );
            return {
              case: caseNode?.test?.value,
              calls: caseCalls,
            };
          });

          // const defaultCase = switchNode.cases.find(caseNode => caseNode.test === null);
          // const defaultCalls = defaultCase ? extractMethodCalls(defaultCase.consequent,visitedCalls) : [];

          cases.forEach((caseItem) => {
            // the undefined check is for default case
            if (caseItem.calls.length > 0) {
              methodCalls.push({
                type: "switch",
                to: caseItem.calls,
                condition: caseItem != undefined ? caseItem.case : null,
              });
            }
          });
        },
        CallExpression(innerPath) {
          // avoid duplicate addition
          const { start, end } = innerPath.node;
          if (!visitedCalls.has(`${start}-${end}`)) {
            visitedCalls.add(`${start}-${end}`);
          } else {
            return;
          }
          // checks to confirm functions are of type this.Function
          // to add others type identifier innerPath.node.callee.type
          if (
            innerPath.node.callee.type === "MemberExpression" &&
            innerPath.node.callee.object.type === "ThisExpression"
          ) {
            const calledMethod = innerPath.node.callee.property.name;
            methodCalls.push({
              type: "memberfunction",
              to: { name: calledMethod, type: "member" },
              condition: null,
            });
          } else if (innerPath.node.callee.type === "Identifier") {
            const calledMethod = innerPath.node.callee.name;
            methodCalls.push({
              type: "externalfunction",
              to: { name: calledMethod, type: "external" },
              condition: null,
            });
          }
        },
      });

    return methodCalls;
  }


  extractKeyNames(scriptAST, nodeName) {
    const keyProperties = [];
    traverse(scriptAST, {
      ObjectProperty(path) {
        if (path.node.key.name === nodeName) {
          const nodeObject = path.node.value;
          if (nodeObject.type === "ObjectExpression") {
            nodeObject.properties.forEach((property) => {
              if (property.key.type === "Identifier") {
                keyProperties.push(property.key.name);
              }
            });
          }
        }
      },
    });

    return keyProperties;
  }

  extractReturnKeys(scriptAST, nodeName) {
    // used for data props since we return from a function
    const dataProperties = [];

    traverse(scriptAST, {
      ObjectMethod(path) {
        if (path.node.key.name === nodeName) {
          const dataFunction = path.node;
          const returnStatement = dataFunction.body.body.find(
            (statement) => statement.type === "ReturnStatement"
          );

          if (
            returnStatement &&
            returnStatement.argument.type === "ObjectExpression"
          ) {
            const dataObject = returnStatement.argument;
            dataObject.properties.forEach((property) => {
              if (property.type === "ObjectProperty") {
                dataProperties.push(property.key.name);
              }
            });
          }
        }
      },
    });

    return dataProperties;
  }
}

module.exports = { utilFunc: new UtilityFunctions() };
