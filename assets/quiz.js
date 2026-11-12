(function(){
'use strict';
// Quiz v2 (12/11/26): 6 telas, texto do Stefan Brain em copy/02-quiz-v2-sb.md. Não mexer no texto sem ele.
var MX=window.MX||{};
var num=function(n){return 'R$ '+(n*1000).toLocaleString('pt-BR')};
// Faixas de carta por categoria, em milhares de reais: [mínimo, máximo, destaque]. O valor somado na planilha (carta_valor)
// é o meio da faixa; na faixa aberta ("Acima de") é o próprio piso.
var FX={
 'Imóvel':[[120,200],[200,350,'Inclui planos de R$ 250 mil'],[350,500],[500,800],[800,0]],
 'Carro':[[40,70],[70,100,'Inclui planos de R$ 80 mil'],[100,150],[150,220],[220,0]],
 'Moto':[[15,25],[25,35],[35,50],[50,0]],
 'Pesados':[[150,250],[250,400],[400,600],[600,0]],
 'Serviços':[[20,30],[30,45],[45,60],[60,0]]
};
function fxTxt(f){return !f[1]?'Acima de '+num(f[0]):'De '+num(f[0])+' a '+num(f[1])}
function fxNum(f){return (!f[1]?f[0]:(f[0]+f[1])/2)*1000}
// Parcela por categoria. A referência de R$ 916 é de imóvel, a de R$ 635 é de carro e a de R$ 1.690 é de pesados,
// por isso cada uma só aparece na sua categoria.
var PA=['Até R$ 1.000 por mês','De R$ 1.000 a R$ 1.800 por mês','De R$ 1.800 a R$ 2.800 por mês','De R$ 2.800 a R$ 4.000 por mês','Acima de R$ 4.000 por mês'];
var PB=['Até R$ 650 por mês','De R$ 650 a R$ 1.000 por mês','De R$ 1.000 a R$ 1.500 por mês','De R$ 1.500 a R$ 2.200 por mês','Acima de R$ 2.200 por mês'];
var PC=['Até R$ 350 por mês','De R$ 350 a R$ 550 por mês','De R$ 550 a R$ 850 por mês','Acima de R$ 850 por mês'];
var PD=['Até R$ 1.800 por mês','De R$ 1.800 a R$ 2.800 por mês','De R$ 2.800 a R$ 4.000 por mês','De R$ 4.000 a R$ 6.000 por mês','Acima de R$ 6.000 por mês'];
var PAR={'Imóvel':PA,'Pesados':PD,'Carro':PB,'Moto':PC,'Serviços':PC};
var REF={'Imóvel':'Referência Embracon: R$ 250 mil com parcelas a partir de R$ 916/mês','Carro':'Referência Embracon: R$ 80 mil com parcelas a partir de R$ 635/mês','Pesados':'Referência Embracon: Pesados de R$ 150 mil com parcelas a partir de R$ 1.690/mês'};
// Botões da página inicial que caem na mesma categoria do quiz. O nome clicado segue pra planilha (coluna tipo).
var DA_LP={'Caminhão':'Pesados','Trator ou máquina':'Pesados'};
var NOME_CAT={'Pesados':'Caminhão, trator ou máquina pesada'};

var P=[
 {k:'tipo',t:'Qual conquista você quer planejar?',d:'Selecione a categoria para carregar as tabelas oficiais da Embracon sem juros de banco:',o:function(){return [
  {v:'Imóvel',t:'Imóvel',s:'Comprar casa, apartamento, terreno, construir ou reformar'},
  {v:'Carro',t:'Carro',s:'Comprar carro novo, seminovo ou trocar usando seu usado'},
  {v:'Moto',t:'Moto',s:'Comprar sua primeira moto ou modelo para trabalho/viagem'},
  {v:'Pesados',t:'Caminhão, trator ou máquina pesada',s:'Renovação de frota ou agronegócio'},
  {v:'Serviços',t:'Serviços',s:'Reformas, viagens, casamentos ou cursos e estudos'}]}},
 {k:'carta',t:'De quanto crédito você precisa para o seu plano?',d:'Escolha a estimativa de valor da sua carta para calcularmos as menores parcelas:',o:function(){return FX[R.tipo].map(function(f){return {v:fxTxt(f),t:fxTxt(f),dq:f[2],n:fxNum(f)}})}},
 {k:'parcela',t:'Quanto fica confortável investir por mês?',d:'Os planos são desenhados para caber no seu orçamento sem comprometer sua renda:',o:function(){return PAR[R.tipo].map(function(x,n){return {v:x,t:x,dq:n===0?REF[R.tipo]:''}})}},
 {k:'contemplacao',t:'Como você prefere receber a sua carta de crédito?',d:'Na Embracon você tem diferentes formas de contemplação nas assembleias mensais. Escolha sua preferência:',o:function(){return [
  {v:'Sorteios mensais',t:'Quero contar com os sorteios mensais',s:'Sem precisar desembolsar nada de lance à vista'},
  {v:'Lance embutido',t:'Quero antecipar com o Lance Embutido da Embracon',s:'Você usa até 25% do próprio crédito contratado para dar lance, sem tirar dinheiro do bolso'},
  {v:'Reserva ou veículo usado',t:'Tenho reserva financeira ou veículo usado para lance',s:'Lance livre com recursos próprios ou programa Troca de Chaves para veículos'},
  {v:'Consultor indica',t:'Quero que o consultor me mostre a opção mais rápida para o meu bolso',s:'Análise comparativa dos grupos abertos com menor concorrência'}]}},
 {k:'cidade',t:'Em qual cidade você mora?',d:'Identificamos os grupos e tabelas disponíveis com atendimento regional da Embracon para você:',form:telaCidade},
 {k:'contato',t:'Onde devemos enviar sua simulação detalhada?',d:'Um consultor credenciado da equipe MXM / Embracon vai preparar a relação de grupos, prazos e parcelas para o seu perfil e enviar no seu WhatsApp:',form:telaContato}
];
var PCT=[15,35,55,75,90,100];
var R={},i=0,enviando=false,iniciou=false,trava=false,tras=false;
var $=function(s){return document.querySelector(s)};
var body=$('#qbody'),prog=$('#prog'),cont=$('#cont'),pct=$('#pct'),volta=$('#volta'),qbar=$('#qbar');

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

function limpaTipo(){delete R.carta;delete R.carta_valor;delete R.parcela;delete R.tipo_det}
function abrir(tipo){
 if(i>=P.length){i=0;R={}}
 if(tipo){
  var cat=DA_LP[tipo]||tipo;
  if(FX[cat]){if(R.tipo!==cat)limpaTipo();R.tipo=cat;if(DA_LP[tipo])R.tipo_det=tipo;else delete R.tipo_det;i=1}
 }
 document.body.classList.add('q');window.scrollTo(0,0);
 if(!iniciou){iniciou=true;fb('track','InitiateCheckout');window.rtConv&&rtConv('QuizStarted');history.pushState({q:1},'')}
 tras=false;tela();
}
document.querySelectorAll('[data-quiz]').forEach(function(b){b.addEventListener('click',function(){abrir()})});
document.querySelectorAll('[data-tipo]').forEach(function(b){b.addEventListener('click',function(){abrir(b.getAttribute('data-tipo'))})});
window.addEventListener('popstate',function(){if(document.body.classList.contains('q')&&!enviando){if(i>0&&i<P.length){i--;history.pushState({q:1},'');tras=true;tela()}else{document.body.classList.remove('q');iniciou=false}}});
volta.addEventListener('click',function(){if(enviando)return;if(i>0){i--;tras=true;tela()}else{history.back()}});

function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}

function tela(){
 var p=P[i];body.innerHTML='';trava=false;
 qbar.hidden=false;prog.parentNode.hidden=false;
 prog.style.width=PCT[i]+'%';
 cont.textContent='Etapa '+(i+1)+' de '+P.length;
 pct.textContent=PCT[i]+'%'+(i===P.length-1?' · Quase pronto!':'');
 volta.hidden=i===0;
 body.className='qbody';void body.offsetWidth;body.className='qbody entra'+(tras?' tras':'');tras=false;
 body.appendChild(el('h2','',p.t));
 body.appendChild(el('p','dica',p.d));
 if(p.form)return p.form();
 var ops=el('div','ops');
 p.o().forEach(function(o){
  var b=el('button','op');b.type='button';
  var tx=el('span','tx');
  tx.appendChild(el(o.s||o.dq?'b':'span','',o.t));
  if(o.s)tx.appendChild(el('small','',o.s));
  if(o.dq)tx.appendChild(el('small','dq',o.dq));
  b.appendChild(el('span','m'));b.appendChild(tx);
  if(R[p.k]===o.v)b.classList.add('on');
  b.addEventListener('click',function(){
   if(trava)return;trava=true;
   if(p.k==='tipo'&&(R.tipo!==o.v||R.tipo_det))limpaTipo();
   R[p.k]=o.v;
   if(p.k==='carta')R.carta_valor=o.n;
   ops.querySelectorAll('.op').forEach(function(x){x.classList.remove('on')});b.classList.add('on');
   setTimeout(avanca,250);
  });
  ops.appendChild(b);
 });
 body.appendChild(ops);
}
function avanca(){fb('trackCustom','QuizEtapa',{etapa:i+1,pergunta:P[i].k});i++;window.scrollTo(0,0);tela()}

function campo(id,rot,attrs,erro){
 var c=el('div','campo'),l=el('label','',rot);l.htmlFor=id;
 var inp=el('input');inp.id=id;
 for(var k in attrs)inp.setAttribute(k,attrs[k]);
 c.appendChild(l);c.appendChild(inp);c.appendChild(el('div','e',erro));
 inp.addEventListener('input',function(){c.classList.remove('err')});
 return {c:c,i:inp};
}
function noEnter(inp,b){inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();b.click()}})}

function telaCidade(){
 var cid=campo('f_cidade','Sua Cidade',{type:'text',autocomplete:'address-level2',autocapitalize:'words',maxlength:'60',placeholder:'Exemplo: Campinas (ou digite sua cidade)'},'Escreva o nome da sua cidade.');
 cid.i.value=R.cidade||'';
 var b=el('button','btn','Avançar para o Resultado');b.type='button';
 b.addEventListener('click',function(){
  var c=cid.i.value.trim().replace(/\s+/g,' ');
  if(c.length<3){cid.c.classList.add('err');cid.i.focus();return}
  R.cidade=c;avanca();
 });
 noEnter(cid.i,b);
 body.appendChild(cid.c);body.appendChild(b);
}

// Estado pelo DDD do WhatsApp (a tela de cidade não pergunta mais o estado).
var DDD={SP:'11 12 13 14 15 16 17 18 19',RJ:'21 22 24',ES:'27 28',MG:'31 32 33 34 35 37 38',PR:'41 42 43 44 45 46',SC:'47 48 49',RS:'51 53 54 55',DF:'61',GO:'62 64',TO:'63',MT:'65 66',MS:'67',AC:'68',RO:'69',BA:'71 73 74 75 77',SE:'79',PE:'81 87',AL:'82',PB:'83',RN:'84',CE:'85 88',PI:'86 89',PA:'91 93 94',AM:'92 97',RR:'95',AP:'96',MA:'98 99'};
function ufDoDDD(d){for(var u in DDD)if((' '+DDD[u]+' ').indexOf(' '+d+' ')>=0)return u;return ''}
function mascTel(v){v=v.replace(/\D/g,'').slice(0,11);if(v.length<3)return v;if(v.length<8)return '('+v.slice(0,2)+') '+v.slice(2);return '('+v.slice(0,2)+') '+v.slice(2,7)+'-'+v.slice(7)}

var SETA='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';
var ZAP='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
var CTA='Quero Receber Minha Simulação no WhatsApp';
function rotulo(b,txt,seta){b.textContent='';b.appendChild(el('span','',txt));if(seta)b.insertAdjacentHTML('beforeend',SETA)}

function telaContato(){
 var nome=campo('f_nome','Seu Nome Completo',{type:'text',autocomplete:'name',autocapitalize:'words',maxlength:'80',placeholder:'Como prefere ser chamado(a)?'},'Escreva seu nome.');
 var zap=campo('f_zap','Seu WhatsApp com DDD',{type:'tel',inputmode:'numeric',autocomplete:'tel-national',placeholder:'(00) 00000-0000'},'Confira o número: DDD e os 9 dígitos do celular.');
 var hp=el('input','hp');hp.type='text';hp.name='site';hp.tabIndex=-1;hp.autocomplete='off';hp.setAttribute('aria-hidden','true');
 nome.i.value=R.nome||'';zap.i.value=R.whatsapp?mascTel(R.whatsapp):'';
 zap.i.addEventListener('input',function(){zap.i.value=mascTel(zap.i.value)});
 var er=el('p','erro');er.hidden=true;
 var b=el('button','btn envia');b.type='button';rotulo(b,CTA,true);
 b.addEventListener('click',function(){
  if(enviando)return;
  var ok=true,n=nome.i.value.trim().replace(/\s+/g,' '),z=zap.i.value.replace(/\D/g,'');
  if(n.length<3){nome.c.classList.add('err');ok=false}
  if(!/^[1-9]{2}9\d{8}$/.test(z)||!ufDoDDD(z.slice(0,2))){zap.c.classList.add('err');ok=false}
  if(!ok){var f=body.querySelector('.err');if(f)f.scrollIntoView({block:'center',behavior:'smooth'});return}
  R.nome=n;R.whatsapp=z;
  var falta=!R.tipo?0:!R.carta?1:!R.parcela?2:!R.contemplacao?3:!R.cidade?4:-1;
  if(falta>=0){i=falta;return tela()}
  enviar(hp.value,b,er);
 });
 noEnter(nome.i,b);noEnter(zap.i,b);
 body.appendChild(nome.c);body.appendChild(zap.c);body.appendChild(hp);
 body.appendChild(el('p','lgpd','Seus dados estão seguros e não solicitamos CPF nesta etapa. Ao tocar no botão abaixo, você autoriza o envio da simulação gratuita e o esclarecimento de dúvidas sobre os planos de consórcio via WhatsApp por um consultor credenciado, nos termos da Lei Geral de Proteção de Dados (LGPD).'));
 body.appendChild(er);body.appendChild(b);
 var pv=el('p','pv'),a=el('a','','Política de Privacidade');a.href='privacidade.html';a.target='_blank';a.rel='noopener';pv.appendChild(a);
 body.appendChild(pv);
}

// Ordem fixa dos campos. A planilha separa por esta ordem (aba "leads"); mudou aqui, muda lá.
// email, prazo, lance e ja_fez saíram do quiz em 12/11/26 e seguem vazios pra não desalinhar as colunas dos leads antigos.
var CAMPOS=['nome','whatsapp','email','cidade','uf','tipo','carta','carta_valor','parcela','prazo','lance','ja_fez','aceite','utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','cmpid','rt_clique','pagina','ua','contemplacao'];
function limpa(v){return String(v==null?'':v).replace(/[¦\r\n\t]/g,' ').slice(0,300)}
function enviar(hp,b,er){
 enviando=true;b.disabled=true;rotulo(b,'Calculando opções...');er.hidden=true;
 var id='mx-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
 // aceite: não há mais caixa de marcar; tocar no botão é a autorização (texto logo acima dele).
 var d={aceite:'sim',ua:navigator.userAgent.slice(0,200)};
 for(var k in R)d[k]=R[k];
 d.tipo=R.tipo_det||R.tipo;
 d.whatsapp='55'+R.whatsapp;d.uf=ufDoDDD(R.whatsapp.slice(0,2));
 for(var o in ORIG)d[o]=ORIG[o];
 try{d.rt_clique=window.rtClique?window.rtClique():''}catch(e){}
 var fim=function(){fb('track','Lead',{content_name:'Simulacao Consorcio Embracon',content_category:d.tipo,value:0,currency:'BRL'},{eventID:id});window.rtConv&&rtConv('Lead');pronto()};
 var falha=function(){enviando=false;b.disabled=false;rotulo(b,CTA,true);er.textContent='Não deu pra enviar. Confira sua internet e toque no botão de novo.';er.hidden=false};
 if(hp)return pronto(); // campo-isca preenchido: robô. Finge sucesso, não envia e não dispara Lead.
 if(!MX.endpoint||!MX.campo){console.warn('MXM: endpoint vazio, lead não enviado');return fim()}
 var carga=id+'¦'+CAMPOS.map(function(c){return limpa(d[c])}).join('¦');
 fetch(MX.endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:encodeURIComponent(MX.campo)+'='+encodeURIComponent(carga)})
  .then(fim).catch(falha);
}

function linkZap(){
 var n=String(MX.whatsapp||'').replace(/\D/g,'');
 if(n.length<12)return '';
 var cat=R.tipo_det||NOME_CAT[R.tipo]||R.tipo||'';
 var val=String(R.carta||'').replace(/^De /,'de ').replace(/^Acima/,'acima');
 return 'https://wa.me/'+n+'?text='+encodeURIComponent('Olá! Acabei de simular um consórcio de '+cat+' '+val+' no site e gostaria de ver as opções de parcelas e grupos abertos.');
}

function pronto(){
 i=P.length;qbar.hidden=true;prog.parentNode.hidden=true;body.innerHTML='';body.className='qbody entra';
 var f=el('div','fim');
 var ok=el('div','ok');ok.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>';
 f.appendChild(ok);
 f.appendChild(el('h1','','Simulação recebida com sucesso!'));
 f.appendChild(el('p','','Nossa equipe credenciada já está selecionando os melhores grupos e menores parcelas da Embracon para o seu perfil.'));
 var link=linkZap();
 if(link){
  var cx=el('div','zapbox');
  cx.appendChild(el('b','','Quer ver os números agora mesmo sem esperar na fila?'));
  cx.appendChild(el('p','','Toque no botão abaixo para abrir a conversa direta com o nosso consultor credenciado da Embracon no WhatsApp:'));
  var a=el('a','btnzap');a.href=link;a.target='_blank';a.rel='noopener';a.innerHTML=ZAP;a.appendChild(el('span','','Iniciar Conversa no WhatsApp Agora'));
  a.addEventListener('click',function(){fb('trackCustom','CliqueWhatsApp')});
  cx.appendChild(a);f.appendChild(cx);
  f.appendChild(el('p','calma','Se preferir não chamar agora, fique tranquilo: nosso consultor credenciado analisará seus dados e entrará em contato com você pelo WhatsApp com a simulação detalhada para o seu perfil.'));
 }else{
  // Sem número em config.js (MX.whatsapp) a caixa do botão verde não aparece.
  f.appendChild(el('p','calma','Nosso consultor credenciado analisará seus dados e entrará em contato com você pelo WhatsApp com a simulação detalhada para o seu perfil.'));
 }
 var s=el('div','selo2');
 s.appendChild(el('strong','','MXM Consórcios | Parceira Autorizada Embracon'));
 s.appendChild(el('p','','Embracon Administradora de Consórcio Ltda. Autorizada e fiscalizada pelo Banco Central do Brasil (Bacen).'));
 s.appendChild(el('p','','Nossos consultores nunca solicitam depósito prévio, taxa de adesão antecipada ou pagamento de valores fora dos canais bancários oficiais da Embracon.'));
 f.appendChild(s);
 body.appendChild(f);window.scrollTo(0,0);
}
})();
