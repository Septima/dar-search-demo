var dawaAutocomplete = require("../dawa-autocomplete.cjs.js");
var inputElm = document.getElementById("dawa-autocomplete-input");
var component = dawaAutocomplete.dawaAutocomplete(inputElm, {
  select: function (selected) {
    console.log("Valgt adresse:", selected);
  },
  token: "demo-3KCVX33CKZ",
});
