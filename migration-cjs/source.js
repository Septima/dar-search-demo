var dawaAutocomplete = require("./node_modules/dar-search-ui");
console.log("what", dawaAutocomplete);
var inputElm = document.getElementById("dawa-autocomplete-input");
var component = dawaAutocomplete.dawaAutocomplete(inputElm, {
  select: function (selected) {
    console.log("Valgt adresse:", selected);
  },
  token: "demo-3KCVX33CKZ",
});
