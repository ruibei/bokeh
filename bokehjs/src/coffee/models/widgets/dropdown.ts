/* XXX: partial */
import {span, ul, li, a} from "core/dom"
import * as p from "core/properties"

import {AbstractButton, AbstractButtonView} from "./abstract_button"
import {clear_menus} from "./common"

export class DropdownView extends AbstractButtonView {
  model: Dropdown

  connect_signals(): void {
    super.connect_signals()
    clear_menus.connect(() => this._clear_menu())
  }

  render(): void {
    super.render()

    if (!this.model.is_split_button) {
      this.el.classList.add("bk-bs-dropdown")
      this.buttonEl.classList.add("bk-bs-dropdown-toggle")
      this.buttonEl.appendChild(span({class: "bk-bs-caret"}))
    } else {
      this.el.classList.add("bk-bs-btn-group")
      const caretEl = this._render_button(span({class: "bk-bs-caret"}))
      caretEl.classList.add("bk-bs-dropdown-toggle")
      caretEl.addEventListener("click", (event) => this._caret_click(event))
      this.el.appendChild(caretEl)
    }

    if (this.model.active)
      this.el.classList.add("bk-bs-open")

    const items = []
    for (const item of this.model.menu) {
      let itemEl: HTMLElement
      if (item != null) {
        const [label, value] = item
        const link = a({}, label)
        link.dataset.value = value
        link.addEventListener("click", (event) => this._item_click(event))
        itemEl = li({}, link)
      } else
        itemEl = li({class: "bk-bs-divider"})
      items.push(itemEl)
    }

    const menuEl = ul({class: "bk-bs-dropdown-menu"}, items)
    this.el.appendChild(menuEl)
  }

  _clear_menu(): void {
    this.model.active = false
  }

  _toggle_menu(): void {
    const active = this.model.active
    clear_menus.emit()
    if (!active)
      this.model.active = true
  }

  _button_click(event): void {
    event.preventDefault()
    event.stopPropagation()

    if (!this.model.is_split_button)
      this._toggle_menu()
    else {
      this._clear_menu()
      this.set_value(this.model.default_value)
    }
  }

  _caret_click(event): void {
    event.preventDefault()
    event.stopPropagation()
    this._toggle_menu()
  }

  _item_click(event): void {
    event.preventDefault()
    this._clear_menu()
    this.set_value(event.currentTarget.dataset.value)
  }

  set_value(value): void {
    this.buttonEl.value = this.model.value = value
    this.change_input()
  }
}

export class Dropdown extends AbstractButton {
  get is_split_button(): boolean {
    return this.default_value != null
  }
}

Dropdown.prototype.type = "Dropdown"
Dropdown.prototype.default_view = DropdownView

Dropdown.define({
  value:         [ p.String    ],
  default_value: [ p.String    ],
  menu:          [ p.Array, [] ],
})

Dropdown.override({
  label: "Dropdown"
})

Dropdown.internal({
  active: [p.Boolean, false]
})
