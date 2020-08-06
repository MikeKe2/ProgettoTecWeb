var htmlBase ="<style>\n$STYLE\n</style>\n<script type='text/javascript'>\n$SCRIPT\n</script>\n<div id='Widget'>\n$BODY\n</div>"
var html= "";
$(document).ready(function(){

    $("#run").click(function(){
        html = htmlBase.replace("$STYLE",$("#cssText").val()).replace("$SCRIPT",$("#javascriptText").val()).replace("$BODY",$("#htmlText").val());
        $("#testHTML").html(html);
    });
    $("#save").click(function(){
        html = htmlBase.replace("$STYLE",$("#cssText").val()).replace("$SCRIPT",$("#javascriptText").val()).replace("$BODY",$("#htmlText").val());
        download("widget.html",html);

    });

});
  


function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}

  