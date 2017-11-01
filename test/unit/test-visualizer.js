/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import './util'

import { expect } from 'chai'

import '../../bower_components/things-scene-core/things-scene-min'
import { Visualizer } from '../../src/index'

describe('Visualizer', function () {

  var board;

  beforeEach(function () {
    board = scene.create({
      model: {
        components: [{
          id: 'visualizer',
          type: 'visualizer'
        }]
      }
    })
  });

  it('component should be found by its id.', function () {

    var component = board.findById('visualizer')

    expect(!!component).not.to.equal(false);
  });
});
