/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var registry = {}

export default class Component3d {
  static register(type, clazz) {
    if (!clazz) return registry[type]
    registry[type] = clazz
  }
}
