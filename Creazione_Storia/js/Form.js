function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  $(elmnt+" .header").mousedown(dragMouseDown);

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    let offset=$(elmnt).last().offset();
    // set the element's new position:
    $(elmnt).last().offset({
      top: offset.top - pos2,
      left: offset.left - pos1
    })
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function edit(id){
  $(id+" .edit").show();
  $(id+" .show").hide();
}
function close(id){
  $(id).remove();
  board.scenes[id.replace("#scena","")*1].opened=false;
  
}

function invia(id){
  let scena = board.scenes[id.replace("#scena","")*1].core;
  scena.nome = $(id+" input[name='title']").val();
  scena.descrizione = $(id+ " input[name ='description'").val();
  scena.widget = $(id+ " input[name ='widget'").val();
  scena.tracciaAudio = $(id+ " input[name ='audio'").val();
  scena.valutatore = $(id+ " input[name ='valutatore'").val();
  scena.timemax = $(id+ " input[name ='time'").val();
  //risposte
  //console.log($(id+" form").serialize());

  close(id);
}

function back(id){
  $(id+" .show").show();
  $(id+" .edit").hide();
}

function initScene(id){
  dragElement(id);
  $(id+ " button[name='canc']").click(function(){close(id)});
  $(id+ " button[name='mod']").click(function(){edit(id)});
  $(id+ " button[name='back']").click(function(){back(id)});
  $(id+ " form").on("submit",function(e){
    console.log($( this ).serialize());
    e.preventDefault();
    invia(id);
  });
  $(id+" .edit").hide();
}