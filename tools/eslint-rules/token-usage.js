export const rules = {
  'no-raw-radius': {
    meta: { type: 'suggestion', docs: { description: 'Prefer token-based radius classes' } },
    create(context) {
      return {
        JSXAttribute(node) {
          if (node.name && node.name.name === 'className' && node.value && node.value.type === 'Literal') {
            const v = String(node.value.value)
            if (/\brounded-(sm|md|lg|xl|2xl|3xl|full)\b/.test(v) && !/rounded-token-/.test(v)) {
              context.report({ node, message: 'Use token-based radius class: rounded-token-*' })
            }
          }
        }
      }
    }
  },
  'no-raw-shadow': {
    meta: { type: 'suggestion', docs: { description: 'Prefer token-based shadow classes' } },
    create(context) {
      return {
        JSXAttribute(node) {
          if (node.name && node.name.name === 'className' && node.value && node.value.type === 'Literal') {
            const v = String(node.value.value)
            if (/\bshadow(-[\w-]+)?\b/.test(v) && !/shadow-token-/.test(v)) {
              context.report({ node, message: 'Use token-based shadow class: shadow-token-*' })
            }
          }
        }
      }
    }
  }
}

