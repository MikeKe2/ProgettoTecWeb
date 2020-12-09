var Media = new Vue({
	el: "#Media",
	data:{
		types: ["Images","Audios","Css","Widgets"],
		clicked: "Images",
		list: []
	},
	methods:{
		init: function(type){
			this.clicked=type;
            $.get("/media/"+this.clicked.toLowerCase(), (Serverdata)=>{
				Media.list.splice(0, Media.list.length);
                for(let i = 0; i < Serverdata.length; i++){
					Media.list.push(Serverdata[i]);
                }
            });            
        },
        
        changeName:function(index){
            let newname = prompt("insersci un nuovo nome", this.list[index]);
			if(newname != null && newname != ""){
				$.post("/media/rename/"+this.clicked.toLowerCase(), {name: this.list[index], newName: newname},()=>{
					Media.$set(Media.list, index, newname);
					
                });
			}
		},

		deleteMedia: function(index){
			if(confirm("Sei sicuro di volere eliminare "+this.list[index]+"?")){
				$.post("/media/delete/"+this.clicked.toLowerCase(), {name:this.list[index]}, ()=>{
					Media.list.splice(index, 1);
				})
			}
        },

        newFile: function(){
			let file = $("#newFile")[0].file[0];
			$.post("/media/"+this.clicked.toLowerCase(), file).success(()=>{
				Media.list.push(file.name);
			})
		},
        
        open: function(index){
            window.open("/media/"+$("#user").html()+"/"+this.clicked.toLowerCase()+"/"+this.list[index]);
        }
	}
});