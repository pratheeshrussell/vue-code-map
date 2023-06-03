const AstPropsModel =  require('./AstPropsModel.js')

function generateCodeForTemplate(templateAST) {
    const code = 'subgraph Template\n' +  
    generateMermaidCode(templateAST) + 'end\n';
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
        }else if(binding.type == 'property' || binding.type == 'model'){
          // check if it is a property or a computed item
          let data = identifyData(binding.value);
          let computed = identifyComputed(binding.value);
          const leadingArrow = (binding.type == 'property' ? '--' : '<--');
          const bindingName = (binding.type == 'property' ? binding.name : 'v-model');
          if(data){
            let dataId = getDataId(data);
            code += `${componentId} ${leadingArrow} "<span>${bindingName}</span>" --> ${dataId}\n`;
           }else if(computed){
            let compId = getComputedId(computed);
            code += `${componentId} ${leadingArrow} "<span>${bindingName}</span>" --> ${compId}\n`;
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
  function identifyData(methodName){
    // will only work if we set up scripts first
    let datas = AstPropsModel.identifyData(methodName);
    if(datas.length > 0){
      return datas[0];
    }
    return null;
  }
  function identifyComputed(methodName){
    // will only work if we set up scripts first
    let computed = AstPropsModel.identifyComputed(methodName);
    if(computed.length > 0){
      return computed[0];
    }
    return null;
  }

  function getMethodId(methodName) {
    return AstPropsModel.getMethodId(methodName,'member');
  }
  
  function getDataId(dataName) {
    return AstPropsModel.getDataId(dataName);
  }
  function getComputedId(computedName) {
    return AstPropsModel.getComputedId(computedName);
  }


module.exports = {generateCodeForTemplate};