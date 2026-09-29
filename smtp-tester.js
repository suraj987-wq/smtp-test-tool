// SMTP Tester - ONE file, no npm install needed.
// Email + SMS + WhatsApp + Viber (with webhook to capture Viber user IDs).  Run:  node smtp-tester.js      (opens http://localhost:3000 automatically)
const http = require('http');
const net = require('net');
const https = require('https');
const tls = require('tls');
const os = require('os');
const crypto = require('crypto');
const dns = require('dns').promises;
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const BIND = process.env.HOST || '127.0.0.1';
const PUBLIC_BIND = !['127.0.0.1', 'localhost', '::1'].includes(BIND);
const HTML = String.raw`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SMTP test</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
<style>
:root{--bg1:#e9ecff;--bg2:#ffe9f1;--ink:#1b1740;--mut:#6b6893;--line:#e2e0f5;--card:#fff;--soft:#f5f3ff;--acc:#7c3aed;--acc2:#db2777;--log:#0d0b26;--logtx:#d9dcff;--ha:#4338ca;--hb:#7c3aed;--hc:#db2777}
@media (prefers-color-scheme:dark){:root{--bg1:#0f0d24;--bg2:#1c1033;--ink:#efeeff;--mut:#a09ecb;--line:#2e2a55;--card:#171434;--soft:#221e48;--acc:#a78bfa;--log:#070615}}
*{box-sizing:border-box}
html{min-height:100%;background:linear-gradient(135deg,var(--bg1),var(--bg2)) fixed}
body{margin:0;min-height:100vh;color:var(--ink);font:15px/1.5 "Plus Jakarta Sans",system-ui,-apple-system,Segoe UI,sans-serif;padding:40px 16px}
.wrap{max-width:1180px;margin:0 auto}
.card{background:var(--card);border:1px solid var(--line);border-radius:28px;box-shadow:0 30px 60px -24px rgba(79,70,229,.4);overflow:hidden}
.hd{position:relative;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:30px 34px;color:#fff;background:linear-gradient(120deg,var(--ha),var(--hb) 55%,var(--hc));overflow:hidden}
.hd:after{content:"";position:absolute;right:-60px;top:-90px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.28),transparent 70%);pointer-events:none}
.hd>*{position:relative;z-index:1}
h1{margin:0;font-size:26px;letter-spacing:-.01em}
.sub{margin:4px 0 0;font-size:13px;opacity:.85}
.badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.4);border-radius:99px;padding:7px 15px;font-size:11px;font-weight:800;letter-spacing:.06em;white-space:nowrap}
.badge:before{content:"";width:8px;height:8px;border-radius:50%;background:#6ee7b7;box-shadow:0 0 10px #6ee7b7}
form{padding:32px 34px;display:grid;grid-template-columns:repeat(12,1fr);gap:22px 20px}
.f{display:flex;flex-direction:column;gap:8px;min-width:0}
.f{grid-column:span 6}.c3{grid-column:span 3}.c4{grid-column:span 4}.s2{grid-column:span 6}.s3{grid-column:1/-1}
label{font-weight:800;font-size:13px;display:flex;justify-content:space-between;color:var(--ink)}
label small{font-weight:600;color:var(--mut);font-size:11px}
input,select,textarea{width:100%;font:inherit;color:var(--ink);background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:13px 16px;transition:border-color .15s,box-shadow .15s}
textarea{resize:vertical;min-height:80px}
input:hover,select:hover,textarea:hover{border-color:#c4b5fd}
input:focus,select:focus,textarea:focus{outline:0;border-color:var(--acc);box-shadow:0 0 0 4px rgba(124,58,237,.16)}
button:focus-visible,.chip:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{border:1px solid transparent;background:var(--soft);color:var(--acc);border-radius:99px;padding:4px 12px;font:800 11px inherit;font-family:inherit;cursor:pointer;transition:transform .12s,box-shadow .12s}
.chip:hover{transform:translateY(-1px);box-shadow:0 6px 14px -6px currentColor}
#hosts .chip:nth-child(1){background:#dbeafe;color:#1d4ed8}
#hosts .chip:nth-child(2){background:#fee2e2;color:#b91c1c}
#hosts .chip:nth-child(3){background:#d1fae5;color:#047857}
#hosts .chip:nth-child(4){background:#fef3c7;color:#b45309}
#hosts .chip:nth-child(5){background:#fce7f3;color:#be185d}
#hosts .chip:nth-child(6){background:#e0e7ff;color:#4338ca}
#ports .chip{background:var(--soft);color:var(--acc)}
.pw{position:relative}.pw input{padding-right:64px}
.eye{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:0;color:var(--acc);cursor:pointer;padding:8px;font-size:12px;font-weight:800}
.seg{display:inline-flex;background:var(--soft);border-radius:14px;padding:4px;gap:4px;align-self:flex-start}
.seg button{border:0;background:transparent;color:var(--mut);padding:8px 18px;border-radius:10px;font:800 13px inherit;font-family:inherit;cursor:pointer}
.seg button.on{background:linear-gradient(120deg,var(--hb),var(--hc));color:#fff;box-shadow:0 6px 14px -6px var(--hc)}
.brow{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:8px}
.thumbs{display:flex;gap:10px;flex-wrap:wrap}
.th{position:relative;width:96px;height:96px;border-radius:14px;overflow:hidden;border:2px solid var(--line)}
.th img{width:100%;height:100%;object-fit:cover}
.th button{position:absolute;top:4px;right:4px;border:0;border-radius:50%;width:22px;height:22px;background:rgba(20,10,50,.75);color:#fff;cursor:pointer}
[hidden]{display:none!important}
.ft{grid-column:1/-1;border-top:1px solid var(--line);padding-top:24px;display:flex;align-items:center;gap:18px;flex-wrap:wrap}
button.run{background:linear-gradient(120deg,var(--hb),var(--hc));color:#fff;border:0;border-radius:14px;padding:16px 30px;font:800 15px inherit;font-family:inherit;cursor:pointer;box-shadow:0 14px 26px -10px var(--hc);transition:transform .12s,box-shadow .12s}
button.run:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 18px 30px -10px var(--hc)}
button.run:disabled{opacity:.6;cursor:wait}
.stop{background:transparent;border:2px solid #f43f5e;color:#f43f5e;border-radius:14px;padding:14px 22px;font:800 14px inherit;font-family:inherit;cursor:pointer}
.stop:hover{background:#f43f5e;color:#fff}
.note{color:var(--mut);font-size:12px;max-width:520px}
.chk{display:flex;gap:8px;align-items:center;font-size:12px;color:var(--mut);font-weight:700}.chk input{width:auto;accent-color:var(--acc)}
.status{display:flex;justify-content:space-between;align-items:center;margin:28px 6px 12px;font-weight:800}
.status>span:first-child{display:flex;align-items:center;gap:10px}
.dot{width:11px;height:11px;border-radius:50%;background:var(--mut)}
.dot.busy{background:#fbbf24;box-shadow:0 0 0 0 rgba(251,191,36,.6);animation:pulse 1.2s infinite}
.dot.ok{background:#10b981;box-shadow:0 0 12px #10b981}
.dot.bad{background:#f43f5e;box-shadow:0 0 12px #f43f5e}
@keyframes pulse{70%{box-shadow:0 0 0 10px rgba(251,191,36,0)}100%{box-shadow:0 0 0 0 rgba(251,191,36,0)}}
@media (prefers-reduced-motion:reduce){.dot.busy{animation:none}.chip,button.run{transition:none}}
.st2{font-size:11px;color:var(--mut);display:flex;gap:14px;align-items:center}
.st2 button{background:var(--soft);border:0;border-radius:99px;padding:5px 12px;color:var(--acc);font:800 11px inherit;font-family:inherit;cursor:pointer}
#log{background:var(--log);color:var(--logtx);border:1px solid rgba(139,92,246,.4);border-radius:22px;padding:20px 22px;font:12.5px/1.7 ui-monospace,SFMono-Regular,Consolas,monospace;min-height:220px;max-height:460px;overflow:auto;white-space:pre-wrap;word-break:break-word;box-shadow:0 24px 50px -24px rgba(124,58,237,.6),inset 0 0 60px rgba(124,58,237,.08)}
#log .ts{color:#6a6f9f;margin-right:10px}
.l-ok{color:#34d399;font-weight:700}.l-error{color:#fb7185;font-weight:700}.l-info{color:#60a5fa}.l-warn{color:#fbbf24}.l-dim{color:#8b8fbf}
.l-smtp.lc{color:#f0abfc}.l-smtp.ls{color:#93c5fd}
.empty{color:#8b8fbf}
@media(max-width:760px){form{grid-template-columns:1fr;padding:22px}.f,.c3,.c4,.s2,.s3{grid-column:1/-1}.hd{padding:22px}}
</style></head><body>
<div class="wrap">
<div class="card">
<div class="hd"><div><h1 id="ttl">SMTP connection details</h1><p class="sub">Test your connection, send greetings, and watch the live log.</p></div><span class="badge">DIAGNOSTIC TEST</span></div>
<form id="f" autocomplete="off" novalidate>
  <div class="f s3"><label>Send via</label><div class="seg"><button type="button" data-c="email" class="on">Email</button><button type="button" data-c="sms">SMS</button><button type="button" data-c="wa">WhatsApp</button><button type="button" data-c="viber">Viber</button></div></div>
  <div class="f s2 sp" hidden><label for="prov">SMS provider</label><select id="prov"><option value="sparrow">Sparrow SMS (Nepal)</option><option value="aakash">Aakash SMS (Nepal)</option><option value="custom">Custom HTTP API</option></select></div>
  <div class="f s2" id="sendbox" hidden><label for="sender" id="sendl">Sender identity <small>the "from" name from your provider</small></label><input id="sender" placeholder="e.g. InfoSms"></div>
  <div class="f s3 sm" hidden><label for="tok" id="tokl">API token</label><div class="pw"><input id="tok" type="password" autocomplete="off" placeholder="Paste your SMS API token"><button type="button" class="eye" id="eye2">Show</button></div></div>
  <div class="f s3 vb" hidden><label for="vbUrl">Public webhook URL <small>HTTPS, e.g. ngrok - leave empty + Set to remove</small></label>
    <div class="brow" style="margin-top:0"><input id="vbUrl" placeholder="https://xxxx.ngrok-free.app" style="flex:1;min-width:220px"><button type="button" class="chip" id="vbSet">Set webhook</button><button type="button" class="chip" id="vbRef">Refresh subscribers</button></div>
    <div class="note">Run <b>ngrok http 3000</b>, paste the https address above, click Set webhook, then have people subscribe to your bot. Their IDs appear here - click one to use it as the recipient.</div>
    <div id="vbList" class="chips"></div></div>
  <div class="f c3 wa" hidden><label for="waId">Phone number ID <small>Meta API Setup</small></label><input id="waId" placeholder="1234567890"></div>
  <div class="f c3 wa" hidden><label for="waCc">Default country code <small>if no +</small></label><input id="waCc" value="977"></div>
  <div class="f c3 wa" hidden><label for="waTpl">Template name <small>optional</small></label><input id="waTpl" placeholder="hello_world"></div>
  <div class="f c3 wa" hidden><label for="waLang">Template language</label><input id="waLang" value="en_US"></div>
  <div class="f s3 cu" hidden><label for="cUrl">API URL</label><input id="cUrl" placeholder="https://sms.example.com/api/send"></div>
  <div class="f c4 cu" hidden><label for="cMethod">Request type</label><select id="cMethod"><option value="form">POST (form)</option><option value="json">POST (JSON)</option><option value="get">GET (query)</option></select></div>
  <div class="f c4 cu" hidden><label for="cTokName">Token field name</label><input id="cTokName" value="token"></div>
  <div class="f c4 cu" hidden><label for="cTokIn">Token sent as</label><select id="cTokIn"><option value="field">Field / query value</option><option value="bearer">Bearer header</option></select></div>
  <div class="f c4 cu" hidden><label for="cToName">Number field</label><input id="cToName" value="to"></div>
  <div class="f c4 cu" hidden><label for="cTextName">Message field</label><input id="cTextName" value="text"></div>
  <div class="f c4 cu" hidden><label for="cFromName">Sender field <small>optional</small></label><input id="cFromName" value="from"></div>
  <div class="f s2 em"><label for="host">SMTP Server</label>
    <input id="host" name="host" placeholder="smtp.gmail.com" required>
    <div class="chips" id="hosts"></div></div>
  <div class="f c3 em"><label for="port">Port</label>
    <input id="port" name="port" type="number" value="587" required>
    <div class="chips" id="ports"></div></div>
  <div class="f c3 em"><label for="sec">Security <small>Auto is usually best</small></label>
    <select id="sec"><option value="auto">Auto</option><option value="ssl">SSL/TLS</option><option value="starttls">STARTTLS</option><option value="none">None</option></select></div>
  <div class="f s2 em"><label for="user">Username</label><input id="user" placeholder="you@example.com"></div>
  <div class="f em"><label for="pass">Password</label>
    <div class="pw"><input id="pass" type="password"><button type="button" class="eye" id="eye">Show</button></div></div>
  <div class="f s2 em"><label for="from">From email address</label><input id="from" type="email" placeholder="you@example.com"></div>
  <div class="f"><label for="delay">Delay between messages <small>ms, bulk only</small></label><input id="delay" type="number" min="0" value="1000"></div>
  <div class="f s3"><label>Recipients <small id="cnt"></small></label>
    <div class="seg"><button type="button" data-m="single" class="on">Single</button><button type="button" data-m="bulk">Bulk</button></div>
    <input id="to" type="email" placeholder="someone@example.com">
    <div id="bulkbox" hidden>
      <textarea id="bulk" placeholder="Paste emails - one per line, or separated by commas"></textarea>
      <div class="brow"><label class="chip" for="file" style="cursor:pointer">Import .txt / .csv</label><input id="file" type="file" accept=".txt,.csv" hidden><button type="button" class="chip" id="bclr">Clear list</button><span class="note" id="binfo"></span></div>
    </div></div>
  <div class="f s3 em"><label for="subject">Subject</label><input id="subject" value="SMTP test message"></div>
  <div class="f s3"><label for="msg">Message <small id="mcnt"></small></label><textarea id="msg">Hello, this is a test message sent from the SMTP test tool.</textarea></div>
  <div class="f s3 em"><label>Greeting photos <small id="pinfo"></small></label>
    <div class="brow" style="margin-top:0"><label class="chip" for="photos" style="cursor:pointer">Add photos</label><input id="photos" type="file" accept="image/png,image/jpeg,image/gif,image/webp" multiple hidden>
      <div class="seg"><button type="button" data-p="inline" class="on">Show inside email</button><button type="button" data-p="attach">Send as attachment</button></div>
      <label class="chk"><input type="checkbox" id="rs" checked> Shrink big photos</label></div>
    <div id="thumbs" class="thumbs"></div></div>
  <div class="ft">
    <button class="run" id="go" type="submit">Run SMTP test</button><button class="stop" id="stop" type="button" hidden>Stop</button>
    <div class="note" id="note">Credentials are used only for this test and are not stored. The live transcript below shows exactly where the connection succeeds or fails.</div>
    <label class="em chk"><input type="checkbox" id="strict" checked> Verify TLS certificate</label>
  </div>
</form></div>

<div class="status"><span><i class="dot" id="dot"></i><span id="stxt">Ready</span></span>
  <span class="st2"><button id="copy" type="button">Copy log</button><button id="clear" type="button">Clear</button><span id="fin"></span></span></div>
<div id="log" role="log" aria-live="polite"><span class="empty">Transcript will appear here when you run the test.</span></div>
</div>
<script>
var $=function(i){return document.getElementById(i)};
var H={SendGrid:'smtp.sendgrid.net',Mailgun:'smtp.mailgun.org',SMTP2GO:'mail.smtp2go.com',Brevo:'smtp-relay.brevo.com',JangoSMTP:'smtp.jangosmtp.net',GMass:'smtp.gmass.co'};
Object.keys(H).forEach(function(k){var b=document.createElement('button');b.type='button';b.className='chip';b.textContent=k;b.onclick=function(){$('host').value=H[k]};$('hosts').appendChild(b)});
[25,2525,465,587].forEach(function(p){var b=document.createElement('button');b.type='button';b.className='chip';b.textContent=p;b.onclick=function(){$('port').value=p};$('ports').appendChild(b)});
$('eye2').onclick=function(){var p=$('tok');var s=p.type==='password';p.type=s?'text':'password';this.textContent=s?'Hide':'Show'};
function msgCount(){var m=$('msg').value,n=m.length,u=/[^\x00-\x7f]/.test(m),one=u?70:160,per=u?67:153,seg=n<=one?1:Math.ceil(n/per);$('mcnt').textContent=channel==='sms'?n+' chars, '+seg+' SMS'+(u?' (Unicode)':''):''}
$('msg').oninput=msgCount;
function applyUI(){
  var ch=channel,sms=ch==='sms',wa=ch==='wa',vb=ch==='viber',non=ch!=='email',pv=$('prov').value;
  var nm={sms:'SMS',wa:'WhatsApp',viber:'Viber'}[ch]||'';
  document.querySelectorAll('.em').forEach(function(e){e.hidden=non});
  document.querySelectorAll('.sm').forEach(function(e){e.hidden=!non});
  document.querySelectorAll('.sp').forEach(function(e){e.hidden=!sms});
  document.querySelectorAll('.wa').forEach(function(e){e.hidden=!wa});
  document.querySelectorAll('.vb').forEach(function(e){e.hidden=!vb});if(vb)vbLoad();
  document.querySelectorAll('.cu').forEach(function(e){e.hidden=!(sms&&pv==='custom')});
  $('sendbox').hidden=!((sms&&pv!=='aakash')||vb);
  $('sendl').innerHTML=vb?'Bot name <small>shown to the recipient</small>':'Sender identity <small>the "from" name from your provider</small>';
  $('tokl').textContent=wa?'Access token':vb?'Bot auth token':'API token';
  $('tok').placeholder=wa?'Paste your WhatsApp Cloud API access token':vb?'Paste your Viber bot auth token':'Paste your SMS API token';
  $('ttl').textContent=sms?'SMS gateway details':wa?'WhatsApp Cloud API details':vb?'Viber bot details':'SMTP connection details';
  $('go').textContent=non?'Send '+nm:'Run SMTP test';
  $('to').type=non?'text':'email';
  $('to').placeholder=vb?'Viber user ID':non?'98XXXXXXXX':'someone@example.com';
  $('bulk').placeholder=vb?'Paste Viber user IDs - one per line, or separated by commas':non?'Paste phone numbers - one per line, or separated by commas':'Paste emails - one per line, or separated by commas';
  $('note').textContent=wa?'Your token is sent only to Meta and is not stored. Plain text only reaches people who messaged your number in the last 24 hours; otherwise enter an approved template name.':vb?'Your token is sent only to Viber and is not stored. Viber bots can only message people who subscribed to your bot, addressed by Viber user ID (not phone number).':sms?'Your token is sent only to the SMS provider and is not stored. The live log shows every request and reply.':'Credentials are used only for this test and are not stored. The live transcript below shows exactly where the connection succeeds or fails.';
  msgCount();upd();
}
document.querySelectorAll('.seg button[data-c]').forEach(function(b){b.onclick=function(){channel=b.dataset.c;document.querySelectorAll('.seg button[data-c]').forEach(function(x){x.classList.toggle('on',x===b)});applyUI()}});
$('prov').onchange=applyUI;
$('eye').onclick=function(){var p=$('pass');var s=p.type==='password';p.type=s?'text':'password';this.textContent=s?'Hide':'Show'};
$('user').oninput=function(){if(!$('from').dataset.t)$('from').value=this.value};
$('from').oninput=function(){this.dataset.t=1};

var mode='single',channel='email',RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function norm(x){return (channel==='sms'||channel==='wa')?String(x).replace(/[\s\-()]/g,''):String(x).trim()}
function valid(x){return (channel==='sms'||channel==='wa')?/^\+?\d{7,15}$/.test(x):channel==='viber'?/^[A-Za-z0-9+\/=_\-]{10,40}$/.test(x):RE.test(x)}
function parse(){
  var ph=channel==='sms'||channel==='wa',t=(ph?$('bulk').value.split(/[\n,;]+/).map(norm):$('bulk').value.split(/[\s,;]+/)).filter(Boolean),seen={},ok=[],bad=0,dup=0;
  t.forEach(function(x){var k=channel==='viber'?x:x.toLowerCase();if(!valid(x)){bad++;return}if(seen[k]){dup++;return}seen[k]=1;ok.push(x)});
  return {ok:ok,bad:bad,dup:dup};
}
function upd(){
  if(mode==='bulk'){var p=parse();$('cnt').textContent=p.ok.length+' valid';
    $('binfo').textContent=(p.bad?p.bad+' invalid, ':'')+(p.dup?p.dup+' duplicate removed':'')}
  else $('cnt').textContent='';
}
document.querySelectorAll('.seg button[data-m]').forEach(function(b){b.onclick=function(){
  mode=b.dataset.m;document.querySelectorAll('.seg button[data-m]').forEach(function(x){x.classList.toggle('on',x===b)});
  $('to').hidden=mode==='bulk';$('bulkbox').hidden=mode!=='bulk';upd()}});
$('bulk').oninput=upd;
$('bclr').onclick=function(){$('bulk').value='';upd()};
$('file').onchange=function(){var f=this.files[0];if(!f)return;var r=new FileReader();
  r.onload=function(){$('bulk').value=($('bulk').value?$('bulk').value+'\n':'')+r.result;upd()};r.readAsText(f);this.value=''};
var photos=[],pmode='inline';
document.querySelectorAll('.seg button[data-p]').forEach(function(b){b.onclick=function(){pmode=b.dataset.p;document.querySelectorAll('.seg button[data-p]').forEach(function(x){x.classList.toggle('on',x===b)})}});
function shrink(f){return new Promise(function(res){
  if(!$('rs').checked||f.size<800000||!/jpeg|png|webp/.test(f.type))return res(f);
  var im=new Image(),u=URL.createObjectURL(f);
  im.onload=function(){var k=Math.min(1,1600/Math.max(im.width,im.height));
    if(k===1&&f.size<2e6){URL.revokeObjectURL(u);return res(f)}
    var c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
    c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    var t=f.type==='image/png'?'image/png':'image/jpeg';
    c.toBlob(function(bl){URL.revokeObjectURL(u);res(bl&&bl.size<f.size?new File([bl],f.name,{type:t}):f)},t,0.88)};
  im.onerror=function(){res(f)};im.src=u})}
function toB64(f){return new Promise(function(res){var r=new FileReader();r.onload=function(){res(r.result.split(',')[1])};r.readAsDataURL(f)})}
$('photos').onchange=async function(){
  var fs=Array.from(this.files);this.value='';
  for(var i=0;i<fs.length&&photos.length<10;i++){var f=await shrink(fs[i]);photos.push({name:fs[i].name,type:f.type,data:await toB64(f),size:f.size,url:URL.createObjectURL(f)})}
  drawThumbs()};
function drawThumbs(){var t=$('thumbs');t.innerHTML='';var tot=0;
  photos.forEach(function(p,i){tot+=p.size;var d=document.createElement('div');d.className='th';
    var im=document.createElement('img');im.src=p.url;im.alt=p.name;
    var x=document.createElement('button');x.type='button';x.textContent='\u00d7';x.setAttribute('aria-label','Remove '+p.name);
    x.onclick=function(){URL.revokeObjectURL(p.url);photos.splice(i,1);drawThumbs()};
    d.appendChild(im);d.appendChild(x);t.appendChild(d)});
  $('pinfo').textContent=photos.length?photos.length+' photo'+(photos.length>1?'s':'')+', '+Math.round(tot/1024)+' KB':''}
function setRec(ids){document.querySelector('.seg button[data-m="'+(ids.length>1?'bulk':'single')+'"]').click();if(ids.length>1){$('bulk').value=ids.join('\n');upd()}else $('to').value=ids[0]}
function vbLoad(){fetch('/api/viber/users').then(function(r){return r.json()}).then(function(u){
  var c=$('vbList');c.innerHTML='';
  if(!u.length){var n=document.createElement('span');n.className='note';n.textContent='No subscribers captured yet. Have someone subscribe to your bot.';c.appendChild(n);return}
  var a=document.createElement('button');a.type='button';a.className='chip';a.textContent='Use all ('+u.length+')';a.onclick=function(){setRec(u.map(function(x){return x.id}))};c.appendChild(a);
  u.forEach(function(x){var b=document.createElement('button');b.type='button';b.className='chip';b.textContent=(x.name||'user')+' - '+x.id.slice(0,6)+'...';b.title=x.id;b.onclick=function(){setRec([x.id])};c.appendChild(b)})}).catch(function(){})}
$('vbRef').onclick=vbLoad;
$('vbSet').onclick=function(){fetch('/api/viber/webhook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:$('tok').value,url:$('vbUrl').value})}).then(function(r){return r.json()}).then(function(o){add({level:o.ok?'ok':'error',msg:o.msg})}).catch(function(e){add({level:'error',msg:'Request failed: '+e.message})})};
setInterval(function(){if(channel==='viber')vbLoad()},5000);
var ctl=null;$('stop').onclick=function(){if(ctl)ctl.abort()};

var log=$('log'),lines=[];
function add(o){
  if(!lines.length)log.innerHTML='';
  var t=new Date(o.t||Date.now()).toLocaleTimeString([], {hour12:false});
  var d=document.createElement('div');
  var ts=document.createElement('span');ts.className='ts';ts.textContent=t;
  var m=document.createElement('span');m.className='l-'+(o.level||'dim')+(o.level==='smtp'?(String(o.msg).charAt(0)==='C'?' lc':' ls'):'');m.textContent=o.msg;
  d.appendChild(ts);d.appendChild(m);log.appendChild(d);log.scrollTop=log.scrollHeight;
  lines.push('['+t+'] '+o.msg);
}
function state(c,txt,fin){$('dot').className='dot '+c;$('stxt').textContent=txt;$('fin').textContent=fin||''}

$('f').onsubmit=async function(e){
  e.preventDefault();
  lines=[];log.innerHTML='';
  var sms=channel!=='email',nm={sms:'SMS',wa:'WhatsApp',viber:'Viber'}[channel]||'';
  var rec=mode==='bulk'?parse().ok:[norm($('to').value)];
  if(!rec.length||!rec[0]||(mode!=='bulk'&&!valid(rec[0]))){add({level:'error',msg:'Add at least one valid '+(channel==='viber'?'Viber user ID':sms?'phone number':'email')+'.'});return}
  ctl=new AbortController();$('stop').hidden=false;
  $('go').disabled=true;state('busy',sms?'Sending '+nm+'...':'SMTP test running...','Running');
  var body={host:$('host').value,port:$('port').value,security:$('sec').value,user:$('user').value,pass:$('pass').value,
    from:$('from').value,recipients:rec,images:photos.map(function(p){return{name:p.name,type:p.type,data:p.data}}),imageMode:pmode,delay:$('delay').value,subject:$('subject').value,message:$('msg').value,strictTls:$('strict').checked};
  if(sms)body={provider:channel==='sms'?$('prov').value:channel==='wa'?'whatsapp':'viber',waId:$('waId').value,waCc:$('waCc').value,waTpl:$('waTpl').value,waLang:$('waLang').value,token:$('tok').value,sender:$('sender').value,recipients:rec,delay:$('delay').value,message:$('msg').value,cUrl:$('cUrl').value,cMethod:$('cMethod').value,cTokName:$('cTokName').value,cTokIn:$('cTokIn').value,cToName:$('cToName').value,cTextName:$('cTextName').value,cFromName:$('cFromName').value};
  var ok=false,sum='';
  try{
    var r=await fetch(sms?'/api/sms':'/api/test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:ctl.signal});
    var rd=r.body.getReader(),dec=new TextDecoder(),buf='';
    for(;;){
      var x=await rd.read();if(x.done)break;
      buf+=dec.decode(x.value,{stream:true});
      var parts=buf.split('\n');buf=parts.pop();
      parts.forEach(function(p){if(!p)return;var o=JSON.parse(p);if(o.done){ok=o.ok;sum=o.summary||''}else add(o)});
    }
  }catch(err){add(err.name==='AbortError'?{level:'warn',msg:'Stopped by you.'}:{level:'error',msg:'Could not reach the test server: '+err.message})}
  $('go').disabled=false;$('stop').hidden=true;
  ok?state('ok',(sms?nm+' complete':'SMTP test complete')+(sum?' - '+sum:''),'Finished'):state('bad','Finished with errors'+(sum?' - '+sum:''),'Finished');
};
$('copy').onclick=function(){navigator.clipboard.writeText(lines.join('\n'));this.textContent='Copied';var b=this;setTimeout(function(){b.textContent='Copy log'},1200)};
$('clear').onclick=function(){lines=[];log.innerHTML='<span class="empty">Transcript will appear here when you run the test.</span>';state('','Ready','')};
</script></body></html>
`;

function readBody(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data', c => { d += c; if (d.length > 30e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch (e) { reject(e); } });
  });
}

/* ---------- minimal SMTP client ---------- */
class Conn {
  constructor(sock) { this.q = []; this.waiters = []; this.err = null; this.cur = []; this.attach(sock); }
  attach(sock) {
    this.sock = sock; this.buf = '';
    sock.on('data', d => { this.buf += d.toString('utf8'); this.pump(); });
    sock.on('error', e => this.fail(e));
    sock.on('close', () => this.fail(new Error('Connection closed by server')));
  }
  detach() {
    ['data', 'error', 'close'].forEach(ev => this.sock.removeAllListeners(ev));
    this.sock.on('error', () => {});
  }
  fail(e) { if (this.err) return; this.err = e; this.waiters.splice(0).forEach(w => w.rej(e)); }
  pump() {
    let i;
    while ((i = this.buf.indexOf('\n')) >= 0) {
      const line = this.buf.slice(0, i).replace(/\r$/, '');
      this.buf = this.buf.slice(i + 1);
      this.cur.push(line);
      if (/^\d{3}( |$)/.test(line)) { this.q.push({ code: +line.slice(0, 3), lines: this.cur }); this.cur = []; }
    }
    while (this.q.length && this.waiters.length) this.waiters.shift().res(this.q.shift());
  }
  read() {
    if (this.q.length) return Promise.resolve(this.q.shift());
    if (this.err) return Promise.reject(this.err);
    return new Promise((res, rej) => this.waiters.push({ res, rej }));
  }
}

function timeoutErr(s) { s.setTimeout(25000, () => s.destroy(Object.assign(new Error('Socket timeout (no reply for 25s)'), { code: 'ETIMEDOUT' }))); }

function connectSock(host, port, implicit, strict) {
  return new Promise((res, rej) => {
    const s = implicit ? tls.connect({ host, port, servername: host, rejectUnauthorized: strict }) : net.connect({ host, port });
    timeoutErr(s);
    s.once(implicit ? 'secureConnect' : 'connect', () => { s.removeListener('error', rej); res(s); });
    s.once('error', rej);
  });
}

function upgrade(sock, host, strict) {
  return new Promise((res, rej) => {
    const t = tls.connect({ socket: sock, servername: host, rejectUnauthorized: strict });
    timeoutErr(t);
    t.once('secureConnect', () => res(t));
    t.once('error', rej);
  });
}

const wrap = s => (s.match(/.{1,76}/g) || []).join('\r\n');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const safeName = n => String(n || 'photo').replace(/[^\w.\- ]/g, '_').slice(0, 80);
const b64 = s => Buffer.from(s).toString('base64');
const addrOf = s => { const m = String(s).match(/<([^>]+)>/) || String(s).match(/([^\s<>]+@[^\s<>]+)/); return m ? m[1] : String(s); };
const encHdr = s => /^[\x20-\x7e]*$/.test(s) ? s : '=?UTF-8?B?' + b64(s) + '?=';

function buildMime(head, text, imgs, mode, bd) {
  const part = (type, data) => 'Content-Type: ' + type + '; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\n\r\n' + wrap(b64(data));
  head = head.concat('MIME-Version: 1.0');
  if (!imgs.length) return head.join('\r\n') + '\r\n' + part('text/plain', text);
  const file = (im, i, disp) => 'Content-Type: ' + im.type + '; name="' + im.fname + '"\r\nContent-Transfer-Encoding: base64\r\n' +
    (disp === 'inline' ? 'Content-ID: <img' + i + '@smtp-tester>\r\n' : '') +
    'Content-Disposition: ' + disp + '; filename="' + im.fname + '"\r\n\r\n' + wrap(im.data);
  if (mode === 'attach') {
    const parts = [part('text/plain', text)].concat(imgs.map((im, i) => file(im, i, 'attachment')));
    return head.concat('Content-Type: multipart/mixed; boundary="' + bd + 'M"').join('\r\n') + '\r\n\r\n' +
      parts.map(p => '--' + bd + 'M\r\n' + p + '\r\n').join('') + '--' + bd + 'M--';
  }
  const html = '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5">' + esc(text).replace(/\r?\n/g, '<br>') + '</div>' +
    imgs.map((im, i) => '<div style="margin-top:14px"><img src="cid:img' + i + '@smtp-tester" alt="" style="max-width:100%;height:auto;border:0"></div>').join('');
  const alt = '--' + bd + 'A\r\n' + part('text/plain', text) + '\r\n--' + bd + 'A\r\n' + part('text/html', html) + '\r\n--' + bd + 'A--';
  const rel = ['Content-Type: multipart/alternative; boundary="' + bd + 'A"\r\n\r\n' + alt].concat(imgs.map((im, i) => file(im, i, 'inline')));
  return head.concat('Content-Type: multipart/related; boundary="' + bd + 'R"').join('\r\n') + '\r\n\r\n' +
    rel.map(p => '--' + bd + 'R\r\n' + p + '\r\n').join('') + '--' + bd + 'R--';
}

async function runTest(b, send, isAborted) {
  const host = (b.host || '').trim();
  const port = Number(b.port) || 587;
  const user = b.user || '';
  const pass = b.pass || '';
  const from = (b.from || user).trim();
  const RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const list = [...new Set((Array.isArray(b.recipients) ? b.recipients : [b.to || ''])
    .map(x => String(x).trim()).filter(x => RE.test(x)))].slice(0, 500);
  const delay = Math.min(Math.max(Number(b.delay) || 0, 0), 60000);
  const sec = b.security || 'auto';
  const strict = b.strictTls !== false;
  const log = (level, msg) => send({ level, msg });
  const fail = { ok: false };

  if (!host || !list.length) { log('error', 'SMTP server and at least one valid recipient are required.'); return fail; }
  if (!RE.test(addrOf(from))) { log('error', 'A valid From email address is required.'); return fail; }

  const imgs = (Array.isArray(b.images) ? b.images : [])
    .filter(i => i && /^image\/(png|jpe?g|gif|webp)$/.test(i.type) && typeof i.data === 'string')
    .slice(0, 10).map(i => ({ type: i.type, fname: safeName(i.name), data: i.data.replace(/\s/g, '') }));
  const imgMode = b.imageMode === 'attach' ? 'attach' : 'inline';
  const imgBytes = imgs.reduce((a, i) => a + i.data.length * 0.75, 0);
  if (imgBytes > 18e6) { log('error', 'Photos are too big (' + Math.round(imgBytes / 1e6) + ' MB). Keep the total under 18 MB.'); return fail; }

  const secrets = [];
  if (pass) secrets.push(pass, b64(pass), b64('\0' + user + '\0' + pass));
  if (user) secrets.push(b64(user));
  const mask = s => secrets.reduce((a, x) => a.split(x).join('****'), String(s));

  log('info', 'Starting SMTP test for ' + host + ':' + port);
  try {
    const r = await dns.lookup(host);
    log('ok', 'DNS resolved ' + host + ' -> ' + r.address);
  } catch (e) {
    log('error', 'DNS lookup failed: ' + e.code + ' (check the server name)');
    return fail;
  }

  const implicit = sec === 'ssl' || (sec === 'auto' && port === 465);
  let sock, conn, encrypted = implicit;
  const write = (line, shown) => { sock.write(line + '\r\n'); log('smtp', 'C: ' + mask(shown !== undefined ? shown : line)); };
  const reply = async () => { const r = await conn.read(); r.lines.forEach(l => log('smtp', 'S: ' + mask(l))); return r; };
  const cmd = async (line, ok, shown) => {
    write(line, shown);
    const r = await reply();
    if (!ok.includes(r.code)) { const e = new Error(r.lines.join(' | ')); e.responseCode = r.code; throw e; }
    return r;
  };
  const ehlo = async () => {
    const name = os.hostname().replace(/[^\w.-]/g, '') || 'localhost';
    return (await cmd('EHLO ' + name, [250])).lines.map(l => l.slice(4).toUpperCase());
  };

  let sent = 0, failed = 0, stage = 'connect';
  try {
    log('info', 'Connecting to ' + host + ':' + port + (implicit ? ' (SSL/TLS)' : '') + '...');
    sock = await connectSock(host, port, implicit, strict);
    conn = new Conn(sock);
    log('ok', implicit ? 'TLS connected (' + sock.getProtocol() + ')' : 'TCP connected');

    const greet = await reply();
    if (greet.code !== 220) throw new Error('Unexpected greeting: ' + greet.lines.join(' | '));
    let caps = await ehlo();

    if (!implicit && sec !== 'none') {
      if (caps.includes('STARTTLS')) {
        await cmd('STARTTLS', [220]);
        conn.detach();
        sock = await upgrade(sock, host, strict);
        conn.attach(sock);
        encrypted = true;
        log('ok', 'STARTTLS upgrade OK (' + sock.getProtocol() + ')');
        caps = await ehlo();
      } else if (sec === 'starttls') {
        throw new Error('Server does not offer STARTTLS on this port.');
      } else {
        log('warn', 'Server does not offer STARTTLS - connection is not encrypted.');
      }
    }

    stage = 'auth';
    if (user || pass) {
      if (!encrypted && sec !== 'none') throw new Error('Refusing to send the password over an unencrypted connection. Pick another port/security, or set Security = None to force it.');
      const auth = caps.find(c => c.startsWith('AUTH')) || '';
      if (!auth) throw new Error('Server does not offer login (AUTH) on this port/security.');
      if (auth.includes('PLAIN')) await cmd('AUTH PLAIN ' + b64('\0' + user + '\0' + pass), [235], 'AUTH PLAIN ****');
      else if (auth.includes('LOGIN')) {
        await cmd('AUTH LOGIN', [334]);
        await cmd(b64(user), [334], '****');
        await cmd(b64(pass), [235], '****');
      } else throw new Error('No supported login method. Server offers: ' + auth);
      log('ok', 'Login accepted.');
    } else log('info', 'No username/password given - skipping login.');
    log('ok', 'Connection OK.');

    stage = 'send';
    const subject = b.subject || 'SMTP test';
    const body = (b.message || 'This is a test message from SMTP Tester.').replace(/\r?\n/g, '\r\n');
    const fromAddr = addrOf(from);
    const sizeCap = Number(((caps.find(c => c.startsWith('SIZE ')) || '').split(' ')[1]) || 0);
    if (imgs.length) log('info', imgs.length + ' photo' + (imgs.length > 1 ? 's' : '') + ' (' + Math.round(imgBytes / 1024) + ' KB) - ' + (imgMode === 'inline' ? 'shown inside the email' : 'sent as attachments'));
    log('info', 'Sending to ' + list.length + ' recipient' + (list.length > 1 ? 's (delay ' + delay + ' ms)' : '') + '...');

    for (let i = 0; i < list.length; i++) {
      if (isAborted()) { log('warn', 'Stopped. ' + (list.length - i) + ' not sent.'); break; }
      if (conn.err) break;
      const tag = '[' + (i + 1) + '/' + list.length + '] ';
      const msg = buildMime([
        'From: ' + from, 'To: ' + list[i], 'Subject: ' + encHdr(subject),
        'Date: ' + new Date().toUTCString(),
        'Message-ID: <' + crypto.randomBytes(12).toString('hex') + '@' + (fromAddr.split('@')[1] || 'localhost') + '>'
      ], body, imgs, imgMode, 'b' + crypto.randomBytes(8).toString('hex'));
      try {
        if (sizeCap && msg.length > sizeCap) throw new Error('Message is ' + (msg.length / 1048576).toFixed(1) + ' MB, over the server limit of ' + (sizeCap / 1048576).toFixed(1) + ' MB. Use fewer or smaller photos.');
        await cmd('MAIL FROM:<' + fromAddr + '>', [250]);
        await cmd('RCPT TO:<' + list[i] + '>', [250, 251]);
        await cmd('DATA', [354]);
        sock.write(msg + '\r\n.\r\n');
        log('smtp', 'C: [message body, ' + msg.length + ' bytes]');
        const r = await reply();
        if (r.code !== 250) { const e = new Error(r.lines.join(' | ')); e.responseCode = r.code; throw e; }
        sent++;
        log('ok', tag + list[i] + ' accepted');
      } catch (e) {
        failed++;
        log('error', tag + list[i] + ' failed: ' + mask(e.message));
        if (conn.err) break;
        try { await cmd('RSET', [250]); } catch (_) { break; }
      }
      if (i < list.length - 1 && delay) await new Promise(r => setTimeout(r, delay));
    }
    if (!conn.err) { try { write('QUIT'); await reply(); } catch (_) {} }
  } catch (e) {
    const code = e.code ? ' [' + e.code + ']' : '';
    log('error', (stage === 'auth' ? 'Login failed: ' : stage === 'send' ? 'Sending failed: ' : 'Connection failed: ') + mask(e.message) + code);
    if (/SELF.SIGNED|CERT|certificate/i.test(e.code + ' ' + e.message)) log('warn', 'Certificate problem. If you trust this server, untick "Verify TLS certificate" and retry.');
    if (stage === 'auth' && /535|534|Username|Password/i.test(e.message) && /gmail/i.test(host)) log('warn', 'Gmail needs an App Password (2-step verification on), not your normal password.');
    return fail;
  } finally {
    if (sock) sock.destroy();
  }
  const summary = sent + ' sent, ' + failed + ' failed';
  log(failed || !sent ? 'warn' : 'ok', 'Done: ' + summary);
  return { ok: sent > 0 && !failed, summary };
}

/* ---------- SMS over HTTP ---------- */
function httpReq(url, method, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const h = Object.assign({ 'User-Agent': 'smtp-tester' }, headers);
    if (body) h['Content-Length'] = Buffer.byteLength(body);
    const req = lib.request(u, { method, headers: h, timeout: 20000 }, res => {
      let d = ''; res.setEncoding('utf8');
      res.on('data', x => { if (d.length < 20000) d += x; });
      res.on('end', () => resolve({ status: res.statusCode, text: d, location: res.headers.location }));
    });
    req.on('timeout', () => req.destroy(Object.assign(new Error('Request timed out'), { code: 'ETIMEDOUT' })));
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function smsPlan(b, token) {
  const sender = String(b.sender || '').trim();
  if (b.provider === 'sparrow') {
    if (!sender) return { err: 'Sender identity is required for Sparrow SMS (the "from" name Sparrow gave you).' };
    return { label: 'Sparrow SMS', local: true, urls: ['https://api.sparrowsms.com/v2/sms/', 'http://api.sparrowsms.com/v2/sms/'], method: 'POST', kind: 'form',
      fields: (to, text) => ({ token, from: sender, to, text }), ok: j => Number(j.response_code) === 200 };
  }
  if (b.provider === 'aakash') {
    return { label: 'Aakash SMS', local: true, urls: ['https://sms.aakashsms.com/sms/v3/send'], method: 'POST', kind: 'form',
      fields: (to, text) => ({ auth_token: token, to, text }), ok: j => j.error === false || j.error === 'false' };
  }
  if (b.provider === 'whatsapp') {
    const pid = String(b.waId || '').replace(/\D/g, '');
    if (!pid) return { err: 'Phone number ID is required (Meta for Developers > WhatsApp > API Setup).' };
    const tpl = String(b.waTpl || '').trim(), lang = String(b.waLang || '').trim() || 'en_US';
    return { label: 'WhatsApp Cloud API', wa: true, tpl: !!tpl, cc: String(b.waCc || '').replace(/\D/g, ''),
      urls: ['https://graph.facebook.com/v21.0/' + pid + '/messages'], method: 'POST', kind: 'json',
      headers: { Authorization: 'Bearer ' + token },
      fields: (to, text) => Object.assign({ messaging_product: 'whatsapp', recipient_type: 'individual', to },
        tpl ? { type: 'template', template: { name: tpl, language: { code: lang } } } : { type: 'text', text: { preview_url: false, body: text } }),
      ok: j => !j.error && Array.isArray(j.messages) };
  }
  if (b.provider === 'viber') {
    if (!sender) return { err: 'Bot name is required for Viber (the name of your bot, max 28 characters).' };
    return { label: 'Viber Bot API', viber: true, urls: ['https://chatapi.viber.com/pa/send_message'], method: 'POST', kind: 'json',
      headers: { 'X-Viber-Auth-Token': token },
      fields: (to, text) => ({ receiver: to, min_api_version: 1, sender: { name: sender.slice(0, 28) }, type: 'text', text }),
      ok: j => Number(j.status) === 0 };
  }
  const url = String(b.cUrl || '').trim();
  if (!/^https?:\/\//i.test(url)) return { err: 'Custom API: enter a full URL starting with http:// or https://' };
  const kind = b.cMethod === 'json' ? 'json' : b.cMethod === 'get' ? 'get' : 'form';
  const tn = String(b.cTokName || 'token').trim(), on = String(b.cToName || 'to').trim();
  const xn = String(b.cTextName || 'text').trim(), fn = String(b.cFromName || '').trim();
  const bearer = b.cTokIn === 'bearer';
  return { label: 'Custom API', local: false, urls: [url], method: kind === 'get' ? 'GET' : 'POST', kind,
    headers: bearer ? { Authorization: 'Bearer ' + token } : {},
    fields: (to, text) => { const o = { [on]: to, [xn]: text }; if (fn && sender) o[fn] = sender; if (!bearer) o[tn] = token; return o; },
    ok: j => !(j.error === true || j.success === false || (j.response_code !== undefined && Number(j.response_code) >= 400) ||
      (j.status !== undefined && /^(error|fail)/i.test(String(j.status)))) };
}

async function runSms(b, send, isAborted) {
  const log = (level, msg) => send({ level, msg });
  const fail = { ok: false };
  const token = String(b.token || process.env.SMS_TOKEN || '').trim();
  const text = String(b.message || '');
  const delay = Math.min(Math.max(Number(b.delay) || 0, 0), 60000);
  if (!token) { log('error', 'API token is required.'); return fail; }
  
  const plan = smsPlan(b, token);
  if (plan.err) { log('error', plan.err); return fail; }
  if (!text.trim() && !plan.tpl) { log('error', 'Message is empty.'); return fail; }
  const norm = x => { if (plan.viber) return String(x).trim(); let n = String(x).replace(/[\s\-()]/g, ''); if (plan.wa) { const plus = n.startsWith('+'); n = n.replace(/^\+/, ''); if (!plus && plan.cc && n.length === 10) n = plan.cc + n; } else if (plan.local) n = n.replace(/^\+?977(?=\d{10}$)/, ''); return n; };
  const list = [...new Set((Array.isArray(b.recipients) ? b.recipients : []).map(norm).filter(x => (plan.viber ? /^[A-Za-z0-9+\/=_-]{10,40}$/ : /^\+?\d{7,15}$/).test(x)))].slice(0, 500);
  if (!list.length) { log('error', plan.viber ? 'Add at least one valid Viber user ID.' : 'Add at least one valid phone number.'); return fail; }

  const secrets = [token, encodeURIComponent(token), new URLSearchParams({ t: token }).toString().slice(2)];
  const mask = s => secrets.reduce((a, x) => a.split(x).join('****'), String(s));
  log('info', 'Sending ' + list.length + ' SMS via ' + plan.label + (list.length > 1 ? ' (delay ' + delay + ' ms)' : '') + '...');

  let sent = 0, failed = 0, ui = 0;
  for (let i = 0; i < list.length; i++) {
    if (isAborted()) { log('warn', 'Stopped. ' + (list.length - i) + ' not sent.'); break; }
    const tag = '[' + (i + 1) + '/' + list.length + '] ';
    const f = plan.fields(list[i], text);
    let done = false, lastErr = '';
    for (let u = ui; u < plan.urls.length && !done; u++) {
      const url = plan.urls[u];
      try {
        const headers = Object.assign({}, plan.headers);
        let reqUrl = url, bodyStr = null;
        if (plan.kind === 'get') reqUrl += (url.includes('?') ? '&' : '?') + new URLSearchParams(f).toString();
        else if (plan.kind === 'json') { bodyStr = JSON.stringify(f); headers['Content-Type'] = 'application/json'; }
        else { bodyStr = new URLSearchParams(f).toString(); headers['Content-Type'] = 'application/x-www-form-urlencoded'; }
        log('smtp', 'C: ' + plan.method + ' ' + mask(reqUrl) + (bodyStr ? ' ' + mask(bodyStr) : ''));
        if (headers.Authorization) log('smtp', 'C: Authorization: Bearer ****');
        if (headers['X-Viber-Auth-Token']) log('smtp', 'C: X-Viber-Auth-Token: ****');
        let r = await httpReq(reqUrl, plan.method, headers, bodyStr);
        if ([301, 302, 307, 308].includes(r.status) && r.location) {
          log('warn', 'Redirected to ' + mask(r.location));
          r = await httpReq(r.location, plan.method, headers, bodyStr);
        }
        log('smtp', 'S: HTTP ' + r.status + ' ' + mask(r.text.slice(0, 400)).replace(/\s+/g, ' '));
        let j = null; try { j = JSON.parse(r.text); } catch (_) {}
        if (r.status >= 200 && r.status < 300 && (!j || plan.ok(j))) { done = true; ui = u; sent++; log('ok', tag + list[i] + ' accepted'); }
        else { const em = j && (j.response || j.message || j.status_message || (j.error && j.error.message)); lastErr = 'HTTP ' + r.status + (em ? ' - ' + em : ''); break; }
      } catch (e) {
        lastErr = (e.code || '') + ' ' + e.message;
        if (u < plan.urls.length - 1) log('warn', 'Could not reach ' + url + ' (' + (e.code || e.message) + '), trying the next address...');
      }
    }
    if (!done) { failed++; log('error', tag + list[i] + ' failed: ' + mask(lastErr).trim()); }
    if (i < list.length - 1 && delay) await new Promise(r => setTimeout(r, delay));
  }
  const summary = sent + ' sent, ' + failed + ' failed';
  log(failed || !sent ? 'warn' : 'ok', 'Done: ' + summary);
  return { ok: sent > 0 && !failed, summary };
}

const viberUsers = new Map();
function viberEvent(j) {
  if (!j || typeof j !== 'object') return;
  if (j.event === 'unsubscribed' && j.user_id) return void viberUsers.delete(j.user_id);
  const u = j.user || j.sender;
  if (u && u.id && ['subscribed', 'conversation_started', 'message'].includes(j.event))
    viberUsers.set(u.id, { id: u.id, name: u.name || '', event: j.event, t: Date.now() });
}

const server = http.createServer(async (req, res) => {
  // Viber calls this through your tunnel; everything else is local-only.
  if (req.method === 'POST' && req.url === '/viber/webhook') {
    try { viberEvent(await readBody(req)); } catch (_) {}
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('ok');
  }
  if (req.method === 'GET' && req.url === '/healthz') { res.writeHead(200); return res.end('ok'); }
  const hostName = String(req.headers.host || '').replace(/:\d+$/, '');
  // "Local" = opened directly on this PC. Anything via ngrok / a public server needs ACCESS_PASS.
  const isLocal = !PUBLIC_BIND && !req.headers['x-forwarded-for'] && ['localhost', '127.0.0.1', '[::1]'].includes(hostName);
  if (!isLocal) {
    // Request came through a tunnel (ngrok): needs ACCESS_PASS, otherwise blocked.
    const pw = process.env.ACCESS_PASS || '';
    if (!pw) { res.writeHead(404); return res.end('Not found'); }
    const given = Buffer.from(String((req.headers.authorization || '').split(' ')[1] || ''), 'base64').toString().split(':').slice(1).join(':');
    const a = Buffer.from(given), c = Buffer.from(pw);
    if (!(a.length === c.length && crypto.timingSafeEqual(a, c))) {
      res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="SMTP Tester"' });
      return res.end('Password required');
    }
  }
  if (req.method === 'GET' && req.url === '/api/viber/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify([...viberUsers.values()].sort((a, b) => b.t - a.t)));
  }
  if (req.method === 'POST' && req.url === '/api/viber/webhook') {
    const out = o => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
    try {
      const b = await readBody(req);
      const token = String(b.token || '').trim();
      let url = String(b.url || '').trim();
      if (!token) return out({ ok: false, msg: 'Enter the Bot auth token first.' });
      if (url && !/^https:\/\//i.test(url)) return out({ ok: false, msg: 'Webhook URL must start with https://' });
      if (url && !/\/viber\/webhook$/.test(url)) url = url.replace(/\/+$/, '') + '/viber/webhook';
      const payload = url ? { url, event_types: ['subscribed', 'unsubscribed', 'conversation_started', 'message'] } : { url: '' };
      const r = await httpReq('https://chatapi.viber.com/pa/set_webhook', 'POST', { 'X-Viber-Auth-Token': token, 'Content-Type': 'application/json' }, JSON.stringify(payload));
      let j = {}; try { j = JSON.parse(r.text); } catch (_) {}
      const good = Number(j.status) === 0;
      return out({ ok: good, msg: good ? (url ? 'Webhook set: ' + url : 'Webhook removed.') : 'Viber said: ' + (j.status_message || 'HTTP ' + r.status) + (r.status === 403 || /webhook/i.test(j.status_message || '') ? ' (Viber must be able to reach ' + url + ' - is ngrok running on port ' + PORT + '?)' : '') });
    } catch (e) { return out({ ok: false, msg: 'Failed: ' + e.message }); }
  }
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(HTML);
  }
  if (req.method === 'POST' && (req.url === '/api/test' || req.url === '/api/sms')) {
    res.writeHead(200, { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' });
    let aborted = false;
    res.on('close', () => { aborted = true; });
    const send = o => !aborted && res.write(JSON.stringify({ t: Date.now(), ...o }) + '\n');
    try {
      const r = await (req.url === '/api/sms' ? runSms : runTest)(await readBody(req), send, () => aborted);
      send({ done: true, ok: r.ok, summary: r.summary });
    } catch (e) {
      send({ level: 'error', msg: 'Unexpected error: ' + e.message });
      send({ done: true, ok: false });
    }
    return res.end();
  }
  res.writeHead(404); res.end('Not found');
});

server.on('error', e => {
  console.error(e.code === 'EADDRINUSE' ? 'Port ' + PORT + ' is busy. Try:  PORT=3001 node smtp-tester.js' : e.message);
  process.exit(1);
});
if (PUBLIC_BIND && !process.env.ACCESS_PASS) { console.error('Refusing to listen on ' + BIND + ' without ACCESS_PASS. Set a strong ACCESS_PASS first.'); process.exit(1); }
server.listen(PORT, BIND, () => {
  const url = 'http://localhost:' + PORT;
  console.log('SMTP Tester running at ' + url + '  (Ctrl+C to stop)');
  console.log(process.env.ACCESS_PASS ? 'Tunnel access ON (password protected). Username: anything, Password: your ACCESS_PASS.' : 'Tunnel access OFF. To open it via ngrok set ACCESS_PASS first (see instructions).');
  if (!process.env.NO_OPEN) {
    const c = process.platform === 'win32' ? 'start "" "' + url + '"' : process.platform === 'darwin' ? 'open ' + url : 'xdg-open ' + url;
    exec(c, () => {});
  }
});
