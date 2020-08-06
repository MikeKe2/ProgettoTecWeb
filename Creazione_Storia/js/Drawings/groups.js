var groups=[];

groups.newgroup=function(){
	this.append(new group())
}

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
	  color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
function addNewGroup(){
	storia.ngruppi++;
	for(let i = 0; i < storia.scene.length; i++){
		for(let j = 0; j < storia.scene[i].risposte.length; j ++){
			storia.scene[i].risposte[j].to.push(-1);
		}
	}
	addGroup();
}

function addGroup(){
	groups.push(getRandomColor());
	addGroupButton();
}

function removeGroup(){
	if(storia.ngruppi > 1){
		storia.ngruppi--;
		for(let i = 0; i < storia.scene.length; i++){
			for(let j = 0; j < storia.scene[i].risposte.length; j ++){
				storia.scene[i].risposte[j].to.pop();
			}
		}
		$("#listGruppi .listItem").last().remove();
		groups.pop();
	}
}

function addGroupButton(){
	$("#listGruppi").append("<div id='Gruppo"+groups.length+"' class='listItem'>"+groups.length+"<div>");
	$("#listGruppi .listItem").last().css({color: groups.last()});
	let toCall = groups.length-1;
	$("#listGruppi .listItem").last().click(function(){$("#listGruppi .listItem").not(this).removeClass("attivato"); $(this).addClass("attivato"); board.activegroup=toCall});
}

function initGroups(){

	for(let i = 0; i < storia.ngruppi; i++){
		addGroup();
	}	
	$("#Gruppo1").addClass("attivato");
	$("#GruppoAdd").click(addNewGroup);
	$("#GruppoDel").click(removeGroup);
	if(storia.categoria=="singolo")
		$("#listGruppi").hide();
}

//mettere i bottoni + , - e visualizza tutti

[1,null,5,null,null]