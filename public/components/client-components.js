// src/components/rm-button.js
class RmButton extends HTMLElement {
  constructor() {
    super();
  }
  static get observedAttributes() {
    return [
      "xs",
      "sm",
      "md",
      "lg",
      "pill",
      "standard",
      "primary",
      "secondary",
      "danger",
      "outline",
      "ghost",
      "disabled",
      "type"
    ];
  }
  connectedCallback() {
    this.render();
    this.addEventListener("click", this._handleClick);
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
    }
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "button");
    }
  }
  disconnectedCallback() {
    this.removeEventListener("click", this._handleClick);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }
  _handleClick = (e) => {
    if (this.hasAttribute("disabled")) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const type = this.getAttribute("type");
    if (type === "submit") {
      const form = this.closest("form");
      if (form) {
        form.requestSubmit();
      }
    }
  };
  set label(value) {
    this.textContent = value;
  }
  get label() {
    return this.textContent;
  }
  getSizeClasses() {
    if (this.hasAttribute("xs"))
      return "px-2 py-1 text-xs gap-1.5";
    if (this.hasAttribute("sm"))
      return "px-2 py-1.5 text-xs gap-2";
    if (this.hasAttribute("lg"))
      return "px-3.5 py-3 text-base gap-2.5";
    return "px-4 py-2 text-sm gap-2";
  }
  getShapeClasses() {
    if (this.hasAttribute("pill"))
      return "rounded-full";
    if (this.hasAttribute("xs") || this.hasAttribute("sm"))
      return "rounded-sm";
    if (this.hasAttribute("lg"))
      return "rounded-lg";
    return "rounded-md";
  }
  getStyleClasses() {
    if (this.hasAttribute("ghost"))
      return "bg-transparent text-primary-600 hover:bg-gray-50 focus:ring-primary-500";
    if (this.hasAttribute("outline"))
      return "bg-white text-primary-700 hover:bg-primary-50 focus:ring-gray-300 focus:outline-none border border-primary-300";
    if (this.hasAttribute("danger"))
      return "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500";
    if (this.hasAttribute("secondary"))
      return "bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-400";
    return "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500";
  }
  render() {
    const base = "inline-flex items-center justify-center font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer select-none";
    const size = this.getSizeClasses();
    const shape = this.getShapeClasses();
    let style = "";
    if (this.hasAttribute("disabled")) {
      style = "bg-gray-100 text-gray-400 cursor-not-allowed opacity-80 shadow-none pointer-events-none";
      this.removeAttribute("tabindex");
    } else {
      style = this.getStyleClasses();
      this.setAttribute("tabindex", "0");
    }
    this.className = `${base} ${size} ${shape} ${style}`;
  }
}
customElements.define("rm-button", RmButton);

// src/components/rm-x-button.js
class RmXButton extends HTMLElement {
  constructor() {
    super();
  }
  static get observedAttributes() {
    return ["xs", "sm", "md", "lg", "circle", "disabled"];
  }
  connectedCallback() {
    this.render();
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }
  getSizeClasses() {
    if (this.hasAttribute("xs"))
      return "h-6 w-6";
    if (this.hasAttribute("sm"))
      return "h-8 w-8";
    if (this.hasAttribute("lg"))
      return "h-12 w-12";
    return "h-10 w-10";
  }
  getIconSize() {
    if (this.hasAttribute("xs"))
      return "h-3 w-3";
    if (this.hasAttribute("sm"))
      return "h-4 w-4";
    if (this.hasAttribute("lg"))
      return "h-6 w-6";
    return "h-5 w-5";
  }
  getStyleClasses() {
    const base = "text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500";
    if (this.hasAttribute("circle")) {
      return `${base} rounded-full hover:bg-gray-100`;
    }
    return `${base} rounded-md hover:bg-gray-100`;
  }
  render() {
    let btn = this.querySelector("button.rm-x-btn-internal");
    if (!btn) {
      btn = document.createElement("button");
      btn.className = "rm-x-btn-internal";
      this.appendChild(btn);
    }
    const base = "inline-flex items-center justify-center transition-colors duration-200";
    const size = this.getSizeClasses();
    const style = this.getStyleClasses();
    const disabled = this.hasAttribute("disabled") ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
    btn.className = `rm-x-btn-internal ${base} ${size} ${style} ${disabled}`;
    btn.setAttribute("type", "button");
    btn.setAttribute("aria-label", "Close");
    if (this.hasAttribute("disabled")) {
      btn.setAttribute("disabled", "");
    } else {
      btn.removeAttribute("disabled");
    }
    const iconSize = this.getIconSize();
    btn.innerHTML = `
            <svg class="${iconSize}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        `;
    this.style.display = "contents";
  }
}
customElements.define("rm-x-button", RmXButton);

// node_modules/@lit/reactive-element/development/css-tag.js
var NODE_MODE = false;
var global = globalThis;
var supportsAdoptingStyleSheets = global.ShadowRoot && (global.ShadyCSS === undefined || global.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var constructionToken = Symbol();
var cssTagCache = new WeakMap;

class CSSResult {
  constructor(cssText, strings, safeToken) {
    this["_$cssResult$"] = true;
    if (safeToken !== constructionToken) {
      throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    }
    this.cssText = cssText;
    this._strings = strings;
  }
  get styleSheet() {
    let styleSheet = this._styleSheet;
    const strings = this._strings;
    if (supportsAdoptingStyleSheets && styleSheet === undefined) {
      const cacheable = strings !== undefined && strings.length === 1;
      if (cacheable) {
        styleSheet = cssTagCache.get(strings);
      }
      if (styleSheet === undefined) {
        (this._styleSheet = styleSheet = new CSSStyleSheet).replaceSync(this.cssText);
        if (cacheable) {
          cssTagCache.set(strings, styleSheet);
        }
      }
    }
    return styleSheet;
  }
  toString() {
    return this.cssText;
  }
}
var textFromCSSResult = (value) => {
  if (value["_$cssResult$"] === true) {
    return value.cssText;
  } else if (typeof value === "number") {
    return value;
  } else {
    throw new Error(`Value passed to 'css' function must be a 'css' function result: ` + `${value}. Use 'unsafeCSS' to pass non-literal values, but take care ` + `to ensure page security.`);
  }
};
var unsafeCSS = (value) => new CSSResult(typeof value === "string" ? value : String(value), undefined, constructionToken);
var css = (strings, ...values) => {
  const cssText = strings.length === 1 ? strings[0] : values.reduce((acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1], strings[0]);
  return new CSSResult(cssText, strings, constructionToken);
};
var adoptStyles = (renderRoot, styles) => {
  if (supportsAdoptingStyleSheets) {
    renderRoot.adoptedStyleSheets = styles.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  } else {
    for (const s of styles) {
      const style = document.createElement("style");
      const nonce = global["litNonce"];
      if (nonce !== undefined) {
        style.setAttribute("nonce", nonce);
      }
      style.textContent = s.cssText;
      renderRoot.appendChild(style);
    }
  }
};
var cssResultFromStyleSheet = (sheet) => {
  let cssText = "";
  for (const rule of sheet.cssRules) {
    cssText += rule.cssText;
  }
  return unsafeCSS(cssText);
};
var getCompatibleStyle = supportsAdoptingStyleSheets || NODE_MODE && global.CSSStyleSheet === undefined ? (s) => s : (s) => s instanceof CSSStyleSheet ? cssResultFromStyleSheet(s) : s;

// node_modules/@lit/reactive-element/development/reactive-element.js
var { is, defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, getOwnPropertySymbols, getPrototypeOf } = Object;
var NODE_MODE2 = false;
var global2 = globalThis;
if (NODE_MODE2) {
  global2.customElements ??= customElements;
}
var DEV_MODE = true;
var issueWarning;
var trustedTypes = global2.trustedTypes;
var emptyStringForBooleanAttribute = trustedTypes ? trustedTypes.emptyScript : "";
var polyfillSupport = DEV_MODE ? global2.reactiveElementPolyfillSupportDevMode : global2.reactiveElementPolyfillSupport;
if (DEV_MODE) {
  global2.litIssuedWarnings ??= new Set;
  issueWarning = (code, warning) => {
    warning += ` See https://lit.dev/msg/${code} for more information.`;
    if (!global2.litIssuedWarnings.has(warning) && !global2.litIssuedWarnings.has(code)) {
      console.warn(warning);
      global2.litIssuedWarnings.add(warning);
    }
  };
  queueMicrotask(() => {
    issueWarning("dev-mode", `Lit is in dev mode. Not recommended for production!`);
    if (global2.ShadyDOM?.inUse && polyfillSupport === undefined) {
      issueWarning("polyfill-support-missing", `Shadow DOM is being polyfilled via \`ShadyDOM\` but ` + `the \`polyfill-support\` module has not been loaded.`);
    }
  });
}
var debugLogEvent = DEV_MODE ? (event) => {
  const shouldEmit = global2.emitLitDebugLogEvents;
  if (!shouldEmit) {
    return;
  }
  global2.dispatchEvent(new CustomEvent("lit-debug", {
    detail: event
  }));
} : undefined;
var JSCompiler_renameProperty = (prop, _obj) => prop;
var defaultConverter = {
  toAttribute(value, type) {
    switch (type) {
      case Boolean:
        value = value ? emptyStringForBooleanAttribute : null;
        break;
      case Object:
      case Array:
        value = value == null ? value : JSON.stringify(value);
        break;
    }
    return value;
  },
  fromAttribute(value, type) {
    let fromValue = value;
    switch (type) {
      case Boolean:
        fromValue = value !== null;
        break;
      case Number:
        fromValue = value === null ? null : Number(value);
        break;
      case Object:
      case Array:
        try {
          fromValue = JSON.parse(value);
        } catch (e) {
          fromValue = null;
        }
        break;
    }
    return fromValue;
  }
};
var notEqual = (value, old) => !is(value, old);
var defaultPropertyDeclaration = {
  attribute: true,
  type: String,
  converter: defaultConverter,
  reflect: false,
  useDefault: false,
  hasChanged: notEqual
};
Symbol.metadata ??= Symbol("metadata");
global2.litPropertyMetadata ??= new WeakMap;

class ReactiveElement extends HTMLElement {
  static addInitializer(initializer) {
    this.__prepare();
    (this._initializers ??= []).push(initializer);
  }
  static get observedAttributes() {
    this.finalize();
    return this.__attributeToPropertyMap && [...this.__attributeToPropertyMap.keys()];
  }
  static createProperty(name, options = defaultPropertyDeclaration) {
    if (options.state) {
      options.attribute = false;
    }
    this.__prepare();
    if (this.prototype.hasOwnProperty(name)) {
      options = Object.create(options);
      options.wrapped = true;
    }
    this.elementProperties.set(name, options);
    if (!options.noAccessor) {
      const key = DEV_MODE ? Symbol.for(`${String(name)} (@property() cache)`) : Symbol();
      const descriptor = this.getPropertyDescriptor(name, key, options);
      if (descriptor !== undefined) {
        defineProperty(this.prototype, name, descriptor);
      }
    }
  }
  static getPropertyDescriptor(name, key, options) {
    const { get, set } = getOwnPropertyDescriptor(this.prototype, name) ?? {
      get() {
        return this[key];
      },
      set(v) {
        this[key] = v;
      }
    };
    if (DEV_MODE && get == null) {
      if ("value" in (getOwnPropertyDescriptor(this.prototype, name) ?? {})) {
        throw new Error(`Field ${JSON.stringify(String(name))} on ` + `${this.name} was declared as a reactive property ` + `but it's actually declared as a value on the prototype. ` + `Usually this is due to using @property or @state on a method.`);
      }
      issueWarning("reactive-property-without-getter", `Field ${JSON.stringify(String(name))} on ` + `${this.name} was declared as a reactive property ` + `but it does not have a getter. This will be an error in a ` + `future version of Lit.`);
    }
    return {
      get,
      set(value) {
        const oldValue = get?.call(this);
        set?.call(this, value);
        this.requestUpdate(name, oldValue, options);
      },
      configurable: true,
      enumerable: true
    };
  }
  static getPropertyOptions(name) {
    return this.elementProperties.get(name) ?? defaultPropertyDeclaration;
  }
  static __prepare() {
    if (this.hasOwnProperty(JSCompiler_renameProperty("elementProperties", this))) {
      return;
    }
    const superCtor = getPrototypeOf(this);
    superCtor.finalize();
    if (superCtor._initializers !== undefined) {
      this._initializers = [...superCtor._initializers];
    }
    this.elementProperties = new Map(superCtor.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(JSCompiler_renameProperty("finalized", this))) {
      return;
    }
    this.finalized = true;
    this.__prepare();
    if (this.hasOwnProperty(JSCompiler_renameProperty("properties", this))) {
      const props = this.properties;
      const propKeys = [
        ...getOwnPropertyNames(props),
        ...getOwnPropertySymbols(props)
      ];
      for (const p of propKeys) {
        this.createProperty(p, props[p]);
      }
    }
    const metadata = this[Symbol.metadata];
    if (metadata !== null) {
      const properties = litPropertyMetadata.get(metadata);
      if (properties !== undefined) {
        for (const [p, options] of properties) {
          this.elementProperties.set(p, options);
        }
      }
    }
    this.__attributeToPropertyMap = new Map;
    for (const [p, options] of this.elementProperties) {
      const attr = this.__attributeNameForProperty(p, options);
      if (attr !== undefined) {
        this.__attributeToPropertyMap.set(attr, p);
      }
    }
    this.elementStyles = this.finalizeStyles(this.styles);
    if (DEV_MODE) {
      if (this.hasOwnProperty("createProperty")) {
        issueWarning("no-override-create-property", "Overriding ReactiveElement.createProperty() is deprecated. " + "The override will not be called with standard decorators");
      }
      if (this.hasOwnProperty("getPropertyDescriptor")) {
        issueWarning("no-override-get-property-descriptor", "Overriding ReactiveElement.getPropertyDescriptor() is deprecated. " + "The override will not be called with standard decorators");
      }
    }
  }
  static finalizeStyles(styles) {
    const elementStyles = [];
    if (Array.isArray(styles)) {
      const set = new Set(styles.flat(Infinity).reverse());
      for (const s of set) {
        elementStyles.unshift(getCompatibleStyle(s));
      }
    } else if (styles !== undefined) {
      elementStyles.push(getCompatibleStyle(styles));
    }
    return elementStyles;
  }
  static __attributeNameForProperty(name, options) {
    const attribute = options.attribute;
    return attribute === false ? undefined : typeof attribute === "string" ? attribute : typeof name === "string" ? name.toLowerCase() : undefined;
  }
  constructor() {
    super();
    this.__instanceProperties = undefined;
    this.isUpdatePending = false;
    this.hasUpdated = false;
    this.__reflectingProperty = null;
    this.__initialize();
  }
  __initialize() {
    this.__updatePromise = new Promise((res) => this.enableUpdating = res);
    this._$changedProperties = new Map;
    this.__saveInstanceProperties();
    this.requestUpdate();
    this.constructor._initializers?.forEach((i) => i(this));
  }
  addController(controller) {
    (this.__controllers ??= new Set).add(controller);
    if (this.renderRoot !== undefined && this.isConnected) {
      controller.hostConnected?.();
    }
  }
  removeController(controller) {
    this.__controllers?.delete(controller);
  }
  __saveInstanceProperties() {
    const instanceProperties = new Map;
    const elementProperties = this.constructor.elementProperties;
    for (const p of elementProperties.keys()) {
      if (this.hasOwnProperty(p)) {
        instanceProperties.set(p, this[p]);
        delete this[p];
      }
    }
    if (instanceProperties.size > 0) {
      this.__instanceProperties = instanceProperties;
    }
  }
  createRenderRoot() {
    const renderRoot = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    adoptStyles(renderRoot, this.constructor.elementStyles);
    return renderRoot;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot();
    this.enableUpdating(true);
    this.__controllers?.forEach((c) => c.hostConnected?.());
  }
  enableUpdating(_requestedUpdate) {}
  disconnectedCallback() {
    this.__controllers?.forEach((c) => c.hostDisconnected?.());
  }
  attributeChangedCallback(name, _old, value) {
    this._$attributeToProperty(name, value);
  }
  __propertyToAttribute(name, value) {
    const elemProperties = this.constructor.elementProperties;
    const options = elemProperties.get(name);
    const attr = this.constructor.__attributeNameForProperty(name, options);
    if (attr !== undefined && options.reflect === true) {
      const converter = options.converter?.toAttribute !== undefined ? options.converter : defaultConverter;
      const attrValue = converter.toAttribute(value, options.type);
      if (DEV_MODE && this.constructor.enabledWarnings.includes("migration") && attrValue === undefined) {
        issueWarning("undefined-attribute-value", `The attribute value for the ${name} property is ` + `undefined on element ${this.localName}. The attribute will be ` + `removed, but in the previous version of \`ReactiveElement\`, ` + `the attribute would not have changed.`);
      }
      this.__reflectingProperty = name;
      if (attrValue == null) {
        this.removeAttribute(attr);
      } else {
        this.setAttribute(attr, attrValue);
      }
      this.__reflectingProperty = null;
    }
  }
  _$attributeToProperty(name, value) {
    const ctor = this.constructor;
    const propName = ctor.__attributeToPropertyMap.get(name);
    if (propName !== undefined && this.__reflectingProperty !== propName) {
      const options = ctor.getPropertyOptions(propName);
      const converter = typeof options.converter === "function" ? { fromAttribute: options.converter } : options.converter?.fromAttribute !== undefined ? options.converter : defaultConverter;
      this.__reflectingProperty = propName;
      const convertedValue = converter.fromAttribute(value, options.type);
      this[propName] = convertedValue ?? this.__defaultValues?.get(propName) ?? convertedValue;
      this.__reflectingProperty = null;
    }
  }
  requestUpdate(name, oldValue, options) {
    if (name !== undefined) {
      if (DEV_MODE && name instanceof Event) {
        issueWarning(``, `The requestUpdate() method was called with an Event as the property name. This is probably a mistake caused by binding this.requestUpdate as an event listener. Instead bind a function that will call it with no arguments: () => this.requestUpdate()`);
      }
      const ctor = this.constructor;
      const newValue = this[name];
      options ??= ctor.getPropertyOptions(name);
      const changed = (options.hasChanged ?? notEqual)(newValue, oldValue) || options.useDefault && options.reflect && newValue === this.__defaultValues?.get(name) && !this.hasAttribute(ctor.__attributeNameForProperty(name, options));
      if (changed) {
        this._$changeProperty(name, oldValue, options);
      } else {
        return;
      }
    }
    if (this.isUpdatePending === false) {
      this.__updatePromise = this.__enqueueUpdate();
    }
  }
  _$changeProperty(name, oldValue, { useDefault, reflect, wrapped }, initializeValue) {
    if (useDefault && !(this.__defaultValues ??= new Map).has(name)) {
      this.__defaultValues.set(name, initializeValue ?? oldValue ?? this[name]);
      if (wrapped !== true || initializeValue !== undefined) {
        return;
      }
    }
    if (!this._$changedProperties.has(name)) {
      if (!this.hasUpdated && !useDefault) {
        oldValue = undefined;
      }
      this._$changedProperties.set(name, oldValue);
    }
    if (reflect === true && this.__reflectingProperty !== name) {
      (this.__reflectingProperties ??= new Set).add(name);
    }
  }
  async __enqueueUpdate() {
    this.isUpdatePending = true;
    try {
      await this.__updatePromise;
    } catch (e) {
      Promise.reject(e);
    }
    const result = this.scheduleUpdate();
    if (result != null) {
      await result;
    }
    return !this.isUpdatePending;
  }
  scheduleUpdate() {
    const result = this.performUpdate();
    if (DEV_MODE && this.constructor.enabledWarnings.includes("async-perform-update") && typeof result?.then === "function") {
      issueWarning("async-perform-update", `Element ${this.localName} returned a Promise from performUpdate(). ` + `This behavior is deprecated and will be removed in a future ` + `version of ReactiveElement.`);
    }
    return result;
  }
  performUpdate() {
    if (!this.isUpdatePending) {
      return;
    }
    debugLogEvent?.({ kind: "update" });
    if (!this.hasUpdated) {
      this.renderRoot ??= this.createRenderRoot();
      if (DEV_MODE) {
        const ctor = this.constructor;
        const shadowedProperties = [...ctor.elementProperties.keys()].filter((p) => this.hasOwnProperty(p) && (p in getPrototypeOf(this)));
        if (shadowedProperties.length) {
          throw new Error(`The following properties on element ${this.localName} will not ` + `trigger updates as expected because they are set using class ` + `fields: ${shadowedProperties.join(", ")}. ` + `Native class fields and some compiled output will overwrite ` + `accessors used for detecting changes. See ` + `https://lit.dev/msg/class-field-shadowing ` + `for more information.`);
        }
      }
      if (this.__instanceProperties) {
        for (const [p, value] of this.__instanceProperties) {
          this[p] = value;
        }
        this.__instanceProperties = undefined;
      }
      const elementProperties = this.constructor.elementProperties;
      if (elementProperties.size > 0) {
        for (const [p, options] of elementProperties) {
          const { wrapped } = options;
          const value = this[p];
          if (wrapped === true && !this._$changedProperties.has(p) && value !== undefined) {
            this._$changeProperty(p, undefined, options, value);
          }
        }
      }
    }
    let shouldUpdate = false;
    const changedProperties = this._$changedProperties;
    try {
      shouldUpdate = this.shouldUpdate(changedProperties);
      if (shouldUpdate) {
        this.willUpdate(changedProperties);
        this.__controllers?.forEach((c) => c.hostUpdate?.());
        this.update(changedProperties);
      } else {
        this.__markUpdated();
      }
    } catch (e) {
      shouldUpdate = false;
      this.__markUpdated();
      throw e;
    }
    if (shouldUpdate) {
      this._$didUpdate(changedProperties);
    }
  }
  willUpdate(_changedProperties) {}
  _$didUpdate(changedProperties) {
    this.__controllers?.forEach((c) => c.hostUpdated?.());
    if (!this.hasUpdated) {
      this.hasUpdated = true;
      this.firstUpdated(changedProperties);
    }
    this.updated(changedProperties);
    if (DEV_MODE && this.isUpdatePending && this.constructor.enabledWarnings.includes("change-in-update")) {
      issueWarning("change-in-update", `Element ${this.localName} scheduled an update ` + `(generally because a property was set) ` + `after an update completed, causing a new update to be scheduled. ` + `This is inefficient and should be avoided unless the next update ` + `can only be scheduled as a side effect of the previous update.`);
    }
  }
  __markUpdated() {
    this._$changedProperties = new Map;
    this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this.__updatePromise;
  }
  shouldUpdate(_changedProperties) {
    return true;
  }
  update(_changedProperties) {
    this.__reflectingProperties &&= this.__reflectingProperties.forEach((p) => this.__propertyToAttribute(p, this[p]));
    this.__markUpdated();
  }
  updated(_changedProperties) {}
  firstUpdated(_changedProperties) {}
}
ReactiveElement.elementStyles = [];
ReactiveElement.shadowRootOptions = { mode: "open" };
ReactiveElement[JSCompiler_renameProperty("elementProperties", ReactiveElement)] = new Map;
ReactiveElement[JSCompiler_renameProperty("finalized", ReactiveElement)] = new Map;
polyfillSupport?.({ ReactiveElement });
if (DEV_MODE) {
  ReactiveElement.enabledWarnings = [
    "change-in-update",
    "async-perform-update"
  ];
  const ensureOwnWarnings = function(ctor) {
    if (!ctor.hasOwnProperty(JSCompiler_renameProperty("enabledWarnings", ctor))) {
      ctor.enabledWarnings = ctor.enabledWarnings.slice();
    }
  };
  ReactiveElement.enableWarning = function(warning) {
    ensureOwnWarnings(this);
    if (!this.enabledWarnings.includes(warning)) {
      this.enabledWarnings.push(warning);
    }
  };
  ReactiveElement.disableWarning = function(warning) {
    ensureOwnWarnings(this);
    const i = this.enabledWarnings.indexOf(warning);
    if (i >= 0) {
      this.enabledWarnings.splice(i, 1);
    }
  };
}
(global2.reactiveElementVersions ??= []).push("2.1.1");
if (DEV_MODE && global2.reactiveElementVersions.length > 1) {
  queueMicrotask(() => {
    issueWarning("multiple-versions", `Multiple versions of Lit loaded. Loading multiple versions ` + `is not recommended.`);
  });
}

// node_modules/lit-html/development/lit-html.js
var DEV_MODE2 = true;
var ENABLE_EXTRA_SECURITY_HOOKS = true;
var ENABLE_SHADYDOM_NOPATCH = true;
var NODE_MODE3 = false;
var global3 = globalThis;
var debugLogEvent2 = DEV_MODE2 ? (event) => {
  const shouldEmit = global3.emitLitDebugLogEvents;
  if (!shouldEmit) {
    return;
  }
  global3.dispatchEvent(new CustomEvent("lit-debug", {
    detail: event
  }));
} : undefined;
var debugLogRenderId = 0;
var issueWarning2;
if (DEV_MODE2) {
  global3.litIssuedWarnings ??= new Set;
  issueWarning2 = (code, warning) => {
    warning += code ? ` See https://lit.dev/msg/${code} for more information.` : "";
    if (!global3.litIssuedWarnings.has(warning) && !global3.litIssuedWarnings.has(code)) {
      console.warn(warning);
      global3.litIssuedWarnings.add(warning);
    }
  };
  queueMicrotask(() => {
    issueWarning2("dev-mode", `Lit is in dev mode. Not recommended for production!`);
  });
}
var wrap = ENABLE_SHADYDOM_NOPATCH && global3.ShadyDOM?.inUse && global3.ShadyDOM?.noPatch === true ? global3.ShadyDOM.wrap : (node) => node;
var trustedTypes2 = global3.trustedTypes;
var policy = trustedTypes2 ? trustedTypes2.createPolicy("lit-html", {
  createHTML: (s) => s
}) : undefined;
var identityFunction = (value) => value;
var noopSanitizer = (_node, _name, _type) => identityFunction;
var setSanitizer = (newSanitizer) => {
  if (!ENABLE_EXTRA_SECURITY_HOOKS) {
    return;
  }
  if (sanitizerFactoryInternal !== noopSanitizer) {
    throw new Error(`Attempted to overwrite existing lit-html security policy.` + ` setSanitizeDOMValueFactory should be called at most once.`);
  }
  sanitizerFactoryInternal = newSanitizer;
};
var _testOnlyClearSanitizerFactoryDoNotCallOrElse = () => {
  sanitizerFactoryInternal = noopSanitizer;
};
var createSanitizer = (node, name, type) => {
  return sanitizerFactoryInternal(node, name, type);
};
var boundAttributeSuffix = "$lit$";
var marker = `lit$${Math.random().toFixed(9).slice(2)}$`;
var markerMatch = "?" + marker;
var nodeMarker = `<${markerMatch}>`;
var d = NODE_MODE3 && global3.document === undefined ? {
  createTreeWalker() {
    return {};
  }
} : document;
var createMarker = () => d.createComment("");
var isPrimitive = (value) => value === null || typeof value != "object" && typeof value != "function";
var isArray = Array.isArray;
var isIterable = (value) => isArray(value) || typeof value?.[Symbol.iterator] === "function";
var SPACE_CHAR = `[ 	
\f\r]`;
var ATTR_VALUE_CHAR = `[^ 	
\f\r"'\`<>=]`;
var NAME_CHAR = `[^\\s"'>=/]`;
var textEndRegex = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var COMMENT_START = 1;
var TAG_NAME = 2;
var DYNAMIC_TAG_NAME = 3;
var commentEndRegex = /-->/g;
var comment2EndRegex = />/g;
var tagEndRegex = new RegExp(`>|${SPACE_CHAR}(?:(${NAME_CHAR}+)(${SPACE_CHAR}*=${SPACE_CHAR}*(?:${ATTR_VALUE_CHAR}|("|')|))|$)`, "g");
var ENTIRE_MATCH = 0;
var ATTRIBUTE_NAME = 1;
var SPACES_AND_EQUALS = 2;
var QUOTE_CHAR = 3;
var singleQuoteAttrEndRegex = /'/g;
var doubleQuoteAttrEndRegex = /"/g;
var rawTextElement = /^(?:script|style|textarea|title)$/i;
var HTML_RESULT = 1;
var SVG_RESULT = 2;
var MATHML_RESULT = 3;
var ATTRIBUTE_PART = 1;
var CHILD_PART = 2;
var PROPERTY_PART = 3;
var BOOLEAN_ATTRIBUTE_PART = 4;
var EVENT_PART = 5;
var ELEMENT_PART = 6;
var COMMENT_PART = 7;
var tag = (type) => (strings, ...values) => {
  if (DEV_MODE2 && strings.some((s) => s === undefined)) {
    console.warn(`Some template strings are undefined.
` + "This is probably caused by illegal octal escape sequences.");
  }
  if (DEV_MODE2) {
    if (values.some((val) => val?.["_$litStatic$"])) {
      issueWarning2("", `Static values 'literal' or 'unsafeStatic' cannot be used as values to non-static templates.
` + `Please use the static 'html' tag function. See https://lit.dev/docs/templates/expressions/#static-expressions`);
    }
  }
  return {
    ["_$litType$"]: type,
    strings,
    values
  };
};
var html = tag(HTML_RESULT);
var svg = tag(SVG_RESULT);
var mathml = tag(MATHML_RESULT);
var noChange = Symbol.for("lit-noChange");
var nothing = Symbol.for("lit-nothing");
var templateCache = new WeakMap;
var walker = d.createTreeWalker(d, 129);
var sanitizerFactoryInternal = noopSanitizer;
function trustFromTemplateString(tsa, stringFromTSA) {
  if (!isArray(tsa) || !tsa.hasOwnProperty("raw")) {
    let message = "invalid template strings array";
    if (DEV_MODE2) {
      message = `
          Internal Error: expected template strings to be an array
          with a 'raw' field. Faking a template strings array by
          calling html or svg like an ordinary function is effectively
          the same as calling unsafeHtml and can lead to major security
          issues, e.g. opening your code up to XSS attacks.
          If you're using the html or svg tagged template functions normally
          and still seeing this error, please file a bug at
          https://github.com/lit/lit/issues/new?template=bug_report.md
          and include information about your build tooling, if any.
        `.trim().replace(/\n */g, `
`);
    }
    throw new Error(message);
  }
  return policy !== undefined ? policy.createHTML(stringFromTSA) : stringFromTSA;
}
var getTemplateHtml = (strings, type) => {
  const l = strings.length - 1;
  const attrNames = [];
  let html2 = type === SVG_RESULT ? "<svg>" : type === MATHML_RESULT ? "<math>" : "";
  let rawTextEndRegex;
  let regex = textEndRegex;
  for (let i = 0;i < l; i++) {
    const s = strings[i];
    let attrNameEndIndex = -1;
    let attrName;
    let lastIndex = 0;
    let match;
    while (lastIndex < s.length) {
      regex.lastIndex = lastIndex;
      match = regex.exec(s);
      if (match === null) {
        break;
      }
      lastIndex = regex.lastIndex;
      if (regex === textEndRegex) {
        if (match[COMMENT_START] === "!--") {
          regex = commentEndRegex;
        } else if (match[COMMENT_START] !== undefined) {
          regex = comment2EndRegex;
        } else if (match[TAG_NAME] !== undefined) {
          if (rawTextElement.test(match[TAG_NAME])) {
            rawTextEndRegex = new RegExp(`</${match[TAG_NAME]}`, "g");
          }
          regex = tagEndRegex;
        } else if (match[DYNAMIC_TAG_NAME] !== undefined) {
          if (DEV_MODE2) {
            throw new Error("Bindings in tag names are not supported. Please use static templates instead. " + "See https://lit.dev/docs/templates/expressions/#static-expressions");
          }
          regex = tagEndRegex;
        }
      } else if (regex === tagEndRegex) {
        if (match[ENTIRE_MATCH] === ">") {
          regex = rawTextEndRegex ?? textEndRegex;
          attrNameEndIndex = -1;
        } else if (match[ATTRIBUTE_NAME] === undefined) {
          attrNameEndIndex = -2;
        } else {
          attrNameEndIndex = regex.lastIndex - match[SPACES_AND_EQUALS].length;
          attrName = match[ATTRIBUTE_NAME];
          regex = match[QUOTE_CHAR] === undefined ? tagEndRegex : match[QUOTE_CHAR] === '"' ? doubleQuoteAttrEndRegex : singleQuoteAttrEndRegex;
        }
      } else if (regex === doubleQuoteAttrEndRegex || regex === singleQuoteAttrEndRegex) {
        regex = tagEndRegex;
      } else if (regex === commentEndRegex || regex === comment2EndRegex) {
        regex = textEndRegex;
      } else {
        regex = tagEndRegex;
        rawTextEndRegex = undefined;
      }
    }
    if (DEV_MODE2) {
      console.assert(attrNameEndIndex === -1 || regex === tagEndRegex || regex === singleQuoteAttrEndRegex || regex === doubleQuoteAttrEndRegex, "unexpected parse state B");
    }
    const end = regex === tagEndRegex && strings[i + 1].startsWith("/>") ? " " : "";
    html2 += regex === textEndRegex ? s + nodeMarker : attrNameEndIndex >= 0 ? (attrNames.push(attrName), s.slice(0, attrNameEndIndex) + boundAttributeSuffix + s.slice(attrNameEndIndex)) + marker + end : s + marker + (attrNameEndIndex === -2 ? i : end);
  }
  const htmlResult = html2 + (strings[l] || "<?>") + (type === SVG_RESULT ? "</svg>" : type === MATHML_RESULT ? "</math>" : "");
  return [trustFromTemplateString(strings, htmlResult), attrNames];
};

class Template {
  constructor({ strings, ["_$litType$"]: type }, options) {
    this.parts = [];
    let node;
    let nodeIndex = 0;
    let attrNameIndex = 0;
    const partCount = strings.length - 1;
    const parts = this.parts;
    const [html2, attrNames] = getTemplateHtml(strings, type);
    this.el = Template.createElement(html2, options);
    walker.currentNode = this.el.content;
    if (type === SVG_RESULT || type === MATHML_RESULT) {
      const wrapper = this.el.content.firstChild;
      wrapper.replaceWith(...wrapper.childNodes);
    }
    while ((node = walker.nextNode()) !== null && parts.length < partCount) {
      if (node.nodeType === 1) {
        if (DEV_MODE2) {
          const tag2 = node.localName;
          if (/^(?:textarea|template)$/i.test(tag2) && node.innerHTML.includes(marker)) {
            const m = `Expressions are not supported inside \`${tag2}\` ` + `elements. See https://lit.dev/msg/expression-in-${tag2} for more ` + `information.`;
            if (tag2 === "template") {
              throw new Error(m);
            } else
              issueWarning2("", m);
          }
        }
        if (node.hasAttributes()) {
          for (const name of node.getAttributeNames()) {
            if (name.endsWith(boundAttributeSuffix)) {
              const realName = attrNames[attrNameIndex++];
              const value = node.getAttribute(name);
              const statics = value.split(marker);
              const m = /([.?@])?(.*)/.exec(realName);
              parts.push({
                type: ATTRIBUTE_PART,
                index: nodeIndex,
                name: m[2],
                strings: statics,
                ctor: m[1] === "." ? PropertyPart : m[1] === "?" ? BooleanAttributePart : m[1] === "@" ? EventPart : AttributePart
              });
              node.removeAttribute(name);
            } else if (name.startsWith(marker)) {
              parts.push({
                type: ELEMENT_PART,
                index: nodeIndex
              });
              node.removeAttribute(name);
            }
          }
        }
        if (rawTextElement.test(node.tagName)) {
          const strings2 = node.textContent.split(marker);
          const lastIndex = strings2.length - 1;
          if (lastIndex > 0) {
            node.textContent = trustedTypes2 ? trustedTypes2.emptyScript : "";
            for (let i = 0;i < lastIndex; i++) {
              node.append(strings2[i], createMarker());
              walker.nextNode();
              parts.push({ type: CHILD_PART, index: ++nodeIndex });
            }
            node.append(strings2[lastIndex], createMarker());
          }
        }
      } else if (node.nodeType === 8) {
        const data = node.data;
        if (data === markerMatch) {
          parts.push({ type: CHILD_PART, index: nodeIndex });
        } else {
          let i = -1;
          while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
            parts.push({ type: COMMENT_PART, index: nodeIndex });
            i += marker.length - 1;
          }
        }
      }
      nodeIndex++;
    }
    if (DEV_MODE2) {
      if (attrNames.length !== attrNameIndex) {
        throw new Error(`Detected duplicate attribute bindings. This occurs if your template ` + `has duplicate attributes on an element tag. For example ` + `"<input ?disabled=\${true} ?disabled=\${false}>" contains a ` + `duplicate "disabled" attribute. The error was detected in ` + `the following template: 
` + "`" + strings.join("${...}") + "`");
      }
    }
    debugLogEvent2 && debugLogEvent2({
      kind: "template prep",
      template: this,
      clonableTemplate: this.el,
      parts: this.parts,
      strings
    });
  }
  static createElement(html2, _options) {
    const el = d.createElement("template");
    el.innerHTML = html2;
    return el;
  }
}
function resolveDirective(part, value, parent = part, attributeIndex) {
  if (value === noChange) {
    return value;
  }
  let currentDirective = attributeIndex !== undefined ? parent.__directives?.[attributeIndex] : parent.__directive;
  const nextDirectiveConstructor = isPrimitive(value) ? undefined : value["_$litDirective$"];
  if (currentDirective?.constructor !== nextDirectiveConstructor) {
    currentDirective?.["_$notifyDirectiveConnectionChanged"]?.(false);
    if (nextDirectiveConstructor === undefined) {
      currentDirective = undefined;
    } else {
      currentDirective = new nextDirectiveConstructor(part);
      currentDirective._$initialize(part, parent, attributeIndex);
    }
    if (attributeIndex !== undefined) {
      (parent.__directives ??= [])[attributeIndex] = currentDirective;
    } else {
      parent.__directive = currentDirective;
    }
  }
  if (currentDirective !== undefined) {
    value = resolveDirective(part, currentDirective._$resolve(part, value.values), currentDirective, attributeIndex);
  }
  return value;
}

class TemplateInstance {
  constructor(template, parent) {
    this._$parts = [];
    this._$disconnectableChildren = undefined;
    this._$template = template;
    this._$parent = parent;
  }
  get parentNode() {
    return this._$parent.parentNode;
  }
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  _clone(options) {
    const { el: { content }, parts } = this._$template;
    const fragment = (options?.creationScope ?? d).importNode(content, true);
    walker.currentNode = fragment;
    let node = walker.nextNode();
    let nodeIndex = 0;
    let partIndex = 0;
    let templatePart = parts[0];
    while (templatePart !== undefined) {
      if (nodeIndex === templatePart.index) {
        let part;
        if (templatePart.type === CHILD_PART) {
          part = new ChildPart(node, node.nextSibling, this, options);
        } else if (templatePart.type === ATTRIBUTE_PART) {
          part = new templatePart.ctor(node, templatePart.name, templatePart.strings, this, options);
        } else if (templatePart.type === ELEMENT_PART) {
          part = new ElementPart(node, this, options);
        }
        this._$parts.push(part);
        templatePart = parts[++partIndex];
      }
      if (nodeIndex !== templatePart?.index) {
        node = walker.nextNode();
        nodeIndex++;
      }
    }
    walker.currentNode = d;
    return fragment;
  }
  _update(values) {
    let i = 0;
    for (const part of this._$parts) {
      if (part !== undefined) {
        debugLogEvent2 && debugLogEvent2({
          kind: "set part",
          part,
          value: values[i],
          valueIndex: i,
          values,
          templateInstance: this
        });
        if (part.strings !== undefined) {
          part._$setValue(values, part, i);
          i += part.strings.length - 2;
        } else {
          part._$setValue(values[i]);
        }
      }
      i++;
    }
  }
}

class ChildPart {
  get _$isConnected() {
    return this._$parent?._$isConnected ?? this.__isConnected;
  }
  constructor(startNode, endNode, parent, options) {
    this.type = CHILD_PART;
    this._$committedValue = nothing;
    this._$disconnectableChildren = undefined;
    this._$startNode = startNode;
    this._$endNode = endNode;
    this._$parent = parent;
    this.options = options;
    this.__isConnected = options?.isConnected ?? true;
    if (ENABLE_EXTRA_SECURITY_HOOKS) {
      this._textSanitizer = undefined;
    }
  }
  get parentNode() {
    let parentNode = wrap(this._$startNode).parentNode;
    const parent = this._$parent;
    if (parent !== undefined && parentNode?.nodeType === 11) {
      parentNode = parent.parentNode;
    }
    return parentNode;
  }
  get startNode() {
    return this._$startNode;
  }
  get endNode() {
    return this._$endNode;
  }
  _$setValue(value, directiveParent = this) {
    if (DEV_MODE2 && this.parentNode === null) {
      throw new Error(`This \`ChildPart\` has no \`parentNode\` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's \`innerHTML\` or \`textContent\` can do this.`);
    }
    value = resolveDirective(this, value, directiveParent);
    if (isPrimitive(value)) {
      if (value === nothing || value == null || value === "") {
        if (this._$committedValue !== nothing) {
          debugLogEvent2 && debugLogEvent2({
            kind: "commit nothing to child",
            start: this._$startNode,
            end: this._$endNode,
            parent: this._$parent,
            options: this.options
          });
          this._$clear();
        }
        this._$committedValue = nothing;
      } else if (value !== this._$committedValue && value !== noChange) {
        this._commitText(value);
      }
    } else if (value["_$litType$"] !== undefined) {
      this._commitTemplateResult(value);
    } else if (value.nodeType !== undefined) {
      if (DEV_MODE2 && this.options?.host === value) {
        this._commitText(`[probable mistake: rendered a template's host in itself ` + `(commonly caused by writing \${this} in a template]`);
        console.warn(`Attempted to render the template host`, value, `inside itself. This is almost always a mistake, and in dev mode `, `we render some warning text. In production however, we'll `, `render it, which will usually result in an error, and sometimes `, `in the element disappearing from the DOM.`);
        return;
      }
      this._commitNode(value);
    } else if (isIterable(value)) {
      this._commitIterable(value);
    } else {
      this._commitText(value);
    }
  }
  _insert(node) {
    return wrap(wrap(this._$startNode).parentNode).insertBefore(node, this._$endNode);
  }
  _commitNode(value) {
    if (this._$committedValue !== value) {
      this._$clear();
      if (ENABLE_EXTRA_SECURITY_HOOKS && sanitizerFactoryInternal !== noopSanitizer) {
        const parentNodeName = this._$startNode.parentNode?.nodeName;
        if (parentNodeName === "STYLE" || parentNodeName === "SCRIPT") {
          let message = "Forbidden";
          if (DEV_MODE2) {
            if (parentNodeName === "STYLE") {
              message = `Lit does not support binding inside style nodes. ` + `This is a security risk, as style injection attacks can ` + `exfiltrate data and spoof UIs. ` + `Consider instead using css\`...\` literals ` + `to compose styles, and do dynamic styling with ` + `css custom properties, ::parts, <slot>s, ` + `and by mutating the DOM rather than stylesheets.`;
            } else {
              message = `Lit does not support binding inside script nodes. ` + `This is a security risk, as it could allow arbitrary ` + `code execution.`;
            }
          }
          throw new Error(message);
        }
      }
      debugLogEvent2 && debugLogEvent2({
        kind: "commit node",
        start: this._$startNode,
        parent: this._$parent,
        value,
        options: this.options
      });
      this._$committedValue = this._insert(value);
    }
  }
  _commitText(value) {
    if (this._$committedValue !== nothing && isPrimitive(this._$committedValue)) {
      const node = wrap(this._$startNode).nextSibling;
      if (ENABLE_EXTRA_SECURITY_HOOKS) {
        if (this._textSanitizer === undefined) {
          this._textSanitizer = createSanitizer(node, "data", "property");
        }
        value = this._textSanitizer(value);
      }
      debugLogEvent2 && debugLogEvent2({
        kind: "commit text",
        node,
        value,
        options: this.options
      });
      node.data = value;
    } else {
      if (ENABLE_EXTRA_SECURITY_HOOKS) {
        const textNode = d.createTextNode("");
        this._commitNode(textNode);
        if (this._textSanitizer === undefined) {
          this._textSanitizer = createSanitizer(textNode, "data", "property");
        }
        value = this._textSanitizer(value);
        debugLogEvent2 && debugLogEvent2({
          kind: "commit text",
          node: textNode,
          value,
          options: this.options
        });
        textNode.data = value;
      } else {
        this._commitNode(d.createTextNode(value));
        debugLogEvent2 && debugLogEvent2({
          kind: "commit text",
          node: wrap(this._$startNode).nextSibling,
          value,
          options: this.options
        });
      }
    }
    this._$committedValue = value;
  }
  _commitTemplateResult(result) {
    const { values, ["_$litType$"]: type } = result;
    const template = typeof type === "number" ? this._$getTemplate(result) : (type.el === undefined && (type.el = Template.createElement(trustFromTemplateString(type.h, type.h[0]), this.options)), type);
    if (this._$committedValue?._$template === template) {
      debugLogEvent2 && debugLogEvent2({
        kind: "template updating",
        template,
        instance: this._$committedValue,
        parts: this._$committedValue._$parts,
        options: this.options,
        values
      });
      this._$committedValue._update(values);
    } else {
      const instance = new TemplateInstance(template, this);
      const fragment = instance._clone(this.options);
      debugLogEvent2 && debugLogEvent2({
        kind: "template instantiated",
        template,
        instance,
        parts: instance._$parts,
        options: this.options,
        fragment,
        values
      });
      instance._update(values);
      debugLogEvent2 && debugLogEvent2({
        kind: "template instantiated and updated",
        template,
        instance,
        parts: instance._$parts,
        options: this.options,
        fragment,
        values
      });
      this._commitNode(fragment);
      this._$committedValue = instance;
    }
  }
  _$getTemplate(result) {
    let template = templateCache.get(result.strings);
    if (template === undefined) {
      templateCache.set(result.strings, template = new Template(result));
    }
    return template;
  }
  _commitIterable(value) {
    if (!isArray(this._$committedValue)) {
      this._$committedValue = [];
      this._$clear();
    }
    const itemParts = this._$committedValue;
    let partIndex = 0;
    let itemPart;
    for (const item of value) {
      if (partIndex === itemParts.length) {
        itemParts.push(itemPart = new ChildPart(this._insert(createMarker()), this._insert(createMarker()), this, this.options));
      } else {
        itemPart = itemParts[partIndex];
      }
      itemPart._$setValue(item);
      partIndex++;
    }
    if (partIndex < itemParts.length) {
      this._$clear(itemPart && wrap(itemPart._$endNode).nextSibling, partIndex);
      itemParts.length = partIndex;
    }
  }
  _$clear(start = wrap(this._$startNode).nextSibling, from) {
    this._$notifyConnectionChanged?.(false, true, from);
    while (start !== this._$endNode) {
      const n = wrap(start).nextSibling;
      wrap(start).remove();
      start = n;
    }
  }
  setConnected(isConnected) {
    if (this._$parent === undefined) {
      this.__isConnected = isConnected;
      this._$notifyConnectionChanged?.(isConnected);
    } else if (DEV_MODE2) {
      throw new Error("part.setConnected() may only be called on a " + "RootPart returned from render().");
    }
  }
}

class AttributePart {
  get tagName() {
    return this.element.tagName;
  }
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  constructor(element, name, strings, parent, options) {
    this.type = ATTRIBUTE_PART;
    this._$committedValue = nothing;
    this._$disconnectableChildren = undefined;
    this.element = element;
    this.name = name;
    this._$parent = parent;
    this.options = options;
    if (strings.length > 2 || strings[0] !== "" || strings[1] !== "") {
      this._$committedValue = new Array(strings.length - 1).fill(new String);
      this.strings = strings;
    } else {
      this._$committedValue = nothing;
    }
    if (ENABLE_EXTRA_SECURITY_HOOKS) {
      this._sanitizer = undefined;
    }
  }
  _$setValue(value, directiveParent = this, valueIndex, noCommit) {
    const strings = this.strings;
    let change = false;
    if (strings === undefined) {
      value = resolveDirective(this, value, directiveParent, 0);
      change = !isPrimitive(value) || value !== this._$committedValue && value !== noChange;
      if (change) {
        this._$committedValue = value;
      }
    } else {
      const values = value;
      value = strings[0];
      let i, v;
      for (i = 0;i < strings.length - 1; i++) {
        v = resolveDirective(this, values[valueIndex + i], directiveParent, i);
        if (v === noChange) {
          v = this._$committedValue[i];
        }
        change ||= !isPrimitive(v) || v !== this._$committedValue[i];
        if (v === nothing) {
          value = nothing;
        } else if (value !== nothing) {
          value += (v ?? "") + strings[i + 1];
        }
        this._$committedValue[i] = v;
      }
    }
    if (change && !noCommit) {
      this._commitValue(value);
    }
  }
  _commitValue(value) {
    if (value === nothing) {
      wrap(this.element).removeAttribute(this.name);
    } else {
      if (ENABLE_EXTRA_SECURITY_HOOKS) {
        if (this._sanitizer === undefined) {
          this._sanitizer = sanitizerFactoryInternal(this.element, this.name, "attribute");
        }
        value = this._sanitizer(value ?? "");
      }
      debugLogEvent2 && debugLogEvent2({
        kind: "commit attribute",
        element: this.element,
        name: this.name,
        value,
        options: this.options
      });
      wrap(this.element).setAttribute(this.name, value ?? "");
    }
  }
}

class PropertyPart extends AttributePart {
  constructor() {
    super(...arguments);
    this.type = PROPERTY_PART;
  }
  _commitValue(value) {
    if (ENABLE_EXTRA_SECURITY_HOOKS) {
      if (this._sanitizer === undefined) {
        this._sanitizer = sanitizerFactoryInternal(this.element, this.name, "property");
      }
      value = this._sanitizer(value);
    }
    debugLogEvent2 && debugLogEvent2({
      kind: "commit property",
      element: this.element,
      name: this.name,
      value,
      options: this.options
    });
    this.element[this.name] = value === nothing ? undefined : value;
  }
}

class BooleanAttributePart extends AttributePart {
  constructor() {
    super(...arguments);
    this.type = BOOLEAN_ATTRIBUTE_PART;
  }
  _commitValue(value) {
    debugLogEvent2 && debugLogEvent2({
      kind: "commit boolean attribute",
      element: this.element,
      name: this.name,
      value: !!(value && value !== nothing),
      options: this.options
    });
    wrap(this.element).toggleAttribute(this.name, !!value && value !== nothing);
  }
}

class EventPart extends AttributePart {
  constructor(element, name, strings, parent, options) {
    super(element, name, strings, parent, options);
    this.type = EVENT_PART;
    if (DEV_MODE2 && this.strings !== undefined) {
      throw new Error(`A \`<${element.localName}>\` has a \`@${name}=...\` listener with ` + "invalid content. Event listeners in templates must have exactly " + "one expression and no surrounding text.");
    }
  }
  _$setValue(newListener, directiveParent = this) {
    newListener = resolveDirective(this, newListener, directiveParent, 0) ?? nothing;
    if (newListener === noChange) {
      return;
    }
    const oldListener = this._$committedValue;
    const shouldRemoveListener = newListener === nothing && oldListener !== nothing || newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive;
    const shouldAddListener = newListener !== nothing && (oldListener === nothing || shouldRemoveListener);
    debugLogEvent2 && debugLogEvent2({
      kind: "commit event listener",
      element: this.element,
      name: this.name,
      value: newListener,
      options: this.options,
      removeListener: shouldRemoveListener,
      addListener: shouldAddListener,
      oldListener
    });
    if (shouldRemoveListener) {
      this.element.removeEventListener(this.name, this, oldListener);
    }
    if (shouldAddListener) {
      this.element.addEventListener(this.name, this, newListener);
    }
    this._$committedValue = newListener;
  }
  handleEvent(event) {
    if (typeof this._$committedValue === "function") {
      this._$committedValue.call(this.options?.host ?? this.element, event);
    } else {
      this._$committedValue.handleEvent(event);
    }
  }
}

class ElementPart {
  constructor(element, parent, options) {
    this.element = element;
    this.type = ELEMENT_PART;
    this._$disconnectableChildren = undefined;
    this._$parent = parent;
    this.options = options;
  }
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  _$setValue(value) {
    debugLogEvent2 && debugLogEvent2({
      kind: "commit to element binding",
      element: this.element,
      value,
      options: this.options
    });
    resolveDirective(this, value);
  }
}
var polyfillSupport2 = DEV_MODE2 ? global3.litHtmlPolyfillSupportDevMode : global3.litHtmlPolyfillSupport;
polyfillSupport2?.(Template, ChildPart);
(global3.litHtmlVersions ??= []).push("3.3.1");
if (DEV_MODE2 && global3.litHtmlVersions.length > 1) {
  queueMicrotask(() => {
    issueWarning2("multiple-versions", `Multiple versions of Lit loaded. ` + `Loading multiple versions is not recommended.`);
  });
}
var render = (value, container, options) => {
  if (DEV_MODE2 && container == null) {
    throw new TypeError(`The container to render into may not be ${container}`);
  }
  const renderId = DEV_MODE2 ? debugLogRenderId++ : 0;
  const partOwnerNode = options?.renderBefore ?? container;
  let part = partOwnerNode["_$litPart$"];
  debugLogEvent2 && debugLogEvent2({
    kind: "begin render",
    id: renderId,
    value,
    container,
    options,
    part
  });
  if (part === undefined) {
    const endNode = options?.renderBefore ?? null;
    partOwnerNode["_$litPart$"] = part = new ChildPart(container.insertBefore(createMarker(), endNode), endNode, undefined, options ?? {});
  }
  part._$setValue(value);
  debugLogEvent2 && debugLogEvent2({
    kind: "end render",
    id: renderId,
    value,
    container,
    options,
    part
  });
  return part;
};
if (ENABLE_EXTRA_SECURITY_HOOKS) {
  render.setSanitizer = setSanitizer;
  render.createSanitizer = createSanitizer;
  if (DEV_MODE2) {
    render._testOnlyClearSanitizerFactoryDoNotCallOrElse = _testOnlyClearSanitizerFactoryDoNotCallOrElse;
  }
}

// node_modules/lit-element/development/lit-element.js
var JSCompiler_renameProperty2 = (prop, _obj) => prop;
var DEV_MODE3 = true;
var global4 = globalThis;
var issueWarning3;
if (DEV_MODE3) {
  global4.litIssuedWarnings ??= new Set;
  issueWarning3 = (code, warning) => {
    warning += ` See https://lit.dev/msg/${code} for more information.`;
    if (!global4.litIssuedWarnings.has(warning) && !global4.litIssuedWarnings.has(code)) {
      console.warn(warning);
      global4.litIssuedWarnings.add(warning);
    }
  };
}

class LitElement extends ReactiveElement {
  constructor() {
    super(...arguments);
    this.renderOptions = { host: this };
    this.__childPart = undefined;
  }
  createRenderRoot() {
    const renderRoot = super.createRenderRoot();
    this.renderOptions.renderBefore ??= renderRoot.firstChild;
    return renderRoot;
  }
  update(changedProperties) {
    const value = this.render();
    if (!this.hasUpdated) {
      this.renderOptions.isConnected = this.isConnected;
    }
    super.update(changedProperties);
    this.__childPart = render(value, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback();
    this.__childPart?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.__childPart?.setConnected(false);
  }
  render() {
    return noChange;
  }
}
LitElement["_$litElement$"] = true;
LitElement[JSCompiler_renameProperty2("finalized", LitElement)] = true;
global4.litElementHydrateSupport?.({ LitElement });
var polyfillSupport3 = DEV_MODE3 ? global4.litElementPolyfillSupportDevMode : global4.litElementPolyfillSupport;
polyfillSupport3?.({ LitElement });
(global4.litElementVersions ??= []).push("4.2.1");
if (DEV_MODE3 && global4.litElementVersions.length > 1) {
  queueMicrotask(() => {
    issueWarning3("multiple-versions", `Multiple versions of Lit loaded. Loading multiple versions ` + `is not recommended.`);
  });
}
// src/components/rm-head.js
class RmHead extends LitElement {
  static properties = {
    pageTitle: { type: String, attribute: "page-title" }
  };
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback();
    this.initHead();
  }
  initHead() {
    if (this.pageTitle) {
      document.title = this.pageTitle;
    }
    this.addMetaTag("description", "Bun starter template");
    this.addMetaTag("author", "RNC");
    this.addMetaTag("keywords", "Bun 1.3 bun-serve tailwind tailwindcss Lit SQLite");
    this.addLinkTag("icon", "/favicon.ico", "image/x-icon");
  }
  addMetaTag(attrName, attrValue) {
    if (attrName === "charset") {
      if (!document.querySelector("meta[charset]")) {
        const meta = document.createElement("meta");
        meta.setAttribute("charset", attrValue);
        document.head.appendChild(meta);
      }
      return;
    }
    if (!document.querySelector(`meta[name="${attrName}"]`)) {
      const meta = document.createElement("meta");
      meta.name = attrName;
      meta.content = attrValue;
      document.head.appendChild(meta);
    }
  }
  addLinkTag(rel, href, type = null) {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = rel;
      link.href = href;
      if (type)
        link.type = type;
      document.head.appendChild(link);
    }
  }
}
customElements.define("rm-head", RmHead);

// node_modules/better-auth/dist/client/broadcast-channel.mjs
var kBroadcastChannel = Symbol.for("better-auth:broadcast-channel");
var now = () => Math.floor(Date.now() / 1000);
var WindowBroadcastChannel = class {
  listeners = /* @__PURE__ */ new Set;
  name;
  constructor(name = "better-auth.message") {
    this.name = name;
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  post(message) {
    if (typeof window === "undefined")
      return;
    try {
      localStorage.setItem(this.name, JSON.stringify({
        ...message,
        timestamp: now()
      }));
    } catch {}
  }
  setup() {
    if (typeof window === "undefined" || typeof window.addEventListener === "undefined")
      return () => {};
    const handler = (event) => {
      if (event.key !== this.name)
        return;
      const message = JSON.parse(event.newValue ?? "{}");
      if (message?.event !== "session" || !message?.data)
        return;
      this.listeners.forEach((listener) => listener(message));
    };
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("storage", handler);
    };
  }
};
function getGlobalBroadcastChannel(name = "better-auth.message") {
  if (!globalThis[kBroadcastChannel])
    globalThis[kBroadcastChannel] = new WindowBroadcastChannel(name);
  return globalThis[kBroadcastChannel];
}

// node_modules/better-auth/dist/client/focus-manager.mjs
var kFocusManager = Symbol.for("better-auth:focus-manager");
var WindowFocusManager = class {
  listeners = /* @__PURE__ */ new Set;
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  setFocused(focused) {
    this.listeners.forEach((listener) => listener(focused));
  }
  setup() {
    if (typeof window === "undefined" || typeof document === "undefined" || typeof window.addEventListener === "undefined")
      return () => {};
    const visibilityHandler = () => {
      if (document.visibilityState === "visible")
        this.setFocused(true);
    };
    document.addEventListener("visibilitychange", visibilityHandler, false);
    return () => {
      document.removeEventListener("visibilitychange", visibilityHandler, false);
    };
  }
};
function getGlobalFocusManager() {
  if (!globalThis[kFocusManager])
    globalThis[kFocusManager] = new WindowFocusManager;
  return globalThis[kFocusManager];
}

// node_modules/better-auth/dist/client/online-manager.mjs
var kOnlineManager = Symbol.for("better-auth:online-manager");
var WindowOnlineManager = class {
  listeners = /* @__PURE__ */ new Set;
  isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  setOnline(online) {
    this.isOnline = online;
    this.listeners.forEach((listener) => listener(online));
  }
  setup() {
    if (typeof window === "undefined" || typeof window.addEventListener === "undefined")
      return () => {};
    const onOnline = () => this.setOnline(true);
    const onOffline = () => this.setOnline(false);
    window.addEventListener("online", onOnline, false);
    window.addEventListener("offline", onOffline, false);
    return () => {
      window.removeEventListener("online", onOnline, false);
      window.removeEventListener("offline", onOffline, false);
    };
  }
};
function getGlobalOnlineManager() {
  if (!globalThis[kOnlineManager])
    globalThis[kOnlineManager] = new WindowOnlineManager;
  return globalThis[kOnlineManager];
}

// node_modules/nanostores/clean-stores/index.js
var clean = Symbol("clean");

// node_modules/nanostores/atom/index.js
var listenerQueue = [];
var lqIndex = 0;
var QUEUE_ITEMS_PER_LISTENER = 4;
var epoch = 0;
var atom = (initialValue) => {
  let listeners = [];
  let $atom = {
    get() {
      if (!$atom.lc) {
        $atom.listen(() => {})();
      }
      return $atom.value;
    },
    lc: 0,
    listen(listener) {
      $atom.lc = listeners.push(listener);
      return () => {
        for (let i = lqIndex + QUEUE_ITEMS_PER_LISTENER;i < listenerQueue.length; ) {
          if (listenerQueue[i] === listener) {
            listenerQueue.splice(i, QUEUE_ITEMS_PER_LISTENER);
          } else {
            i += QUEUE_ITEMS_PER_LISTENER;
          }
        }
        let index = listeners.indexOf(listener);
        if (~index) {
          listeners.splice(index, 1);
          if (!--$atom.lc)
            $atom.off();
        }
      };
    },
    notify(oldValue, changedKey) {
      epoch++;
      let runListenerQueue = !listenerQueue.length;
      for (let listener of listeners) {
        listenerQueue.push(listener, $atom.value, oldValue, changedKey);
      }
      if (runListenerQueue) {
        for (lqIndex = 0;lqIndex < listenerQueue.length; lqIndex += QUEUE_ITEMS_PER_LISTENER) {
          listenerQueue[lqIndex](listenerQueue[lqIndex + 1], listenerQueue[lqIndex + 2], listenerQueue[lqIndex + 3]);
        }
        listenerQueue.length = 0;
      }
    },
    off() {},
    set(newValue) {
      let oldValue = $atom.value;
      if (oldValue !== newValue) {
        $atom.value = newValue;
        $atom.notify(oldValue);
      }
    },
    subscribe(listener) {
      let unbind = $atom.listen(listener);
      listener($atom.value);
      return unbind;
    },
    value: initialValue
  };
  if (true) {
    $atom[clean] = () => {
      listeners = [];
      $atom.lc = 0;
      $atom.off();
    };
  }
  return $atom;
};
// node_modules/nanostores/lifecycle/index.js
var MOUNT = 5;
var UNMOUNT = 6;
var REVERT_MUTATION = 10;
var on = (object, listener, eventKey, mutateStore) => {
  object.events = object.events || {};
  if (!object.events[eventKey + REVERT_MUTATION]) {
    object.events[eventKey + REVERT_MUTATION] = mutateStore((eventProps) => {
      object.events[eventKey].reduceRight((event, l) => (l(event), event), {
        shared: {},
        ...eventProps
      });
    });
  }
  object.events[eventKey] = object.events[eventKey] || [];
  object.events[eventKey].push(listener);
  return () => {
    let currentListeners = object.events[eventKey];
    let index = currentListeners.indexOf(listener);
    currentListeners.splice(index, 1);
    if (!currentListeners.length) {
      delete object.events[eventKey];
      object.events[eventKey + REVERT_MUTATION]();
      delete object.events[eventKey + REVERT_MUTATION];
    }
  };
};
var STORE_UNMOUNT_DELAY = 1000;
var onMount = ($store, initialize) => {
  let listener = (payload) => {
    let destroy = initialize(payload);
    if (destroy)
      $store.events[UNMOUNT].push(destroy);
  };
  return on($store, listener, MOUNT, (runListeners) => {
    let originListen = $store.listen;
    $store.listen = (...args) => {
      if (!$store.lc && !$store.active) {
        $store.active = true;
        runListeners();
      }
      return originListen(...args);
    };
    let originOff = $store.off;
    $store.events[UNMOUNT] = [];
    $store.off = () => {
      originOff();
      setTimeout(() => {
        if ($store.active && !$store.lc) {
          $store.active = false;
          for (let destroy of $store.events[UNMOUNT])
            destroy();
          $store.events[UNMOUNT] = [];
        }
      }, STORE_UNMOUNT_DELAY);
    };
    if (true) {
      let originClean = $store[clean];
      $store[clean] = () => {
        for (let destroy of $store.events[UNMOUNT])
          destroy();
        $store.events[UNMOUNT] = [];
        $store.active = false;
        originClean();
      };
    }
    return () => {
      $store.listen = originListen;
      $store.off = originOff;
    };
  });
};
// node_modules/better-auth/dist/client/query.mjs
var isServer = () => typeof window === "undefined";
var useAuthQuery = (initializedAtom, path, $fetch, options) => {
  const value = atom({
    data: null,
    error: null,
    isPending: true,
    isRefetching: false,
    refetch: (queryParams) => fn(queryParams)
  });
  const fn = async (queryParams) => {
    return new Promise((resolve) => {
      const opts = typeof options === "function" ? options({
        data: value.get().data,
        error: value.get().error,
        isPending: value.get().isPending
      }) : options;
      $fetch(path, {
        ...opts,
        query: {
          ...opts?.query,
          ...queryParams?.query
        },
        async onSuccess(context) {
          value.set({
            data: context.data,
            error: null,
            isPending: false,
            isRefetching: false,
            refetch: value.value.refetch
          });
          await opts?.onSuccess?.(context);
        },
        async onError(context) {
          const { request } = context;
          const retryAttempts = typeof request.retry === "number" ? request.retry : request.retry?.attempts;
          const retryAttempt = request.retryAttempt || 0;
          if (retryAttempts && retryAttempt < retryAttempts)
            return;
          value.set({
            error: context.error,
            data: null,
            isPending: false,
            isRefetching: false,
            refetch: value.value.refetch
          });
          await opts?.onError?.(context);
        },
        async onRequest(context) {
          const currentValue = value.get();
          value.set({
            isPending: currentValue.data === null,
            data: currentValue.data,
            error: null,
            isRefetching: true,
            refetch: value.value.refetch
          });
          await opts?.onRequest?.(context);
        }
      }).catch((error) => {
        value.set({
          error,
          data: null,
          isPending: false,
          isRefetching: false,
          refetch: value.value.refetch
        });
      }).finally(() => {
        resolve(undefined);
      });
    });
  };
  initializedAtom = Array.isArray(initializedAtom) ? initializedAtom : [initializedAtom];
  let isMounted = false;
  for (const initAtom of initializedAtom)
    initAtom.subscribe(async () => {
      if (isServer())
        return;
      if (isMounted)
        await fn();
      else
        onMount(value, () => {
          const timeoutId = setTimeout(async () => {
            if (!isMounted) {
              await fn();
              isMounted = true;
            }
          }, 0);
          return () => {
            value.off();
            initAtom.off();
            clearTimeout(timeoutId);
          };
        });
    });
  return value;
};

// node_modules/better-auth/dist/client/session-refresh.mjs
var now2 = () => Math.floor(Date.now() / 1000);
var FOCUS_REFETCH_RATE_LIMIT_SECONDS = 5;
function createSessionRefreshManager(opts) {
  const { sessionAtom, sessionSignal, $fetch, options = {} } = opts;
  const refetchInterval = options.sessionOptions?.refetchInterval ?? 0;
  const refetchOnWindowFocus = options.sessionOptions?.refetchOnWindowFocus ?? true;
  const refetchWhenOffline = options.sessionOptions?.refetchWhenOffline ?? false;
  const state = {
    lastSync: 0,
    lastSessionRequest: 0,
    cachedSession: undefined
  };
  const shouldRefetch = () => {
    return refetchWhenOffline || getGlobalOnlineManager().isOnline;
  };
  const triggerRefetch = (event) => {
    if (!shouldRefetch())
      return;
    if (event?.event === "storage") {
      state.lastSync = now2();
      sessionSignal.set(!sessionSignal.get());
      return;
    }
    const currentSession = sessionAtom.get();
    if (event?.event === "poll") {
      state.lastSessionRequest = now2();
      $fetch("/get-session").then((res) => {
        sessionAtom.set({
          ...currentSession,
          data: res.data,
          error: res.error || null
        });
        state.lastSync = now2();
        sessionSignal.set(!sessionSignal.get());
      }).catch(() => {});
      return;
    }
    if (event?.event === "visibilitychange") {
      if (now2() - state.lastSessionRequest < FOCUS_REFETCH_RATE_LIMIT_SECONDS && currentSession?.data !== null && currentSession?.data !== undefined)
        return;
    }
    if (currentSession?.data === null || currentSession?.data === undefined || event?.event === "visibilitychange") {
      if (event?.event === "visibilitychange")
        state.lastSessionRequest = now2();
      state.lastSync = now2();
      sessionSignal.set(!sessionSignal.get());
    }
  };
  const broadcastSessionUpdate = (trigger) => {
    getGlobalBroadcastChannel().post({
      event: "session",
      data: { trigger },
      clientId: Math.random().toString(36).substring(7)
    });
  };
  const setupPolling = () => {
    if (refetchInterval && refetchInterval > 0)
      state.pollInterval = setInterval(() => {
        if (sessionAtom.get()?.data)
          triggerRefetch({ event: "poll" });
      }, refetchInterval * 1000);
  };
  const setupBroadcast = () => {
    state.unsubscribeBroadcast = getGlobalBroadcastChannel().subscribe(() => {
      triggerRefetch({ event: "storage" });
    });
  };
  const setupFocusRefetch = () => {
    if (!refetchOnWindowFocus)
      return;
    state.unsubscribeFocus = getGlobalFocusManager().subscribe(() => {
      triggerRefetch({ event: "visibilitychange" });
    });
  };
  const setupOnlineRefetch = () => {
    state.unsubscribeOnline = getGlobalOnlineManager().subscribe((online) => {
      if (online)
        triggerRefetch({ event: "visibilitychange" });
    });
  };
  const init = () => {
    setupPolling();
    setupBroadcast();
    setupFocusRefetch();
    setupOnlineRefetch();
    getGlobalBroadcastChannel().setup();
    getGlobalFocusManager().setup();
    getGlobalOnlineManager().setup();
  };
  const cleanup = () => {
    if (state.pollInterval) {
      clearInterval(state.pollInterval);
      state.pollInterval = undefined;
    }
    if (state.unsubscribeBroadcast) {
      state.unsubscribeBroadcast();
      state.unsubscribeBroadcast = undefined;
    }
    if (state.unsubscribeFocus) {
      state.unsubscribeFocus();
      state.unsubscribeFocus = undefined;
    }
    if (state.unsubscribeOnline) {
      state.unsubscribeOnline();
      state.unsubscribeOnline = undefined;
    }
    state.lastSync = 0;
    state.lastSessionRequest = 0;
    state.cachedSession = undefined;
  };
  return {
    init,
    cleanup,
    triggerRefetch,
    broadcastSessionUpdate
  };
}

// node_modules/@better-auth/core/dist/env-DbssmzoK.mjs
var _envShim = Object.create(null);
var _getEnv = (useShim) => globalThis.process?.env || globalThis.Deno?.env.toObject() || globalThis.__env__ || (useShim ? _envShim : globalThis);
var env = new Proxy(_envShim, {
  get(_, prop) {
    return _getEnv()[prop] ?? _envShim[prop];
  },
  has(_, prop) {
    return prop in _getEnv() || prop in _envShim;
  },
  set(_, prop, value) {
    const env$1 = _getEnv(true);
    env$1[prop] = value;
    return true;
  },
  deleteProperty(_, prop) {
    if (!prop)
      return false;
    const env$1 = _getEnv(true);
    delete env$1[prop];
    return true;
  },
  ownKeys() {
    const env$1 = _getEnv(true);
    return Object.keys(env$1);
  }
});
var nodeENV = typeof process !== "undefined" && process.env && "development" || "";
function getEnvVar(key, fallback) {
  if (typeof process !== "undefined" && process.env)
    return process.env[key] ?? fallback;
  if (typeof Deno !== "undefined")
    return Deno.env.get(key) ?? fallback;
  if (typeof Bun !== "undefined")
    return Bun.env[key] ?? fallback;
  return fallback;
}
var ENV = Object.freeze({
  get BETTER_AUTH_SECRET() {
    return getEnvVar("BETTER_AUTH_SECRET");
  },
  get AUTH_SECRET() {
    return getEnvVar("AUTH_SECRET");
  },
  get BETTER_AUTH_TELEMETRY() {
    return getEnvVar("BETTER_AUTH_TELEMETRY");
  },
  get BETTER_AUTH_TELEMETRY_ID() {
    return getEnvVar("BETTER_AUTH_TELEMETRY_ID");
  },
  get NODE_ENV() {
    return getEnvVar("NODE_ENV", "development");
  },
  get PACKAGE_VERSION() {
    return getEnvVar("PACKAGE_VERSION", "0.0.0");
  },
  get BETTER_AUTH_TELEMETRY_ENDPOINT() {
    return getEnvVar("BETTER_AUTH_TELEMETRY_ENDPOINT", "https://telemetry.better-auth.com/v1/track");
  }
});
var COLORS_2 = 1;
var COLORS_16 = 4;
var COLORS_256 = 8;
var COLORS_16m = 24;
var TERM_ENVS = {
  eterm: COLORS_16,
  cons25: COLORS_16,
  console: COLORS_16,
  cygwin: COLORS_16,
  dtterm: COLORS_16,
  gnome: COLORS_16,
  hurd: COLORS_16,
  jfbterm: COLORS_16,
  konsole: COLORS_16,
  kterm: COLORS_16,
  mlterm: COLORS_16,
  mosh: COLORS_16m,
  putty: COLORS_16,
  st: COLORS_16,
  "rxvt-unicode-24bit": COLORS_16m,
  terminator: COLORS_16m,
  "xterm-kitty": COLORS_16m
};
var CI_ENVS_MAP = new Map(Object.entries({
  APPVEYOR: COLORS_256,
  BUILDKITE: COLORS_256,
  CIRCLECI: COLORS_16m,
  DRONE: COLORS_256,
  GITEA_ACTIONS: COLORS_16m,
  GITHUB_ACTIONS: COLORS_16m,
  GITLAB_CI: COLORS_256,
  TRAVIS: COLORS_256
}));
var TERM_ENVS_REG_EXP = [
  /ansi/,
  /color/,
  /linux/,
  /direct/,
  /^con[0-9]*x[0-9]/,
  /^rxvt/,
  /^screen/,
  /^xterm/,
  /^vt100/,
  /^vt220/
];
function getColorDepth() {
  if (getEnvVar("FORCE_COLOR") !== undefined)
    switch (getEnvVar("FORCE_COLOR")) {
      case "":
      case "1":
      case "true":
        return COLORS_16;
      case "2":
        return COLORS_256;
      case "3":
        return COLORS_16m;
      default:
        return COLORS_2;
    }
  if (getEnvVar("NODE_DISABLE_COLORS") !== undefined && getEnvVar("NODE_DISABLE_COLORS") !== "" || getEnvVar("NO_COLOR") !== undefined && getEnvVar("NO_COLOR") !== "" || getEnvVar("TERM") === "dumb")
    return COLORS_2;
  if (getEnvVar("TMUX"))
    return COLORS_16m;
  if ("TF_BUILD" in env && "AGENT_NAME" in env)
    return COLORS_16;
  if ("CI" in env) {
    for (const { 0: envName, 1: colors } of CI_ENVS_MAP)
      if (envName in env)
        return colors;
    if (getEnvVar("CI_NAME") === "codeship")
      return COLORS_256;
    return COLORS_2;
  }
  if ("TEAMCITY_VERSION" in env)
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.exec(getEnvVar("TEAMCITY_VERSION")) !== null ? COLORS_16 : COLORS_2;
  switch (getEnvVar("TERM_PROGRAM")) {
    case "iTerm.app":
      if (!getEnvVar("TERM_PROGRAM_VERSION") || /^[0-2]\./.exec(getEnvVar("TERM_PROGRAM_VERSION")) !== null)
        return COLORS_256;
      return COLORS_16m;
    case "HyperTerm":
    case "MacTerm":
      return COLORS_16m;
    case "Apple_Terminal":
      return COLORS_256;
  }
  if (getEnvVar("COLORTERM") === "truecolor" || getEnvVar("COLORTERM") === "24bit")
    return COLORS_16m;
  if (getEnvVar("TERM")) {
    if (/truecolor/.exec(getEnvVar("TERM")) !== null)
      return COLORS_16m;
    if (/^xterm-256/.exec(getEnvVar("TERM")) !== null)
      return COLORS_256;
    const termEnv = getEnvVar("TERM").toLowerCase();
    if (TERM_ENVS[termEnv])
      return TERM_ENVS[termEnv];
    if (TERM_ENVS_REG_EXP.some((term) => term.exec(termEnv) !== null))
      return COLORS_16;
  }
  if (getEnvVar("COLORTERM"))
    return COLORS_16;
  return COLORS_2;
}
var TTY_COLORS = {
  reset: "\x1B[0m",
  bright: "\x1B[1m",
  dim: "\x1B[2m",
  undim: "\x1B[22m",
  underscore: "\x1B[4m",
  blink: "\x1B[5m",
  reverse: "\x1B[7m",
  hidden: "\x1B[8m",
  fg: {
    black: "\x1B[30m",
    red: "\x1B[31m",
    green: "\x1B[32m",
    yellow: "\x1B[33m",
    blue: "\x1B[34m",
    magenta: "\x1B[35m",
    cyan: "\x1B[36m",
    white: "\x1B[37m"
  },
  bg: {
    black: "\x1B[40m",
    red: "\x1B[41m",
    green: "\x1B[42m",
    yellow: "\x1B[43m",
    blue: "\x1B[44m",
    magenta: "\x1B[45m",
    cyan: "\x1B[46m",
    white: "\x1B[47m"
  }
};
var levels = [
  "debug",
  "info",
  "success",
  "warn",
  "error"
];
function shouldPublishLog(currentLogLevel, logLevel) {
  return levels.indexOf(logLevel) >= levels.indexOf(currentLogLevel);
}
var levelColors = {
  info: TTY_COLORS.fg.blue,
  success: TTY_COLORS.fg.green,
  warn: TTY_COLORS.fg.yellow,
  error: TTY_COLORS.fg.red,
  debug: TTY_COLORS.fg.magenta
};
var formatMessage = (level, message, colorsEnabled) => {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  if (colorsEnabled)
    return `${TTY_COLORS.dim}${timestamp}${TTY_COLORS.reset} ${levelColors[level]}${level.toUpperCase()}${TTY_COLORS.reset} ${TTY_COLORS.bright}[Better Auth]:${TTY_COLORS.reset} ${message}`;
  return `${timestamp} ${level.toUpperCase()} [Better Auth]: ${message}`;
};
var createLogger = (options) => {
  const enabled = options?.disabled !== true;
  const logLevel = options?.level ?? "error";
  const colorsEnabled = options?.disableColors !== undefined ? !options.disableColors : getColorDepth() !== 1;
  const LogFunc = (level, message, args = []) => {
    if (!enabled || !shouldPublishLog(logLevel, level))
      return;
    const formattedMessage = formatMessage(level, message, colorsEnabled);
    if (!options || typeof options.log !== "function") {
      if (level === "error")
        console.error(formattedMessage, ...args);
      else if (level === "warn")
        console.warn(formattedMessage, ...args);
      else
        console.log(formattedMessage, ...args);
      return;
    }
    options.log(level === "success" ? "info" : level, message, ...args);
  };
  return {
    ...Object.fromEntries(levels.map((level) => [level, (...[message, ...args]) => LogFunc(level, message, args)])),
    get level() {
      return logLevel;
    }
  };
};
var logger = createLogger();

// node_modules/@better-auth/core/dist/utils-NloIXYE0.mjs
function defineErrorCodes(codes) {
  return codes;
}
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// node_modules/@better-auth/core/dist/error-CzMAIrPb.mjs
var BASE_ERROR_CODES = defineErrorCodes({
  USER_NOT_FOUND: "User not found",
  FAILED_TO_CREATE_USER: "Failed to create user",
  FAILED_TO_CREATE_SESSION: "Failed to create session",
  FAILED_TO_UPDATE_USER: "Failed to update user",
  FAILED_TO_GET_SESSION: "Failed to get session",
  INVALID_PASSWORD: "Invalid password",
  INVALID_EMAIL: "Invalid email",
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "Social account already linked",
  PROVIDER_NOT_FOUND: "Provider not found",
  INVALID_TOKEN: "Invalid token",
  ID_TOKEN_NOT_SUPPORTED: "id_token not supported",
  FAILED_TO_GET_USER_INFO: "Failed to get user info",
  USER_EMAIL_NOT_FOUND: "User email not found",
  EMAIL_NOT_VERIFIED: "Email not verified",
  PASSWORD_TOO_SHORT: "Password too short",
  PASSWORD_TOO_LONG: "Password too long",
  USER_ALREADY_EXISTS: "User already exists.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "User already exists. Use another email.",
  EMAIL_CAN_NOT_BE_UPDATED: "Email can not be updated",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "Credential account not found",
  SESSION_EXPIRED: "Session expired. Re-authenticate to perform this action.",
  FAILED_TO_UNLINK_LAST_ACCOUNT: "You can't unlink your last account",
  ACCOUNT_NOT_FOUND: "Account not found",
  USER_ALREADY_HAS_PASSWORD: "User already has a password. Provide that to delete the account."
});
var BetterAuthError = class extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "BetterAuthError";
    this.message = message;
    this.cause = cause;
    this.stack = "";
  }
};

// node_modules/better-auth/dist/utils/url.mjs
function checkHasPath(url) {
  try {
    return (new URL(url).pathname.replace(/\/+$/, "") || "/") !== "/";
  } catch {
    throw new BetterAuthError(`Invalid base URL: ${url}. Please provide a valid base URL.`);
  }
}
function assertHasProtocol(url) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:")
      throw new BetterAuthError(`Invalid base URL: ${url}. URL must include 'http://' or 'https://'`);
  } catch (error) {
    if (error instanceof BetterAuthError)
      throw error;
    throw new BetterAuthError(`Invalid base URL: ${url}. Please provide a valid base URL.`, String(error));
  }
}
function withPath(url, path = "/api/auth") {
  assertHasProtocol(url);
  if (checkHasPath(url))
    return url;
  const trimmedUrl = url.replace(/\/+$/, "");
  if (!path || path === "/")
    return trimmedUrl;
  path = path.startsWith("/") ? path : `/${path}`;
  return `${trimmedUrl}${path}`;
}
function getBaseURL(url, path, request, loadEnv, trustedProxyHeaders) {
  if (url)
    return withPath(url, path);
  if (loadEnv !== false) {
    const fromEnv = env.BETTER_AUTH_URL || env.NEXT_PUBLIC_BETTER_AUTH_URL || env.PUBLIC_BETTER_AUTH_URL || env.NUXT_PUBLIC_BETTER_AUTH_URL || env.NUXT_PUBLIC_AUTH_URL || (env.BASE_URL !== "/" ? env.BASE_URL : undefined);
    if (fromEnv)
      return withPath(fromEnv, path);
  }
  const fromRequest = request?.headers.get("x-forwarded-host");
  const fromRequestProto = request?.headers.get("x-forwarded-proto");
  if (fromRequest && fromRequestProto && trustedProxyHeaders)
    return withPath(`${fromRequestProto}://${fromRequest}`, path);
  if (request) {
    const url$1 = getOrigin(request.url);
    if (!url$1)
      throw new BetterAuthError("Could not get origin from request. Please provide a valid base URL.");
    return withPath(url$1, path);
  }
  if (typeof window !== "undefined" && window.location)
    return withPath(window.location.origin, path);
}
function getOrigin(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin === "null" ? null : parsedUrl.origin;
  } catch {
    return null;
  }
}

// node_modules/better-auth/dist/client/fetch-plugins.mjs
var redirectPlugin = {
  id: "redirect",
  name: "Redirect",
  hooks: { onSuccess(context) {
    if (context.data?.url && context.data?.redirect) {
      if (typeof window !== "undefined" && window.location) {
        if (window.location)
          try {
            window.location.href = context.data.url;
          } catch {}
      }
    }
  } }
};

// node_modules/better-auth/dist/client/parser.mjs
var PROTO_POLLUTION_PATTERNS = {
  proto: /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/,
  constructor: /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/,
  protoShort: /"__proto__"\s*:/,
  constructorShort: /"constructor"\s*:/
};
var JSON_SIGNATURE = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
var SPECIAL_VALUES = {
  true: true,
  false: false,
  null: null,
  undefined: undefined,
  nan: NaN,
  infinity: Number.POSITIVE_INFINITY,
  "-infinity": Number.NEGATIVE_INFINITY
};
var ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,7}))?(?:Z|([+-])(\d{2}):(\d{2}))$/;
function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}
function parseISODate(value) {
  const match = ISO_DATE_REGEX.exec(value);
  if (!match)
    return null;
  const [, year, month, day, hour, minute, second, ms, offsetSign, offsetHour, offsetMinute] = match;
  let date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10), parseInt(second, 10), ms ? parseInt(ms.padEnd(3, "0"), 10) : 0));
  if (offsetSign) {
    const offset = (parseInt(offsetHour, 10) * 60 + parseInt(offsetMinute, 10)) * (offsetSign === "+" ? -1 : 1);
    date.setUTCMinutes(date.getUTCMinutes() + offset);
  }
  return isValidDate(date) ? date : null;
}
function betterJSONParse(value, options = {}) {
  const { strict = false, warnings = false, reviver, parseDates = true } = options;
  if (typeof value !== "string")
    return value;
  const trimmed = value.trim();
  if (trimmed.length > 0 && trimmed[0] === '"' && trimmed.endsWith('"') && !trimmed.slice(1, -1).includes('"'))
    return trimmed.slice(1, -1);
  const lowerValue = trimmed.toLowerCase();
  if (lowerValue.length <= 9 && lowerValue in SPECIAL_VALUES)
    return SPECIAL_VALUES[lowerValue];
  if (!JSON_SIGNATURE.test(trimmed)) {
    if (strict)
      throw new SyntaxError("[better-json] Invalid JSON");
    return value;
  }
  if (Object.entries(PROTO_POLLUTION_PATTERNS).some(([key, pattern]) => {
    const matches = pattern.test(trimmed);
    if (matches && warnings)
      console.warn(`[better-json] Detected potential prototype pollution attempt using ${key} pattern`);
    return matches;
  }) && strict)
    throw new Error("[better-json] Potential prototype pollution attempt detected");
  try {
    const secureReviver = (key, value$1) => {
      if (key === "__proto__" || key === "constructor" && value$1 && typeof value$1 === "object" && "prototype" in value$1) {
        if (warnings)
          console.warn(`[better-json] Dropping "${key}" key to prevent prototype pollution`);
        return;
      }
      if (parseDates && typeof value$1 === "string") {
        const date = parseISODate(value$1);
        if (date)
          return date;
      }
      return reviver ? reviver(key, value$1) : value$1;
    };
    return JSON.parse(trimmed, secureReviver);
  } catch (error) {
    if (strict)
      throw error;
    return value;
  }
}
function parseJSON(value, options = { strict: true }) {
  return betterJSONParse(value, options);
}

// node_modules/better-auth/dist/client/session-atom.mjs
function getSessionAtom($fetch, options) {
  const $signal = atom(false);
  const session = useAuthQuery($signal, "/get-session", $fetch, { method: "GET" });
  onMount(session, () => {
    const refreshManager = createSessionRefreshManager({
      sessionAtom: session,
      sessionSignal: $signal,
      $fetch,
      options
    });
    refreshManager.init();
    return () => {
      refreshManager.cleanup();
    };
  });
  return {
    session,
    $sessionSignal: $signal
  };
}

// node_modules/@better-fetch/fetch/dist/index.js
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => (key in obj) ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var BetterFetchError = class extends Error {
  constructor(status, statusText, error) {
    super(statusText || status.toString(), {
      cause: error
    });
    this.status = status;
    this.statusText = statusText;
    this.error = error;
    Error.captureStackTrace(this, this.constructor);
  }
};
var initializePlugins = async (url, options) => {
  var _a, _b, _c, _d, _e, _f;
  let opts = options || {};
  const hooks = {
    onRequest: [options == null ? undefined : options.onRequest],
    onResponse: [options == null ? undefined : options.onResponse],
    onSuccess: [options == null ? undefined : options.onSuccess],
    onError: [options == null ? undefined : options.onError],
    onRetry: [options == null ? undefined : options.onRetry]
  };
  if (!options || !(options == null ? undefined : options.plugins)) {
    return {
      url,
      options: opts,
      hooks
    };
  }
  for (const plugin of (options == null ? undefined : options.plugins) || []) {
    if (plugin.init) {
      const pluginRes = await ((_a = plugin.init) == null ? undefined : _a.call(plugin, url.toString(), options));
      opts = pluginRes.options || opts;
      url = pluginRes.url;
    }
    hooks.onRequest.push((_b = plugin.hooks) == null ? undefined : _b.onRequest);
    hooks.onResponse.push((_c = plugin.hooks) == null ? undefined : _c.onResponse);
    hooks.onSuccess.push((_d = plugin.hooks) == null ? undefined : _d.onSuccess);
    hooks.onError.push((_e = plugin.hooks) == null ? undefined : _e.onError);
    hooks.onRetry.push((_f = plugin.hooks) == null ? undefined : _f.onRetry);
  }
  return {
    url,
    options: opts,
    hooks
  };
};
var LinearRetryStrategy = class {
  constructor(options) {
    this.options = options;
  }
  shouldAttemptRetry(attempt, response) {
    if (this.options.shouldRetry) {
      return Promise.resolve(attempt < this.options.attempts && this.options.shouldRetry(response));
    }
    return Promise.resolve(attempt < this.options.attempts);
  }
  getDelay() {
    return this.options.delay;
  }
};
var ExponentialRetryStrategy = class {
  constructor(options) {
    this.options = options;
  }
  shouldAttemptRetry(attempt, response) {
    if (this.options.shouldRetry) {
      return Promise.resolve(attempt < this.options.attempts && this.options.shouldRetry(response));
    }
    return Promise.resolve(attempt < this.options.attempts);
  }
  getDelay(attempt) {
    const delay = Math.min(this.options.maxDelay, this.options.baseDelay * 2 ** attempt);
    return delay;
  }
};
function createRetryStrategy(options) {
  if (typeof options === "number") {
    return new LinearRetryStrategy({
      type: "linear",
      attempts: options,
      delay: 1000
    });
  }
  switch (options.type) {
    case "linear":
      return new LinearRetryStrategy(options);
    case "exponential":
      return new ExponentialRetryStrategy(options);
    default:
      throw new Error("Invalid retry strategy");
  }
}
var getAuthHeader = async (options) => {
  const headers = {};
  const getValue = async (value) => typeof value === "function" ? await value() : value;
  if (options == null ? undefined : options.auth) {
    if (options.auth.type === "Bearer") {
      const token = await getValue(options.auth.token);
      if (!token) {
        return headers;
      }
      headers["authorization"] = `Bearer ${token}`;
    } else if (options.auth.type === "Basic") {
      const [username, password] = await Promise.all([
        getValue(options.auth.username),
        getValue(options.auth.password)
      ]);
      if (!username || !password) {
        return headers;
      }
      headers["authorization"] = `Basic ${btoa(`${username}:${password}`)}`;
    } else if (options.auth.type === "Custom") {
      const [prefix, value] = await Promise.all([
        getValue(options.auth.prefix),
        getValue(options.auth.value)
      ]);
      if (!value) {
        return headers;
      }
      headers["authorization"] = `${prefix != null ? prefix : ""} ${value}`;
    }
  }
  return headers;
};
var JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(request) {
  const _contentType = request.headers.get("content-type");
  const textTypes = /* @__PURE__ */ new Set([
    "image/svg",
    "application/xml",
    "application/xhtml",
    "application/html"
  ]);
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function isJSONParsable(value) {
  try {
    JSON.parse(value);
    return true;
  } catch (error) {
    return false;
  }
}
function isJSONSerializable(value) {
  if (value === undefined) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
function jsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
}
function isFunction(value) {
  return typeof value === "function";
}
function getFetch(options) {
  if (options == null ? undefined : options.customFetchImpl) {
    return options.customFetchImpl;
  }
  if (typeof globalThis !== "undefined" && isFunction(globalThis.fetch)) {
    return globalThis.fetch;
  }
  if (typeof window !== "undefined" && isFunction(window.fetch)) {
    return window.fetch;
  }
  throw new Error("No fetch implementation found");
}
async function getHeaders(opts) {
  const headers = new Headers(opts == null ? undefined : opts.headers);
  const authHeader = await getAuthHeader(opts);
  for (const [key, value] of Object.entries(authHeader || {})) {
    headers.set(key, value);
  }
  if (!headers.has("content-type")) {
    const t = detectContentType(opts == null ? undefined : opts.body);
    if (t) {
      headers.set("content-type", t);
    }
  }
  return headers;
}
function detectContentType(body) {
  if (isJSONSerializable(body)) {
    return "application/json";
  }
  return null;
}
function getBody(options) {
  if (!(options == null ? undefined : options.body)) {
    return null;
  }
  const headers = new Headers(options == null ? undefined : options.headers);
  if (isJSONSerializable(options.body) && !headers.has("content-type")) {
    for (const [key, value] of Object.entries(options == null ? undefined : options.body)) {
      if (value instanceof Date) {
        options.body[key] = value.toISOString();
      }
    }
    return JSON.stringify(options.body);
  }
  if (headers.has("content-type") && headers.get("content-type") === "application/x-www-form-urlencoded") {
    if (isJSONSerializable(options.body)) {
      return new URLSearchParams(options.body).toString();
    }
    return options.body;
  }
  return options.body;
}
function getMethod(url, options) {
  var _a;
  if (options == null ? undefined : options.method) {
    return options.method.toUpperCase();
  }
  if (url.startsWith("@")) {
    const pMethod = (_a = url.split("@")[1]) == null ? undefined : _a.split("/")[0];
    if (!methods.includes(pMethod)) {
      return (options == null ? undefined : options.body) ? "POST" : "GET";
    }
    return pMethod.toUpperCase();
  }
  return (options == null ? undefined : options.body) ? "POST" : "GET";
}
function getTimeout(options, controller) {
  let abortTimeout;
  if (!(options == null ? undefined : options.signal) && (options == null ? undefined : options.timeout)) {
    abortTimeout = setTimeout(() => controller == null ? undefined : controller.abort(), options == null ? undefined : options.timeout);
  }
  return {
    abortTimeout,
    clearTimeout: () => {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
  };
}
var ValidationError = class _ValidationError extends Error {
  constructor(issues, message) {
    super(message || JSON.stringify(issues, null, 2));
    this.issues = issues;
    Object.setPrototypeOf(this, _ValidationError.prototype);
  }
};
async function parseStandardSchema(schema, input) {
  const result = await schema["~standard"].validate(input);
  if (result.issues) {
    throw new ValidationError(result.issues);
  }
  return result.value;
}
var methods = ["get", "post", "put", "patch", "delete"];
var applySchemaPlugin = (config) => ({
  id: "apply-schema",
  name: "Apply Schema",
  version: "1.0.0",
  async init(url, options) {
    var _a, _b, _c, _d;
    const schema = ((_b = (_a = config.plugins) == null ? undefined : _a.find((plugin) => {
      var _a2;
      return ((_a2 = plugin.schema) == null ? undefined : _a2.config) ? url.startsWith(plugin.schema.config.baseURL || "") || url.startsWith(plugin.schema.config.prefix || "") : false;
    })) == null ? undefined : _b.schema) || config.schema;
    if (schema) {
      let urlKey = url;
      if ((_c = schema.config) == null ? undefined : _c.prefix) {
        if (urlKey.startsWith(schema.config.prefix)) {
          urlKey = urlKey.replace(schema.config.prefix, "");
          if (schema.config.baseURL) {
            url = url.replace(schema.config.prefix, schema.config.baseURL);
          }
        }
      }
      if ((_d = schema.config) == null ? undefined : _d.baseURL) {
        if (urlKey.startsWith(schema.config.baseURL)) {
          urlKey = urlKey.replace(schema.config.baseURL, "");
        }
      }
      const keySchema = schema.schema[urlKey];
      if (keySchema) {
        let opts = __spreadProps(__spreadValues({}, options), {
          method: keySchema.method,
          output: keySchema.output
        });
        if (!(options == null ? undefined : options.disableValidation)) {
          opts = __spreadProps(__spreadValues({}, opts), {
            body: keySchema.input ? await parseStandardSchema(keySchema.input, options == null ? undefined : options.body) : options == null ? undefined : options.body,
            params: keySchema.params ? await parseStandardSchema(keySchema.params, options == null ? undefined : options.params) : options == null ? undefined : options.params,
            query: keySchema.query ? await parseStandardSchema(keySchema.query, options == null ? undefined : options.query) : options == null ? undefined : options.query
          });
        }
        return {
          url,
          options: opts
        };
      }
    }
    return {
      url,
      options
    };
  }
});
var createFetch = (config) => {
  async function $fetch(url, options) {
    const opts = __spreadProps(__spreadValues(__spreadValues({}, config), options), {
      plugins: [...(config == null ? undefined : config.plugins) || [], applySchemaPlugin(config || {}), ...(options == null ? undefined : options.plugins) || []]
    });
    if (config == null ? undefined : config.catchAllError) {
      try {
        return await betterFetch(url, opts);
      } catch (error) {
        return {
          data: null,
          error: {
            status: 500,
            statusText: "Fetch Error",
            message: "Fetch related error. Captured by catchAllError option. See error property for more details.",
            error
          }
        };
      }
    }
    return await betterFetch(url, opts);
  }
  return $fetch;
};
function getURL2(url, option) {
  const { baseURL, params, query } = option || {
    query: {},
    params: {},
    baseURL: ""
  };
  let basePath = url.startsWith("http") ? url.split("/").slice(0, 3).join("/") : baseURL || "";
  if (url.startsWith("@")) {
    const m = url.toString().split("@")[1].split("/")[0];
    if (methods.includes(m)) {
      url = url.replace(`@${m}/`, "/");
    }
  }
  if (!basePath.endsWith("/"))
    basePath += "/";
  let [path, urlQuery] = url.replace(basePath, "").split("?");
  const queryParams = new URLSearchParams(urlQuery);
  for (const [key, value] of Object.entries(query || {})) {
    if (value == null)
      continue;
    let serializedValue;
    if (typeof value === "string") {
      serializedValue = value;
    } else if (Array.isArray(value)) {
      for (const val of value) {
        queryParams.append(key, val);
      }
      continue;
    } else {
      serializedValue = JSON.stringify(value);
    }
    queryParams.set(key, serializedValue);
  }
  if (params) {
    if (Array.isArray(params)) {
      const paramPaths = path.split("/").filter((p) => p.startsWith(":"));
      for (const [index, key] of paramPaths.entries()) {
        const value = params[index];
        path = path.replace(key, value);
      }
    } else {
      for (const [key, value] of Object.entries(params)) {
        path = path.replace(`:${key}`, String(value));
      }
    }
  }
  path = path.split("/").map(encodeURIComponent).join("/");
  if (path.startsWith("/"))
    path = path.slice(1);
  let queryParamString = queryParams.toString();
  queryParamString = queryParamString.length > 0 ? `?${queryParamString}`.replace(/\+/g, "%20") : "";
  if (!basePath.startsWith("http")) {
    return `${basePath}${path}${queryParamString}`;
  }
  const _url = new URL(`${path}${queryParamString}`, basePath);
  return _url;
}
var betterFetch = async (url, options) => {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const {
    hooks,
    url: __url,
    options: opts
  } = await initializePlugins(url, options);
  const fetch2 = getFetch(opts);
  const controller = new AbortController;
  const signal = (_a = opts.signal) != null ? _a : controller.signal;
  const _url = getURL2(__url, opts);
  const body = getBody(opts);
  const headers = await getHeaders(opts);
  const method = getMethod(__url, opts);
  let context = __spreadProps(__spreadValues({}, opts), {
    url: _url,
    headers,
    body,
    method,
    signal
  });
  for (const onRequest of hooks.onRequest) {
    if (onRequest) {
      const res = await onRequest(context);
      if (typeof res === "object" && res !== null) {
        context = res;
      }
    }
  }
  if ("pipeTo" in context && typeof context.pipeTo === "function" || typeof ((_b = options == null ? undefined : options.body) == null ? undefined : _b.pipe) === "function") {
    if (!("duplex" in context)) {
      context.duplex = "half";
    }
  }
  const { clearTimeout: clearTimeout2 } = getTimeout(opts, controller);
  let response = await fetch2(context.url, context);
  clearTimeout2();
  const responseContext = {
    response,
    request: context
  };
  for (const onResponse of hooks.onResponse) {
    if (onResponse) {
      const r = await onResponse(__spreadProps(__spreadValues({}, responseContext), {
        response: ((_c = options == null ? undefined : options.hookOptions) == null ? undefined : _c.cloneResponse) ? response.clone() : response
      }));
      if (r instanceof Response) {
        response = r;
      } else if (typeof r === "object" && r !== null) {
        response = r.response;
      }
    }
  }
  if (response.ok) {
    const hasBody = context.method !== "HEAD";
    if (!hasBody) {
      return {
        data: "",
        error: null
      };
    }
    const responseType = detectResponseType(response);
    const successContext = {
      data: null,
      response,
      request: context
    };
    if (responseType === "json" || responseType === "text") {
      const text = await response.text();
      const parser2 = (_d = context.jsonParser) != null ? _d : jsonParse;
      successContext.data = await parser2(text);
    } else {
      successContext.data = await response[responseType]();
    }
    if (context == null ? undefined : context.output) {
      if (context.output && !context.disableValidation) {
        successContext.data = await parseStandardSchema(context.output, successContext.data);
      }
    }
    for (const onSuccess of hooks.onSuccess) {
      if (onSuccess) {
        await onSuccess(__spreadProps(__spreadValues({}, successContext), {
          response: ((_e = options == null ? undefined : options.hookOptions) == null ? undefined : _e.cloneResponse) ? response.clone() : response
        }));
      }
    }
    if (options == null ? undefined : options.throw) {
      return successContext.data;
    }
    return {
      data: successContext.data,
      error: null
    };
  }
  const parser = (_f = options == null ? undefined : options.jsonParser) != null ? _f : jsonParse;
  const responseText = await response.text();
  const isJSONResponse = isJSONParsable(responseText);
  const errorObject = isJSONResponse ? await parser(responseText) : null;
  const errorContext = {
    response,
    responseText,
    request: context,
    error: __spreadProps(__spreadValues({}, errorObject), {
      status: response.status,
      statusText: response.statusText
    })
  };
  for (const onError of hooks.onError) {
    if (onError) {
      await onError(__spreadProps(__spreadValues({}, errorContext), {
        response: ((_g = options == null ? undefined : options.hookOptions) == null ? undefined : _g.cloneResponse) ? response.clone() : response
      }));
    }
  }
  if (options == null ? undefined : options.retry) {
    const retryStrategy = createRetryStrategy(options.retry);
    const _retryAttempt = (_h = options.retryAttempt) != null ? _h : 0;
    if (await retryStrategy.shouldAttemptRetry(_retryAttempt, response)) {
      for (const onRetry of hooks.onRetry) {
        if (onRetry) {
          await onRetry(responseContext);
        }
      }
      const delay = retryStrategy.getDelay(_retryAttempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return await betterFetch(url, __spreadProps(__spreadValues({}, options), {
        retryAttempt: _retryAttempt + 1
      }));
    }
  }
  if (options == null ? undefined : options.throw) {
    throw new BetterFetchError(response.status, response.statusText, isJSONResponse ? errorObject : responseText);
  }
  return {
    data: null,
    error: __spreadProps(__spreadValues({}, errorObject), {
      status: response.status,
      statusText: response.statusText
    })
  };
};

// node_modules/better-auth/dist/client/config.mjs
var getClientConfig = (options, loadEnv) => {
  const isCredentialsSupported = "credentials" in Request.prototype;
  const baseURL = getBaseURL(options?.baseURL, options?.basePath, undefined, loadEnv) ?? "/api/auth";
  const pluginsFetchPlugins = options?.plugins?.flatMap((plugin) => plugin.fetchPlugins).filter((pl) => pl !== undefined) || [];
  const lifeCyclePlugin = {
    id: "lifecycle-hooks",
    name: "lifecycle-hooks",
    hooks: {
      onSuccess: options?.fetchOptions?.onSuccess,
      onError: options?.fetchOptions?.onError,
      onRequest: options?.fetchOptions?.onRequest,
      onResponse: options?.fetchOptions?.onResponse
    }
  };
  const { onSuccess: _onSuccess, onError: _onError, onRequest: _onRequest, onResponse: _onResponse, ...restOfFetchOptions } = options?.fetchOptions || {};
  const $fetch = createFetch({
    baseURL,
    ...isCredentialsSupported ? { credentials: "include" } : {},
    method: "GET",
    jsonParser(text) {
      if (!text)
        return null;
      return parseJSON(text, { strict: false });
    },
    customFetchImpl: fetch,
    ...restOfFetchOptions,
    plugins: [
      lifeCyclePlugin,
      ...restOfFetchOptions.plugins || [],
      ...options?.disableDefaultFetchPlugins ? [] : [redirectPlugin],
      ...pluginsFetchPlugins
    ]
  });
  const { $sessionSignal, session } = getSessionAtom($fetch, options);
  const plugins = options?.plugins || [];
  let pluginsActions = {};
  let pluginsAtoms = {
    $sessionSignal,
    session
  };
  let pluginPathMethods = {
    "/sign-out": "POST",
    "/revoke-sessions": "POST",
    "/revoke-other-sessions": "POST",
    "/delete-user": "POST"
  };
  const atomListeners = [{
    signal: "$sessionSignal",
    matcher(path) {
      return path === "/sign-out" || path === "/update-user" || path === "/sign-up/email" || path === "/sign-in/email" || path === "/delete-user" || path === "/verify-email" || path === "/revoke-sessions" || path === "/revoke-session" || path === "/change-email";
    }
  }];
  for (const plugin of plugins) {
    if (plugin.getAtoms)
      Object.assign(pluginsAtoms, plugin.getAtoms?.($fetch));
    if (plugin.pathMethods)
      Object.assign(pluginPathMethods, plugin.pathMethods);
    if (plugin.atomListeners)
      atomListeners.push(...plugin.atomListeners);
  }
  const $store = {
    notify: (signal) => {
      pluginsAtoms[signal].set(!pluginsAtoms[signal].get());
    },
    listen: (signal, listener) => {
      pluginsAtoms[signal].subscribe(listener);
    },
    atoms: pluginsAtoms
  };
  for (const plugin of plugins)
    if (plugin.getActions)
      Object.assign(pluginsActions, plugin.getActions?.($fetch, $store, options));
  return {
    get baseURL() {
      return baseURL;
    },
    pluginsActions,
    pluginsAtoms,
    pluginPathMethods,
    atomListeners,
    $fetch,
    $store
  };
};

// node_modules/better-auth/dist/utils/is-atom.mjs
function isAtom(value) {
  return typeof value === "object" && value !== null && "get" in value && typeof value.get === "function" && "lc" in value && typeof value.lc === "number";
}

// node_modules/better-auth/dist/client/proxy.mjs
function getMethod2(path, knownPathMethods, args) {
  const method = knownPathMethods[path];
  const { fetchOptions, query: _query, ...body } = args || {};
  if (method)
    return method;
  if (fetchOptions?.method)
    return fetchOptions.method;
  if (body && Object.keys(body).length > 0)
    return "POST";
  return "GET";
}
function createDynamicPathProxy(routes, client, knownPathMethods, atoms, atomListeners) {
  function createProxy(path = []) {
    return new Proxy(function() {}, {
      get(_, prop) {
        if (typeof prop !== "string")
          return;
        if (prop === "then" || prop === "catch" || prop === "finally")
          return;
        const fullPath = [...path, prop];
        let current = routes;
        for (const segment of fullPath)
          if (current && typeof current === "object" && segment in current)
            current = current[segment];
          else {
            current = undefined;
            break;
          }
        if (typeof current === "function")
          return current;
        if (isAtom(current))
          return current;
        return createProxy(fullPath);
      },
      apply: async (_, __, args) => {
        const routePath = "/" + path.map((segment) => segment.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)).join("/");
        const arg = args[0] || {};
        const fetchOptions = args[1] || {};
        const { query, fetchOptions: argFetchOptions, ...body } = arg;
        const options = {
          ...fetchOptions,
          ...argFetchOptions
        };
        const method = getMethod2(routePath, knownPathMethods, arg);
        return await client(routePath, {
          ...options,
          body: method === "GET" ? undefined : {
            ...body,
            ...options?.body || {}
          },
          query: query || options?.query,
          method,
          async onSuccess(context) {
            await options?.onSuccess?.(context);
            if (!atomListeners || options.disableSignal)
              return;
            const matches = atomListeners.filter((s) => s.matcher(routePath));
            if (!matches.length)
              return;
            for (const match of matches) {
              const signal = atoms[match.signal];
              if (!signal)
                return;
              const val = signal.get();
              setTimeout(() => {
                signal.set(!val);
              }, 10);
            }
          }
        });
      }
    });
  }
  return createProxy();
}

// node_modules/better-auth/dist/client/vanilla.mjs
function createAuthClient(options) {
  const { pluginPathMethods, pluginsActions, pluginsAtoms, $fetch, atomListeners, $store } = getClientConfig(options);
  let resolvedHooks = {};
  for (const [key, value] of Object.entries(pluginsAtoms))
    resolvedHooks[`use${capitalizeFirstLetter(key)}`] = value;
  return createDynamicPathProxy({
    ...pluginsActions,
    ...resolvedHooks,
    $fetch,
    $store
  }, $fetch, pluginPathMethods, pluginsAtoms, atomListeners);
}

// node_modules/better-auth/dist/plugins/access/access.mjs
function role(statements) {
  return {
    authorize(request, connector = "AND") {
      let success = false;
      for (const [requestedResource, requestedActions] of Object.entries(request)) {
        const allowedActions = statements[requestedResource];
        if (!allowedActions)
          return {
            success: false,
            error: `You are not allowed to access resource: ${requestedResource}`
          };
        if (Array.isArray(requestedActions))
          success = requestedActions.every((requestedAction) => allowedActions.includes(requestedAction));
        else if (typeof requestedActions === "object") {
          const actions = requestedActions;
          if (actions.connector === "OR")
            success = actions.actions.some((requestedAction) => allowedActions.includes(requestedAction));
          else
            success = actions.actions.every((requestedAction) => allowedActions.includes(requestedAction));
        } else
          throw new BetterAuthError("Invalid access control request");
        if (success && connector === "OR")
          return { success };
        if (!success && connector === "AND")
          return {
            success: false,
            error: `unauthorized to access resource "${requestedResource}"`
          };
      }
      if (success)
        return { success };
      return {
        success: false,
        error: "Not authorized"
      };
    },
    statements
  };
}
function createAccessControl(s) {
  return {
    newRole(statements) {
      return role(statements);
    },
    statements: s
  };
}

// node_modules/better-auth/dist/plugins/admin/access/statement.mjs
var defaultStatements = {
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "delete",
    "set-password",
    "get",
    "update"
  ],
  session: [
    "list",
    "revoke",
    "delete"
  ]
};
var defaultAc = createAccessControl(defaultStatements);
var adminAc = defaultAc.newRole({
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "delete",
    "set-password",
    "get",
    "update"
  ],
  session: [
    "list",
    "revoke",
    "delete"
  ]
});
var userAc = defaultAc.newRole({
  user: [],
  session: []
});
var defaultRoles = {
  admin: adminAc,
  user: userAc
};

// node_modules/better-auth/dist/plugins/admin/has-permission.mjs
var hasPermission = (input) => {
  if (input.userId && input.options?.adminUserIds?.includes(input.userId))
    return true;
  if (!input.permissions && !input.permission)
    return false;
  const roles = (input.role || input.options?.defaultRole || "user").split(",");
  const acRoles = input.options?.roles || defaultRoles;
  for (const role2 of roles)
    if (acRoles[role2]?.authorize(input.permission ?? input.permissions)?.success)
      return true;
  return false;
};

// node_modules/better-auth/dist/plugins/admin/client.mjs
var adminClient = (options) => {
  const roles = {
    admin: adminAc,
    user: userAc,
    ...options?.roles
  };
  return {
    id: "admin-client",
    $InferServerPlugin: {},
    getActions: () => ({ admin: { checkRolePermission: (data) => {
      return hasPermission({
        role: data.role,
        options: {
          ac: options?.ac,
          roles
        },
        permissions: data.permissions ?? data.permission
      });
    } } }),
    pathMethods: {
      "/admin/list-users": "GET",
      "/admin/stop-impersonating": "POST"
    }
  };
};

// node_modules/better-auth/dist/plugins/organization/access/statement.mjs
var defaultStatements2 = {
  organization: ["update", "delete"],
  member: [
    "create",
    "update",
    "delete"
  ],
  invitation: ["create", "cancel"],
  team: [
    "create",
    "update",
    "delete"
  ],
  ac: [
    "create",
    "read",
    "update",
    "delete"
  ]
};
var defaultAc2 = createAccessControl(defaultStatements2);
var adminAc2 = defaultAc2.newRole({
  organization: ["update"],
  invitation: ["create", "cancel"],
  member: [
    "create",
    "update",
    "delete"
  ],
  team: [
    "create",
    "update",
    "delete"
  ],
  ac: [
    "create",
    "read",
    "update",
    "delete"
  ]
});
var ownerAc = defaultAc2.newRole({
  organization: ["update", "delete"],
  member: [
    "create",
    "update",
    "delete"
  ],
  invitation: ["create", "cancel"],
  team: [
    "create",
    "update",
    "delete"
  ],
  ac: [
    "create",
    "read",
    "update",
    "delete"
  ]
});
var memberAc = defaultAc2.newRole({
  organization: [],
  member: [],
  invitation: [],
  team: [],
  ac: ["read"]
});

// src/auth-client.js
var authClient = createAuthClient({
  plugins: [adminClient()]
});

// src/auth-validation.js
var passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return "Password is required.";
  }
  if (!passwordRegex.test(password)) {
    return "Password must be at least 8 characters long and contain at least 1 uppercase letter and 1 number.";
  }
  return null;
}

// src/components/rm-add-user-modal.js
class RmAddUserModal extends LitElement {
  static properties = {
    isOpen: { type: Boolean },
    _isLoading: { state: true },
    _errorMessage: { state: true },
    _successMessage: { state: true },
    _formData: { state: true },
    _passwordError: { state: true }
  };
  static styles = css`
    :host {
      display: block;
      font-family: sans-serif;
    }
    .text-red-600 {
      color: #dc2626;
    }
    .text-xs {
      font-size: 0.75rem;
    }
    .mt-1 {
      margin-top: 0.25rem;
    }
  `;
  constructor() {
    super();
    this.isOpen = false;
    this._isLoading = false;
    this._errorMessage = "";
    this._successMessage = "";
    this._passwordError = null;
    this._formData = {
      name: "",
      email: "",
      password: this._generateStrongPassword(),
      role: "user",
      requiresPasswordChange: true
    };
  }
  _generateStrongPassword() {
    const length = 12;
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const numbers = "23456789";
    const all = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
    let result = "";
    result += upper.charAt(Math.floor(Math.random() * upper.length));
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    for (let i = 2;i < length; i++) {
      result += all.charAt(Math.floor(Math.random() * all.length));
    }
    return result.split("").sort(() => 0.5 - Math.random()).join("");
  }
  _regeneratePassword() {
    const newPass = this._generateStrongPassword();
    this._formData = { ...this._formData, password: newPass };
    this._passwordError = null;
    this.requestUpdate();
  }
  _handleInput(e) {
    const { name, value, type, checked } = e.target;
    this._formData = {
      ...this._formData,
      [name]: type === "checkbox" ? checked : value
    };
    if (name === "password") {
      this._passwordError = validatePassword(value);
    }
    this.requestUpdate();
  }
  _getMailtoLink() {
    const subject = encodeURIComponent("Sign up credentials for BunStarter");
    const body = encodeURIComponent(`Hello ${this._formData.name || "User"},

Here are your login credentials for BunStarter:

URL: ${window.location.origin}
Email: ${this._formData.email}
Password: ${this._formData.password}

Please log in and change your password immediately.`);
    return `mailto:${this._formData.email}?subject=${subject}&body=${body}`;
  }
  async _handleSubmit(e) {
    e.preventDefault();
    this._isLoading = true;
    this._errorMessage = "";
    this._successMessage = "";
    const validationError = validatePassword(this._formData.password);
    if (validationError) {
      this._passwordError = validationError;
      this._isLoading = false;
      return;
    }
    try {
      const hours = parseInt("48");
      let expiresAt = null;
      if (this._formData.requiresPasswordChange) {
        expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
      }
      const { data, error } = await authClient.admin.createUser({
        name: this._formData.name,
        email: this._formData.email,
        password: this._formData.password,
        role: this._formData.role,
        data: {
          requiresPasswordChange: this._formData.requiresPasswordChange,
          tempPasswordExpiresAt: expiresAt
        }
      });
      if (error) {
        throw new Error(error.message);
      }
      this._successMessage = "User created successfully!";
      this.dispatchEvent(new CustomEvent("user-added", {
        detail: { user: data },
        bubbles: true,
        composed: true
      }));
      setTimeout(() => {
        this._resetForm();
        this._close();
      }, 1500);
    } catch (err) {
      this._errorMessage = err.message || "Failed to create user.";
    } finally {
      this._isLoading = false;
    }
  }
  _close() {
    this.isOpen = false;
    this.dispatchEvent(new Event("close-modal"));
  }
  _resetForm() {
    this._formData = {
      name: "",
      email: "",
      password: this._generateStrongPassword(),
      role: "user",
      requiresPasswordChange: true
    };
    this._errorMessage = "";
    this._successMessage = "";
    this._passwordError = null;
  }
  render() {
    const overlayState = this.isOpen ? "opacity-100 pointer-events-auto visible" : "opacity-0 pointer-events-none invisible";
    return html`
      <link rel="stylesheet" href="/styles/output.css" />

      <div
        class="${overlayState} fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all duration-200"
        @click="${(e) => {
      if (e.target === e.currentTarget)
        this._close();
    }}"
      >
        <div
          class="relative mx-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-xl"
        >
          <button
            @click="${this._close}"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>

          <h2 class="mb-6 text-2xl font-bold text-gray-800">Add New User</h2>

          ${this._errorMessage ? html`
                <div class="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  ${this._errorMessage}
                </div>
              ` : ""}
          ${this._successMessage ? html`
                <div
                  class="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-600"
                >
                  ${this._successMessage}
                </div>
              ` : ""}

          <form @submit="${this._handleSubmit}">
            <div class="mb-4">
              <label for="name" class="mb-2 block text-sm font-medium text-gray-600"
                >Full Name</label
              >
              <input
                type="text"
                id="name"
                name="name"
                .value="${this._formData.name}"
                @input="${this._handleInput}"
                required
                placeholder="e.g. Jane Doe"
                class="focus:ring-primary-200 focus:border-primary-500 w-full rounded border border-gray-300 p-3 transition duration-200 focus:ring-2 focus:outline-none"
              />
            </div>

            <div class="mb-4">
              <label for="email" class="mb-2 block text-sm font-medium text-gray-600"
                >Email Address</label
              >
              <input
                type="email"
                id="email"
                name="email"
                .value="${this._formData.email}"
                @input="${this._handleInput}"
                required
                placeholder="user@example.com"
                class="focus:ring-primary-200 focus:border-primary-500 w-full rounded border border-gray-300 p-3 transition duration-200 focus:ring-2 focus:outline-none"
              />
            </div>

            <div class="mb-4">
              <div class="mb-2 flex items-center justify-between">
                <label for="add-user-password" class="block text-sm font-medium text-gray-600"
                  >Temporary Password</label
                >
                ${this._formData.email && this._formData.password ? html`
                      <a
                        href="${this._getMailtoLink()}"
                        class="text-primary-600 hover:text-primary-800 flex items-center gap-1 text-xs font-semibold"
                        target="_blank"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Email Credentials
                      </a>
                    ` : ""}
              </div>

              <div class="flex gap-2">
                <input
                  type="text"
                  id="add-user-password"
                  name="password"
                  .value="${this._formData.password}"
                  @input="${this._handleInput}"
                  required
                  class="focus:ring-primary-200 focus:border-primary-500 ${this._passwordError ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""} flex-1 rounded border border-gray-300 p-3 font-mono text-sm tracking-wider transition duration-200 focus:ring-2 focus:outline-none"
                />
                <button
                  type="button"
                  @click="${this._regeneratePassword}"
                  class="rounded border border-gray-300 bg-gray-100 px-3 text-gray-600 transition-colors hover:bg-gray-200"
                  title="Regenerate Password"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>

              ${this._passwordError ? html`<p class="mt-1 text-xs text-red-600">${this._passwordError}</p>` : html`<p class="mt-1 text-xs text-gray-400">
                    Must be 8+ chars, include 1 uppercase & 1 number.
                  </p>`}
            </div>

            <div class="mb-4">
              <label for="role" class="mb-2 block text-sm font-medium text-gray-600">Role</label>
              <select
                id="role"
                name="role"
                @change="${this._handleInput}"
                class="focus:ring-primary-200 focus:border-primary-500 w-full rounded border border-gray-300 bg-white p-3 transition duration-200 focus:ring-2 focus:outline-none"
              >
                <option value="user" ?selected="${this._formData.role === "user"}">User</option>
                <option value="admin" ?selected="${this._formData.role === "admin"}">Admin</option>
              </select>
            </div>

            <div class="mb-6 flex items-center gap-2">
              <input
                type="checkbox"
                id="forceReset"
                name="requiresPasswordChange"
                .checked="${this._formData.requiresPasswordChange}"
                @change="${this._handleInput}"
                class="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
              />
              <label for="forceReset" class="cursor-pointer text-sm text-gray-600 select-none">
                Force password change on first login
              </label>
            </div>

            <div class="mt-8 flex justify-end gap-3">
              <rm-button
                aria-label="Add User cancel button"
                type="button"
                @click="${this._close}"
                outline
              >
                Cancel
              </rm-button>
              <rm-button
                aria-label="Create user button"
                type="submit"
                ?disabled="${this._isLoading || this._passwordError}"
              >
                ${this._isLoading ? "Creating..." : "Create User"}
              </rm-button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}
customElements.define("rm-add-user-modal", RmAddUserModal);

// src/components/rm-reset-password-modal.js
class RmResetPasswordModal extends LitElement {
  static properties = {
    isOpen: { type: Boolean },
    user: { type: Object },
    _isLoading: { state: true },
    _errorMessage: { state: true },
    _successMessage: { state: true },
    _password: { state: true },
    _passwordError: { state: true }
  };
  static styles = css`
    :host {
      display: block;
      font-family: sans-serif;
    }
    .text-red-600 {
      color: #dc2626;
    }
    .text-xs {
      font-size: 0.75rem;
    }
    .mt-1 {
      margin-top: 0.25rem;
    }
  `;
  constructor() {
    super();
    this.isOpen = false;
    this.user = null;
    this._isLoading = false;
    this._errorMessage = "";
    this._successMessage = "";
    this._passwordError = null;
    this._password = this._generateStrongPassword();
  }
  updated(changedProperties) {
    if (changedProperties.has("isOpen") && this.isOpen) {
      this._resetFormState();
    }
  }
  _generateStrongPassword() {
    const length = 12;
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const numbers = "23456789";
    const all = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
    let result = "";
    result += upper.charAt(Math.floor(Math.random() * upper.length));
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    for (let i = 2;i < length; i++) {
      result += all.charAt(Math.floor(Math.random() * all.length));
    }
    return result.split("").sort(() => 0.5 - Math.random()).join("");
  }
  _regeneratePassword() {
    this._password = this._generateStrongPassword();
    this._passwordError = null;
    this.requestUpdate();
  }
  _handlePasswordInput(e) {
    this._password = e.target.value;
    this._passwordError = validatePassword(this._password);
  }
  _getMailtoLink() {
    if (!this.user)
      return "#";
    const subject = encodeURIComponent("Password Reset for BunStarter");
    const body = encodeURIComponent(`Hello ${this.user.name || "User"},

Your password has been reset.

URL: ${window.location.origin}
Email: ${this.user.email}
Password: ${this._password}

Please log in and change your password immediately.`);
    return `mailto:${this.user.email}?subject=${subject}&body=${body}`;
  }
  async _handleSubmit(e) {
    e.preventDefault();
    if (!this.user || !this.user.id) {
      this._errorMessage = "User ID is missing";
      return;
    }
    this._isLoading = true;
    this._errorMessage = "";
    this._successMessage = "";
    const validationError = validatePassword(this._password);
    if (validationError) {
      this._passwordError = validationError;
      this._isLoading = false;
      return;
    }
    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: this.user.id,
          newPassword: this._password
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }
      this._successMessage = "Password reset successfully!";
      setTimeout(() => {
        this._close();
      }, 1500);
    } catch (err) {
      this._errorMessage = err.message || "Failed to reset password.";
    } finally {
      this._isLoading = false;
    }
  }
  _close() {
    this.isOpen = false;
    this.dispatchEvent(new Event("close-modal"));
  }
  _resetFormState() {
    this._password = this._generateStrongPassword();
    this._errorMessage = "";
    this._successMessage = "";
    this._passwordError = null;
  }
  render() {
    const overlayState = this.isOpen ? "opacity-100 pointer-events-auto visible" : "opacity-0 pointer-events-none invisible";
    const userData = this.user || { name: "", email: "", role: "" };
    return html`
      <link rel="stylesheet" href="/styles/output.css" />

      <div
        class="${overlayState} fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all duration-200"
        @click="${(e) => {
      if (e.target === e.currentTarget)
        this._close();
    }}"
      >
        <div
          class="relative mx-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-xl"
        >
          <button
            @click="${this._close}"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>

          <h2 class="mb-6 text-2xl font-bold text-gray-800">Reset Password</h2>

          ${this._errorMessage ? html`
                <div class="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  ${this._errorMessage}
                </div>
              ` : ""}
          ${this._successMessage ? html`
                <div
                  class="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-600"
                >
                  ${this._successMessage}
                </div>
              ` : ""}

          <form @submit="${this._handleSubmit}">
            <div class="mb-4">
              <label class="mb-2 block text-sm font-medium text-gray-600">Full Name</label>
              <input
                type="text"
                .value="${userData.name}"
                disabled
                class="w-full cursor-not-allowed rounded border border-gray-200 bg-gray-50 p-3 text-gray-500"
              />
            </div>

            <div class="mb-4">
              <label class="mb-2 block text-sm font-medium text-gray-600">Email Address</label>
              <input
                type="email"
                .value="${userData.email}"
                disabled
                class="w-full cursor-not-allowed rounded border border-gray-200 bg-gray-50 p-3 text-gray-500"
              />
            </div>

            <div class="mb-4">
              <div class="mb-2 flex items-center justify-between">
                <label for="reset-temp-password" class="block text-sm font-medium text-gray-600"
                  >New Temporary Password</label
                >
                <a
                  href="${this._getMailtoLink()}"
                  class="text-primary-600 hover:text-primary-800 flex items-center gap-1 text-xs font-semibold"
                  target="_blank"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Email New Password
                </a>
              </div>

              <div class="flex gap-2">
                <input
                  type="text"
                  id="reset-temp-password"
                  name="password"
                  .value="${this._password}"
                  @input="${this._handlePasswordInput}"
                  required
                  class="focus:ring-primary-200 focus:border-primary-500 ${this._passwordError ? "border-red-500" : "border-gray-300"} flex-1 rounded border p-3 font-mono text-sm tracking-wider transition duration-200 focus:ring-2 focus:outline-none"
                />
                <button
                  type="button"
                  @click="${this._regeneratePassword}"
                  class="rounded border border-gray-300 bg-gray-100 px-3 text-gray-600 transition-colors hover:bg-gray-200"
                  title="Regenerate"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
              ${this._passwordError ? html`<p class="mt-1 text-xs text-red-600">${this._passwordError}</p>` : html`<p class="mt-1 text-xs text-gray-400">
                    Must be 8+ chars, include 1 uppercase & 1 number.
                  </p>`}
            </div>

            <div class="mb-4">
              <label class="mb-2 block text-sm font-medium text-gray-600">Role</label>
              <input
                type="text"
                .value="${userData.role}"
                disabled
                class="w-full cursor-not-allowed rounded border border-gray-200 bg-gray-50 p-3 text-gray-500 capitalize"
              />
            </div>

            <div class="mb-6 flex items-center gap-2">
              <input
                type="checkbox"
                checked
                disabled
                class="text-primary-400 h-4 w-4 cursor-not-allowed rounded border-gray-300 bg-gray-100"
              />
              <label class="text-sm text-gray-500 select-none">
                Force password change on next login (Required)
              </label>
            </div>

            <div class="mt-8 flex justify-end gap-3">
              <rm-button aria-label="Cancel reset user passwrod" outline @click="${this._close}">
                Cancel
              </rm-button>

              <rm-button
                aria-label="Comfirm reset of user password"
                type="submit"
                primary
                ?disabled="${this._isLoading || !!this._passwordError}"
              >
                ${this._isLoading ? "Saving..." : "Reset Password"}
              </rm-button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}
customElements.define("rm-reset-password-modal", RmResetPasswordModal);

// src/components/rm-delete-user-modal.js
class RmDeleteUserModal extends LitElement {
  static properties = {
    isOpen: { type: Boolean },
    user: { type: Object },
    _isLoading: { state: true },
    _errorMessage: { state: true },
    _successMessage: { state: true }
  };
  static styles = css`
    :host {
      display: block;
      font-family: sans-serif;
    }
    .text-red-600 {
      color: #dc2626;
    }
  `;
  constructor() {
    super();
    this.isOpen = false;
    this.user = null;
    this._isLoading = false;
    this._errorMessage = "";
    this._successMessage = "";
  }
  updated(changedProperties) {
    if (changedProperties.has("isOpen") && this.isOpen) {
      this._errorMessage = "";
      this._successMessage = "";
    }
  }
  _close() {
    if (this._isLoading)
      return;
    this.isOpen = false;
    this.dispatchEvent(new Event("close"));
  }
  async _handleDelete() {
    if (!this.user || !this.user.id) {
      this._errorMessage = "User ID is missing";
      return;
    }
    const confirmed = window.confirm(`Are you strictly sure you want to delete ${this.user.name}? This cannot be undone.`);
    if (!confirmed)
      return;
    this._isLoading = true;
    this._errorMessage = "";
    try {
      const response = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: this.user.id })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Deletion failed");
      }
      this._successMessage = "User deleted successfully.";
      this.dispatchEvent(new Event("user-deleted", { bubbles: true, composed: true }));
      setTimeout(() => {
        this._close();
        window.location.reload();
      }, 1000);
    } catch (err) {
      this._errorMessage = err.message || "Failed to delete user.";
    } finally {
      this._isLoading = false;
    }
  }
  render() {
    const overlayState = this.isOpen ? "opacity-100 pointer-events-auto visible" : "opacity-0 pointer-events-none invisible";
    const userData = this.user || { name: "", email: "", role: "" };
    return html`
      <link rel="stylesheet" href="/styles/output.css" />

      <div
        class="${overlayState} fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all duration-200"
        @click="${(e) => {
      if (e.target === e.currentTarget)
        this._close();
    }}"
      >
        <div
          class="relative mx-4 w-full max-w-md rounded-lg border border-red-200 bg-white p-8 shadow-xl"
        >
          <button
            @click="${this._close}"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>

          <h2 class="mb-2 text-2xl font-bold text-red-700">Delete User</h2>
          <p class="mb-6 text-sm text-gray-500">
            This action is permanent and cannot be undone. The user will lose access immediately.
          </p>

          ${this._errorMessage ? html`
                <div class="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  ${this._errorMessage}
                </div>
              ` : ""}
          ${this._successMessage ? html`
                <div
                  class="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-600"
                >
                  ${this._successMessage}
                </div>
              ` : ""}

          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-gray-600">User Name</label>
            <input
              type="text"
              .value="${userData.name}"
              disabled
              class="w-full cursor-not-allowed rounded border border-gray-200 bg-gray-50 p-2 text-gray-500"
            />
          </div>

          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-gray-600">Email Address</label>
            <input
              type="email"
              .value="${userData.email}"
              disabled
              class="w-full cursor-not-allowed rounded border border-gray-200 bg-gray-50 p-2 text-gray-500"
            />
          </div>

          <div class="mb-6">
            <label class="mb-1 block text-sm font-medium text-gray-600">Role</label>
            <input
              type="text"
              .value="${userData.role}"
              disabled
              class="w-full cursor-not-allowed rounded border border-gray-200 bg-gray-50 p-2 text-gray-500 capitalize"
            />
          </div>

          <div class="mt-8 flex justify-end gap-3">
            <rm-button
              aria-label="Cancel User deletion button"
              outline
              @click="${this._close}"
              ?disabled="${this._isLoading}"
            >
              Cancel
            </rm-button>

            <rm-button
              aria-label="Confirm Delete User button"
              danger
              type="button"
              @click="${this._handleDelete}"
              ?disabled="${this._isLoading}"
            >
              ${this._isLoading ? "Deleting..." : "Delete User"}
            </rm-button>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define("rm-delete-user-modal", RmDeleteUserModal);

// src/components/rm-pages-search-modal.js
class RmPagesSearchModal extends LitElement {
  static properties = {
    isOpen: { type: Boolean },
    _query: { state: true },
    _results: { state: true },
    _isLoading: { state: true },
    _error: { state: true },
    _hasSearched: { state: true },
    _totalResults: { state: true },
    _duration: { state: true },
    _isAdmin: { state: true },
    _lastIndexed: { state: true },
    _isReindexing: { state: true },
    _reindexSuccess: { state: true },
    _reindexError: { state: true }
  };
  _searchTimeout = null;
  static MIN_QUERY_LENGTH = 3;
  static DEBOUNCE_MS = 250;
  constructor() {
    super();
    this.isOpen = false;
    this._query = "";
    this._results = [];
    this._isLoading = false;
    this._error = null;
    this._hasSearched = false;
    this._totalResults = 0;
    this._duration = "";
    this._isAdmin = false;
    this._lastIndexed = null;
    this._isReindexing = false;
    this._reindexSuccess = null;
    this._reindexError = null;
  }
  createRenderRoot() {
    return this;
  }
  updated(changedProperties) {
    if (changedProperties.has("isOpen") && this.isOpen) {
      setTimeout(() => {
        const input = this.querySelector("#pages-search-input");
        if (input)
          input.focus();
      }, 50);
      this._checkAdminAndFetchMeta();
    }
    if (changedProperties.has("isOpen") && !this.isOpen) {
      this._resetState();
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._searchTimeout) {
      clearTimeout(this._searchTimeout);
    }
  }
  _resetState() {
    this._query = "";
    this._results = [];
    this._isLoading = false;
    this._error = null;
    this._hasSearched = false;
    this._totalResults = 0;
    this._duration = "";
    if (this._searchTimeout) {
      clearTimeout(this._searchTimeout);
    }
    this._isReindexing = false;
    this._reindexSuccess = null;
    this._reindexError = null;
  }
  async _checkAdminAndFetchMeta() {
    try {
      const response = await fetch("/api/pages/search-meta", {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        this._isAdmin = true;
        this._lastIndexed = data.lastIndexed || null;
      } else if (response.status === 403) {
        this._isAdmin = false;
        this._lastIndexed = null;
      } else {
        this._isAdmin = false;
        this._lastIndexed = null;
      }
    } catch (err) {
      console.error("[Search] Error checking admin status:", err);
      this._isAdmin = false;
      this._lastIndexed = null;
    }
  }
  async _performReindex() {
    if (this._isReindexing)
      return;
    this._isReindexing = true;
    this._reindexSuccess = null;
    this._reindexError = null;
    try {
      const response = await fetch("/api/pages/reindex", {
        method: "POST",
        credentials: "include"
      });
      const data = await response.json();
      if (response.ok && data.success) {
        this._reindexSuccess = `Indexed ${data.indexed} pages in ${data.duration}`;
        this._lastIndexed = new Date().toISOString();
        setTimeout(() => {
          this._reindexSuccess = null;
        }, 5000);
      } else {
        this._reindexError = data.error || "Reindex failed";
      }
    } catch (err) {
      console.error("[Search] Reindex error:", err);
      this._reindexError = err.message || "Reindex failed";
    } finally {
      this._isReindexing = false;
    }
  }
  _formatIndexDate(isoString) {
    if (!isoString)
      return "Never";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime()))
        return "Unknown";
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
      return "Unknown";
    }
  }
  _handleInput(e) {
    this._query = e.target.value;
    if (this._searchTimeout) {
      clearTimeout(this._searchTimeout);
    }
    if (this._query.trim().length < RmPagesSearchModal.MIN_QUERY_LENGTH) {
      this._results = [];
      this._hasSearched = false;
      this._error = null;
      return;
    }
    this._isLoading = true;
    this._searchTimeout = setTimeout(() => {
      this._performSearch();
    }, RmPagesSearchModal.DEBOUNCE_MS);
  }
  _handleSearchClick() {
    if (this._query.trim().length >= RmPagesSearchModal.MIN_QUERY_LENGTH) {
      if (this._searchTimeout) {
        clearTimeout(this._searchTimeout);
      }
      this._performSearch();
    }
  }
  _handleKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      this._emitClose();
    }
    if (e.key === "Enter" && this._query.trim().length >= RmPagesSearchModal.MIN_QUERY_LENGTH) {
      e.preventDefault();
      if (this._searchTimeout) {
        clearTimeout(this._searchTimeout);
      }
      this._performSearch();
    }
  }
  _handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      this._emitClose();
    }
  }
  _emitClose() {
    this.dispatchEvent(new CustomEvent("close", {
      bubbles: true,
      composed: true
    }));
  }
  async _performSearch() {
    const query = this._query.trim();
    if (query.length < RmPagesSearchModal.MIN_QUERY_LENGTH) {
      this._isLoading = false;
      return;
    }
    this._isLoading = true;
    this._error = null;
    try {
      const response = await fetch(`/api/pages/search?q=${encodeURIComponent(query)}`, {
        credentials: "include"
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Search failed: ${response.status}`);
      }
      const data = await response.json();
      if (query === this._query.trim()) {
        this._results = data.results || [];
        this._totalResults = data.total || 0;
        this._duration = data.duration || "";
        this._hasSearched = true;
        this._error = data.error || null;
      }
    } catch (err) {
      console.error("[Search] Error:", err);
      this._error = err.message || "Search failed";
      this._results = [];
    } finally {
      this._isLoading = false;
    }
  }
  _renderResult(result) {
    const url = `/pages/${result.category}/${result.slug}`;
    return html`
      <a
        href="${url}"
        class="group border-primary-100 hover:border-primary-200 block rounded-md border bg-white p-4 shadow-sm transition-all hover:shadow-md"
        @click="${this._emitClose}"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 grow">
            <!-- Category badge and status -->
            <div class="mb-1 flex items-center gap-2">
              <span
                class="bg-primary-100 text-primary-700 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize"
              >
                ${result.category}
              </span>
              ${result.isPrivate ? html`<span
                    class="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                    >Private</span
                  >` : nothing}
              ${result.isUnpublished ? html`<span
                    class="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                    >Unpublished</span
                  >` : nothing}
            </div>

            <!-- Title -->
            <h3
              class="text-primary-800 group-hover:text-primary-600 text-lg leading-tight font-bold"
            >
              ${result.title || "Untitled"}
            </h3>

            <!-- Description -->
            ${result.description ? html`<p class="text-primary-600 mt-1 line-clamp-2 text-sm">
                  ${result.description}
                </p>` : nothing}

            <!-- Match snippets -->
            ${result.matches && result.matches.length > 0 ? html`
                  <div class="mt-2 space-y-1">
                    ${result.matches.map((match) => html`
                        <div class="flex items-start gap-2 text-xs">
                          <span
                            class="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-500 capitalize"
                          >
                            ${match.region}
                          </span>
                          <span
                            class="text-gray-600 [&>mark]:rounded [&>mark]:bg-yellow-200 [&>mark]:px-0.5"
                          >
                            ${this._renderHighlightedFragment(match.fragment)}
                          </span>
                        </div>
                      `)}
                  </div>
                ` : nothing}
          </div>

          <!-- Arrow indicator -->
          <div
            class="text-secondary-600 group-hover:text-secondary-700 hidden shrink-0 items-center gap-1 pl-2 text-sm font-semibold whitespace-nowrap transition-colors sm:flex"
          >
            <span>Read</span>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </div>
        </div>
      </a>
    `;
  }
  _renderHighlightedFragment(fragment) {
    if (!fragment)
      return "";
    return html`<span .innerHTML="${fragment}"></span>`;
  }
  render() {
    if (!this.isOpen)
      return nothing;
    const queryLength = this._query.trim().length;
    const canSearch = queryLength >= RmPagesSearchModal.MIN_QUERY_LENGTH;
    return html`
      <!-- Full-screen modal backdrop -->
      <div
        class="fixed inset-0 z-50 overflow-y-auto bg-black/40"
        @click="${this._handleBackdropClick}"
        @keydown="${this._handleKeydown}"
      >
        <!-- Modal container - centered with max width, viewport-relative height -->
        <div class="flex items-start justify-center p-4 pt-16 sm:pt-20">
          <div
            class="flex w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl"
            style="height: calc(85vh - 5rem);"
            @click="${(e) => e.stopPropagation()}"
          >
            <!-- Header -->
            <div class="shrink-0 border-b border-gray-200 px-6 py-4">
              <div class="flex items-center justify-between">
                <h2 class="text-primary-700 text-2xl font-bold">Search Pages</h2>
                <button
                  @click="${this._emitClose}"
                  class="text-gray-400 transition-colors hover:text-gray-600"
                  title="Close"
                >
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
              <p class="mt-1 text-sm text-gray-600">
                The search string must be ${RmPagesSearchModal.MIN_QUERY_LENGTH} characters or
                longer. The search is across titles, headings, and content.
              </p>
            </div>

            <!-- Search input section -->
            <div class="shrink-0 px-6 py-4">
              <div class="flex gap-3">
                <input
                  id="pages-search-input"
                  type="text"
                  placeholder="Search pages"
                  class="focus:border-primary-500 focus:ring-primary-500 grow rounded-md border border-gray-300 px-4 py-2 text-gray-700 placeholder-gray-400 focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                  .value="${this._query}"
                  @input="${this._handleInput}"
                  @keydown="${this._handleKeydown}"
                  autocomplete="off"
                  spellcheck="false"
                  ?disabled="${this._isReindexing}"
                />
                <button
                  @click="${this._handleSearchClick}"
                  ?disabled="${!canSearch || this._isLoading || this._isReindexing}"
                  class="bg-primary-700 hover:bg-primary-800 rounded-md px-6 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ${this._isLoading ? "Searching..." : "Search Pages"}
                </button>
              </div>
            </div>

            <!-- Results section - fills remaining space -->
            <div class="min-h-0 grow overflow-y-auto border-t border-gray-200 px-6 py-4">
              ${this._error ? html`
                    <div class="rounded-md bg-red-50 p-4 text-sm text-red-700">${this._error}</div>
                  ` : this._hasSearched && this._results.length === 0 ? html`
                      <div class="py-8 text-center text-gray-500">
                        <p class="text-lg">No pages found</p>
                        <p class="mt-1 text-sm">Try different keywords or check your spelling</p>
                      </div>
                    ` : this._results.length > 0 ? html`
                        <div class="mb-3 text-sm text-gray-500">
                          Found ${this._totalResults} result${this._totalResults !== 1 ? "s" : ""}
                          ${this._duration ? html`<span class="text-gray-400">(${this._duration})</span>` : nothing}
                        </div>
                        <div class="space-y-3">
                          ${this._results.map((result) => this._renderResult(result))}
                        </div>
                      ` : html`
                        <div class="py-8 text-center text-gray-500">
                          <p>Enter a search term to find pages</p>
                        </div>
                      `}
            </div>

            <!-- Footer -->
            <div class="shrink-0 border-t border-gray-200 px-6 py-3">
              <div class="flex items-center justify-between">
                <!-- Admin controls (left side) -->
                <div class="flex items-center gap-4">
                  ${this._isAdmin ? html`
                        <!-- Last indexed date -->
                        <span class="text-primary-400 text-xs">
                          Date last indexed: ${this._formatIndexDate(this._lastIndexed)}
                        </span>

                        <!-- Reindex button/link -->
                        ${this._isReindexing ? html`
                              <span class="text-primary-500 flex items-center gap-2 text-xs">
                                <span
                                  class="border-primary-300 border-t-primary-600 inline-block h-3 w-3 animate-spin rounded-full border-2"
                                ></span>
                                Reindexing...
                              </span>
                            ` : html`
                              <button
                                @click="${this._performReindex}"
                                class="text-secondary-600 hover:text-secondary-800 text-xs transition-colors hover:underline"
                              >
                                re-index now
                              </button>
                            `}

                        <!-- Success message -->
                        ${this._reindexSuccess ? html`
                              <span class="text-xs text-green-600">
                                ✓ ${this._reindexSuccess}
                              </span>
                            ` : nothing}

                        <!-- Error message -->
                        ${this._reindexError ? html`
                              <span class="text-xs text-red-600"> ✗ ${this._reindexError} </span>
                            ` : nothing}
                      ` : nothing}
                </div>

                <!-- Close button (right side) -->
                <button
                  @click="${this._emitClose}"
                  class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define("rm-pages-search-modal", RmPagesSearchModal);

// src/components/rm-nav-header-pages.js
class RmHeader extends LitElement {
  static properties = {
    _isDrawerOpen: { state: true },
    _isMenuOpen: { state: true },
    _isPagesOpen: { state: true },
    _pageCategories: { state: true },
    _isSearchOpen: { state: true },
    _isSignOutModalOpen: { state: true },
    _isAddUserModalOpen: { state: true },
    _isResetPasswordModalOpen: { state: true },
    _resetPasswordUser: { state: true },
    _isDeleteUserModalOpen: { state: true },
    _deleteUserTarget: { state: true },
    isSignedIn: { type: Boolean },
    userRole: { type: String }
  };
  constructor() {
    super();
    this._isDrawerOpen = false;
    this._isMenuOpen = false;
    this._isPagesOpen = false;
    this._pageCategories = [];
    this._isSearchOpen = false;
    this._isSignOutModalOpen = false;
    this._isAddUserModalOpen = false;
    this._isResetPasswordModalOpen = false;
    this._resetPasswordUser = null;
    this._isDeleteUserModalOpen = false;
    this._deleteUserTarget = null;
    this.isSignedIn = false;
    this.userRole = null;
  }
  createRenderRoot() {
    return this;
  }
  async connectedCallback() {
    super.connectedCallback();
    window.addEventListener("auth-changed", this._handleAuthChange.bind(this));
    window.addEventListener("request-password-reset", this._handleResetPasswordRequest.bind(this));
    window.addEventListener("request-delete-user", this._handleDeleteUserRequest.bind(this));
    await this._checkSession();
    await this._fetchPageCategories();
  }
  disconnectedCallback() {
    window.removeEventListener("auth-changed", this._handleAuthChange.bind(this));
    window.removeEventListener("request-password-reset", this._handleResetPasswordRequest.bind(this));
    window.removeEventListener("request-delete-user", this._handleDeleteUserRequest.bind(this));
    super.disconnectedCallback();
  }
  async _fetchPageCategories() {
    try {
      const response = await fetch("/api/pages-config");
      if (response.ok) {
        this._pageCategories = await response.json();
      } else {
        console.warn("Could not fetch pages config");
        this._pageCategories = [];
      }
    } catch (error) {
      console.error("Error fetching pages config:", error);
      this._pageCategories = [];
    }
  }
  _handleResetPasswordRequest(e) {
    this._resetPasswordUser = e.detail || null;
    this._isMenuOpen = false;
    this._isResetPasswordModalOpen = true;
  }
  _handleDeleteUserRequest(e) {
    this._deleteUserTarget = e.detail || null;
    this._isMenuOpen = false;
    this._isDeleteUserModalOpen = true;
  }
  async _checkSession() {
    try {
      const { data } = await authClient.getSession();
      if (data) {
        this.isSignedIn = true;
        this.userRole = data.user.role || "user";
      } else {
        this.isSignedIn = false;
        this.userRole = null;
      }
    } catch (error) {
      console.error("Failed to check session:", error);
      this.isSignedIn = false;
      this.userRole = null;
    }
  }
  _handleAuthChange(e) {
    this.isSignedIn = e.detail.signedIn;
    if (this.isSignedIn) {
      this._checkSession();
    } else {
      this.userRole = null;
    }
  }
  toggleDrawer() {
    this._isDrawerOpen = !this._isDrawerOpen;
  }
  toggleMenu() {
    this._isMenuOpen = !this._isMenuOpen;
    if (this._isMenuOpen) {
      this._isPagesOpen = false;
    }
  }
  togglePages() {
    this._isPagesOpen = !this._isPagesOpen;
    if (this._isPagesOpen) {
      this._isMenuOpen = false;
    }
  }
  openSearchModal() {
    this._isPagesOpen = false;
    this._isSearchOpen = true;
  }
  closeSearchModal() {
    this._isSearchOpen = false;
  }
  openAddUserModal() {
    this._isMenuOpen = false;
    this._isAddUserModalOpen = true;
  }
  closeAddUserModal() {
    this._isAddUserModalOpen = false;
  }
  closeResetPasswordModal() {
    this._isResetPasswordModalOpen = false;
    this._resetPasswordUser = null;
  }
  closeDeleteUserModal() {
    this._isDeleteUserModalOpen = false;
    this._deleteUserTarget = null;
  }
  openSignOutModal() {
    this._isMenuOpen = false;
    this._isSignOutModalOpen = true;
  }
  closeSignOutModal() {
    this._isSignOutModalOpen = false;
  }
  async performSignOut() {
    try {
      await authClient.signOut();
      localStorage.removeItem("user_email");
      this.isSignedIn = false;
      this.userRole = null;
      this._isSignOutModalOpen = false;
      window.location.href = "/";
    } catch (error) {
      this._isSignOutModalOpen = false;
    }
  }
  render() {
    const currentPath = window.location.pathname;
    const getHeaderLinkClass = (path) => {
      const baseClass = "hover:text-white transition-colors duration-200 cursor-pointer";
      const isActive = currentPath === path || path !== "/" && currentPath.startsWith(path);
      return isActive ? `${baseClass} underline font-semibold text-white` : `${baseClass} text-primary-100`;
    };
    const getDrawerLinkClass = (path) => {
      const baseClass = "block px-4 py-2 rounded transition-colors text-sm";
      const isActive = currentPath === path || path !== "/" && currentPath.startsWith(path);
      return isActive ? `${baseClass} font-bold text-secondary-700 bg-secondary-50` : `${baseClass} text-primary-600 hover:bg-primary-100`;
    };
    const isAdmin = this.isSignedIn && this.userRole === "admin";
    const hasPages = this._pageCategories && this._pageCategories.length > 0;
    return html`
      <header class="bg-primary-700 relative z-30 text-white shadow-md">
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-2 sm:gap-4">
            <button
              aria-label="Hamburger menu button to open drawer on mobile"
              @click="${this.toggleDrawer}"
              class="hover:bg-primary-600 rounded p-1 focus:outline-none sm:hidden"
            >
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
            <img
              src="/media/redmug_logo_316x316.png"
              alt="Redmug Logo"
              class="relative -top-0.75 h-10 w-auto object-contain"
            />
            <span class="text-xl font-bold tracking-tight whitespace-nowrap text-white">Pages</span>
          </div>

          <div class="flex items-center gap-2 sm:gap-4">
            <nav class="mr-2 hidden items-center gap-6 text-sm sm:flex">
              <a href="/" class="${getHeaderLinkClass("/")}">Home</a>
              ${hasPages ? html`
                    <div class="relative">
                      <button
                        aria-label="Button to access Pages and Blogs"
                        @click="${this.togglePages}"
                        class="${this._isPagesOpen ? "text-white" : "text-primary-100"} flex items-center gap-1 transition-colors hover:text-white focus:outline-none"
                      >
                        Content
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </button>
                      ${this._isPagesOpen ? html`
                            <div
                              class="fixed inset-0 z-40 cursor-default"
                              @click="${() => this._isPagesOpen = false}"
                            ></div>
                            <div
                              class="text-primary-800 absolute right-0 z-50 mt-2 w-56 rounded-md bg-white py-2 shadow-lg ring-1 ring-black/5"
                            >
                              <div
                                class="border-primary-700 bg-primary-100 text-primary-500 border-b px-4 py-2 text-xs font-bold tracking-wider uppercase"
                              >
                                Content
                              </div>
                              ${this._pageCategories.map((cat) => html`
                                  <a
                                    href="/pages/${cat.name}"
                                    class="text-primary-700 hover:bg-primary-50 block px-4 py-2 text-sm capitalize"
                                  >
                                    ${cat.name}
                                  </a>
                                `)}

                              <!-- Search pages option -->
                              <div class="border-primary-100 mt-1 border-t pt-1">
                                <button
                                  @click="${this.openSearchModal}"
                                  class="text-primary-700 hover:bg-primary-50 flex w-full items-center gap-2 px-4 py-2 text-left text-sm"
                                >
                                  <svg
                                    class="text-primary-400 h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    ></path>
                                  </svg>
                                  Search pages
                                </button>
                              </div>
                            </div>
                          ` : nothing}
                    </div>
                  ` : nothing}
              <a href="/about.html" class="${getHeaderLinkClass("/about.html")}">About</a>
            </nav>

            <div class="relative">
              <button
                aria-label="Button to access admin sub menu - sign in  and sign out"
                @click="${this.toggleMenu}"
                class="hover:bg-primary-600 rounded p-1 focus:outline-none"
              >
                <svg
                  class="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  ></path>
                </svg>
              </button>
              ${this._isMenuOpen ? html`
                    <div
                      class="fixed inset-0 z-40 cursor-default"
                      @click="${() => this._isMenuOpen = false}"
                    ></div>
                    <div
                      class="text-primary-800 absolute right-0 z-50 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5"
                    >
                      ${isAdmin ? html`<div
                              class="border-primary-700 bg-primary-100 text-primary-500 border-b px-4 py-2 text-xs font-bold tracking-wider uppercase"
                            >
                              User admin
                            </div>
                            <button
                              aria-label="Add new user button"
                              @click="${this.openAddUserModal}"
                              class="text-primary-800 hover:bg-primary-100 w-full px-4 py-2 text-left text-sm"
                            >
                              Add new user</button
                            ><a
                              href="/users-list.html"
                              class="hover:bg-primary-100 block px-4 py-2 text-sm"
                              >List users</a
                            >
                            <hr class="border-primary-100 my-1" />` : nothing}
                      ${!this.isSignedIn ? html`<a
                            href="/login.html"
                            class="hover:bg-primary-100 block px-4 py-2 text-sm"
                            >Sign in</a
                          >` : nothing}
                      ${this.isSignedIn ? html`<button
                            aria-label="Sign out button"
                            @click="${this.openSignOutModal}"
                            class="text-primary-800 hover:bg-primary-100 w-full px-4 py-2 text-left text-sm"
                          >
                            Sign out
                          </button>` : nothing}
                    </div>
                  ` : nothing}
            </div>
          </div>
        </div>
      </header>

      ${this._isDrawerOpen ? html`<div
              class="fixed inset-0 z-40 bg-black/50 transition-opacity"
              @click="${this.toggleDrawer}"
            ></div>
            <aside class="fixed top-0 left-0 z-50 h-full w-60 overflow-y-auto bg-white shadow-2xl">
              <div
                class="border-primary-200 bg-primary-50 flex items-center justify-between border-b p-4"
              >
                <span class="text-primary-700 font-bold">Menu</span
                ><button
                  arai-label="Close drawer on mobile"
                  @click="${this.toggleDrawer}"
                  class="text-primary-500 hover:text-error1"
                >
                  Close
                </button>
              </div>

              <div class="flex flex-col py-2">
                <a href="/" class="${getDrawerLinkClass("/")}">Home</a>
                <a href="/about.html" class="${getDrawerLinkClass("/about.html")}">About</a>

                ${hasPages ? html`
                      <div
                        class="text-primary-500 bg-primary-50 mt-2 px-4 py-2 text-xs font-bold tracking-wider uppercase"
                      >
                        Content
                      </div>
                      ${this._pageCategories.map((cat) => html`
                          <a
                            href="/pages/${cat.name}"
                            class="${getDrawerLinkClass(`/pages/${cat.name}`)} pl-8 capitalize"
                          >
                            ${cat.name}
                          </a>
                        `)}
                      <!-- Search pages in mobile drawer -->
                      <button
                        @click="${() => {
      this.toggleDrawer();
      this.openSearchModal();
    }}"
                        class="text-primary-600 hover:bg-primary-100 flex items-center gap-2 px-4 py-2 pl-8 text-left text-sm"
                      >
                        <svg
                          class="text-primary-400 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          ></path>
                        </svg>
                        Search pages
                      </button>
                    ` : nothing}
              </div>
            </aside>` : nothing}
      ${this._isSignOutModalOpen ? html`<div
            class="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            @click="${this.closeSignOutModal}"
          >
            <div
              class="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
              @click="${(e) => e.stopPropagation()}"
            >
              <h3 class="text-lg font-bold text-gray-900">Confirm Sign Out</h3>
              <div class="mt-6 flex justify-end gap-3">
                <button
                  aria-label="Sign out button"
                  @click="${this.closeSignOutModal}"
                  class="rounded border border-gray-300 px-4 py-2"
                >
                  Cancel</button
                ><button
                  @click="${this.performSignOut}"
                  class="bg-primary-600 rounded px-4 py-2 text-white"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>` : nothing}

      <rm-add-user-modal
        .isOpen="${this._isAddUserModalOpen}"
        @close="${this.closeAddUserModal}"
      ></rm-add-user-modal>
      <rm-reset-password-modal
        .isOpen="${this._isResetPasswordModalOpen}"
        .user="${this._resetPasswordUser}"
        @close-modal="${this.closeResetPasswordModal}"
      ></rm-reset-password-modal>

      <rm-delete-user-modal
        .isOpen="${this._isDeleteUserModalOpen}"
        .user="${this._deleteUserTarget}"
        @close="${this.closeDeleteUserModal}"
      ></rm-delete-user-modal>

      <!-- Pages Search Modal -->
      <rm-pages-search-modal
        .isOpen="${this._isSearchOpen}"
        @close="${this.closeSearchModal}"
      ></rm-pages-search-modal>
    `;
  }
}
customElements.define("rm-nav-header", RmHeader);

// src/components/rm-footer.js
class RmFooter extends LitElement {
  static properties = {
    currentUser: { type: String }
  };
  constructor() {
    super();
    this.currentUser = null;
  }
  async connectedCallback() {
    super.connectedCallback();
    try {
      const { data } = await authClient.getSession();
      if (data?.user) {
        this.currentUser = data.user.email;
      }
    } catch (e) {}
    window.addEventListener("auth-changed", this._handleAuthChange);
  }
  disconnectedCallback() {
    window.removeEventListener("auth-changed", this._handleAuthChange);
    super.disconnectedCallback();
  }
  _handleAuthChange = (e) => {
    if (e.detail?.signedIn) {
      this.currentUser = e.detail.email;
    } else {
      this.currentUser = null;
    }
  };
  render() {
    const year = new Date().getFullYear();
    const versionText = `version ${"0.1.0"}`;
    return html`
      <link rel="stylesheet" href="/styles/output.css" />

      <footer class="text-primary-800 mt-24 mb-8 pl-8 text-xs">
        <div class="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div class="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <span>&copy; ${year} Redmug Software. </span><span class="pl-0">${versionText}</span>
          </div>

          <div class="text-right mr-8">${this.currentUser ? html`Signed in as:
                  <span class="text-primary-600 font-semibold">${this.currentUser}</span>` : html`<span class="text-gray-400 italic">Not signed in</span>`}</div>
        </div>
        </div>
      </footer>
    `;
  }
}
customElements.define("rm-footer", RmFooter);

// src/components/rm-default-container.js
class RmDefaultContainer extends LitElement {
  render() {
    return html`
      <!-- Link to Tailwind Output to ensure styles inside Shadow DOM work -->
      <link rel="stylesheet" href="/styles/output.css" />

      <!--
        Container Logic:
        - min-h-screen: Ensures the container takes at least the full height of the viewport.
        - w-full: Takes available width up to the max-width.
        - max-w-[1200px]: Restricts width on large monitors
        - min-w-[320px]: Ensures readable layout on small mobiles
        - mx-auto: Centers the container within the viewport (provides the whitespace on sides).
        - bg-white: Defines the content area background.
        - shadow-xl: Adds depth to separate content from the browser background on wide screens.
        - flex flex-col: Allows children (header, main, footer) to layout vertically.
      -->
      <div
        class="relative mx-auto mb-8 flex min-h-screen w-full max-w-[1200px] min-w-[320px] flex-col bg-white shadow-xl"
      >
        <slot></slot>
      </div>
    `;
  }
}
customElements.define("rm-default-container", RmDefaultContainer);

// src/components/rm-login.js
class RMLogin extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.isChangePasswordMode = false;
    this.tempEmail = "";
    this.tempPassword = "";
  }
  connectedCallback() {
    this.render();
    this.addEventListeners();
  }
  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/styles/output.css">
      <style>
        :host { display: block; width: 100%; max-width: 24rem; margin: 0 auto; }
        .hidden { display: none !important; }
        .cursor-pointer { cursor: pointer; }
      </style>

      <div class="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h2 id="form-title" class="text-2xl font-bold text-gray-800 text-center mb-2">Sign In</h2>
        <p id="form-desc" class="text-gray-500 text-center text-sm mb-6">Enter your credentials to access the system.</p>

        <div id="error-msg" class="hidden text-red-600 bg-red-50 p-3 rounded mb-4 text-sm border border-red-200"></div>

        <form id="auth-form">
          <div class="mb-4" id="email-group">
            <label for="login-email" class="block mb-2 text-gray-600 text-sm font-medium">Email Address</label>
            <input type="email" id="login-email" required placeholder="you@company.com"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition duration-200">
          </div>

          <div class="mb-6" id="password-group">
            <label for="login-password" id="password-label" class="block mb-2 text-gray-600 text-sm font-medium">Password</label>
            <div class="relative">
              <input type="password" id="login-password" required placeholder="••••••••"
                class="w-full p-3 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition duration-200">
              <button type="button" class="toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" data-target="login-password">
                <svg class="h-5 w-5 eye-open" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg class="h-5 w-5 eye-closed hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.057 10.057 0 01-3.78 5.43L17.16 17.16m-2.15-2.15l-.88-.88" />
                </svg>
              </button>
            </div>
          </div>

          <div id="new-password-section" class="hidden">
             <div class="mb-4">
              <label for="new-password" class="block mb-2 text-gray-600 text-sm font-medium">New Password</label>
              <div class="relative">
                <input type="password" id="new-password" placeholder="New secure password"
                  class="w-full p-3 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition duration-200">
                <button type="button" class="toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" data-target="new-password">
                  <svg class="h-5 w-5 eye-open" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg class="h-5 w-5 eye-closed hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.057 10.057 0 01-3.78 5.43L17.16 17.16m-2.15-2.15l-.88-.88" />
                  </svg>
                </button>
              </div>
              <p id="new-password-hint" class="mt-1 text-xs text-gray-400">
                Must be 8+ chars, include 1 uppercase & 1 number.
              </p>
            </div>

             <div class="mb-6">
              <label for="confirm-password" class="block mb-2 text-gray-600 text-sm font-medium">Confirm New Password</label>
              <div class="relative">
                <input type="password" id="confirm-password" placeholder="Confirm new password"
                  class="w-full p-3 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition duration-200">
                <button type="button" class="toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" data-target="confirm-password">
                  <svg class="h-5 w-5 eye-open" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg class="h-5 w-5 eye-closed hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.057 10.057 0 01-3.78 5.43L17.16 17.16m-2.15-2.15l-.88-.88" />
                  </svg>
                </button>
              </div>
              <p id="confirm-password-error" class="hidden mt-1 text-xs text-red-600"></p>
            </div>
          </div>

          <button type="submit" id="submit-btn"
            class="w-full bg-primary-500 text-white p-3 rounded font-bold hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200">
            Sign In
          </button>
        </form>


      </div>
    `;
  }
  addEventListeners() {
    this.shadowRoot.getElementById("auth-form").addEventListener("submit", (e) => this.handleSubmit(e));
    this.shadowRoot.getElementById("google-btn").addEventListener("click", () => this.handleSocialSignIn("google"));
    this.shadowRoot.getElementById("github-btn").addEventListener("click", () => this.handleSocialSignIn("github"));
    const inputs = ["new-password", "confirm-password"];
    inputs.forEach((id) => {
      const el = this.shadowRoot.getElementById(id);
      if (el)
        el.addEventListener("input", () => this.resetPasswordStyles(id));
    });
    const toggles = this.shadowRoot.querySelectorAll(".toggle-password");
    toggles.forEach((btn) => {
      btn.addEventListener("click", (e) => this.togglePasswordVisibility(e));
    });
  }
  togglePasswordVisibility(e) {
    const btn = e.currentTarget;
    const targetId = btn.getAttribute("data-target");
    const input = this.shadowRoot.getElementById(targetId);
    const eyeOpen = btn.querySelector(".eye-open");
    const eyeClosed = btn.querySelector(".eye-closed");
    if (input.type === "password") {
      input.type = "text";
      eyeOpen.classList.add("hidden");
      eyeClosed.classList.remove("hidden");
    } else {
      input.type = "password";
      eyeOpen.classList.remove("hidden");
      eyeClosed.classList.add("hidden");
    }
  }
  validatePassword(password) {
    if (!password)
      return "Password is required";
    if (password.length < 8)
      return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least 1 uppercase letter";
    if (!/[0-9]/.test(password))
      return "Password must contain at least 1 number";
    return null;
  }
  setPasswordError(inputId, message) {
    const input = this.shadowRoot.getElementById(inputId);
    input.classList.add("border-red-500", "focus:ring-red-200", "focus:border-red-500");
    input.classList.remove("border-gray-300", "focus:ring-primary-200", "focus:border-primary-500");
    if (inputId === "new-password") {
      const hint = this.shadowRoot.getElementById("new-password-hint");
      hint.textContent = message;
      hint.classList.remove("text-gray-400");
      hint.classList.add("text-red-600");
    } else if (inputId === "confirm-password") {
      const errorMsg = this.shadowRoot.getElementById("confirm-password-error");
      errorMsg.textContent = message;
      errorMsg.classList.remove("hidden");
    }
  }
  resetPasswordStyles(inputId) {
    const input = this.shadowRoot.getElementById(inputId);
    if (!input)
      return;
    input.classList.remove("border-red-500", "focus:ring-red-200", "focus:border-red-500");
    input.classList.add("border-gray-300", "focus:ring-primary-200", "focus:border-primary-500");
    if (inputId === "new-password") {
      const hint = this.shadowRoot.getElementById("new-password-hint");
      hint.textContent = "Must be 8+ chars, include 1 uppercase & 1 number.";
      hint.classList.add("text-gray-400");
      hint.classList.remove("text-red-600");
    } else if (inputId === "confirm-password") {
      const errorMsg = this.shadowRoot.getElementById("confirm-password-error");
      errorMsg.classList.add("hidden");
    }
  }
  enableChangePasswordMode() {
    this.isChangePasswordMode = true;
    this.shadowRoot.getElementById("form-title").textContent = "Setup New Password";
    this.shadowRoot.getElementById("form-desc").textContent = "Administrator requires you to change your password.";
    const submitBtn = this.shadowRoot.getElementById("submit-btn");
    submitBtn.textContent = "Update & Sign In";
    this.shadowRoot.getElementById("new-password-section").classList.remove("hidden");
    this.shadowRoot.getElementById("email-group").classList.add("hidden");
    this.shadowRoot.getElementById("password-group").classList.add("hidden");
    const socialSection = this.shadowRoot.getElementById("social-section");
    if (socialSection)
      socialSection.classList.add("hidden");
    this.shadowRoot.getElementById("new-password").required = true;
    this.shadowRoot.getElementById("confirm-password").required = true;
    this.showError(null);
    submitBtn.disabled = false;
  }
  showError(message) {
    const errorMsg = this.shadowRoot.getElementById("error-msg");
    if (message) {
      errorMsg.textContent = message;
      errorMsg.classList.remove("hidden");
      errorMsg.classList.add("block");
    } else {
      errorMsg.classList.add("hidden");
      errorMsg.classList.remove("block");
    }
  }
  async handleSocialSignIn(provider) {
    const btnId = `${provider}-btn`;
    const btn = this.shadowRoot.getElementById(btnId);
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="${provider === "github" ? "text-gray-300" : "text-gray-500"}">Connecting...</span>`;
    try {
      const { data, error } = await authClient.signIn.social({
        provider,
        callbackURL: "/"
      });
      if (error)
        throw new Error(error.message);
    } catch (err) {
      console.error(`${provider} Sign In Error:`, err);
      this.showError(err.message || `Failed to connect to ${provider}.`);
      btn.disabled = false;
      btn.innerHTML = originalContent;
    }
  }
  async handleSubmit(e) {
    e.preventDefault();
    const submitBtn = this.shadowRoot.getElementById("submit-btn");
    this.showError(null);
    try {
      if (!this.isChangePasswordMode) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";
        const email = this.shadowRoot.getElementById("login-email").value;
        const password = this.shadowRoot.getElementById("login-password").value;
        const { data, error } = await authClient.signIn.email({
          email,
          password
        });
        if (error)
          throw new Error(error.message || "Login failed");
        if (data.user && data.user.requiresPasswordChange) {
          this.tempEmail = email;
          this.tempPassword = password;
          await authClient.signOut();
          this.enableChangePasswordMode();
          return;
        }
        this.finishLogin(data.user);
      } else {
        const newPassword = this.shadowRoot.getElementById("new-password").value;
        const confirmPassword = this.shadowRoot.getElementById("confirm-password").value;
        if (newPassword !== confirmPassword) {
          this.setPasswordError("confirm-password", "Passwords do not match");
          return;
        }
        const validationError = this.validatePassword(newPassword);
        if (validationError) {
          this.setPasswordError("new-password", validationError);
          return;
        }
        if (newPassword === this.tempPassword) {
          this.showError("New password cannot be the same as temporary password");
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";
        const { error: signInError } = await authClient.signIn.email({
          email: this.tempEmail,
          password: this.tempPassword
        });
        if (signInError) {
          throw new Error("Session expired. Please reload and sign in again.");
        }
        const { data, error } = await authClient.changePassword({
          newPassword,
          currentPassword: this.tempPassword,
          revokeOtherSessions: true
        });
        if (error)
          throw new Error(error.message || "Failed to update password");
        const userPayload = data?.user || { email: this.tempEmail };
        this.finishLogin(userPayload);
      }
    } catch (err) {
      let message = err.message;
      if (message === "Failed to fetch" || message === "NetworkError") {
        message = "Unable to connect to the server. Please try again later.";
      }
      this.showError(message);
      if (this.isChangePasswordMode)
        submitBtn.textContent = "Update & Sign In";
      else
        submitBtn.textContent = "Sign In";
      submitBtn.disabled = false;
    }
  }
  finishLogin(user) {
    localStorage.setItem("user_email", user.email || this.tempEmail);
    window.dispatchEvent(new CustomEvent("auth-changed", {
      detail: { email: user.email || this.tempEmail, signedIn: true }
    }));
    window.location.href = "/";
  }
}
customElements.define("rm-login", RMLogin);

// src/components/rm-colour-swatch.js
class RmColourSwatch extends LitElement {
  static properties = {
    color: { type: String },
    _hexValues: { state: true }
  };
  static _cssCache = null;
  constructor() {
    super();
    this.color = "primary";
    this._hexValues = {};
    this.paletteConfig = {
      standard: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      error: ["1", "2"],
      highlight: ["1", "2", "3"]
    };
  }
  createRenderRoot() {
    return this;
  }
  async connectedCallback() {
    super.connectedCallback();
    await this._loadColors();
  }
  async _loadColors() {
    if (!RmColourSwatch._cssCache) {
      try {
        const response = await fetch("/styles/input.css");
        if (!response.ok)
          throw new Error("Failed to load input.css");
        RmColourSwatch._cssCache = await response.text();
      } catch (err) {
        console.error("RmColourSwatch Error:", err);
        return;
      }
    }
    const cssText = RmColourSwatch._cssCache;
    const newHexValues = {};
    const shades = this.getShades();
    shades.forEach((shade) => {
      const isStandard = !["error", "highlight"].includes(this.color);
      const separator = isStandard ? "-" : "";
      const varName = `--color-${this.color}${separator}${shade}`;
      const regex = new RegExp(`${varName}\\s*:\\s*(#[0-9a-fA-F]{3,8})`, "i");
      const match = cssText.match(regex);
      if (match && match[1]) {
        newHexValues[shade] = match[1];
      }
    });
    this._hexValues = newHexValues;
  }
  getShades() {
    return this.paletteConfig[this.color] || this.paletteConfig.standard;
  }
  getMainShade(shades) {
    if (shades.includes(500))
      return 500;
    return shades[Math.floor((shades.length - 1) / 2)];
  }
  getTextColorClass(shade) {
    if (this.color === "highlight")
      return "text-slate-900";
    if (this.color === "error")
      return "text-white";
    const shadeNum = parseInt(shade);
    if (!isNaN(shadeNum)) {
      return shadeNum >= 500 ? "text-white" : "text-slate-900";
    }
    return "text-slate-900";
  }
  render() {
    const shades = this.getShades();
    const headerShade = this.getMainShade(shades);
    const isStandard = !["error", "highlight"].includes(this.color);
    const headerHex = this._hexValues[headerShade] || "#cccccc";
    const headerLabel = isStandard ? headerShade : `${this.color}${headerShade}`;
    return html`
      <div
        class="flex w-64 flex-col gap-0.5 overflow-hidden rounded-lg border border-slate-200 bg-white font-sans text-sm shadow-lg"
      >
        <!-- Header Block -->
        <div
          class="${this.getTextColorClass(headerShade)} flex h-32 flex-col justify-between p-4"
          style="background-color: ${headerHex}"
        >
          <span class="text-lg font-semibold capitalize">${this.color}</span>
          <div class="flex items-end justify-between">
            <span class="font-medium opacity-90">${headerLabel}</span>
            <span class="font-mono uppercase opacity-80"
              >${this._hexValues[headerShade] || "..."}</span
            >
          </div>
        </div>

        <!-- List of Shades -->
        <div class="flex flex-col">
          ${shades.map((shade) => {
      const hex = this._hexValues[shade] || "#ffffff";
      const textColor = this.getTextColorClass(shade);
      const rowLabel = isStandard ? shade : `${this.color}${shade}`;
      return html`
              <div
                class="${textColor} flex items-center justify-between px-4 py-3"
                style="background-color: ${hex}"
              >
                <span class="font-medium">${rowLabel}</span>
                <span class="font-mono uppercase opacity-80">${this._hexValues[shade] || ""}</span>
              </div>
            `;
    })}
        </div>
      </div>
    `;
  }
}
customElements.define("rm-colour-swatch", RmColourSwatch);

// src/components/rm-markdown-editor.js
class RmMarkdownEditor extends LitElement {
  static properties = {
    isOpen: { type: Boolean },
    category: { type: String },
    slug: { type: String },
    mode: { type: String },
    _originalContent: { state: true },
    _currentContent: { state: true },
    _isLoading: { state: true },
    _isSaving: { state: true },
    _error: { state: true },
    _isDirty: { state: true },
    _title: { state: true },
    _spellErrors: { state: true },
    _isChecking: { state: true },
    _showContext: { state: true },
    _contextWord: { state: true },
    _contextPos: { state: true },
    _dots: { state: true }
  };
  constructor() {
    super();
    this.isOpen = false;
    this.category = "";
    this.slug = "";
    this.mode = "view";
    this._resetState();
    this._highlight = null;
    this._isUserTyping = false;
    this._debounceTimer = null;
    this._dotInterval = null;
    this._dots = "";
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback();
    this._injectHighlightStyles();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (CSS.highlights && this._highlight)
      CSS.highlights.delete("spell-error");
    const styleEl = document.getElementById("rm-markdown-editor-highlight-styles");
    if (styleEl)
      styleEl.remove();
    this._stopDotAnimation();
    if (this._debounceTimer)
      clearTimeout(this._debounceTimer);
  }
  _injectHighlightStyles() {
    if (document.getElementById("rm-markdown-editor-highlight-styles"))
      return;
    const style = document.createElement("style");
    style.id = "rm-markdown-editor-highlight-styles";
    style.textContent = `
      ::highlight(spell-error) {
        text-decoration: underline wavy red;
        text-decoration-thickness: 2px;
        text-underline-offset: 3px;
      }
    `;
    document.head.appendChild(style);
  }
  updated(changedProperties) {
    if (changedProperties.has("isOpen") && this.isOpen)
      this._loadContent();
    if (changedProperties.has("isOpen") && !this.isOpen)
      this._resetState();
    if (changedProperties.has("_spellErrors"))
      this._applyHighlights();
    if (changedProperties.has("_currentContent") || changedProperties.has("_isLoading")) {
      requestAnimationFrame(() => this._syncEditorContent());
    }
    if (changedProperties.has("_isChecking")) {
      if (this._isChecking)
        this._startDotAnimation();
      else
        this._stopDotAnimation();
    }
  }
  _startDotAnimation() {
    this._dots = "";
    this._dotInterval = setInterval(() => {
      this._dots = this._dots.length >= 3 ? "" : this._dots + " .";
    }, 400);
  }
  _stopDotAnimation() {
    if (this._dotInterval)
      clearInterval(this._dotInterval);
    this._dots = "";
  }
  _resetState() {
    this._originalContent = "";
    this._currentContent = "";
    this._isLoading = false;
    this._isSaving = false;
    this._error = null;
    this._isDirty = false;
    this._title = "";
    this._spellErrors = [];
    this._isChecking = false;
    this._showContext = false;
    this._isUserTyping = false;
    this._stopDotAnimation();
    if (this._debounceTimer)
      clearTimeout(this._debounceTimer);
    if (CSS.highlights)
      CSS.highlights.delete("spell-error");
  }
  async _loadContent() {
    if (!this.category || !this.slug)
      return;
    this._isLoading = true;
    try {
      const response = await fetch(`/api/pages/raw/${this.category}/${this.slug}`);
      if (!response.ok)
        throw new Error(`Load failed: ${response.status}`);
      const data = await response.json();
      this._originalContent = data.content || "";
      this._currentContent = data.content || "";
      this._title = data.meta?.title || this.slug;
      if (this._currentContent)
        this._runSpellCheck();
    } catch (err) {
      this._error = err.message;
    } finally {
      this._isLoading = false;
    }
  }
  _syncEditorContent() {
    if (this._isUserTyping)
      return;
    const editor = this.querySelector("#editor-content");
    if (editor && editor.textContent !== this._currentContent) {
      editor.textContent = this._currentContent;
    }
  }
  _handleInput(e) {
    const editor = e.target;
    this._isUserTyping = true;
    this._currentContent = editor.textContent || "";
    this._isDirty = this._currentContent !== this._originalContent;
    if (this._spellErrors.length > 0)
      this._spellErrors = [];
    if (this._debounceTimer)
      clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      if (this._isDirty)
        this._runSpellCheck();
    }, 1500);
    requestAnimationFrame(() => {
      this._isUserTyping = false;
    });
  }
  _handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }
  _handleKeydown(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "  ");
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      if (this._isDirty && this.mode === "edit")
        this._handleSave();
    }
    if (e.key === "Escape")
      this._handleClose();
  }
  async _runSpellCheck() {
    if (this._isChecking || !this._currentContent)
      return;
    this._isChecking = true;
    try {
      const response = await fetch("/api/spellcheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: this._currentContent })
      });
      const data = await response.json();
      this._spellErrors = data.errors || [];
    } catch (err) {
      console.error("Spellcheck failed:", err);
    } finally {
      this._isChecking = false;
    }
  }
  _applyHighlights() {
    if (!CSS.highlights)
      return;
    const editor = this.querySelector("#editor-content");
    if (!editor)
      return;
    CSS.highlights.delete("spell-error");
    if (this._spellErrors.length === 0)
      return;
    const ranges = [];
    const textNodes = [];
    const walker2 = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    let node;
    while (node = walker2.nextNode()) {
      textNodes.push(node);
    }
    if (textNodes.length === 0)
      return;
    for (const error of this._spellErrors) {
      let charCount = 0;
      let startNode = null;
      let startOffset = 0;
      let endNode = null;
      let endOffset = 0;
      for (const n of textNodes) {
        const nodeLength = n.textContent.length;
        if (!startNode && charCount + nodeLength >= error.offset) {
          startNode = n;
          startOffset = error.offset - charCount;
        }
        if (charCount + nodeLength >= error.offset + error.length) {
          endNode = n;
          endOffset = error.offset + error.length - charCount;
          break;
        }
        charCount += nodeLength;
      }
      if (startNode && endNode) {
        try {
          const range = new Range;
          range.setStart(startNode, startOffset);
          range.setEnd(endNode, endOffset);
          ranges.push(range);
        } catch (err) {
          console.warn("Range error:", error.word);
        }
      }
    }
    if (ranges.length > 0) {
      this._highlight = new Highlight(...ranges);
      CSS.highlights.set("spell-error", this._highlight);
    }
  }
  _handleContextMenu(e) {
    if (this._spellErrors.length === 0)
      return;
    const editor = this.querySelector("#editor-content");
    const selection = window.getSelection();
    if (!selection.rangeCount)
      return;
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editor);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    const start = preCaretRange.toString().length;
    const error = this._spellErrors.find((err) => start >= err.offset && start <= err.offset + err.length);
    if (error) {
      e.preventDefault();
      this._contextWord = error.word;
      this._contextPos = { x: e.clientX, y: e.clientY };
      this._showContext = true;
    }
  }
  async _addToDictionary(word) {
    try {
      const response = await fetch("/api/dictionary/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word })
      });
      if (response.ok) {
        this._spellErrors = this._spellErrors.filter((e) => e.word !== word);
        this._showContext = false;
      }
    } catch (err) {
      console.error(err);
    }
  }
  async _handleSave() {
    if (!this._isDirty || this._isSaving)
      return;
    this._isSaving = true;
    try {
      await fetch(`/api/pages/raw/${this.category}/${this.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: this._currentContent })
      });
      this._originalContent = this._currentContent;
      this._isDirty = false;
      this.dispatchEvent(new CustomEvent("saved", { detail: { slug: this.slug }, bubbles: true }));
      this._emitClose();
    } catch (err) {
      this._error = err.message;
    } finally {
      this._isSaving = false;
    }
  }
  _handleDiscard() {
    this._currentContent = this._originalContent;
    this._isDirty = false;
    this._spellErrors = [];
    const editor = this.querySelector("#editor-content");
    if (editor)
      editor.textContent = this._originalContent;
  }
  _handleClose() {
    if (this._isDirty && !window.confirm("Unsaved changes. Close anyway?"))
      return;
    this._emitClose();
  }
  _emitClose() {
    this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
  }
  get _lineCount() {
    return (this._currentContent || "").split(`
`).length;
  }
  render() {
    if (!this.isOpen)
      return nothing;
    const isEditMode = this.mode === "edit";
    const statusColor = this._isChecking ? "text-primary-700" : this._spellErrors.length > 0 ? "text-red-600" : "text-green-500";
    return html`
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        @click="${this._handleClose}"
      >
        <div
          class="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
          @click="${(e) => e.stopPropagation()}"
        >
          <div
            class="bg-primary-700 flex shrink-0 items-center justify-between px-6 py-4 text-white"
          >
            <div class="flex items-center gap-4">
              <h2 class="max-w-md truncate text-lg font-bold">${this._title || "Loading..."}</h2>
              <div class="bg-primary-800 flex rounded-full p-1">
                <button
                  class="${this.mode === "view" ? "bg-white text-primary-700" : "text-primary-200"} rounded-full px-3 py-1 text-sm font-medium"
                  @click="${() => this.mode = "view"}"
                >
                  View
                </button>
                <button
                  class="${isEditMode ? "bg-white text-primary-700" : "text-primary-200"} rounded-full px-3 py-1 text-sm font-medium"
                  @click="${() => this.mode = "edit"}"
                >
                  Edit
                </button>
              </div>
            </div>
            <button class="hover:bg-primary-600 rounded p-1.5" @click="${this._handleClose}">
              &times;
            </button>
          </div>

          <div class="relative flex-1 overflow-hidden p-4">
            <div
              id="editor-content"
              contenteditable="${isEditMode ? "true" : "false"}"
              class="border-primary-200 ${isEditMode ? "bg-white" : "bg-primary-50 cursor-default"} wrap-break-words absolute inset-0 m-4 overflow-auto rounded-lg border p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap outline-none"
              @input="${this._handleInput}"
              @paste="${this._handlePaste}"
              @keydown="${this._handleKeydown}"
              @contextmenu="${this._handleContextMenu}"
              spellcheck="false"
            ></div>

            ${this._showContext ? html`
                  <div
                    class="border-primary-200 fixed z-100 w-64 rounded-md border bg-white py-2 shadow-2xl"
                    style="left: ${this._contextPos.x}px; top: ${this._contextPos.y}px;"
                  >
                    <button
                      class="hover:bg-primary-50 text-secondary-600 w-full px-4 py-2 text-left font-semibold"
                      @click="${() => this._addToDictionary(this._contextWord)}"
                    >
                      Add "${this._contextWord}" to Dictionary
                    </button>
                    <button
                      class="w-full px-4 py-2 text-left text-gray-500 hover:bg-gray-100"
                      @click="${() => this._showContext = false}"
                    >
                      Ignore
                    </button>
                  </div>
                ` : nothing}
          </div>

          <div class="bg-primary-50 flex items-center justify-between border-t px-6 py-3">
            <div class="text-primary-500 flex items-center gap-4 text-sm">
              <span class="w-24">${this._lineCount} lines</span>
              <span class="w-24"
                >${(this._currentContent || "").length.toLocaleString()} chars</span
              >

              <span
                class="${statusColor} flex items-center gap-1 font-mono transition-colors duration-300"
              >
                <svg class="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <span class="min-w-120px">
                  ${this._isChecking ? html`Checking<span class="inline-block w-8 text-left">${this._dots}</span>` : this._spellErrors.length > 0 ? html`<strong
                          >${this._spellErrors.length}
                          ${this._spellErrors.length === 1 ? "error" : "errors"} found</strong
                        >` : "Check complete"}
                </span>
              </span>
            </div>

            <div class="flex items-center gap-3">
              ${isEditMode ? html`
                    <button
                      class="text-primary-600 hover:bg-primary-100 rounded px-4 py-2 text-sm font-medium"
                      @click="${this._handleDiscard}"
                    >
                      Discard
                    </button>
                    <button
                      class="bg-secondary-600 hover:bg-secondary-700 rounded px-4 py-2 text-sm font-medium text-white shadow"
                      @click="${this._handleSave}"
                      ?disabled="${this._isSaving}"
                    >
                      Save
                    </button>
                  ` : html`<button
                    class="border-primary-200 rounded border bg-white px-4 py-2 text-sm font-medium shadow-sm"
                    @click="${this._handleClose}"
                  >
                    Close
                  </button>`}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define("rm-markdown-editor", RmMarkdownEditor);

// src/components/rm-image.js
class RmImage extends LitElement {
  static properties = {
    src: { type: String },
    width: { type: String },
    height: { type: String },
    position: { type: String },
    wrap: { type: String },
    border: { type: Boolean },
    rounded: { type: String },
    alt: { type: String },
    _currentIndex: { type: Number, state: true },
    _images: { type: Array, state: true },
    _isCarousel: { type: Boolean, state: true },
    _hasTitle: { type: Boolean, state: true }
  };
  static styles = css`
    /*
     * Host element styling
     * Uses CSS custom properties for theming compatibility
     */
    :host {
      --primary-500: #607d8b; /* primary-500 as default border */
      --primary-200: #b0bec5; /* primary-200 for title text */
      --border-width: 2px;
      display: block;
    }

    /* --------------------------------------------------------
     * WRAPPER STYLES - Controls text wrapping behaviour
     * Mirrors Google Docs image insertion options
     * -------------------------------------------------------- */

    /* Base wrapper styling - provides bottom spacing */
    .image-wrapper {
      padding-bottom: 0.5rem; /* 8px bottom spacing for all images */
    }

    /* Inline: Image sits in text flow like a character */
    .wrap-inline {
      display: inline-block;
      vertical-align: middle;
      padding-bottom: 0; /* No extra padding for inline images */
    }

    /* Wrap: Text wraps around the image (float behaviour) */
    .wrap-wrap.position-left {
      float: left;
      margin-right: 1rem;
      margin-bottom: 0.5rem;
    }

    .wrap-wrap.position-right {
      float: right;
      margin-left: 1rem;
      margin-bottom: 0.5rem;
    }

    .wrap-wrap.position-center {
      /* Center cannot float, so behaves like break */
      display: block;
      margin: 1rem auto;
      clear: both;
    }

    /* Break: Image breaks text flow, sits on its own line */
    .wrap-break {
      display: block;
      clear: both;
      margin: 1rem 0;
    }

    .wrap-break.position-left {
      margin-right: auto;
    }

    .wrap-break.position-center {
      margin-left: auto;
      margin-right: auto;
    }

    .wrap-break.position-right {
      margin-left: auto;
    }

    /* Behind: Image positioned behind text (background-like) */
    .wrap-behind {
      position: relative;
      z-index: -1;
    }

    /* In-front: Image positioned in front of text (overlay) */
    .wrap-in-front {
      position: relative;
      z-index: 10;
    }

    /* --------------------------------------------------------
     * IMAGE CONTAINER - Holds the image and carousel controls
     * -------------------------------------------------------- */
    .image-container {
      position: relative;
      display: inline-block;
      max-width: 100%;
      /*background-color: green !important;*/
      padding-top: 20px;
    }

    /* --------------------------------------------------------
     * IMAGE STYLES - The actual image element
     * -------------------------------------------------------- */
    .image {
      display: block;
      max-width: 100%;
      height: auto;
      object-fit: contain;
    }

    /* Border styles when border attribute is present */
    .image.has-border {
      border: var(--border-width) solid var(--primary-500);
    }

    /* Rounded corner variants matching Tailwind naming */
    .image.rounded-xs {
      border-radius: 0.125rem;
    } /* 2px */
    .image.rounded-sm {
      border-radius: 0.25rem;
    } /* 4px */
    .image.rounded-md {
      border-radius: 0.375rem;
    } /* 6px */
    .image.rounded-lg {
      border-radius: 0.5rem;
    } /* 8px */

    /* --------------------------------------------------------
     * CAROUSEL CONTROLS - Container for arrows and indicators
     * All controls now positioned beneath the image
     * -------------------------------------------------------- */
    .carousel-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0 0.25rem 0;
    }

    /* Navigation button base styles - now inline with indicators */
    .carousel-nav {
      width: 2rem;
      height: 2rem;
      border: none;
      border-radius: 9999px;
      background-color: rgba(0, 0, 0, 0.15);
      color: #374151;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        background-color 0.2s ease,
        opacity 0.2s ease;
      flex-shrink: 0;
    }

    .carousel-nav:hover {
      background-color: rgba(0, 0, 0, 0.25);
    }

    .carousel-nav:focus-visible {
      outline: 2px solid var(--primary-500);
      outline-offset: 2px;
    }

    .carousel-nav:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    /* Navigation arrow icons */
    .carousel-nav svg {
      width: 1rem;
      height: 1rem;
    }

    /* --------------------------------------------------------
     * CAROUSEL INDICATORS - Dots showing current position
     * -------------------------------------------------------- */
    .carousel-indicators {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
    }

    .carousel-indicator {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 9999px;
      border: none;
      background-color: rgba(0, 0, 0, 0.3);
      cursor: pointer;
      padding: 0;
      transition:
        background-color 0.2s ease,
        transform 0.2s ease;
    }

    .carousel-indicator:hover {
      background-color: rgba(0, 0, 0, 0.5);
      transform: scale(1.2);
    }

    .carousel-indicator:focus-visible {
      outline: 2px solid var(--primary-500);
      outline-offset: 2px;
    }

    .carousel-indicator.active {
      background-color: var(--primary-500);
    }

    /* --------------------------------------------------------
     * FOOTER ROW - Contains controls (left/center) and title (right)
     * -------------------------------------------------------- */
    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0 0.25rem 0;
      gap: 1rem;
    }

    /* When no carousel, title takes full width and aligns right */
    /* Reduced padding for tighter layout with single images */
    .footer-row.title-only {
      justify-content: flex-end;
      padding: 0.15rem 0 0.5rem 0; /* 4px top only, wrapper provides bottom */
    }

    /* Controls section within footer */
    .footer-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    /* --------------------------------------------------------
     * TITLE/CAPTION STYLES - Slot content displayed bottom-right
     * -------------------------------------------------------- */
    .image-title {
      font-size: 0.75rem; /* Small font - 12px */
      line-height: 1;
      color: var(--primary-200); /* #b0bec5 */
      white-space: nowrap; /* No wrapping */
      overflow: hidden; /* Hide overflow */
      text-overflow: ellipsis; /* Add ellipsis when truncated */
      max-width: 100%; /* Constrain to container */
      text-align: right;
      flex-shrink: 1;
      min-width: 0; /* Allow shrinking below content size */
    }

    /* Hide the slot visually - we read its content via JS */
    .slot-container {
      display: none;
    }

    /* --------------------------------------------------------
     * SCREEN READER ONLY - Hidden but accessible text
     * -------------------------------------------------------- */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;
  constructor() {
    super();
    this.src = "";
    this.width = "";
    this.height = "";
    this.position = "left";
    this.wrap = "inline";
    this.border = false;
    this.rounded = "none";
    this.alt = "Image";
    this._currentIndex = 0;
    this._images = [];
    this._isCarousel = false;
    this._hasTitle = false;
  }
  willUpdate(changedProperties) {
    if (changedProperties.has("src")) {
      this._parseSource();
    }
  }
  firstUpdated() {
    this._checkSlotContent();
  }
  _checkSlotContent() {
    const slot = this.shadowRoot.querySelector("slot");
    if (slot) {
      const nodes = slot.assignedNodes({ flatten: true });
      const textContent = nodes.map((node) => node.textContent || "").join("").trim();
      this._hasTitle = textContent.length > 0;
    }
  }
  _getTitleText() {
    const slot = this.shadowRoot.querySelector("slot");
    if (slot) {
      const nodes = slot.assignedNodes({ flatten: true });
      return nodes.map((node) => node.textContent || "").join("").trim();
    }
    return "";
  }
  _parseSource() {
    if (!this.src) {
      this._images = [];
      this._isCarousel = false;
      return;
    }
    try {
      const trimmed = this.src.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          this._images = parsed;
          this._isCarousel = parsed.length > 1;
          this._currentIndex = 0;
          return;
        }
      }
    } catch (e) {}
    this._images = [this.src];
    this._isCarousel = false;
    this._currentIndex = 0;
  }
  _goToPrevious() {
    if (this._currentIndex > 0) {
      this._currentIndex = this._currentIndex - 1;
      this.requestUpdate();
      this._announceSlideChange();
    }
  }
  _goToNext() {
    if (this._currentIndex < this._images.length - 1) {
      this._currentIndex = this._currentIndex + 1;
      this.requestUpdate();
      this._announceSlideChange();
    }
  }
  _goToIndex(index) {
    if (index >= 0 && index < this._images.length && index !== this._currentIndex) {
      this._currentIndex = index;
      this.requestUpdate();
      this._announceSlideChange();
    }
  }
  _announceSlideChange() {
    this.updateComplete.then(() => {
      const liveRegion = this.shadowRoot.querySelector(".carousel-live-region");
      if (liveRegion) {
        liveRegion.textContent = `Image ${this._currentIndex + 1} of ${this._images.length}`;
      }
    });
  }
  _handleKeydown(event) {
    if (!this._isCarousel)
      return;
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        this._goToPrevious();
        break;
      case "ArrowRight":
        event.preventDefault();
        this._goToNext();
        break;
      case "Home":
        event.preventDefault();
        this._goToIndex(0);
        break;
      case "End":
        event.preventDefault();
        this._goToIndex(this._images.length - 1);
        break;
    }
  }
  _handleSlotChange() {
    this._checkSlotContent();
    this.requestUpdate();
  }
  _getWrapperClasses() {
    const classes = ["image-wrapper"];
    classes.push(`wrap-${this.wrap}`);
    classes.push(`position-${this.position}`);
    return classes.join(" ");
  }
  _getImageClasses() {
    const classes = ["image"];
    if (this.border) {
      classes.push("has-border");
    }
    if (this.rounded && this.rounded !== "none") {
      classes.push(`rounded-${this.rounded}`);
    }
    return classes.join(" ");
  }
  _getSizeStyles() {
    const styles = [];
    if (this.width) {
      styles.push(`width: ${this.width}`);
      styles.push("height: auto");
    } else if (this.height) {
      styles.push(`height: ${this.height}`);
      styles.push("width: auto");
    } else {
      styles.push("max-width: 600px");
      styles.push("width: 100%");
      styles.push("height: auto");
    }
    return styles.join("; ");
  }
  _renderCarouselControls() {
    const currentIdx = this._currentIndex;
    const totalImages = this._images.length;
    return html`
      <!-- Previous button -->
      <button
        class="carousel-nav"
        @click="${this._goToPrevious}"
        ?disabled="${currentIdx === 0}"
        aria-label="Previous image"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <!-- Dot indicators -->
      <div class="carousel-indicators" role="tablist" aria-label="Image navigation">
        ${this._images.map((_, index) => html`
            <button
              class="carousel-indicator ${index === currentIdx ? "active" : ""}"
              role="tab"
              aria-selected="${index === currentIdx}"
              aria-label="Go to image ${index + 1}"
              @click="${() => this._goToIndex(index)}"
              type="button"
            ></button>
          `)}
      </div>

      <!-- Next button -->
      <button
        class="carousel-nav"
        @click="${this._goToNext}"
        ?disabled="${currentIdx === totalImages - 1}"
        aria-label="Next image"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Screen reader live region for announcing slide changes -->
      <div class="carousel-live-region sr-only" role="status" aria-live="polite" aria-atomic="true">
        Image ${currentIdx + 1} of ${totalImages}
      </div>
    `;
  }
  _renderFooter() {
    const hasCarousel = this._isCarousel;
    const titleText = this._getTitleText();
    const hasTitle = titleText.length > 0;
    if (!hasCarousel && !hasTitle) {
      return "";
    }
    if (!hasCarousel && hasTitle) {
      return html`
        <div class="footer-row title-only">
          <span class="image-title" title="${titleText}">${titleText}</span>
        </div>
      `;
    }
    return html`
      <div class="footer-row">
        <div class="footer-controls">${this._renderCarouselControls()}</div>
        ${hasTitle ? html` <span class="image-title" title="${titleText}">${titleText}</span> ` : ""}
      </div>
    `;
  }
  render() {
    if (this._images.length === 0) {
      return html`
        <div class="image-wrapper" role="img" aria-label="No image source provided">
          <span class="sr-only">No image source provided</span>
        </div>
      `;
    }
    const currentIdx = this._currentIndex;
    const currentImage = this._images[currentIdx];
    const imageClasses = this._getImageClasses();
    const sizeStyles = this._getSizeStyles();
    const wrapperClasses = this._getWrapperClasses();
    return html`
      <!-- Hidden slot to capture title content -->
      <div class="slot-container">
        <slot @slotchange="${this._handleSlotChange}"></slot>
      </div>

      <div class="${wrapperClasses}">
        <!--
          Main image container
          For carousel: acts as a group with keyboard navigation
        -->
        <div
          class="image-container"
          role="${this._isCarousel ? "group" : "none"}"
          aria-roledescription="${this._isCarousel ? "carousel" : ""}"
          aria-label="${this._isCarousel ? `Image carousel with ${this._images.length} images` : ""}"
          @keydown="${this._handleKeydown}"
          tabindex="${this._isCarousel ? "0" : "-1"}"
          style="${sizeStyles}"
        >
          <!-- Current image display -->
          <img
            src="${currentImage}"
            alt="${this.alt}${this._isCarousel ? ` (${currentIdx + 1} of ${this._images.length})` : ""}"
            class="${imageClasses}"
            style="${sizeStyles}"
            loading="lazy"
          />
        </div>

        <!-- Footer row: carousel controls and/or title -->
        ${this._renderFooter()}
      </div>
    `;
  }
}
customElements.define("rm-image", RmImage);

// src/client-components-build.js
console.log("Component bundle loaded successfully.");
