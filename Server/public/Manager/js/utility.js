var qrmaker;
$(document).ready(()=>{
  Stories.init();
  Media.init(Media.types[0]);
  qrmaker = new QRCode($("#qr")[0]);
  $("#qr").click(copyToClipboard)
  $("#load").on("change",()=>{
    let file = $("#load")[0].files[0];
    console.log(file.name);
    for(story of Stories.list){
      console.log(story);
      if(story.name == file.name){
        if(!confirm("Così facendo sovrascriverai il file "+story.name+". Sei sicuro?"))
          return;
      }
    }

    var reader = new FileReader();
    reader.onload = (event)=>{
      console.log(event.target.result);
      var obj = JSON.parse(event.target.result);
      $.post("/import", {name: file.name, data:obj},()=>{
        Stories.list.push({name: file.name, visibility: "private"});
      });
    };
    reader.readAsText($("#load")[0].files[0]);
  })
  // $(function () {
  //   $('[data-toggle="popover"]').popover();
  // })
  // $('.popover-dismiss').popover({
  //   trigger: 'focus'
  // })
});
function copyToClipboard(){
  let cb = $("#urlValue")[0];
  cb.style.display='block';
  cb.select();
  document.execCommand('copy');
  cb.style.display='none';
  alert("url copiato!");
}
