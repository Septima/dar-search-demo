import { dawaAutocomplete } from "../dawa-autocomplete.esm.js";

const inputElement = document.querySelector("#dawa-autocomplete-input");
var component = dawaAutocomplete(inputElement, {
  select: function (selected) {
    console.log("Valgt adresse: ", selected);
  },
  token: "demo-3KCVX33CKZ",
});
