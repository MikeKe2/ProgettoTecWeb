var qrmaker;
$(document).ready(() => {
  Stories.init();
  Media.init(Media.types[0]);
  qrmaker = new QRCode($("#qr")[0]);
  $("#qr").click(copyToClipboard)
  $("#load").on("change", () => {
    let file = $("#load")[0].files[0];
    for (story of Stories.list) {
      if (story.name == file.name) {
        if (!confirm("Così facendo sovrascriverai il file " + story.name + ". Sei sicuro?"))
          return;
      }
    }

    var reader = new FileReader();
    reader.onload = (event) => {
      var obj = JSON.parse(event.target.result);
      $.post("/import", {
        name: file.name,
        data: obj
      }, () => {
        Stories.list.push({
          name: file.name,
          visibility: "private"
        });
      });
    };
    reader.readAsText($("#load")[0].files[0]);
  })
});

function copyToClipboard() {
  let cb = $("#urlValue")[0];
  cb.style.display = 'block';
  cb.select();
  document.execCommand('copy');
  cb.style.display = 'none';
  alert("url copiato!");
}