Fliplet.Floorplan = (function() {
  const components = {}
  const eventHub = new Vue();
  const templates = Fliplet.Widget.Templates

  return {
    on: function(eventName, fn) {
      eventHub.$on(eventName, fn);
    },
    off: function(eventName, fn) {
      eventHub.$off(eventName, fn);
    },
    emit: function(eventName, data) {
      eventHub.$emit(eventName, data);
    },
    component(componentName, component) {
      if (!component.componentName) {
        throw new Error('The component name is required')
      }

      const template = templates['templates.interface.' + componentName]

      if (!template) {
        throw new Error('A template for the ' + componentName + ' component has not been found')
      }

      component.template = template()

      Vue.component(componentName, component)
    }
  }
})();