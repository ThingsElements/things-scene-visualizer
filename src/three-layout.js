/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import { Layout } from '@hatiolab/things-scene'

/* 대상 컴포넌트의 bounds를 계산한다. */
var ThreeLayout = {
  reflow: function(container, component) {},

  capturables: function(container) {
    return container.get('threed') ? [] : container.components
  },

  drawables: function(container) {
    return container.get('threed') ? [] : container.components
  },

  isStuck: function(component) {
    return false
  }
}

Layout.register('three', ThreeLayout)

export default ThreeLayout
