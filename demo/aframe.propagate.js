AFRAME.registerComponent('propagate', {
  schema: {
    events: {type: 'array', default: []},
  },
  init: function () {
    var self  = this
    var parentEntity = this.el

    parentEntity.addEventListener('mouseenter', function (e) {
      walk(parentEntity, function (child) {
        emitEvents(child)
      })
    })

    parentEntity.addEventListener('mouseleave', function (e) {
      walkback(parentEntity, function (parent) {
        emitEvents(parent)
      })
    })

    function walk(node, func) {
       var children = node.children;
       for (var i = 0; i < children.length; i++) {
         walk(children[i], func);
       }
       func(node);
    }

    function walkback(node, func) {
      var parent = node.parentEl;
      func(parent);
    }

    function emitEvents (entity) {
      for (var i = 0; i < self.data.events.length; i++) {
        entity.emit(self.data.events[i])
      }
    }
  }
});
