if (window.localStorage.permanentData) {
  $("ol.change").replaceWith(window.localStorage.permanentData);
}

$(document).ready(function () {
  $.ajax({
      //change me for server (http://site181993.tw.cs.unibo.it) or localhost (http://localhost:8000)
      url: "http://localhost:8000/public",
      method: "POST",
  }).done(function (data) {
      /*localStorage.setItem("permanentData", data);
      var savedText = localStorage.getItem("permanentData");*/
      $("ol.changepublic").append(data);
      return;
  }).fail(function () {
      console.log("failed...");
      return;
  });
  $.ajax({
      //change me for server (http://site181993.tw.cs.unibo.it) or localhost (http://localhost:8000)
      url: "http://localhost:8000/private",
      method: "POST",
  }).done(function (data) {
      /*localStorage.setItem("permanentData", data);
      var savedText = localStorage.getItem("permanentData");*/
      $("ol.changeprivate").append(data);
      return;
  }).fail(function () {
      console.log("failed...");
      return;
  });
});

function mkPrivate() {
  $.ajax({
    url: "/makeprivate",
    method: "POST",
    async: false,
    data: selectedFiles,
    success: function (response) {
      window.location.href = window.location.href;
    }
  })
  selectedFiles.files = [];
}

function mkPublic() {
  $.ajax({
    url: "/makepublic",
    method: "POST",
    async: false,
    data: selectedFiles,
    success: function (response) {
      window.location.href = window.location.href;
    }
  })
  selectedFiles.files = [];
}

function gotoEditor(fileName, type) {
  window.location.href = "/editor/" + type + "/" + fileName;
}
var selectedFiles = {
  files: []
};

var checkSel = undefined;

function unselectFile(event, ui) {
  let i = selectedFiles.files.indexOf(ui.selected.getAttribute("name"));
  selectedFiles.files.splice(i, 1);
}

function publicSelected(event, ui) {
  if (checkSel == 0) selectedFiles.files = [];
  checkSel = 1;
  if (selectedFiles.files.indexOf(ui.selected.getAttribute("name")) == -1)
    selectedFiles.files.push(ui.selected.getAttribute("name"));
  $("#selectableprivate").selectable("destroy");
  $("#selectableprivate").selectable({
    selected: privateSelected,
    unselected: unselectFile
  });
}

function privateSelected(event, ui) {
  if (checkSel == 1) selectedFiles.files = [];
  checkSel = 0;
  if (selectedFiles.files.indexOf(ui.selected.getAttribute("name")) == -1)
    selectedFiles.files.push(ui.selected.getAttribute("name"));
  $("#selectablepublic").selectable("destroy");
  $("#selectablepublic").selectable({
    selected: publicSelected,
    unselected: unselectFile
  });
}
$(function () {
  $("#selectablepublic").selectable({
    selected: publicSelected,
    unselected: unselectFile
  });
  $("#selectableprivate").selectable({
    selected: privateSelected,
    unselected: unselectFile
  });
});