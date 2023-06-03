const { parse } = require('@vue/compiler-sfc');
const { transform } = require('@vue/compiler-dom');

function extractTemplateAndScript(component) {
    const { descriptor } = parse(component);
    const templateAST = descriptor.template?.ast;
    const scriptContent = descriptor.script?.content;
    const api = (descriptor.script && descriptor.script.setup) ? 'composition' : 'options';
    extractBindings(templateAST);
    return {
      templateAST,
      scriptContent,
      descriptor,
      api
    };
}

function extractBindings(ast) {
  const transformed = transform(ast, {
    nodeTransforms: [transformElement],
  });
  return transformed;

  function transformElement(node) {
    if (node.type === 1 /* NodeTypes.ELEMENT */) {
      const bindings = [];
      for (const attr of node.props) {
        
        if (attr.type === 7 /* NodeTypes.ATTRIBUTE */) {
          // console.log('attr ',attr)
          if (attr.name== 'on' ) {
            const eventName = attr.arg.content;
            bindings.push({ type: 'event', name: eventName, value: attr.exp.content });
          } else if (attr.name == 'bind' ) {
            const propName = attr.arg.content;
            bindings.push({ type: 'property', name: propName, value: attr.exp.content });
          } else if (attr.name == 'model' || attr.name == 'if' || attr.name == 'for') {
            const propName = '';
            bindings.push({ type: attr.name, name: propName, value: attr.exp.content });
          }
        }
      }
      if (bindings.length > 0) {
        node.bindings = bindings;
      }
    }
  }
}

module.exports = {extractTemplateAndScript};