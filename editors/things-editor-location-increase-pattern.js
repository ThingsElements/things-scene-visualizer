import { html } from '@polymer/polymer/polymer-element';
import { ThingsEditorProperty } from '@hatiolab/things-shell/things-module';

export default class LocationIncreasePatternEditor extends ThingsEditorProperty {

  static get is() {
    return 'things-editor-location-increase-pattern';
  }

  static get editorTemplate() {
    return html`
    <style>
      #pattern-set{
        padding:0 10px;
        overflow:hidden;
      }
    </style>

    <legend>
      <things-i18n-msg msgid="label.location-increase-pattern" auto>Increase Pattern</things-i18n-msg>
    </legend>
    <label>
      <things-i18n-msg msgid="label.start-section" auto>Start Section</things-i18n-msg>
    </label>
    <input type="number" data-start-section value="{{startSection::change}}">
    <label>
      <things-i18n-msg msgid="label.start-unit" auto>Start Unit</things-i18n-msg>
    </label>
    <input type="number" data-start-unit value="{{startUnit::change}}">
    <label>
        <things-i18n-msg msgid="label.skip-numbering" auto>Skip Numbering</things-i18n-msg>
      </label>
    <input type="checkbox" data-skip-numbering checked="{{skipNumbering::change}}">
    <div id="pattern-set" class="location-increase-pattern-btn">
      <paper-button data-value="cw">
        <iron-icon icon="editor:border-outer"></iron-icon>
      </paper-button>
      <paper-button data-value="ccw">
        <iron-icon icon="editor:border-inner"></iron-icon>
      </paper-button>
      <paper-button data-value="zigzag">
        <iron-icon icon="editor:border-inner"></iron-icon>
      </paper-button>
      <paper-button data-value="zigzag-reverse">
        <iron-icon icon="editor:border-inner"></iron-icon>
      </paper-button>
    </div>
    `;
  }

  static get properties() {
    return {
      startSection: {
        type: Number,
        value: 1
      },
      startUnit: {
        type: Number,
        value: 1
      },
      skipNumbering: {
        type: Boolean,
        value: true
      },
      _specificPropEl: {
        type: HTMLElement,
        value: null
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._specificPropEl = this._getSpecificPropEl();
    if(this._specificPropEl)
      this._specificPropEl.addEventListener('rack-table-cell-increment-set', this._handleRackTableCellIncrementSet, false);
    this.$['pattern-set'].addEventListener('tap', this._onTapType);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if(this._specificPropEl)
      this._specificPropEl.removeEventListener('rack-table-cell-increment-set', this._handleRackTableCellIncrementSet);
    this.$['pattern-set'].removeEventListener('tap', this._onTapType);
  }

  _onTapType(e) {
    var target = e.target;

    while (!target.hasAttribute('data-value') && target !== this)
      target = target.parentElement;

    if (target === this)
      return;

    var evt = new CustomEvent('rack-table-cell-increment-set', {
      bubbles: true,
      composed: true,
      detail: {
        increasingDirection: target.getAttribute('data-value'),
        startSection: this.startSection,
        startUnit: this.startUnit,
        skipNumbering: this.skipNumbering
      }
    })

    this.dispatchEvent(evt)

    e.stopPropagation();
  }


  _handleRackTableCellIncrementSet(e) {
    let detail = e.detail;

    var selected = this.selected[0].parent;

    var {
      increasingDirection,
      skipNumbering,
      startSection,
      startUnit
    } = detail

    this.scene.undoableChange(function () {
      selected.increaseLocation(increasingDirection, skipNumbering, startSection, startUnit)
    })

  }

  _getSpecificPropEl() {
    // TODO: Shady인 경우에 대하여 처리하여야 함.
    return this.getRootNode().host.getRootNode().host
  }

  isTypeOf(is, type) {
    return is == type;
  }
}

customElements.define(LocationIncreasePatternEditor.is, LocationIncreasePatternEditor);
