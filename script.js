(function(){
  const progress=document.querySelector('.scroll-progress span');
  const updateProgress=()=>{if(!progress)return;const h=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=(h>0?window.scrollY/h*100:0)+'%'};
  updateProgress();window.addEventListener('scroll',updateProgress,{passive:true});

  document.querySelectorAll('.reveal').forEach(el=>{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});io.observe(el)});

  if(document.body.classList.contains('road-page')){
    const state={country:'Иран',entry:'Учебная виза',arrival:'2–3 дня назад',university:'ВШЭ',housing:'Общежитие'};
    const country=document.getElementById('countrySelect');
    const chips=document.getElementById('summaryChips');
    const t1=document.getElementById('previewTask1'),t2=document.getElementById('previewTask2'),t3=document.getElementById('previewTask3'),status=document.getElementById('routeStatus');
    function refresh(){
      chips.innerHTML=[state.country,state.entry,state.arrival,state.university,state.housing].map(x=>`<span>${x}</span>`).join('');
      status.textContent=state.arrival==='Сегодня'?'день 01':'день 02';
      if(state.entry==='Без визы / ЕАЭС'){t1.textContent='Проверка учёта / статуса';t2.textContent='Статусная ветка';t3.textContent='Университетские сервисы'}
      else if(state.entry==='Не уверен'){t1.textContent='Уточнение статуса въезда';t2.textContent='Проверка нужных документов';t3.textContent='Следующие шаги по сценарию'}
      else{t1.textContent='Миграционные документы';t2.textContent='Расписка / подтверждение';t3.textContent='Пропуск и следующие сервисы'}
    }
    country.addEventListener('change',()=>{state.country=country.value;refresh()});
    document.querySelectorAll('.inline-choices').forEach(group=>group.querySelectorAll('.choice-chip').forEach(btn=>btn.addEventListener('click',()=>{
      group.querySelectorAll('.choice-chip').forEach(b=>b.classList.remove('active'));btn.classList.add('active');state[group.dataset.field]=btn.dataset.value;refresh();
    })));
    refresh();
  }

  if(document.body.classList.contains('map-page')){
    const data={
      arrival:{num:'01',status:'готово',title:'Въезд',lead:'Старт маршрута. После приезда система понимает, что делать дальше.',do:'Проверить дату приезда и начальную ситуацию.',why:'От этого зависит приоритет первых действий.',opens:'Документы / учёт.'},
      migration:{num:'02',status:'сейчас',title:'Миграционные документы',lead:'Собери только то, что нужно сейчас, чтобы открыть следующий шаг.',do:'Проверить, какие документы уже переданы и чего не хватает.',why:'Следующий университетский шаг зависит от подтверждения.',opens:'Расписку → пропуск.'},
      branch:{num:'↗',status:'если нужна',title:'Статусная ветка',lead:'Появляется только если относится к твоему типу въезда.',do:'Понять, нужна ли эта ветка в твоём случае.',why:'У разных статусов часть маршрута отличается.',opens:'Отдельную последовательность шагов.'},
      receipt:{num:'03',status:'после 02',title:'Расписка / подтверждение',lead:'Переходный шаг между документами и доступом в университет.',do:'Получить подтверждение завершения предыдущего шага.',why:'Без него следующий блок не открывается.',opens:'Пропуск.'},
      pass:{num:'04',status:'на неделе',title:'Пропуск',lead:'После подтверждения документов можно перейти к университетскому доступу.',do:'Оформить доступ в корпус.',why:'Он нужен для повседневного использования инфраструктуры вуза.',opens:'Следующие сервисы.'}
    };
    const nodes=[...document.querySelectorAll('.metro-stop')];
    const f={status:document.getElementById('insStatus'),number:document.getElementById('insNumber'),title:document.getElementById('insTitle'),lead:document.getElementById('insLead'),do:document.getElementById('insDo'),why:document.getElementById('insWhy'),opens:document.getElementById('insOpens')};
    function select(key){const d=data[key];if(!d)return;nodes.forEach(n=>n.classList.toggle('active',n.dataset.node===key));f.status.textContent=d.status;f.number.textContent=d.num;f.title.textContent=d.title;f.lead.textContent=d.lead;f.do.textContent=d.do;f.why.textContent=d.why;f.opens.textContent=d.opens}
    nodes.forEach(n=>n.addEventListener('click',()=>select(n.dataset.node)));
    document.querySelectorAll('.map-toolbar button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.map-toolbar button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const v=btn.dataset.filter;nodes.forEach(n=>n.classList.toggle('hidden',v!=='all'&&n.dataset.time!==v))}));
    select('migration');
  }
})();

(function(){
  if(document.body.classList.contains('route-v11')){
    const questions=[...document.querySelectorAll('.route-v11-question')];
    const counter=document.getElementById('routeQuestionCounter');
    const bar=document.getElementById('routeQuestionBar');
    const prev=document.getElementById('routePrev');
    const next=document.getElementById('routeNext');
    const country=document.getElementById('countrySelect');
    const chips=document.getElementById('summaryChips');
    const status=document.getElementById('routeStatus');
    const t1=document.getElementById('previewTask1');
    const t2=document.getElementById('previewTask2');
    const t3=document.getElementById('previewTask3');
    let q=0;
    const state={country:'Иран',entry:'Учебная виза',arrival:'2–3 дня назад',university:'ВШЭ',housing:'Общежитие'};

    function refreshRoute(){
      chips.innerHTML=[state.country,state.entry,state.arrival,state.university,state.housing].map(v=>`<span>${v}</span>`).join('');
      status.textContent=state.arrival==='Сегодня'?'ДЕНЬ 01':'ДЕНЬ 02';
      if(state.entry==='Без визы / ЕАЭС'){
        t1.textContent='Проверка учёта / статуса';
        t2.textContent='Статусная ветка';
        t3.textContent='Университетские сервисы';
      }else if(state.entry==='Не уверен'){
        t1.textContent='Уточнение статуса въезда';
        t2.textContent='Проверка нужных документов';
        t3.textContent='Следующие шаги по сценарию';
      }else{
        t1.textContent='Миграционные документы';
        t2.textContent='Расписка / подтверждение';
        t3.textContent='Пропуск и следующие сервисы';
      }
    }
    function showQuestion(){
      questions.forEach((el,i)=>el.classList.toggle('active',i===q));
      counter.textContent=`ВОПРОС ${String(q+1).padStart(2,'0')} / 05`;
      bar.style.width=((q+1)/questions.length*100)+'%';
      prev.disabled=q===0;
      next.textContent=q===questions.length-1?'Готово →':'Дальше →';
    }
    country?.addEventListener('change',()=>{state.country=country.value;refreshRoute()});
    document.querySelectorAll('.route-v11-options').forEach(group=>{
      group.querySelectorAll('.choice-chip').forEach(btn=>btn.addEventListener('click',()=>{
        group.querySelectorAll('.choice-chip').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        state[group.dataset.field]=btn.dataset.value;
        refreshRoute();
      }));
    });
    prev.addEventListener('click',()=>{if(q>0){q--;showQuestion();}});
    next.addEventListener('click',()=>{if(q<questions.length-1){q++;showQuestion();}else{window.location.href='map.html';}});
    refreshRoute();
    showQuestion();
  }

  if(document.body.classList.contains('map-v11')){
    const data={
      arrival:{num:'01',status:'ГОТОВО',title:'Въезд',lead:'Точка старта маршрута.',do:'Проверить дату приезда и начальную ситуацию.',why:'От этого зависит приоритет первых действий.',opens:'Документы / учёт.'},
      migration:{num:'02',status:'СЕЙЧАС',title:'Миграционные документы',lead:'Проверь текущий статус и подготовь то, что откроет следующий шаг.',do:'Проверить, какие документы уже переданы и чего не хватает.',why:'Следующий университетский шаг зависит от подтверждения.',opens:'Расписку → пропуск.'},
      branch:{num:'↗',status:'ЕСЛИ НУЖНА',title:'Статусная ветка',lead:'Появляется только если относится к твоему типу въезда.',do:'Понять, нужна ли эта ветка в твоём случае.',why:'У разных статусов часть маршрута отличается.',opens:'Отдельную последовательность шагов.'},
      receipt:{num:'03',status:'ПОСЛЕ 02',title:'Расписка / подтверждение',lead:'Переходный шаг между документами и доступом в университет.',do:'Получить подтверждение завершения предыдущего шага.',why:'Без него следующий блок не открывается.',opens:'Пропуск.'},
      pass:{num:'04',status:'НА НЕДЕЛЕ',title:'Пропуск',lead:'После подтверждения документов можно перейти к университетскому доступу.',do:'Оформить доступ в корпус.',why:'Нужен для повседневного использования инфраструктуры вуза.',opens:'Следующие сервисы.'},
      services:{num:'05',status:'НА НЕДЕЛЕ',title:'Сервисы',lead:'После основных обязательных шагов открываются повседневные сервисы.',do:'Настроить базовые университетские и городские сервисы.',why:'Они нужны уже после ключевых обязательных действий.',opens:'Повседневный режим.'}
    };
    const nodes=[...document.querySelectorAll('.map-v11-node')];
    const f={
      status:document.getElementById('insStatus'),number:document.getElementById('insNumber'),title:document.getElementById('insTitle'),lead:document.getElementById('insLead'),do:document.getElementById('insDo'),why:document.getElementById('insWhy'),opens:document.getElementById('insOpens')
    };
    function select(key){
      const d=data[key]; if(!d) return;
      nodes.forEach(n=>n.classList.toggle('selected',n.dataset.node===key));
      f.status.textContent=d.status;f.number.textContent=d.num;f.title.textContent=d.title;f.lead.textContent=d.lead;f.do.textContent=d.do;f.why.textContent=d.why;f.opens.textContent=d.opens;
    }
    nodes.forEach(n=>n.addEventListener('click',()=>select(n.dataset.node)));
    document.querySelectorAll('.map-v11-filters button').forEach(btn=>btn.addEventListener('click',()=>{
      document.querySelectorAll('.map-v11-filters button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const filter=btn.dataset.filter;
      nodes.forEach(n=>n.classList.toggle('hidden',filter!=='all'&&n.dataset.time!==filter));
    }));
    document.querySelectorAll('.map-v11-examples button').forEach(btn=>btn.addEventListener('click',()=>{
      document.querySelectorAll('.map-v11-examples button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      select(btn.dataset.example==='visa-free'?'branch':'migration');
    }));
    select('migration');
  }
})();

/* V12 — restored Steps scroll behavior */
(function(){
  const stepPage=document.querySelector('.step-v5');
  if(!stepPage) return;
  const panels=[...document.querySelectorAll('[data-step-panel]')];
  const chain=document.querySelector('#chainProgress');
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  function calcChainHeight(){
    const chainBox=document.querySelector('.mini-chain');
    return chainBox?Math.max(0,chainBox.offsetHeight-28):180;
  }
  function updateStep(){
    const compact=innerWidth<=700;
    const story=document.querySelector('.step-story');
    if(compact){
      if(chain) chain.style.height='100%';
      panels.forEach(panel=>{
        panel.style.opacity='1';
        panel.style.transform='none';
      });
      return;
    }
    if(story&&chain){
      const r=story.getBoundingClientRect();
      const max=story.offsetHeight-innerHeight;
      const p=clamp(-r.top/Math.max(1,max));
      chain.style.height=`${p*calcChainHeight()}px`;
    }
    panels.forEach(panel=>{
      const r=panel.getBoundingClientRect();
      const q=clamp(1-Math.abs((r.top+r.height/2)-innerHeight/2)/(innerHeight*.8));
      panel.style.opacity=.28+q*.72;
      panel.style.transform=`translate3d(${(1-q)*38}px,${(1-q)*22}px,0)`;
    });
  }
  let ticking=false;
  const onScroll=()=>{
    if(ticking) return;
    ticking=true;
    requestAnimationFrame(()=>{updateStep();ticking=false;});
  };
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',onScroll);
  updateStep();
})();
