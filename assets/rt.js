/* RedTrack na MXM Consórcios (11/11/26, Redtracker, pedido do Assistente). Mesmo esquema da VolanteCred.
   Vai no site como assets/rt.js, carregado ANTES do script do quiz (no <head> ou logo antes dele):
     <script src="assets/rt.js"></script>
   Campanha RT: "Meta - MXM Consórcios (direto)" 6af4d9f0bb2e0a024fecdb0f (fonte Meta, CPC, custo automático).

   O que faz:
   1. Clique: só quando a URL traz cmpid (veio do anúncio) ou rtkcid, carrega o uniclick.js do RedTrack
      pelo domínio do próprio RT (i0c5a.ttrk.io, sem oriameds). Ele registra o clique com os sub1..sub8
      do anúncio e grava o cookie rtkclickid-store no domínio do site (30 dias). Visita orgânica não carrega nada.
   2. window.rtConv('QuizStarted') e window.rtConv('Lead'): mandam a conversão pro RedTrack pelo clique guardado
      (postback do navegador). Uma de cada por clique (rdtk_event_id = qs_<clique> / lead_<clique>).
      Sem clique do anúncio, não manda nada.
   3. window.rtClique(): devolve o id do clique do RedTrack (24 letras e números) ou ''. Vale gravar na
      planilha numa coluna "rt_clique" junto do cmpid: liga cada lead ao anúncio no RedTrack.
   Sem dado da pessoa: só o id do clique e o tipo.
   __rtkMetaCapiLoading: impede o uniclick.js de puxar do unpkg.com (sem versão fixa) o param-builder
   da CAPI do RedTrack, que não usamos. Mesmo cuidado do pixels.js da Oria e da VolanteCred. */
(function () {
  var H = 'https://i0c5a.ttrk.io';
  var RX = /^[a-f0-9]{24}$/;
  function clique() {
    try { var q = new URLSearchParams(location.search).get('rtkcid'); if (q && RX.test(q)) return q; } catch (e) {}
    var m = document.cookie.match(/(?:^|;)\s*rtkclickid-store=([a-f0-9]{24})/);
    return m ? m[1] : '';
  }
  window.rtClique = clique;
  try {
    var q = new URLSearchParams(location.search);
    if (q.get('cmpid') || q.get('rtkcid')) {
      window.__rtkMetaCapiLoading = true;
      var s = document.createElement('script');
      s.async = true;
      s.src = H + '/uniclick.js?attribution=lastpaid&cookiedomain=' + location.hostname.replace(/^www\./, '') +
              '&cookieduration=30&defaultcampaignid=&regviewonce=false&rtkcidurl=false';
      (document.head || document.documentElement).appendChild(s);
    }
  } catch (e) {}
  var feito = {};
  window.rtConv = function (tipo) {
    if (feito[tipo]) return; feito[tipo] = 1;
    var n = 0;
    (function vai() {
      var c = clique();
      if (!c) { if (++n < 20) setTimeout(vai, 500); return; } // espera o uniclick gravar o clique (até 10 s)
      var u = H + '/postback?clickid=' + c + '&type=' + encodeURIComponent(tipo) +
              '&rdtk_event_id=' + (tipo === 'Lead' ? 'lead_' : 'qs_') + c;
      try { fetch(u, { mode: 'no-cors', keepalive: true, credentials: 'omit' }); }
      catch (e) { (new Image()).src = u; }
    })();
  };
})();

/* Onde chamar no quiz (duas linhas, junto dos eventos do pixel):
   1) Quando o quiz começa (o mesmo lugar do InitiateCheckout do pixel):
        window.rtConv && rtConv('QuizStarted');
   2) Quando o envio do lead deu certo (o mesmo lugar do Lead do pixel, nunca no campo-isca de robô):
        window.rtConv && rtConv('Lead');
   Link de teste (depois do deploy): https://consorcio.marcelmacedo.com/?cmpid=6af4d9f0bb2e0a024fecdb0f&sub1=rtktest_mxm&sub4=teste&utm_source=teste */
