var Avventure = new Vue({
	el: "#Stories",
	data: {
		list: []
	},
	mounted: async function () {
		for (let usertag of $(".user")) {
			let user = $(usertag).html();
			this.list.push({
				name: user,
				stories: await $.get('/' + user + '/stories')
			});
		}
		this.$nextTick(function () {
			for (let uindex = 0; uindex < this.list.length; uindex++) {
				for (let sindex = 0; sindex < this.list[uindex].stories.length; sindex++) {
					let user = this.list[uindex].name;
					let adventure = this.list[uindex].stories[sindex];
					let qrmaker = new QRCode($("#qr_" + uindex + "_" + sindex)[0])
					qrmaker.clear(); // clear the code.
					let url = "https://site181993.tw.cs.unibo.it/avventura/" + user + "/" + adventure;
					qrmaker.makeCode(encodeURI(url)); // make another code.
				}
			}
		});
	},
	methods: {
		copy: function (uindex, sindex) {
			let user = this.list[uindex].name;
			let adventure = this.list[uindex].stories[sindex];
			let text = encodeURI(("https://site181993.tw.cs.unibo.it/avventura/" + user + "/" + adventure).replaceAll(".json", ""));

			var falseinput = document.createElement("textarea");
			document.body.appendChild(falseinput);
			falseinput.value = text;
			falseinput.select();
			document.execCommand("copy");
			document.body.removeChild(falseinput);

			alert("url copiato!");
		}
	}
});

/*
	updated: function () {
		this.$nextTick(function () {
			for (let uindex = 0; uindex < this.list.length; uindex++) {
				for (let sindex = 0; sindex < this.list[uindex].stories.length; sindex++) {
					let user = this.list[uindex].name;
					let adventure = this.list[uindex].stories[sindex];
					let qrmaker = new QRCode($("#qr_" + uindex + "_" + sindex)[0])
					qrmaker.clear(); // clear the code.
					let url = "https://site181993.tw.cs.unibo.it/avventura/" + user + "/" + adventure;
					qrmaker.makeCode(encodeURI(url)); // make another code.
				}
			}
		})
	}
});
*/