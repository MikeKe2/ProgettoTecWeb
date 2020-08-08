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
  board.scenes[id.replace("#scena","")*1].opened=false;
  $(id).remove();
}

function invia(id){
  let ID = id.replace("#scena","")*1;
  let scena = board.scenes[ID].core;
  scena.nome = $("#editName" + ID).val();
  scena.descrizione = $("#editDescrizione" + ID).val();
  scena.widget = $("#editWidget" + ID).val();
  scena.tracciaAudio = $("#editAudio" + ID).val();
  scena.valutatore = $("#editValutatore" + ID).val();
  scena.timemax = $("#editName" + ID).val();
  for(let i = 0; i < $("#risposte" + ID + " li").length; i++){
    scena.risposte[i].valore = $("#editValore" + ID + "_" + i).val();
    scena.risposte[i].maxTime = $("#editMaxTime" + ID + "_" + i).val();
    scena.risposte[i].points = $("#editPoints" + ID + "_" + i).val();
  }
  board.PopulateMenu($(".miniNav .attivato").attr('id'));
  close(id);
}

function back(id){
  $(id+" .show").show();
  $(id+" .edit").hide();
}

function initScene(id){
  dragElement(id);
  $(id+ " .canc").click(function(){close(id)});
  $(id+ " .mod").click(function(){edit(id)});
  $(id+ " .back").click(function(){back(id)});
  $(id+ " form").on("submit",function(e){
    e.preventDefault();
    invia(id);
  });
  $(id+" .edit").hide();
}

function allowDrop(ev) {
  ev.preventDefault();
}
  
function drag(ev) {
  console.log(ev);
	ev.dataTransfer.setData("id", ev.target.id.replace("menuScena",""));
}


function dragTouch(ev) {
	ev.dataTransfer.setData("id", document.elementFromPoint(event.clientX, event.clientY).replace("menuScena",""));
}


function drop(ev) {
  ev.preventDefault();
  let index = ev.dataTransfer.getData("id")*1;
  board.scenes[index].core.x=(board.startX + mouse.x)/board.scale;
  board.scenes[index].core.y=(board.startY + mouse.y)/board.scale;
  board.PopulateMenu($(".miniNav .attivato").attr("id"));
}

function collapsehandler(){
  this.value=this.value=="+"?"-":"+";
  $(this).parent().next().toggle();
}