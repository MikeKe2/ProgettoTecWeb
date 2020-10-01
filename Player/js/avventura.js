var storia;
var scena_corr = -1;

$.getJSON("/js/test.json", function(data){
    storiaCallback(data);
});

function storiaCallback(data){
    storia = data;
    console.log(storia);
    initialize();
}

function initialize(){
    $("#titolo").html(storia.nome);
    $("#btn").click(function(){
        checkResult(0);
    })
}

function checkResult(result){
    nextScene();
}

function nextScene(){
    scena_corr++;
    $("#testo").html(storia.scene[scena_corr].descrizione);
    $("#widget").load("/widgets/number.html")
    if(scena_corr == storia.scene.length-1)
        $("#btn").hide();
}

