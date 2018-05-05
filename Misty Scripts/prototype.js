
Library.prototype._bindEvents = function() {
  $(".createScript").on("click", $.proxy(this._toggleCreateScript, this));
  $(".addscript-submit").on("click", $.proxy(this._handleAddScript, this));
};

var Script = function(args){
  this.name = args.name;
  this.description = args.description;
};

var Command = function(args) {


}

var Table = function(args) {
  this.name = args.Name;
  this.columns = args.columns;
}

function addScript(script) {

  for (j = 0; j < scripts.length; j++) {
    if (scripts[j].name === script.name) {
      return false;
      }
    }
    scripts.push(script);
}

Library.prototype.addBooks = function(scriptsToAdd) {
  var num = 0;
  for (i = 0; i < scriptsToAdd.length; i++) {
    if(this.addScript(scriptsToAdd[i])) {
        num++;
    }
  }
  return(num + " book(s) have been added to the library.");
};

function handleAddScript() {
  var newScript = {
    title: $("#add-title").val(),
    author: $("#add-author").val(),
    numPages: $("#add-pages").val(),
    pubDate: new Date($("#add-date").val()),
  };
  if(newBook.title) {
    addScript(newScript);
    populateStorage("vLibrary");
    checkLocalStorage();
  } else {
    alert("Title field must be filled out.");
  }
  $("#book-form").toggle();
};
