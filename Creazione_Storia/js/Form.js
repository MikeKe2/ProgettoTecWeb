// //dragElement($("#scena$ID"));


// function dragElement(elmnt) {
//     var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
//     elmnt.onmousedown = dragMouseDown;
  
//     function dragMouseDown(e) {
//       e = e || window.event;
//       e.preventDefault();
//       // get the mouse cursor position at startup:
//       pos3 = e.clientX;
//       pos4 = e.clientY;
//       document.onmouseup = closeDragElement;
//       // call a function whenever the cursor moves:
//       document.onmousemove = elementDrag;
//     }
  
//     function elementDrag(e) {
//       e = e || window.event;
//       e.preventDefault();
//       // calculate the new cursor position:
//       pos1 = pos3 - e.clientX;
//       pos2 = pos4 - e.clientY;
//       pos3 = e.clientX;
//       pos4 = e.clientY;
//       // set the element's new position:
//       elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
//       elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
//     }
  
//     function closeDragElement() {
//       /* stop moving when mouse button is released:*/
//       document.onmouseup = null;
//       document.onmousemove = null;
//     }
//   }
function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    $(elmnt).mousedown(dragMouseDown);
    //elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    console.log("dragMouseDown");
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
    console.log("elementDrag");
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    let offset=$(elmnt).last().offset();
    console.log(offset);
    // set the element's new position:
    $(elmnt).last().offset({
      top: offset.top - pos2,
      left: offset.left - pos1
    })
    
    
    // ("margin-top",elmnt.offsetTop - pos2 + "px");
    // $(elmnt).css("margin-left",elmnt.offsetLeft - pos1 + "px");
  }

  function closeDragElement() {
    console.log("closeDragElement");
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}