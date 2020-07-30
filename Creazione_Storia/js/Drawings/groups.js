var groups=[]

groups.newgroup=function(){
	this.append(new group())
}

class group{
	constructor(){
		this.color=getRandomColor();
	}
}

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
	  color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}