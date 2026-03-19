var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/dar-search-ui/src/api.js
var DarSearchAPI;
var init_api = __esm({
  "node_modules/dar-search-ui/src/api.js"() {
    DarSearchAPI = class {
      apiUrl = "https://dar-search.test.septima.dk/darsearch";
      token = "";
      constructor(options) {
        if (!options || !options.token) {
          throw new Error(
            'DarSearchAPI must be initialized with a valid configuration. `{token: "xxx"} is the minimum required.`'
          );
        }
        this.token = options.token;
        if (options.apiUrl) {
          this.apiUrl = options.apiUrl;
        }
      }
      async search(endpoint, query, options = {}) {
        if (!endpoint || !query) {
          throw new Error("search() requires both endpoint and query parameters.");
        }
        const response = await fetch(
          `${this.apiUrl}/${endpoint}/soeg?tekst=${query}&token=${this.token}${this.formatParams(options)}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === "fejl") {
          throw new Error(`Search error: ${data.beskrivelse}`);
        }
        return data.items;
      }
      async get(endpoint, id) {
        if (!endpoint || !id) {
          throw new Error("get() requires both endpoint and id parameters.");
        }
        const response = await fetch(
          `${this.apiUrl}/${endpoint}/${id}?token=${this.token}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === "fejl") {
          throw new Error(data.beskrivelse);
        }
        return data;
      }
      formatParams(options) {
        let queryStr = "";
        if (options.medtagForeloebige) {
          queryStr += `&medtagForeloebige=true`;
        }
        if (options.maksimum) {
          queryStr += `&maksimum=${options.maksimum}`;
        }
        if (options.kommuneKode) {
          queryStr += `&kommuneKode=${options.kommuneKode}`;
        }
        if (options.vejnavn) {
          queryStr += `&vejnavn=${options.vejnavn}`;
        }
        if (options.postnummer) {
          queryStr += `&postnummer=${options.postnummer}`;
        }
        return queryStr;
      }
    };
  }
});

// node_modules/dar-search-ui/src/legacy.js
function dawaAutocomplete(element, options) {
  const dawaui = new DarSearchUI(element, options);
}
var DarSearchUI;
var init_legacy = __esm({
  "node_modules/dar-search-ui/src/legacy.js"() {
    init_api();
    DarSearchUI = class {
      searchType = "adresse";
      debounceTimer;
      options;
      wrapperElement;
      inputElement;
      listElement;
      api;
      constructor(element, options) {
        this.options = options;
        this.searchType = options.adgangsadresserOnly ? "husnummer" : "adresse";
        this.inputElement = element;
        this.listElement = document.createElement("div");
        this.wrapperElement = this.inputElement.parentNode;
        this.wrapperElement.append(this.listElement);
        this.inputElement.addEventListener("input", this.inputHandler.bind(this));
        this.wrapperElement.addEventListener(
          "keyup",
          this.listKeyHandler.bind(this)
        );
        document.addEventListener("click", this.outsideClickHandler.bind(this));
        this.api = new DarSearchAPI({ token: options.token });
      }
      inputHandler(event) {
        if (event.target.value === "") {
          return;
        }
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(async () => {
          await this.refreshList(event.target.value);
        }, 500);
      }
      async refreshList(queryText) {
        try {
          const data = await this.api.search(
            this.searchType,
            queryText,
            this.options
          );
          this.renderDOMList(this.listElement, data);
        } catch (err) {
          this.errorHandler(
            new Error(`Failed to load search items: ${err.message}`)
          );
        }
      }
      renderDOMList(parentElement, items) {
        const ulEl = document.createElement("ul");
        ulEl.className = "dawa-autocomplete-suggestions";
        ulEl.role = "listbox";
        ulEl.ariaLabel = "S\xF8geresultater";
        items.forEach((item) => {
          this.renderDOMListItem(ulEl, item);
        });
        parentElement.querySelector("ul")?.remove();
        parentElement.append(ulEl);
      }
      renderDOMListItem(parentElement, item) {
        const liEl = document.createElement("li");
        liEl.className = "dawa-autocomplete-suggestion";
        liEl.role = "option";
        liEl.tabIndex = 0;
        liEl.dataset.item = JSON.stringify(item);
        liEl.addEventListener("click", (event) => {
          this.selectProcessor(JSON.parse(event.target.dataset.item));
        });
        liEl.innerText = item.title;
        parentElement.append(liEl);
      }
      errorHandler(err) {
        console.error(err);
        this.inputElement.dispatchEvent(
          new CustomEvent("dar:error", {
            bubbles: true,
            composed: true,
            detail: { message: err.message }
          })
        );
      }
      listKeyHandler(event) {
        if (event.key === "ArrowDown") {
          this.moveFocus(1);
        } else if (event.key === "ArrowUp") {
          this.moveFocus(-1);
        } else if (event.key === "Enter" && this.listElement.querySelector(":focus")) {
          this.inputElement.focus();
          this.selectProcessor(JSON.parse(event.target.dataset.item));
        } else if (event.key === "Escape") {
          console.log("escaping");
          this.inputElement.focus();
          this.listElement.querySelector("ul")?.remove();
        }
      }
      outsideClickHandler(event) {
        if (!this.wrapperElement.contains(event.target)) {
          this.listElement.querySelector("ul")?.remove();
        }
      }
      moveFocus(direction) {
        if (!this.listElement.querySelector("ul")) {
          return;
        }
        const next = this.listElement.querySelector(":focus")?.nextElementSibling;
        const previous = this.listElement.querySelector(":focus")?.previousElementSibling;
        const first = this.listElement.querySelector("li");
        this.listElement.querySelectorAll("li").forEach((li) => {
          li.classList.remove("dawa-selected");
        });
        if (direction === 1 && !next && !previous) {
          first.focus();
        } else if (direction === -1 && !previous) {
          this.inputElement.focus();
        } else if (direction === 1 && next) {
          next.focus();
        } else if (direction === -1 && previous) {
          previous.focus();
        }
        this.listElement.querySelector(":focus")?.classList.add("dawa-selected");
      }
      selectProcessor(item) {
        if (item.type === "vejnavn" || item.type === "navngivenvejpostnummer" || item.type === "husnummer" && this.searchType === "adresse") {
          this.inputElement.value = item.title;
          this.refreshList(item.title);
        } else {
          this.listElement.querySelector("ul")?.remove();
          this.selectItem(item);
        }
      }
      async selectItem(item) {
        try {
          const data = await this.api.get(this.searchType, item.id);
          this.inputElement.value = data.title;
          this.inputElement.dispatchEvent(
            new CustomEvent("dar:select", {
              bubbles: true,
              composed: true,
              detail: data
            })
          );
          this.options.select(data);
        } catch (err) {
          this.errorHandler(new Error(`Failed to fetch items: ${err.message}`));
        }
      }
    };
  }
});

// node_modules/dar-search-ui/src/web-component.js
var DarSearchInput;
var init_web_component = __esm({
  "node_modules/dar-search-ui/src/web-component.js"() {
    init_api();
    DarSearchInput = class extends HTMLElement {
      static observedAttributes = [
        "placeholder",
        "disabled",
        "adgangsadresser-only",
        "kommune-kode",
        "maksimum",
        "medtag-foreloebige",
        "vejnavn",
        "postnummer",
        "token"
      ];
      elementId = `adr-${Math.ceil(Math.random() * 1e5)}`;
      disabled = false;
      placeholder = "S\xF8g adresse";
      searchType = "adresse";
      options = {
        kommuneKode: null,
        maksimum: null,
        medtagForeloebige: null,
        vejnavn: null,
        postnummer: null
      };
      debounceTimer;
      inputElement;
      listElement;
      api;
      token;
      style = `
    #${this.elementId} {
      --highlight-color: lightblue;
      max-width: 30rem;
      width: 100%;
      display: block;
    }
    #${this.elementId}-input {
      anchor-name: --input-${this.elementId};
      width: 100%;
      display: block;
    }
    #${this.elementId}-list {
      margin: 0;
      inset: auto;
      position-anchor: --input-${this.elementId};
      position: fixed;
      left: anchor(left);
      top: anchor(bottom);
      right: auto;

      position-try-fallbacks: flip-block;
      max-height: 50vh;
      overflow: auto;

      li {
        cursor: pointer;
      }
      li:hover {
        background-color: var(--highlight-color);
      }
    }
  `;
      constructor() {
        super();
      }
      connectedCallback() {
        this.id = this.elementId;
        this.attachStyle(this.style);
        this.renderList();
      }
      attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
          case "token":
            this.token = newValue;
            this.api = new DarSearchAPI({ token: this.token });
            break;
          case "adgangsadresser-only":
            this.searchType = "husnummer";
            break;
          case "placeholder":
            this.placeholder = newValue;
            break;
          case "kommune-kode":
            this.options.kommuneKode = newValue;
            break;
          case "maksimum":
            this.options.maksimum = Number(newValue);
            break;
          case "medtag-foreloebige":
            this.options.medtagForeloebige = newValue !== "false" ? true : false;
            break;
          case "vejnavn":
            this.options.vejnavn = newValue;
            break;
          case "postnummer":
            this.options.postnummer = newValue;
            break;
          default:
        }
        if (name === "disabled" && newValue === "") {
          this.disabled = true;
        }
        this.renderInput();
      }
      async selectHandler(event) {
        const item = JSON.parse(event.target.dataset.item);
        this.selectProcessor(item);
      }
      async selectProcessor(item) {
        if (item.type === "vejnavn" || item.type === "navngivenvejpostnummer" || item.type === "husnummer" && this.searchType === "adresse") {
          this.inputElement.value = item.title;
          await this.refreshList(item.title);
        } else {
          await this.selectItem(item);
          this.listElement.hidePopover();
        }
      }
      async selectItem(item) {
        try {
          const data = await this.api.get(this.searchType, item.id);
          this.inputElement.value = data.title;
          this.dispatchEvent(
            new CustomEvent("dar:select", {
              bubbles: true,
              composed: true,
              detail: data
            })
          );
        } catch (err) {
          this.errorHandler(new Error(`Failed to fetch items: ${err.message}`));
        }
      }
      attachStyle() {
        const styleElement = document.createElement("style");
        styleElement.textContent = this.style;
        document.head.append(styleElement);
      }
      renderInput() {
        if (this.inputElement) {
          this.inputElement.remove();
        }
        this.inputElement = document.createElement("input");
        this.inputElement.id = `${this.elementId}-input`;
        this.inputElement.type = "search";
        this.inputElement.role = "combobox";
        this.inputElement.ariaAutocomplete = "list";
        this.inputElement.ariaControls = `${this.elementId}-list`;
        this.inputElement.placeholder = this.placeholder;
        this.inputElement.disabled = this.disabled;
        this.inputElement.addEventListener("input", this.inputHandler.bind(this));
        this.inputElement.addEventListener(
          "keyup",
          this.inputKeyHandler.bind(this)
        );
        this.append(this.inputElement);
      }
      renderList() {
        this.listElement = document.createElement("ul");
        this.listElement.id = `${this.elementId}-list`;
        this.listElement.popover = "auto";
        this.listElement.role = "listbox";
        this.listElement.ariaLabel = "S\xF8geresultater";
        this.listElement.addEventListener("keyup", this.listKeyHandler.bind(this));
        this.append(this.listElement);
      }
      renderListItems(items) {
        this.listElement.hidePopover();
        this.listElement.innerHTML = "";
        items.forEach((item) => {
          this.listElement.append(this.createListItem(item));
        });
        this.listElement.showPopover();
      }
      createListItem(item) {
        const liElement = document.createElement("li");
        liElement.tabIndex = 0;
        liElement.role = "option";
        liElement.innerText = item.title;
        liElement.dataset.item = JSON.stringify(item);
        liElement.addEventListener("click", this.selectHandler.bind(this));
        return liElement;
      }
      moveFocus(direction) {
        const next = this.listElement.querySelector(":focus").nextElementSibling;
        const previous = this.listElement.querySelector(":focus").previousElementSibling;
        if (direction === 1 && next) {
          next.focus();
        } else if (direction === -1 && previous) {
          previous.focus();
        }
      }
      async refreshList(value) {
        try {
          const data = await this.api.search(this.searchType, value, this.options);
          this.renderListItems(data);
        } catch (err) {
          this.errorHandler(
            new Error(`Failed to load search items: ${err.message}`)
          );
        }
      }
      inputHandler(event) {
        if (event.target.value === "") {
          this.listElement.hidePopover();
          return;
        }
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(async () => {
          await this.refreshList(event.target.value);
        }, 300);
      }
      inputKeyHandler(event) {
        if (event.key === "ArrowDown") {
          this.listElement.childNodes[0].focus();
        }
      }
      listKeyHandler(event) {
        switch (event.key) {
          case "ArrowUp":
            this.moveFocus(-1);
            break;
          case "ArrowDown":
            this.moveFocus(1);
            break;
          case "Enter":
            this.listElement.hidePopover();
            this.selectProcessor(JSON.parse(event.target.dataset.item));
            break;
          default:
        }
      }
      errorHandler(err) {
        console.error(err);
        this.dispatchEvent(
          new CustomEvent("dar:error", {
            bubbles: true,
            composed: true,
            detail: { message: err.message }
          })
        );
      }
    };
  }
});

// node_modules/dar-search-ui/index.js
var dar_search_ui_exports = {};
__export(dar_search_ui_exports, {
  DarSearchAPI: () => DarSearchAPI,
  DarSearchInput: () => DarSearchInput,
  dawaAutocomplete: () => dawaAutocomplete,
  default: () => dar_search_ui_default
});
var dar_search_ui_default;
var init_dar_search_ui = __esm({
  "node_modules/dar-search-ui/index.js"() {
    init_legacy();
    init_web_component();
    init_api();
    dar_search_ui_default = dawaAutocomplete;
  }
});

// source.js
var dawaAutocomplete2 = (init_dar_search_ui(), __toCommonJS(dar_search_ui_exports));
console.log("what", dawaAutocomplete2);
var inputElm = document.getElementById("dawa-autocomplete-input");
var component = dawaAutocomplete2.dawaAutocomplete(inputElm, {
  select: function(selected) {
    console.log("Valgt adresse:", selected);
  },
  token: "demo-3KCVX33CKZ"
});
