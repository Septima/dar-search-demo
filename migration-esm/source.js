import { dawaAutocomplete } from "./node_modules/dar-search-ui";

const inputElement = document.querySelector("#dawa-autocomplete-input");
var component = dawaAutocomplete(inputElement, {
  select: function (selected) {
    console.log("Valgt adresse: ", selected);
  },
  token: "demo-3KCVX33CKZ",
});
