var Media = new Vue({
	el: "#Media",
	data: {
		types: ["Images", "Audios", "Css", "Widgets"],
		clicked: "Images",
		list: []
	},
	methods: {
		init: function (type) {
			this.clicked = type;
			$.get("/media/" + this.clicked.toLowerCase(), (Serverdata) => {
				Media.list.splice(0, Media.list.length);
				for (let i = 0; i < Serverdata.length; i++) {
					Media.list.push(Serverdata[i]);
				}
			});
		},

		changeName: function (index) {
			let newname = prompt("inserisci un nuovo nome", this.list[index]);
			if (newname != null && newname != "") {
				$.post("/media/rename/" + this.clicked.toLowerCase(), {
					name: this.list[index],
					newName: newname
				}, () => {
					Media.$set(Media.list, index, newname);

				});
			}
		},

		deleteMedia: function (index) {
			if (confirm("Sei sicuro di volere eliminare " + this.list[index] + "?")) {
				$.post("/media/delete/" + this.clicked.toLowerCase(), {
					name: this.list[index]
				}, () => {
					Media.list.splice(index, 1);
				})
			}
		},

		newFile: function () {
			let formdata = new FormData();
			if ($("#newFile").prop('files').length > 0) {
				let file = $("#newFile").prop('files')[0];
				formdata.append("file", file);
				$.ajax({
					url: "/media/" + this.clicked.toLowerCase(),
					type: "POST",
					data: formdata,
					processData: false,
					contentType: false,
					xhr: function () {
						var xhr = new window.XMLHttpRequest();
						xhr.upload.addEventListener("progress", (evt) => {
							let percent = (evt.loaded / evt.total) * 100;
							$(".progress-bar").css({
								'width': Math.round(percent) + '%'
							});
						}, false);
						xhr.upload.addEventListener("load", function () {
								$(".progress-bar").css({
									'width': '0'
								});
							}, false);
						return xhr;
					},
					success: function (result) {
						Media.list.push(result);
					}
				});
				$("#newFile").val(null);
			}
		},

		open: function (index) {
			window.open("/media/" + $("#user").html() + "/" + this.clicked.toLowerCase() + "/" + this.list[index]);
		}
	}
});