var goCastPlugin;
var onlinePeers;

var $sign_in;
var $online_peers;
var $peers_list;

var $user_template = $("#user_template").html();


function onPluginLoad() {
  loadElements();
  createEvents();
}

function addEvent(obj, name, func) {
  if (window.addEventListener) {
    obj.addEventListener(name, func, false); 
  } else {
    obj.attachEvent("on"+name, func);
  }
}

function loadElements() {
  $sign_in      = $("#sign_in");
  $online_peers = $(".online_peers");
  $peers_list   = $online_peers.find(".peers");
  $user_template = $("#user_template").html();

  goCastPlugin = document.getElementById("go_cast_plugin");
}

function createEvents() {
  addEvent(goCastPlugin, "SignedIn", onSignedIn);

  $("#sign_in").submit(onSignIn);
}

function onSignedIn(message) {
  onlinePeers = parsePeers(message);
  hideSignInFormAndShowPeers( updatePeerList );
}

function onSignIn(){
  username = $("#sign_in #username").val();
  port = $("#sign_in #port").val();
  ip = $("#sign_in #ip").val();

  goCastPlugin.Signin(username,ip,port);

  return false;
}

function parsePeers(message) {
  peers = $.map( message.split(':'), function(val, i) {
    if (val != null && val !== "") {
      return { username: val };
    } else {
      return null;
    }
  });
  return peers;
}

function hideSignInFormAndShowPeers(callback) {
  $sign_in.hide();
  $online_peers.fadeIn(1000);
  callback();
}

function render(template, view) {
  return Mustache.to_html(template, view);
}

function updatePeerList() {
  $peers_list.empty();
  $.each(onlinePeers, function(index, peer) {
    $peers_list.append( render($user_template, peer) );
  });
}
