(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var doc = document.documentElement, body = document.body;
  document.getElementById('yr').textContent = new Date().getFullYear();
  var GSAP = window.gsap, ST = window.ScrollTrigger;

  /* ---------- PRELOADER ---------- */
  function revealPage(){
    if(revealPage._d) return; revealPage._d = true;
    body.classList.remove('loading');
    var pre = document.getElementById('preloader'), curt = document.getElementById('plCurtain');
    if(reduce || !GSAP){ pre.style.display='none'; curt.style.display='none'; startHero(true); return; }
    var tl = GSAP.timeline({onComplete:function(){pre.style.display='none';curt.style.display='none';}});
    tl.from('.pl-logo',{scale:.84,opacity:0,duration:.3,ease:'back.out(1.4)'},0)
      .to('#plFill',{scaleX:1,duration:.34,ease:'power2.out'},0)
      .to('#preloader',{yPercent:-100,duration:.45,ease:'power3.inOut'},'+=.04')
      .add(function(){ startHero(false); },'-=.18')
      .to('#plCurtain',{yPercent:-100,duration:.5,ease:'power3.inOut'},'-=.34');
  }
  // Reveal as soon as the hero poster is ready (don't wait for full window.load —
  // that waits on the video + every asset and pushes LCP late). GSAP is already loaded here.
  (function(){
    var hi = document.querySelector('.hero-bg img');
    if (hi && hi.complete && hi.naturalWidth) revealPage();
    else if (hi) { hi.addEventListener('load', revealPage, {once:true}); hi.addEventListener('error', revealPage, {once:true}); }
    setTimeout(revealPage, 350);    // cap — keep the brand flash brief
  })();
  setTimeout(revealPage, 3500);      // ultimate safety

  /* ---------- LENIS SMOOTH SCROLL ---------- */
  var lenis = null;
  if(window.Lenis && !reduce){
    lenis = new Lenis({ duration:1.1, easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t));}, smoothWheel:true });
    if(GSAP && ST){
      lenis.on('scroll', ST.update);
      GSAP.ticker.add(function(t){ lenis.raf(t*1000); });
      GSAP.ticker.lagSmoothing(0);
    } else {
      function raf(t){ lenis.raf(t); requestAnimationFrame(raf); } requestAnimationFrame(raf);
    }
    window.__lenis = lenis;
  }
  function scrollTo(target){ if(lenis) lenis.scrollTo(target,{offset:-70}); else { var el=document.querySelector(target); if(el) el.scrollIntoView({behavior:reduce?'auto':'smooth'}); } }
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){ var id=a.getAttribute('href'); if(id.length>1){ e.preventDefault(); closeMenu(); scrollTo(id); } });
  });

  /* ---------- HERO INTRO ---------- */
  function startHero(instant){
    // Hero video on all devices (muted+playsinline autoplay). Mobile gets a lighter 960px
    // encode for smooth decode; the poster (img) still shows if autoplay is blocked
    // (e.g. iOS Low Power Mode). Parallax is disabled on touch so nothing fights the decode.
    if(!reduce){
      var v=document.getElementById('heroVid'), s=v.querySelector('source');
      var src = window.matchMedia('(max-width:760px)').matches ? (s.dataset.srcMobile || s.dataset.src) : s.dataset.src;
      if(src){ s.src=src; v.load();
        v.addEventListener('canplay',function(){ v.classList.add('show'); var p=v.play(); if(p&&p.catch)p.catch(function(){}); },{once:true}); }
    }
    if(instant || !GSAP){ document.querySelectorAll('.hero-title .line-in,[data-hero]').forEach(function(e){e.style.opacity=1;e.style.transform='none';}); return; }
    GSAP.set('.hero-title .line-in',{yPercent:118});
    GSAP.set('[data-hero]',{y:24,opacity:0});
    var tl=GSAP.timeline();
    tl.to('.hero-title .line-in',{yPercent:0,duration:.9,stagger:.08,ease:'power4.out'},0)
      .to('[data-hero="0"]',{y:0,opacity:1,duration:.45,ease:'power2.out'},.05)
      .to('[data-hero="1"]',{y:0,opacity:1,duration:.45,ease:'power2.out'},.15)
      .to('[data-hero="2"]',{y:0,opacity:1,duration:.45,ease:'power2.out'},.3)
      .to('[data-hero="3"]',{y:0,opacity:1,duration:.4,stagger:.05,ease:'power2.out'},.42);
  }

  /* ---------- NAV STATE ---------- */
  var header=document.getElementById('siteHeader'), lastY=0;
  function navState(){
    var y = lenis ? lenis.scroll : window.scrollY;
    header.classList.toggle('scrolled', y>60);
    header.classList.toggle('at-top', y<40);
    if(y>400 && y>lastY+4){ header.classList.add('hide'); } else if(y<lastY-4){ header.classList.remove('hide'); }
    document.getElementById('toTop').classList.toggle('show', y>700);
    lastY=y;
  }
  navState();
  (lenis ? lenis.on('scroll',navState) : window.addEventListener('scroll',navState,{passive:true}));

  /* ---------- MOBILE MENU ---------- */
  var burger=document.getElementById('burger'), menu=document.getElementById('mobileMenu'), scrim=document.getElementById('scrim'), mclose=document.getElementById('menuClose');
  function openMenu(){menu.classList.add('open');scrim.classList.add('open');burger.setAttribute('aria-expanded','true');menu.setAttribute('aria-hidden','false');if(lenis)lenis.stop();}
  function closeMenu(){menu.classList.remove('open');scrim.classList.remove('open');burger.setAttribute('aria-expanded','false');menu.setAttribute('aria-hidden','true');if(lenis)lenis.start();}
  burger.addEventListener('click',openMenu); mclose.addEventListener('click',closeMenu); scrim.addEventListener('click',closeMenu);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu();});

  /* ---------- BACK TO TOP ---------- */
  document.getElementById('toTop').addEventListener('click',function(){ if(lenis)lenis.scrollTo(0); else window.scrollTo({top:0,behavior:reduce?'auto':'smooth'}); });

  /* ---------- CONTACT FORM ---------- */
  var form=document.getElementById('contactForm');
  form.addEventListener('submit',function(e){
    e.preventDefault(); if(!form.checkValidity()){form.reportValidity();return;}
    var d=new FormData(form);
    var bdy='Name: '+(d.get('name')||'')+'\nCompany: '+(d.get('company')||'')+'\nEmail: '+(d.get('email')||'')+'\nPhone: '+(d.get('phone')||'')+'\n\n'+(d.get('message')||'');
    var href='mailto:info@jardineutilities.co.uk?subject='+encodeURIComponent('Website enquiry — '+(d.get('name')||''))+'&body='+encodeURIComponent(bdy);
    document.getElementById('formOk').classList.add('show'); window.location.href=href;
  });

  if(!GSAP || !ST){
    document.querySelectorAll('[data-reveal]').forEach(function(e){e.classList.add('in');});
    document.querySelectorAll('[data-counter]').forEach(function(e){e.textContent=e.getAttribute('data-counter')+(e.getAttribute('data-suffix')||'');});
    return;
  }
  GSAP.registerPlugin(ST);

  /* ---------- SCROLL PROGRESS ---------- */
  GSAP.to('#progress',{scaleX:1,ease:'none',scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:.3}});

  /* ---------- REVEALS ---------- */
  document.querySelectorAll('[data-reveal]').forEach(function(el){
    var delay=parseFloat(el.getAttribute('data-reveal-delay')||0)/1000;
    ST.create({trigger:el,start:'top 88%',once:true,onEnter:function(){ GSAP.to(el,{opacity:1,y:0,duration:.85,delay:delay,ease:'power3.out',onStart:function(){el.classList.add('in');}}); }});
  });

  /* ---------- COUNTERS ---------- */
  document.querySelectorAll('[data-counter]').forEach(function(el){
    var end=parseInt(el.getAttribute('data-counter'),10), suf=el.getAttribute('data-suffix')||'', o={v:0};
    ST.create({trigger:el,start:'top 92%',once:true,onEnter:function(){ GSAP.to(o,{v:end,duration:1.7,ease:'power2.out',onUpdate:function(){el.textContent=Math.round(o.v)+suf;}}); }});
  });

  /* ---------- HERO PARALLAX (desktop only — keeps the mobile video smooth on scroll) ---------- */
  if(fine) GSAP.to('#heroBg',{yPercent:16,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  GSAP.to('.emergency .bg',{yPercent:12,ease:'none',scrollTrigger:{trigger:'.emergency',start:'top bottom',end:'bottom top',scrub:true}});
  document.querySelectorAll('[data-parallax]').forEach(function(el){
    GSAP.fromTo(el,{yPercent:-8},{yPercent:8,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:true}});
  });

  /* ---------- PROCESS LINE DRAW ---------- */
  GSAP.to('#stepFill',{scaleX:1,ease:'none',scrollTrigger:{trigger:'#steps',start:'top 70%',end:'bottom 70%',scrub:.5}});

  /* ---------- CARD TILT (fine pointer) ---------- */
  if(fine && !reduce){
    document.querySelectorAll('[data-tilt]').forEach(function(card){
      card.addEventListener('mousemove',function(e){
        var r=card.getBoundingClientRect(), px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
        GSAP.to(card,{rotateY:px*6,rotateX:-py*6,y:-6,duration:.4,ease:'power2.out',transformPerspective:800});
      });
      card.addEventListener('mouseleave',function(){ GSAP.to(card,{rotateX:0,rotateY:0,y:0,duration:.6,ease:'elastic.out(1,.5)'}); });
    });
    document.querySelectorAll('[data-magnetic]').forEach(function(b){
      b.addEventListener('mousemove',function(e){ var r=b.getBoundingClientRect(); GSAP.to(b,{x:(e.clientX-r.left-r.width/2)*.3,y:(e.clientY-r.top-r.height/2)*.4,duration:.4,ease:'power2.out'}); });
      b.addEventListener('mouseleave',function(){ GSAP.to(b,{x:0,y:0,duration:.5,ease:'elastic.out(1,.4)'}); });
    });
  }

  ST.refresh();
})();
