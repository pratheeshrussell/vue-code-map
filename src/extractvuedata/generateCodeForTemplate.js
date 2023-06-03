const AstPropsModel =  require('./AstPropsModel.js')

function generateCodeForTemplate(templateAST) {
    const code = 'subgraph Template\n' +  
    generateMermaidCode(templateAST) + 'end';
    // add property binding graph

    return code;
}

function generateMermaidCode(node) {
    let code = '';
    if (node.tag) {
      const componentId = generateComponentId(node);
      
      code += `${componentId}["<strong>${node.tag}</strong>"]\n`;
      // Add event and property bindings
      code += setPropertyEventBinding(node,componentId);
      // Add template children
      if (node.children && node.children.length > 0) {
        for (const childNode of node.children) {
          if(childNode.tag){
            const childComponentId = generateComponentId(childNode);
            code += linkComponentAndChildCode(childNode,componentId,childComponentId);
            // code += `${componentId} --> ${childComponentId}\n`;
            code += generateMermaidCode(childNode);
          }
        }
      }
    }
    return (code);
  }

  function setPropertyEventBinding(node,componentId){
    // dont include structural bindings here
    let code = '';
    if (node.bindings && node.bindings.length > 0) {
      for (const binding of node.bindings) {
        // need to add for bind, model
        if(binding.type == 'event'){
          // { type: 'event', name: eventName, value: attr.exp.content }
          let method = identifyMethod(binding.value);
          if(method){
           let methodId = getMethodId(method);
           code += `${componentId} -- "<span>${binding.name}</span>" --> ${methodId}\n`;
          }
        }
      }
    }

    return code;
  }

  function linkComponentAndChildCode(childNode,componentId,childComponentId ){
    // for structural directive
    let bindingset =false;
    let code = '';
    if (childNode.bindings && childNode.bindings.length > 0) {
        for (const binding of childNode.bindings) {
            // need to add else, else if also
            if(binding.type == 'if'){
                code += `${componentId} -- "<span>${binding.type}</span> (<small>${binding.value}</small>)" --> ${childComponentId}\n`;
                bindingset = true;
            }
        }
      }
      if(bindingset == false){
        code += `${componentId} --> ${childComponentId}\n`;
      }

      return code;
    }
  
  function generateComponentId(node) {
    const id = node.tag || 'unknown';
    const line = node.loc && node.loc.start.line;
    return `${id}_${line || 'unknown'}`;
  }

  function identifyMethod(methodName){
    // will only work if we set up scripts first
    let methods = AstPropsModel.identifyMethods(methodName);
    if(methods.length > 0){
      return methods[0];
    }
    return null;
  }

  function getMethodId(methodName) {
    return AstPropsModel.getMethodId(methodName,'member');
  }


module.exports = {generateCodeForTemplate};