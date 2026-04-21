window.CommonUI = (function(){
  const tooltip = document.getElementById('globalTooltip');
  function setLanguage(lang){ localStorage.setItem('tb_lang', lang); document.documentElement.lang = lang; window.dispatchEvent(new Event('tb:langchange')); }
  function moveTooltip(e){ if(!tooltip) return; tooltip.style.left=Math.min(window.innerWidth-tooltip.offsetWidth-12,e.clientX+18)+'px'; tooltip.style.top=Math.min(window.innerHeight-tooltip.offsetHeight-12,e.clientY+18)+'px'; }
  function showTooltip(html,e){ if(!tooltip) return; tooltip.innerHTML=html; tooltip.classList.add('show'); if(e) moveTooltip(e); }
  function hideTooltip(){ if(!tooltip) return; tooltip.classList.remove('show'); }
  function bindHover(selector, renderHtml){ document.querySelectorAll(selector).forEach(el=>{ el.addEventListener('mouseenter', e=>showTooltip(renderHtml(el), e)); el.addEventListener('mousemove', moveTooltip); el.addEventListener('mouseleave', hideTooltip); }); }
  function pageConfig(page){
    const guideTitle = AppUtils.lang()==='es' ? 'Guía' : 'Guide';
    return {
      guide:{title:guideTitle, showSearch:false, showFilters:false},
      items:{title:'Items', showSearch:true, showFilters:true},
      crafts:{title:AppUtils.t('crafts'), showSearch:true, showFilters:false},
      runewords:{title:'Runewords', showSearch:false, showFilters:false},
      pathtrees:{title:'Path Trees', showSearch:false, showFilters:false},
      heroes:{title:'Heroes', showSearch:false, showFilters:false}
    }[page];
  }
  function setupShell(page){
    const cfg=pageConfig(page);
    document.getElementById('pageTitle').textContent=cfg.title;
    const searchWrap = document.getElementById('searchWrap');
    const filtersBtn = document.getElementById('filtersBtn');
    searchWrap.classList.toggle('hidden', !cfg.showSearch);
    filtersBtn.classList.toggle('hidden', !cfg.showFilters);
    document.querySelectorAll('.nav-link').forEach(a=>{
      a.classList.toggle('active', a.dataset.page===page);
      const label=a.querySelector('span:last-child');
      if(label){
        const map={guide:(AppUtils.lang()==='es'?'Guía':AppUtils.lang()==='pt'?'Guia':'Guide'),items:AppUtils.t('items'),runewords:AppUtils.t('runes'),crafts:AppUtils.t('crafts'),pathtrees:AppUtils.t('paths'),heroes:AppUtils.t('heroes')};
        label.textContent=map[a.dataset.page]||label.textContent;
      }
    });
    document.getElementById('langSelect').value=AppUtils.lang();
    const s=document.getElementById('topSearch');
    if(cfg.showSearch){
      s.value = page==='items' ? (AppState.itemSearch || '') : page==='crafts' ? (AppState.craftSearch || '') : '';
      s.placeholder=AppUtils.t('search');
    } else {
      s.value='';
    }
    filtersBtn.textContent = AppState.itemsFiltersOpen ? AppUtils.t('hideFilters') : AppUtils.t('showFilters');
  }
  function setupInteractions(page, onSearch, onToggleFilters){
    document.getElementById('langSelect').onchange=(e)=>setLanguage(e.target.value);
    document.getElementById('topSearch').oninput=(e)=>onSearch && onSearch(e.target.value);
    document.getElementById('filtersBtn').onclick=()=>onToggleFilters && onToggleFilters();
  }
  return { bindHover, setupShell, setupInteractions, hideTooltip };
})();
