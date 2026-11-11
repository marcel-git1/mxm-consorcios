(function(){
'use strict';
var MX=window.MX||{};
var UFS='AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
var mil=function(n){return n>=1000?'R$ '+(n/1000).toLocaleString('pt-BR')+(n>=2000?' milhões':' milhão'):'R$ '+n+' mil'};
// Faixas de carta por tipo, em milhares de reais: [mínimo, máximo]. O valor somado na planilha (carta_valor) é o meio da faixa;
// na faixa aberta ("Acima de") é o próprio piso.
var FX={
 'Imóvel':[[0,200],[200,350],[350,500],[500,800],[800,0]],
 'Carro':[[0,70],[70,100],[100,150],[150,220],[220,0]],
 'Moto':[[0,25],[25,35],[35,50],[50,0]],
 'Caminhão':[[0,250],[250,400],[400,600],[600,0]],
 'Trator ou máquina':[[0,250],[250,400],[400,600],[600,0]],
 'Serviços':[[0,25],[25,35],[35,50],[50,0]]
};
// Faixas de parcela por tipo (texto do Copy Chief).
var PA=['Até R$ 1.000 por mês','De R$ 1.000 a R$ 1.800 por mês','De R$ 1.800 a R$ 2.800 por mês','De R$ 2.800 a R$ 4.000 por mês','Acima de R$ 4.000 por mês'];
var PB=['Até R$ 650 por mês','De R$ 650 a R$ 1.000 por mês','De R$ 1.000 a R$ 1.500 por mês','De R$ 1.500 a R$ 2.200 por mês','Acima de R$ 2.200 por mês'];
var PC=['Até R$ 300 por mês','De R$ 300 a R$ 500 por mês','De R$ 500 a R$ 800 por mês','Acima de R$ 800 por mês'];
var PAR={'Imóvel':PA,'Caminhão':PA,'Trator ou máquina':PA,'Carro':PB,'Moto':PC,'Serviços':PC};
function fxTxt(f){return !f[0]?'Até '+mil(f[1]):!f[1]?'Acima de '+mil(f[0]):'De '+mil(f[0])+' a '+mil(f[1])}
function fxNum(f){return (!f[1]?f[0]:(f[0]+f[1])/2)*1000}
var TIPOS=Object.keys(FX);

var P=[
 {k:'tipo',a:'Simulação gratuita',t:'Qual objetivo você quer realizar?',d:'Escolha a categoria pra gente ver os grupos disponíveis na Embracon.',o:['Imóvel','Carro','Moto','Caminhão','Trator ou máquina','Serviços (reforma, festa, viagem, estudo)'],v:TIPOS},
 {k:'carta',t:'De quanto você precisa pro seu plano?',d:'Escolha uma estimativa do valor da sua carta de crédito.',o:function(){return (FX[R.tipo]||FX['Carro']).map(fxTxt)}},
 {k:'parcela',t:'Quanto fica confortável pagar por mês?',d:'O consórcio é planejado pra caber no seu orçamento.',o:function(){return PAR[R.tipo]||PB}},
 {k:'prazo',t:'Em quanto tempo você pretende usar a carta de crédito?',d:'A contemplação não tem data garantida. Isso ajuda o especialista a indicar o grupo certo pro seu perfil.',o:['O quanto antes','Em até 6 meses','Em até 1 ano','Sem pressa','É investimento']},
 {k:'lance',t:'Você tem algum valor reservado pra tentar antecipar com lance?',d:'O lance aumenta suas chances de contemplação. Se não tiver, tudo bem: você concorre pelos sorteios.',o:['Não tenho valor guardado no momento','Sim, tenho até 10% do valor da carta','Sim, tenho mais de 10% do valor da carta'],v:['Não','Sim, até 10%','Sim, mais de 10%']},
 {k:'ja_fez',t:'Você já participou de algum consórcio antes?',d:'Assim o especialista sabe se explica do zero ou vai direto ao ponto.',o:['Sim, já fiz e conheço como funciona','Não, é a minha primeira vez'],v:['Sim','Não']},
 {k:'local',a:'Quase lá.',t:'Onde você mora?',d:'Usamos pra direcionar sua simulação ao atendimento da sua região.',form:'local'},
 {k:'contato',a:'Última etapa.',t:'Pra onde devemos enviar sua simulação?',d:'Um especialista autorizado da Embracon monta as opções de parcelas e grupos pro seu objetivo.',form:'contato'},
 {k:'aceite',t:'Quase pronto! Podemos chamar você no WhatsApp?',form:'aceite'}
];
var R={},i=0,enviando=false,iniciou=false,HP='',ACEITE=false;
var $=function(s){return document.querySelector(s)};
var body=$('#qbody'),prog=$('#prog'),cont=$('#cont'),volta=$('#volta');

// origem: UTMs, fbclid e cmpid (RedTrack) guardados na chegada
var ORIG=(function(){
 var o={},q=new URLSearchParams(location.search);
 ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','cmpid'].forEach(function(k){var v=q.get(k);if(v)o[k]=v.slice(0,300)});
 try{var s=sessionStorage.getItem('mx_orig');if(s&&!Object.keys(o).length)o=JSON.parse(s);else sessionStorage.setItem('mx_orig',JSON.stringify(o))}catch(e){}
 o.pagina=location.origin+location.pathname;
 return o;
})();

// pixel Meta
function fb(){if(window.fbq)window.fbq.apply(null,arguments)}
if(MX.pixel){
 !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
 fb('init',MX.pixel);fb('track','PageView');
}

function abrir(tipo){
 if(tipo&&FX[tipo]){if(R.tipo!==tipo){R.tipo=tipo;delete R.carta;delete R.carta_valor;delete R.parcela}i=1}
 document.body.classList.add('q');window.scrollTo(0,0);
 if(!iniciou){iniciou=true;fb('track','InitiateCheckout');window.rtConv&&rtConv('QuizStarted');history.pushState({q:1},'')}
 tela();
}
document.querySelectorAll('[data-quiz]').forEach(function(b){b.addEventListener('click',function(){abrir()})});
document.querySelectorAll('[data-tipo]').forEach(function(b){b.addEventListener('click',function(){abrir(b.getAttribute('data-tipo'))})});
window.addEventListener('popstate',function(){if(document.body.classList.contains('q')&&!enviando){if(i>0&&i<P.length){i--;history.pushState({q:1},'');tela()}else{document.body.classList.remove('q');iniciou=false}}});
volta.addEventListener('click',function(){if(i>0){i--;tela()}else{history.back()}});

function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}

function tela(){
 var p=P[i];body.innerHTML='';
 prog.style.width=Math.round((i+1)/P.length*100)+'%';
 cont.textContent='';volta.hidden=false;
 if(p.a)body.appendChild(el('p','av',p.a));
 body.appendChild(el('h2','',p.t));
 if(p.d)body.appendChild(el('p','dica',p.d));
 if(p.form==='local')return telaLocal();
 if(p.form==='contato')return telaContato();
 if(p.form==='aceite')return telaAceite();
 var ops=el('div','ops'),lista=typeof p.o==='function'?p.o():p.o;
 lista.forEach(function(txt,n){
  var v=p.v?p.v[n]:txt;
  var b=el('button','op');b.type='button';
  b.appendChild(el('span','m'));b.appendChild(el('span','',txt));
  if(R[p.k]===v)b.classList.add('on');
  b.addEventListener('click',function(){
   if(p.k==='tipo'&&R.tipo!==v){delete R.carta;delete R.carta_valor;delete R.parcela}
   R[p.k]=v;
   if(p.k==='carta')R.carta_valor=fxNum(FX[R.tipo][n]);
   ops.querySelectorAll('.op').forEach(function(o){o.classList.remove('on')});b.classList.add('on');
   setTimeout(avanca,180);
  });
  ops.appendChild(b);
 });
 body.appendChild(ops);
}
function avanca(){fb('trackCustom','QuizEtapa',{etapa:i+1,pergunta:P[i].k});i++;window.scrollTo(0,0);tela()}

function campo(id,rot,attrs,erro,opc){
 var c=el('div','campo'),l=el('label');l.htmlFor=id;l.textContent=rot;
 if(opc){l.appendChild(document.createTextNode(' '));l.appendChild(el('small','','(opcional)'))}
 var inp=el(attrs.tag||'input');inp.id=id;
 for(var k in attrs)if(k!=='tag')inp.setAttribute(k,attrs[k]);
 c.appendChild(l);c.appendChild(inp);c.appendChild(el('div','e',erro));
 inp.addEventListener('input',function(){c.classList.remove('err')});
 return {c:c,i:inp};
}

function telaLocal(){
 var cid=campo('f_cidade','Sua cidade',{type:'text',autocomplete:'address-level2',maxlength:'60',placeholder:'Ex.: Ribeirão Preto'},'Preencha a cidade e o estado.');
 var uf=campo('f_uf','Seu estado',{tag:'select',autocomplete:'address-level1'},'Preencha a cidade e o estado.');
 uf.i.appendChild(new Option('Escolha o estado',''));
 UFS.forEach(function(u){uf.i.appendChild(new Option(u,u))});
 cid.i.value=R.cidade||'';uf.i.value=R.uf||'';
 var b=el('button','btn','Continuar');b.type='button';
 b.addEventListener('click',function(){
  var c=cid.i.value.trim(),ok=true;
  if(c.length<2){cid.c.classList.add('err');ok=false}
  else if(!uf.i.value){uf.c.classList.add('err');ok=false}
  if(!ok)return;R.cidade=c;R.uf=uf.i.value;avanca();
 });
 body.appendChild(cid.c);body.appendChild(uf.c);body.appendChild(b);
}

function mascTel(v){v=v.replace(/\D/g,'').slice(0,11);if(v.length<3)return v;if(v.length<8)return '('+v.slice(0,2)+') '+v.slice(2);return '('+v.slice(0,2)+') '+v.slice(2,7)+'-'+v.slice(7)}

function telaContato(){
 var nome=campo('f_nome','Seu nome completo',{type:'text',autocomplete:'name',maxlength:'80',placeholder:'Nome e sobrenome'},'Escreva seu nome e sobrenome.');
 var zap=campo('f_zap','Seu WhatsApp com DDD',{type:'tel',inputmode:'numeric',autocomplete:'tel-national',placeholder:'(11) 91234-5678'},'Confira o número, com DDD.');
 var mail=campo('f_mail','Seu melhor e-mail',{type:'email',autocomplete:'email',maxlength:'120',placeholder:'seunome@email.com'},'Confira o e-mail, ou deixe em branco.',true);
 var hp=el('input','hp');hp.type='text';hp.name='site';hp.tabIndex=-1;hp.autocomplete='off';hp.setAttribute('aria-hidden','true');
 nome.i.value=R.nome||'';zap.i.value=R.whatsapp?mascTel(R.whatsapp):'';mail.i.value=R.email||'';
 zap.i.addEventListener('input',function(){zap.i.value=mascTel(zap.i.value)});
 var b=el('button','btn','Continuar');b.type='button';
 b.addEventListener('click',function(){
  var ok=true,n=nome.i.value.trim().replace(/\s+/g,' '),z=zap.i.value.replace(/\D/g,''),m=mail.i.value.trim();
  if(n.split(' ').length<2||n.length<5){nome.c.classList.add('err');ok=false}
  if(!/^[1-9]{2}9?\d{8}$/.test(z)){zap.c.classList.add('err');ok=false}
  if(m&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)){mail.c.classList.add('err');ok=false}
  if(!ok){var f=body.querySelector('.err');if(f)f.scrollIntoView({block:'center',behavior:'smooth'});return}
  R.nome=n;R.whatsapp=z;R.email=m;HP=hp.value;
  avanca();
 });
 [nome,zap,mail].forEach(function(x){body.appendChild(x.c)});
 body.appendChild(hp);
 body.appendChild(el('p','seg','Seus dados estão seguros. A gente não pede CPF, senha nem pagamento neste cadastro.'));
 body.appendChild(b);
}

function telaAceite(){
 var ac=el('label','aceite'),ck=el('input');ck.type='checkbox';ck.id='f_aceite';ck.checked=ACEITE;
 var tx=el('span');tx.textContent='Autorizo a MXM Consórcios e a Embracon a entrarem em contato pelo WhatsApp pra apresentar minha simulação e tirar dúvidas sobre os planos.';
 var sem=el('p','dica','Sem essa autorização, seu cadastro fica guardado, mas o especialista não pode chamar você.');
 var pv=el('p','dica');pv.appendChild(document.createTextNode('Veja como usamos seus dados na '));
 var a=el('a','','Política de Privacidade');a.href='privacidade.html';a.target='_blank';a.rel='noopener';pv.appendChild(a);pv.appendChild(document.createTextNode('.'));
 ac.appendChild(ck);ac.appendChild(tx);
 var er=el('p','erro');er.hidden=true;
 var b=el('button','btn','Quero receber minha simulação');b.type='button';
 b.addEventListener('click',function(){
  if(enviando)return;
  ACEITE=ck.checked;
  if(!R.whatsapp||!R.tipo||!R.carta){i=!R.tipo?0:!R.carta?1:7;return tela()}
  enviar(HP,b,er);
 });
 body.appendChild(ac);body.appendChild(sem);body.appendChild(pv);
 body.appendChild(er);body.appendChild(b);
}

// Ordem fixa dos campos. A planilha separa por esta ordem (aba "leads"); mudou aqui, muda lá.
var CAMPOS=['nome','whatsapp','email','cidade','uf','tipo','carta','carta_valor','parcela','prazo','lance','ja_fez','aceite','utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','cmpid','rt_clique','pagina','ua'];
function limpa(v){return String(v==null?'':v).replace(/[¦\r\n\t]/g,' ').slice(0,300)}
function enviar(hp,b,er){
 enviando=true;b.disabled=true;b.textContent='Enviando';er.hidden=true;
 var id='mx-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
 var d={aceite:ACEITE?'sim':'não',ua:navigator.userAgent.slice(0,200)};
 for(var k in R)d[k]=R[k];
 d.whatsapp='55'+R.whatsapp;
 for(var o in ORIG)d[o]=ORIG[o];
 try{d.rt_clique=window.rtClique?window.rtClique():''}catch(e){}
 var fim=function(){fb('track','Lead',{content_category:R.tipo},{eventID:id});window.rtConv&&rtConv('Lead');pronto()};
 var falha=function(){enviando=false;b.disabled=false;b.textContent='Quero receber minha simulação';er.textContent='Não deu pra enviar. Confira sua internet e toque em Enviar de novo.';er.hidden=false};
 if(hp)return pronto(); // campo-isca preenchido: robô. Finge sucesso, não envia e não dispara Lead.
 if(!MX.endpoint||!MX.campo){console.warn('MXM: endpoint vazio, lead não enviado');return fim()}
 var carga=id+'¦'+CAMPOS.map(function(c){return limpa(d[c])}).join('¦');
 fetch(MX.endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:encodeURIComponent(MX.campo)+'='+encodeURIComponent(carga)})
  .then(fim).catch(falha);
}

function pronto(){
 i=P.length;prog.style.width='100%';cont.textContent='';volta.hidden=true;body.innerHTML='';
 var f=el('div','fim');f.appendChild(el('div','ok','✓'));
 if(ACEITE){
  f.appendChild(el('h2','','Pronto! Um especialista vai te chamar no WhatsApp.'));
  f.appendChild(el('p','','Recebemos as informações da sua simulação. Um consultor da MXM Consórcios, parceira autorizada Embracon, vai chamar você no WhatsApp com as opções de crédito, prazos e parcelas.'));
  var ol=el('ol','prox');
  ['Selecionamos os grupos da Embracon que combinam com a sua carta e a sua parcela.','Você recebe uma mensagem no WhatsApp com a simulação.','Você tira suas dúvidas sobre sorteio, lance e prazos, sem compromisso.'].forEach(function(t){ol.appendChild(el('li','',t))});
  f.appendChild(ol);
 }else{
  f.appendChild(el('h2','','Pronto! Recebemos seu cadastro.'));
  f.appendChild(el('p','','Você não autorizou o contato pelo WhatsApp, então o especialista não vai chamar você. Mudou de ideia? Faça o cadastro de novo e marque a autorização.'));
 }
 f.appendChild(el('p','imp','Quem chamar você vai se identificar como MXM Consórcios, parceira Embracon. A simulação é grátis: ninguém pede pagamento por WhatsApp pra liberar simulação nem carta de crédito.'));
 body.appendChild(f);window.scrollTo(0,0);
}
})();
