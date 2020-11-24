var qrmaker;
$(document).ready(()=>{
  Stories.init();
  Media.init(Media.types[0]);
  qrmaker = new QRCode($("#qr")[0]);
});