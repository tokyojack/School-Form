exports.clearNonLetters = function(value) {
  return value.replace(/[^a-z0-9]|\s+|\r?\n|\r/gmi, "");
};
