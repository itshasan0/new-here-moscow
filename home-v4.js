const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* HOME — route stays the main story, then changes character in the second half. */
const home=document.querySelector('.home-page');
if(home){
  const progress=document.querySelector('.scroll-progress span');
  const stage=document.querySelector('.route-stage');
  const mainPath=document.querySelector('.route-main');
  const branchPath=document.querySelector('.route-branch');
  const branchTwo=document.querySelector('.route-branch-two');
  const camera=document.querySelector('.route-camera');
  const nodes=[...document.querySelectorAll('.route-node')];
  const scenes=[...document.querySelectorAll('.scene')];
  const variants=[...document.querySelectorAll('.route-variant')];
  const traces=[...document.querySelectorAll('.trace-pill')];
  const rails=[...document.querySelectorAll('.motion-rail')];
  const pathLen=mainPath?.getTotalLength?.() || 4000;
  const branchLen=branchPath?.getTotalLength?.() || 1000;
  const branchTwoLen=branchTwo?.getTotalLength?.() || 1000;

  [mainPath,branchPath,branchTwo].forEach((path,i)=>{
    if(!path)return;
    const len=i===0?pathLen:(i===1?branchLen:branchTwoLen);
    path.style.strokeDasharray=len;
    path.style.strokeDashoffset=len;
  });

  const cameraFrames=[
    {p:0,x:15,y:-2,s:1.04,r:-1},
    {p:.18,x:4,y:11,s:1.20,r:0},
    {p:.34,x:-14,y:17,s:1.30,r:1.2},
    {p:.50,x:-6,y:-1,s:1.12,r:-1.2},
    {p:.67,x:13,y:-9,s:1.42,r:4.5},
    {p:.84,x:-16,y:8,s:1.25,r:-3.2},
    {p:1,x:-5,y:-3,s:1.08,r:-.5}
  ];
  const interpolateFrame=(p)=>{
    let a=cameraFrames[0],b=cameraFrames[cameraFrames.length-1];
    for(let i=0;i<cameraFrames.length-1;i++){
      if(p>=cameraFrames[i].p && p<=cameraFrames[i+1].p){a=cameraFrames[i];b=cameraFrames[i+1];break;}
    }
    const t=clamp((p-a.p)/(b.p-a.p||1));
    return {x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t),s:lerp(a.s,b.s,t),r:lerp(a.r,b.r,t)};
  };
  const nodeThresholds=[.01,.13,.27,.42,.58,.76];

  const localProgress=(el)=>{
    const rect=el.getBoundingClientRect();
    return clamp((innerHeight-rect.top)/(innerHeight+rect.height));
  };

  const updateHome=()=>{
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    const p=clamp(scrollY/max);
    if(progress)progress.style.width=`${p*100}%`;
    stage?.classList.toggle('phase-two',p>.47);

    if(!reduced){
      if(mainPath){const drawn=.07+clamp(p*1.05)*.93;mainPath.style.strokeDashoffset=pathLen*(1-drawn);}
      if(branchPath){const bp=clamp((p-.27)/.30);branchPath.style.strokeDashoffset=branchLen*(1-bp);}
      if(branchTwo){const bp2=clamp((p-.55)/.30);branchTwo.style.strokeDashoffset=branchTwoLen*(1-bp2);}
      const f=interpolateFrame(p);
      if(camera)camera.style.transform=`translate3d(${f.x}vw,${f.y}vh,0) scale(${f.s}) rotate(${f.r}deg)`;
      nodes.forEach((node,i)=>node.classList.toggle('active',p>=(nodeThresholds[i]??.4)));

      scenes.forEach((scene)=>{
        const local=localProgress(scene);
        const copy=scene.querySelector('.scene-copy');
        const caption=scene.querySelector('.route-caption');
        const centered=local-.5;
        if(copy){
          const dir=copy.classList.contains('scene-right')?-1:copy.classList.contains('scene-center')?0:1;
          const x=(.5-local)*dir*135;
          const y=Math.abs(centered)*28;
          const opacity=clamp(1-Math.abs(centered)*1.25,.12,1);
          copy.style.transform=`translate3d(${x}px,${y}px,0)`;
          copy.style.opacity=opacity;
        }
        if(caption){
          caption.style.transform=`translate3d(${(local-.5)*105}px,${Math.sin(local*Math.PI)*-12}px,0)`;
          caption.style.opacity=clamp(Math.sin(local*Math.PI)*1.5,0,1);
        }
      });

      const switchScene=document.querySelector('.scene-switch');
      if(switchScene){
        const lp=localProgress(switchScene);
        variants.forEach((card,i)=>{
          const dir=i===0?-1:1;
          const x=(.5-lp)*dir*210;
          const rot=(.5-lp)*dir*8;
          card.style.transform=`translate3d(${x}px,${Math.abs(.5-lp)*25}px,0) rotateY(${rot}deg)`;
          card.style.opacity=clamp(Math.sin(lp*Math.PI)*1.35,.08,1);
        });
        rails.forEach((rail,i)=>rail.style.transform=`translateX(${(lp-.5)*(i===0?35:-35)}vw)`);
      }

      const traceScene=document.querySelector('.scene-traces');
      if(traceScene){
        const lp=localProgress(traceScene);
        traces.forEach((pill,i)=>{
          const delay=i*.10;
          const q=clamp((lp-delay)/(.8-delay));
          pill.style.transform=`translate3d(${(1-q)*(i%2===0?-90:90)}px,${(1-q)*22}px,0)`;
          pill.style.opacity=clamp(q*1.4,0,1);
        });
      }
    }
  };

  let ticking=false;
  const onScroll=()=>{if(!ticking){requestAnimationFrame(()=>{updateHome();ticking=false});ticking=true;}};
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',onScroll,{passive:true});
  updateHome();
}

/* ROUTE BUILDER — clear choices + instant summary. */
const routePage=document.querySelector('.v4-route');
if(routePage){
  const country=document.querySelector('#countrySelect');
  const summary=document.querySelector('#routeSummary');
  const primaryTask=document.querySelector('#primaryTask strong');
  const primaryDesc=document.querySelector('#primaryTask em');
  const progressSteps=[...document.querySelectorAll('.builder-progress span')];
  const questionEls=[...document.querySelectorAll('.detailed-questions .route-question')];

  const values={
    country:country?.value || 'Иран',
    entry:'Учебная виза',
    arrival:'2–3 дня назад',
    university:'ВШЭ',
    housing:'Общежитие'
  };

  const renderRoute=()=>{
    if(summary){
      summary.innerHTML=Object.values(values).map(v=>`<span>${v}</span>`).join('');
    }
    const visaFree=values.entry.includes('Без визы');
    const unsure=values.entry.includes('Не уверен');
    if(primaryTask){
      primaryTask.textContent=visaFree?'Проверить миграционный учёт и свою ветку':unsure?'Уточнить основание въезда':'Миграционные документы';
    }
    if(primaryDesc){
      primaryDesc.textContent=visaFree
        ?'Система сначала проверит, какие шаги относятся именно к твоему статусу, включая условные ветки.'
        :unsure
          ?'Сначала нужно определить статус — от него зависит дальнейшая последовательность.'
          :'Проверить, что уже оформлено и что нужно для следующего университетского шага.';
    }
  };

  country?.addEventListener('change',()=>{values.country=country.value;renderRoute();});

  document.querySelectorAll('[data-route-field]').forEach(group=>{
    const field=group.dataset.routeField;
    group.querySelectorAll('.choice').forEach(btn=>btn.addEventListener('click',()=>{
      group.querySelectorAll('.choice').forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');
      values[field]=btn.dataset.value || btn.textContent.trim();
      renderRoute();
    }));
  });

  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const idx=questionEls.indexOf(entry.target);
      questionEls.forEach((q,i)=>q.classList.toggle('active-question',i===idx));
      progressSteps.forEach((s,i)=>s.classList.toggle('done',i<=idx));
    });
  },{threshold:.55,rootMargin:'-15% 0px -35%'});
  questionEls.forEach(q=>observer.observe(q));
  renderRoute();
}

/* Backward-compatible simple choice groups on other pages. */
document.querySelectorAll('.route-options,.choices').forEach(group=>{
  if(group.hasAttribute('data-route-field'))return;
  group.querySelectorAll('.choice').forEach(btn=>btn.addEventListener('click',()=>{
    group.querySelectorAll('.choice').forEach(x=>x.classList.remove('active'));btn.classList.add('active');
  }));
});

/* MAP — every node has an action, reason, place and dependency. */
const mapData={
  arrival:{status:'ГОТОВО',number:'01',title:'Въезд',lead:'Точка старта маршрута.',do:'Зафиксировать дату приезда и перейти к первым обязательным действиям.',why:'От даты приезда начинается временная логика первых дней.',where:'Точка входа в маршрут.',need:'Дата приезда и твой статус.',opens:'Миграционные документы.',example:'У разных студентов маршрут начинает расходиться уже на следующем шаге.',action:'route.html'},
  migration:{status:'СЕЙЧАС',number:'02',title:'Миграционные документы',lead:'Проверь текущий статус и подготовь то, что откроет следующий шаг.',do:'Проверить, какие документы уже переданы и чего не хватает.',why:'Следующий университетский шаг зависит от этого подтверждения.',where:'Визово-миграционное сопровождение / официальный канал вуза.',need:'Документы по твоему статусу.',opens:'Расписку → пропуск.',example:'На этом месте у многих впервые становится видна зависимость между двумя системами.',action:'step.html'},
  amina:{status:'ПО СТАТУСУ',number:'↗',title:'Амина',lead:'Условная ветка: она появляется не у каждого.',do:'Проверить, относится ли этот шаг к твоему статусу и ситуации.',why:'Маршрут отличается для разных категорий иностранных студентов.',where:'Официальная информация по соответствующей процедуре.',need:'Твой статус и условия въезда.',opens:'Свою последовательность учёта.',example:'Визовый и безвизовый маршруты не должны выглядеть одинаково.',action:'route.html'},
  receipt:{status:'СЛЕДУЮЩЕЕ',number:'03',title:'Расписка / подтверждение',lead:'Этот шаг откроется после текущего.',do:'Получить подтверждение того, что нужные документы переданы.',why:'Оно связывает миграционный шаг с университетским доступом.',where:'Соответствующая служба вуза.',need:'Завершённый предыдущий шаг.',opens:'Пропуск в корпус.',example:'Если предыдущий шаг не завершён, этот должен оставаться заблокированным.',action:'step.html'},
  pass:{status:'НА НЕДЕЛЕ',number:'04',title:'Пропуск в корпус',lead:'Университетский шаг, который зависит от документов.',do:'Проверить готовность и получить доступ в корпус.',why:'Без нужного подтверждения этот шаг нельзя считать независимым.',where:'Университет / служба доступа.',need:'Расписка или подтверждение.',opens:'Нормальный доступ к учебной повседневности.',example:'Именно здесь хорошо видно, зачем карте нужны зависимости, а не простой чек-лист.',action:'step.html'},
  sim:{status:'НА НЕДЕЛЕ',number:'05',title:'Связь и сервисы',lead:'Бытовой блок, который идёт параллельно документам.',do:'Подключить нужные повседневные сервисы по мере готовности.',why:'Такие задачи важны, но не должны скрывать обязательные шаги со сроками.',where:'Городские и коммерческие сервисы.',need:'Зависит от конкретного сервиса.',opens:'Более нормальную повседневность.',example:'NEW HERE отделяет срочное от просто полезного.',action:'route.html'},
  card:{status:'ПОЗЖЕ',number:'06',title:'Карта москвича',lead:'Следующий городской блок после более срочных действий.',do:'Перейти к городскому сервису, когда базовые шаги уже понятны.',why:'Маршрут организован по времени: сегодня → на неделе → позже.',where:'Соответствующий городской сервис.',need:'Базовые документы по ситуации.',opens:'Следующий набор городских возможностей.',example:'Эта задача не исчезает — она просто не конкурирует с тем, что нужно сделать сейчас.',action:'route.html'},
  help:{status:'ПОМОЩЬ',number:'?',title:'Нужна помощь',lead:'Сложный случай не должен заканчиваться ещё одной статьёй.',do:'Перейти к живому человеку или официальной точке помощи.',why:'Не все ситуации можно безопасно свести к универсальному сценарию.',where:'International office / поддержка вуза.',need:'Описание проблемы и текущего шага.',opens:'Разбор сложного случая.',example:'Помощь — отдельный выход из маршрута, а не тупик.',action:'route.html'}
};

const inspector=document.querySelector('.map-inspector');
const mapNodes=[...document.querySelectorAll('[data-map-node]')];
if(inspector && mapNodes.length){
  const render=(key)=>{
    const d=mapData[key];if(!d)return;
    mapNodes.forEach(n=>n.classList.toggle('selected',n.dataset.mapNode===key));
    inspector.querySelector('.inspector-status').textContent=d.status;
    inspector.querySelector('.inspector-number').textContent=d.number;
    inspector.querySelector('h2').textContent=d.title;
    const lead=inspector.querySelector('.inspector-lead');if(lead)lead.textContent=d.lead;
    const dds=inspector.querySelectorAll('dd');
    const vals=[d.do,d.why,d.where,d.need,d.opens];
    dds.forEach((dd,i)=>{if(vals[i])dd.textContent=vals[i];});
    const example=inspector.querySelector('.inspector-example span');if(example)example.textContent=d.example;
    const action=inspector.querySelector('.inspector-action');if(action)action.href=d.action;
    inspector.classList.add('open');
  };

  mapNodes.forEach(n=>n.addEventListener('click',()=>render(n.dataset.mapNode)));
  inspector.querySelector('.inspector-close')?.addEventListener('click',()=>inspector.classList.remove('open'));

  document.querySelectorAll('.map-filter').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.map-filter').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    const filter=btn.dataset.filter;
    mapNodes.forEach(n=>n.classList.toggle('filtered-out',filter!=='all' && n.dataset.time!==filter));
  }));

  document.querySelectorAll('[data-example]').forEach(btn=>btn.addEventListener('click',()=>{
    mapNodes.forEach(n=>n.classList.remove('example-highlight'));
    const type=btn.dataset.example;
    const keys=type==='visa'?['arrival','migration','receipt','pass']:['arrival','migration','amina','sim'];
    mapNodes.forEach(n=>n.classList.toggle('example-highlight',keys.includes(n.dataset.mapNode)));
  }));

  render('migration');
}
