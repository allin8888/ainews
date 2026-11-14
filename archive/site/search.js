
(function(){
  var IDX = window.SEARCH_INDEX || [];
  function norm(s){ return (s||'').toLowerCase(); }
  function search(q){
    q = norm(q).split(/\s+/).filter(Boolean);
    if(!q.length) return [];
    return IDX.filter(function(it){
      var hay = norm(it.title + ' ' + (it.tags||[]).join(' ') + ' ' + (it.date||''));
      return q.every(function(t){ return hay.indexOf(t) !== -1; });
    });
  }
  function render(list){
    var box = document.getElementById('search-results');
    if(!box) return;
    if(!list.length){ box.innerHTML = '<p style="color:var(--dim)">无匹配结果</p>'; return; }
    box.innerHTML = list.map(function(it){
      var tags = (it.tags||[]).map(function(t){ return '<span class="tag">#'+t+'</span>'; }).join('');
      return '<div class="entry"><a href="'+it.url+'">'+it.title+'</a>'+tags+
             '<span class="tag" style="color:var(--dim)">'+it.date+'</span></div>';
    }).join('');
  }
  function reco(){
    try { var raw = localStorage.getItem('clicked_tags'); if(!raw) return;
      var tags = JSON.parse(raw); var box = document.getElementById('reco');
      if(!box || !tags.length) return;
      var scored = IDX.map(function(it){
        var overlap = (it.tags||[]).filter(function(t){ return tags.indexOf(t)!==-1; }).length;
        return {it:it, s:overlap};
      }).filter(function(x){ return x.s>0; }).sort(function(a,b){ return b.s-a.s; }).slice(0,5);
      if(!scored.length){ box.style.display='none'; return; }
      box.innerHTML = '<h2>为你推荐</h2>' + scored.map(function(x){
        return '<div class="entry"><a href="'+x.it.url+'">'+x.it.title+'</a></div>';
      }).join('');
      box.style.display='block';
    } catch(e){}
  }
  function record_tag(el){
    try {
      var t = (el.textContent||'').replace(/^#/, '').trim();
      if(!t) return;
      var arr = JSON.parse(localStorage.getItem('clicked_tags')||'[]');
      if(arr.indexOf(t) === -1){ arr.push(t); localStorage.setItem('clicked_tags', JSON.stringify(arr)); }
      reco();
    } catch(e){}
  }
  window.addEventListener('DOMContentLoaded', function(){
    var inp = document.getElementById('site-search');
    if(inp){ inp.addEventListener('input', function(){ render(search(inp.value)); }); }
    // 标签点击 = 个性化信号：记录到 localStorage，驱动「为你推荐」
    document.addEventListener('click', function(ev){
      var el = ev.target && ev.target.closest && ev.target.closest('.tag');
      if(el) record_tag(el);
    });
    reco();
  });
})();
