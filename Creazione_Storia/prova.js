var storia = {
    "nome": "Storia di prova",
    "categoria": "gruppi",
    "target": "6-12",
    "ngruppi": 5,
    "background": "taccuino",
    "css":"/myfile.css",
    "autore": "autore1",
    "scene":[
        {
            "nome": "scena0",
            "descrizione": "C'era un pampino brutto che è stupido",
            "widget": "text",
            "tracciaAudio": null,
            "valutatore" : false,
            "x":15,
            "y":15,
            "risposte": [
                {
                    "valore" : "15", 
                    "to":[1, -1, -1, -1, -1],
                    "maxTime": 15,
                    "points":5000
                },
                {
                    "valore" : "15",
                    "maxTime": 0,
                    "to":[1, -1, -1, -1, -1],
                    "points":500
                }
            ]
        },
        {
            "nome": "scena1",
            "descrizione": "C'era un altro pampino brutto che è stupido",
            "widget": "text",
            "tracciaAudio": null,
            "valutatore" : false,
            "x":150,
            "y":100,
            "risposte": [
                {
                    "valore" : "15", 
                    "to":[-1, -1, -1, -1, -1],
                    "maxTime": 15,
                    "points":5000
                },
                {
                    "valore" : "15",
                    "maxTime": 0,
                    "to":[-1, -1, -1, -1, -1],
                    "points":500
                }
            ]
        },
        {
            "nome": "scena2",
            "descrizione": "C'era un altro pampino brutto che è stupido e sono troppi ora",
            "widget": "text",
            "tracciaAudio": null,
            "valutatore" : false,
            "x":null,
            "y":null,
            "risposte": [
                {
                    "valore" : "15", 
                    "to":[-1, -1, -1, -1, -1],
                    "maxTime": 15,
                    "points":5000
                },
                {
                    "valore" : "15",
                    "maxTime": 0,
                    "to":[-1, -1, -1, -1, -1],
                    "points":500
                }
            ]
        }
    ]
}