//array di colore, un gruppo = un colore, identificato dall'indice
var groups = [];

groups.newgroup = function () {
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

function addNewGroup() {
	storia.ngruppi++;
	//aggiorna la lungezza di "to" nelle risposte
	for (let i = 0; i < storia.scene.length; i++) {
		if (storia.scene[i].risposte) {
			for (let j = 0; j < storia.scene[i].risposte.length; j++) {
				storia.scene[i].risposte[j].to.push(-1);
			}
		}
		if (i == 0)
			i++;
	}
	addGroup();
}

function addGroup() {
	groups.push(getRandomColor());
	addGroupButton();
}

<<
<< << < HEAD

function removeGroup() {
	if (storia.ngruppi > 1) {
		===
		=== =
		function removeGroup() {
			if (parseInt(storia.ngruppi) > 1) {
				>>>
				>>> > da4f13ad783a1f0d8d4b28e938aadcc87256c613
				storia.ngruppi--;
				//rimuove l'ultimo gruppo da tutte le risposte
				for (let i = 0; i < storia.scene.length; i++) {
					if (storia.scene[i].risposte) {
						for (let j = 0; j < storia.scene[i].risposte.length; j++) {
							storia.scene[i].risposte[j].to.pop();
						}
					}
				}
				$("#listGruppi .listItem").last().remove()
				if (board.activegroup >= parseInt(storia.ngruppi))
					$("#listGruppi .listItem").last().click();
				groups.pop();
			}
		}

		function addGroupButton() {
			//aggiunge l'interfaccia dei gruppi
			$("#listGruppi").append("<div id='Gruppo" + groups.length + "' class='listItem'>" + groups.length + "<div>");
			$("#listGruppi .listItem").last().css({
				color: groups.last()
			});
			let toCall = groups.length - 1;
			$("#listGruppi .listItem").last().click(function () {
				$("#listGruppi .listItem").not(this).removeClass("attivato");
				$(this).addClass("attivato");
				board.activegroup = toCall
			});
		}

		function initGroups() {
			//inizializza i colori e i bottoni dei gruppi
			for (let i = 0; i < parseInt(storia.ngruppi); i++) {
				addGroup();
			}
			$("#Gruppo1").addClass("attivato");
			$("#GruppoAdd").click(addNewGroup);
			$("#GruppoDel").click(removeGroup);
			groupCategories();
		}

		function groupCategories() {
			if (storia.categoria == "Singolo") {
				$("#listGruppi .listItem").removeClass("attivato");
				$("#listGruppi .listItem").hide();
				$("#listGruppi .listItem:nth-child(3)").addClass("attivato").show();
				board.activegroup = 0;
			} else {
				$("#listGruppi .listItem").show();
			}
		}