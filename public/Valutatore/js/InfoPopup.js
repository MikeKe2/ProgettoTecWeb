function Toast(type, msg) {
  this.type = type;
  this.msg = msg;
}

var toasts = [
  new Toast('success', 'è entrato in chat.'),
  new Toast('warning', 'ha lasciato la chat.'),
  new Toast('info', 'ha lasciato un messaggio nella sua chat.'),
  new Toast('error', 'Connessione al server terminata.'),
  new Toast('info', 'Tentativo di riconnessione in corso....'),
  new Toast('success', 'Sei stato riconnesso!'),
  new Toast('info', 'Collegamento avvenuto con successo.'),
  new Toast('info', "Ulteriore dispositivo collegato all'account: "),
  new Toast('error', "L'utente "),
  new Toast('info', ' attende valutazione per una risposta'),
];

function showToast(i, data) {
  var t = toasts[i];

  switch (i) {
    case 0:
      toastr[t.type](`${data.username} ${t.msg}`);
      break;
    case 1:
      toastr[t.type](`${data.username} ${t.msg}`);
      break;
    case 2:
      toastr[t.type](`${data.username} ${t.msg}`);
      break;
    case 3:
      toastr[t.type](t.msg);
      break;
    case 4:
      toastr[t.type](t.msg);
      break;
    case 5:
      toastr[t.type](t.msg);
      break;
    case 6:
      toastr[t.type](t.msg);
      break;
    case 7:
      toastr[t.type](t.msg + data.username);
      break;
    case 8:
      toastr[t.type](`${t.msg + data.username} richiede il suo aiuto`);
      break;
    case 9:
      toastr[t.type](data.username + t.msg);
      break;
    default:
      toastr[t.type](t.msg);
      break;
  }
}

toastr.options.preventDuplicates = true;
toastr.options.closeButton = true;
toastr.options.progressBar = true;
toastr.options.positionClass = 'toast-top-right';
toastr.options.timeOut = 2500;
toastr.options.fadeOut = 150;
toastr.options.fadeIn = 150;