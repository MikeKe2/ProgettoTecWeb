var id; 

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  $(elmnt+" .header").mousedown(dragMouseDown);
  $(elmnt+" .header").on("touchstart",dragMouseDown);

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX || e.touches[0].clientX;
    pos4 = e.clientY || e.touches[0].clientY;
    document.onmouseup = closeDragElement;
    $(elmnt+" .header").on("touchend",closeDragElement);
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
    $(elmnt+" .header").on("touchmove",elementDrag);
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    let x = e.clientX || e.touches[0].clientX;
    let y = e.clientY || e.touches[0].clientY;
    pos1 = pos3 - x;
    pos2 = pos4 - y;
    pos3 = x;
    pos4 = y;
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
}

function del(id){
  $(".scene").remove();
  board.rem(id.replace("#scena","")*1)
}

function invia(id){
  let ID = id.replace("#scena","")*1;
  let scena = board.scenes[ID].core;
  scena.nome = $("#editName" + ID).val();
  scena.descrizione = $("#editDescrizione" + ID).val();
  scena.img = $("#editImmagine" + ID).val();
  scena.imgdescription = $("#editDescImm" + ID).val();
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
  if(id!="#settings_div"){
    dragElement(id);
    $(id+ " form").on("submit",function(e){
      e.preventDefault();
      invia(id);
    });
  }
  else{
    $(id+ " form").on("submit",function(e){
      e.preventDefault();
      storia.nome = $("#settingsNome").val();
      storia.categoria = $("#settingsCategoria").val();
      storia.target = $("#settingsTarget").val();
      storia.background = $("#settingsBg").val();
      storia.css = $("#settingsCss").val();
      storia.accessibile = $("#settingsAccessibilita").prop("checked")
      storia.autore = $("#settingsAuthor").val();
      $("#settings_div")[0].remove();
    });
  }
  $(id+ " .canc").click(function(){close(id)});
  $(id+ " .mod").click(function(){edit(id)});
  $(id+ " .remove").click(function(){del(id)});
  $(id+ " .back").click(function(){back(id)});
  $(id+" .edit").hide();
}

function allowDrop(ev) {
  ev.preventDefault();
}
  
function drag(ev) {
	id=ev.target.id.replace("menuScena","");
}

function dropMove(ev){
  board.dropping = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY).id == "canvas";

}


function dragTouch(ev) {
  id = ev.currentTarget.id.replace("menuScena","");
}

function dropTouch(ev) {
  if(id && document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY).id == "canvas"){
    ev.preventDefault();
    board.scenes[id].core.x=(board.startX + ev.changedTouches[0].clientX)/board.scale;
    board.scenes[id].core.y=(board.startY + ev.changedTouches[0].clientY)/board.scale;
    board.PopulateMenu($(".miniNav .attivato").attr("id"));
  }
  board.dropping=false;
}

function drop(ev) {
  ev.preventDefault();
  if(id!=null){
    board.scenes[id].core.x=(board.startX + mouse.x)/board.scale;
    board.scenes[id].core.y=(board.startY + mouse.y)/board.scale;
    board.PopulateMenu($(".miniNav .attivato").attr("id"));
  }
  id=null;
}

function collapsehandler(){
  this.value=this.value=="+"?"-":"+";
  $(this).parent().next().toggle();
}

function download() {

  //TODO richiamare funzione "salva"

  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(storia)));
  element.setAttribute('download', storia.nome+".mms");

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function settingsToggle(){
  let div = $("#settings_div")[0];
  console.log(div);
  if(!div){
    let settings = $("#settings").html();
    settings = settings.replace("$NOME",storia.nome).replace("$NOME",storia.nome != null? storia.nome : "Non ancora inserito");
    settings = settings.replace("$CATEGORIA",storia.categoria != null? storia.categoria.replace("_", " ") : "Non ancora inserito");
    settings = settings.replace("$TARGET",storia.target != null? storia.target : "Non ancora inserito");
    settings = settings.replace("$ACCESSIBILITA",storia.accessibile);
    settings = settings.replace("$IMMAGINE",storia.background != null? storia.background : "Non ancora inserito");
    settings = settings.replace("$AUTORE",storia.autore != null? storia.autore : "Non ancora inserito").replace("$AUTORE",storia.autore);
    settings = settings.replace("$CSS",storia.css != null? storia.css : "Non ancora inserito");
    $("body").append(settings);
    $("#settingsAccessibilita").prop( "checked", storia.accessibile);
    $("#settingsCategoria").val(storia.categoria);
    $("#settingsTarget").val(storia.target);
    $("#settingsBg").val(storia.background);
    initScene("#settings_div");
  }
  else{
    div.remove();
  }
}

function delRisp(){
  let id = this.id.replace("elimina","").split("_");
  for(let i = 0; i < board.scenes[id[0]].core.risposte[id[1]].to.length; i++){
    if(board.scenes[id[0]].core.risposte[id[1]].to[i] != -1){
      board.eraseArrow(board.scenes[id[0]].core, board.scenes[id[0]].core.risposte[id[1]].to[i], i);
    }
  }
  board.scenes[id[0]].core.risposte.splice(id[1],1);

  board.scenes[id[0]].populateRisp();
  
  $("#scena"+id[0]+" .show").hide();
}