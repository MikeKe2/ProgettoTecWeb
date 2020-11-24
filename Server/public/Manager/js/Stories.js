// {name: "", visibility:""

var Stories = new Vue({
	el: "#Stories",
	data:{
		list:[]
	},
	methods:{
		init: function(){
            $.get("/allStories", function(Serverdata){
                    for(let i = 0; i < Serverdata.length; i++){
						Stories.list.push({name: Serverdata[i].name, visibility: Serverdata[i].visibility});
                    }
                }
            );            
        },
        
		changevisibility: function(index){
            newVisibility = this.list[index].visibility == "private" ? "public" : "private";
            $.ajax({
                type: "POST",
                url: "/make" + newVisibility,
                data: {name: this.list[index].name},
                success: function(){
                    Stories.list[index].visibility = newVisibility;
                }
              });
        },
        
        changeName:function(index){
            let newname = prompt("insersci un nuovo nome", this.list[index].name);
			if(newname != ""){
				$.ajax({
                    type: "POST",
                    url: "/rename",
                    data: {name: this.list[index].name, newName: newname, visibility: this.list[index].visibility},
                    success: function(){
                        Stories.list[index].name = newname+".json";
                    }
                  });
			}
		},

		deleteStory: function(index){
			if(confirm("Sei sicuro di volere eliminare "+this.list[index].name+"?")){
				$.post("/delete", {name:Stories.list[index].name, visibility:this.list[index].visibility},()=>{
					Stories.list.splice(index,1);
				})
			}
        },

        newFile: function(){
			let newname = prompt("insersci un nuovo nome", "New_Story");
			if(newname != "" && newname!=null){
            $.ajax({
                type: "POST",
				url: "/stories",
				data: {name:newname},
                success: function(data){
                    Stories.list.push({name: data+".json", visibility: "private"})
                }
			  });
			}
		},
		
		getQR: function(index){
			alert("Se non funziona è colpa di martina");
        },
        
        open: function(index){
            if(confirm("vuoi modificare la storia: "+Stories.list[index].name+"?"))
                window.open("/editorStoria/"+Stories.list[index].visibility+"/"+Stories.list[index].name.replace(".json","")+"/",'_self',false);

        }
	}
});