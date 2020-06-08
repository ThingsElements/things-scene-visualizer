import { html, css } from 'lit-element'
import { ThingsEditorProperty } from '@things-factory/board-ui/client/modeller-module'

export default class LocationIncreasePatternEditor extends ThingsEditorProperty {
  static get is() {
    return 'things-editor-location-increase-pattern'
  }

  static get styles() {
    return [
      super.styles,
      css`
        #pattern-set {
          overflow: hidden;
          grid-column: 1 / -1;
        }

        #pattern-set paper-button {
          background: url('data:image/png;base64,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')
            no-repeat;
          display: block;
          float: left;
          margin: 0 7px 10px 0 !important;
          width: 55px;
          height: 40px;
          min-width: inherit;
        }
        #pattern-set paper-button iron-icon {
          display: none;
        }
        #pattern-set paper-button[data-value='+u+s'] {
          background-position: 50% 3px;
        }
        #pattern-set paper-button[data-value='+u-s'] {
          background-position: 50% -97px;
        }
        #pattern-set paper-button[data-value='-u+s'] {
          background-position: 50% -197px;
        }
        #pattern-set paper-button[data-value='-u-s'] {
          background-position: 50% -297px;
        }
        #pattern-set paper-button[data-value='+s+u'] {
          background-position: 50% -397px;
        }
        #pattern-set paper-button[data-value='+s-u'] {
          background-position: 50% -497px;
        }
        #pattern-set paper-button[data-value='-s+u'] {
          background-position: 50% -597px;
        }
        #pattern-set paper-button[data-value='-s-u'] {
          background-position: 50% -697px;
        }
        #pattern-set paper-button[data-value='cw'] {
          background-position: 50% -797px;
        }
        #pattern-set paper-button[data-value='ccw'] {
          background-position: 50% -897px;
        }
        #pattern-set paper-button[data-value='zigzag'] {
          background-position: 50% -997px;
        }
        #pattern-set paper-button[data-value='zigzag-reverse'] {
          background-position: 50% -1097px;
        }

        label {
          order: initial;
        }

        input {
          order: initial;
        }

        #skip-numbering {
          order: initial;
          grid-column: span 4;
        }
        label[for='skip-numbering'] {
          order: 1;
          grid-column: span 5;
          text-align: left;
        }
      `
    ]
  }

  editorTemplate() {
    // TODO: background image change to use the url-loader
    return html`
      <legend><i18n-msg msgid="label.location-increase-pattern" auto>Increase Pattern</i18n-msg></legend>
      <label> <i18n-msg msgid="label.start-section" auto>Start Section</i18n-msg> </label>
      <input
        type="number"
        data-start-section
        value="${this.startSection}"
        @change=${e => (this.startSection = e.target.valueAsNumber)}
      />
      <label> <i18n-msg msgid="label.start-unit" auto>Start Unit</i18n-msg> </label>
      <input
        type="number"
        data-start-unit
        value="${this.startUnit}"
        @change=${e => (this.startUnit = e.target.valueAsNumber)}
      />
      <label for="skip-numbering">
        <i18n-msg msgid="label.skip-numbering" auto>Skip Numbering</i18n-msg>
      </label>
      <input id="skip-numbering" type="checkbox" data-skip-numbering ?checked="${this.skipNumbering}" />
      <div id="pattern-set" class="location-increase-pattern-btn" @click=${e => this._onTapType(e)}>
        <paper-button data-value="cw"> <iron-icon icon="editor:border-outer"></iron-icon> </paper-button>
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
    `
  }

  static get properties() {
    return {
      startSection: Number,
      startUnit: Number,
      skipNumbering: Boolean,
      _specificPropEl: HTMLElement
    }
  }

  constructor() {
    super()

    this.startSection = 1
    this.startUnit = 1
    this.skipNumbering = true
    this._specificPropEl = null
  }

  firstUpdated(changedProperties) {
    this.shadowRoot.addEventListener('rack-table-cell-increment-set', this._handleRackTableCellIncrementSet, false)
  }

  connectedCallback() {
    super.connectedCallback()
    if (this.property && this.property.event) {
      Object.entries(this.property.event).forEach(entry => {
        if (entry[0]) {
          document.addEventListener(entry[0], entry[1])
        }
      })
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()

    if (this.property && this.property.event) {
      Object.entries(this.property.event).forEach(entry => {
        if (entry[0]) {
          document.removeEventListener(entry[0], entry[1])
        }
      })
    }
  }

  _onTapType(e) {
    var target = e.target

    while (!target.hasAttribute('data-value') && target !== this) target = target.parentElement

    if (target === this) return

    document.dispatchEvent(
      new CustomEvent('increase-location-pattern', {
        bubbles: true,
        composed: true,
        detail: {
          increasingDirection: target.getAttribute('data-value'),
          startSection: this.startSection,
          startUnit: this.startUnit,
          skipNumbering: this.skipNumbering
        }
      })
    )

    e.stopPropagation()
  }

  _handleRackTableCellIncrementSet(e) {
    let detail = e.detail

    var selected = this.selected[0].parent

    var { increasingDirection, skipNumbering, startSection, startUnit } = detail

    this.scene.undoableChange(function () {
      selected.increaseLocation(increasingDirection, skipNumbering, startSection, startUnit)
    })
  }

  _getSpecificPropEl() {
    // TODO: Shady인 경우에 대하여 처리하여야 함.
    return this.getRootNode().host.getRootNode().host
  }

  isTypeOf(is, type) {
    return is == type
  }
}

customElements.define(LocationIncreasePatternEditor.is, LocationIncreasePatternEditor)
