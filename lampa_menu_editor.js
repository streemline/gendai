/*
Lampa Menu Editor plugin (single-file JS)
Features:
 - Scan the app side menu
 - Disable/enable existing menu items (hide/show)
 - Edit existing items (label, href, icon text)
 - Add new menu items
 - Reorder items (up/down)
 - Persist config to localStorage (fallback) / try to use Lampa storage if available

Install: place this JS on a web server and in Lampa go to Settings → Plugins → Add plugin → enter the raw URL to this file, then restart the app.

Notes: Lampa has different DOM structures across versions; this plugin tries several common selectors. If your Lampa uses a custom HTML structure, you may need to tweak the "MENU_SELECTORS" array.
*/

(function(){
    'use strict';

    const PLUGIN_KEY = 'lampa_menu_editor_v1';
    const MENU_SELECTORS = [
        '.left .menu', // common
        '.left_menu',
        '.menu-list',
        '.sidebar',
        '#menu',
        '.main-menu',
        '.menu'
    ];

    // Utility: safe storage (try Lampa storage, else localStorage)
    const Storage = {
        get(key){
            try{
                if(window.Lampa && window.Lampa.Storage && typeof window.Lampa.Storage.get === 'function'){
                    return window.Lampa.Storage.get(key);
                }
            }catch(e){}
            try{ return JSON.parse(localStorage.getItem(key)); }catch(e){return null}
        },
        set(key, value){
            try{
                if(window.Lampa && window.Lampa.Storage && typeof window.Lampa.Storage.set === 'function'){
                    return window.Lampa.Storage.set(key, value);
                }
            }catch(e){}
            try{ localStorage.setItem(key, JSON.stringify(value)); return true;}catch(e){return false}
        },
        remove(key){
            try{ if(window.Lampa && window.Lampa.Storage && typeof window.Lampa.Storage.remove === 'function'){ return window.Lampa.Storage.remove(key);} }catch(e){}
            try{ localStorage.removeItem(key); return true;}catch(e){return false}
        }
    };

    // Find side menu container
    function findMenuContainer(){
        for(const s of MENU_SELECTORS){
            const el = document.querySelector(s);
            if(el) return el;
        }
        // fallback: find nav with many links
        const navs = Array.from(document.querySelectorAll('nav,aside,div'));
        for(const n of navs){
            const links = n.querySelectorAll('a');
            if(links.length >= 3 && n.offsetHeight > 20) return n;
        }
        return null;
    }

    // Read menu items from DOM into our format
    function readMenuItems(menuRoot){
        const anchors = Array.from(menuRoot.querySelectorAll('a'));
        const items = anchors.map((a, idx)=>{
            const id = a.getAttribute('data-menu-id') || a.id || ('lme-'+idx+'-'+(a.textContent||'').trim().slice(0,8).replace(/\s+/g,'_'));
            const label = (a.textContent||'').trim();
            const href = a.getAttribute('href') || a.getAttribute('data-href') || '';
            const icon = (a.querySelector('i,svg') ? 'icon' : '');
            return {id, label, href, icon, dom: a};
        });
        return items;
    }

    // Apply saved config to DOM: hide disabled, reorder, edit labels/links, add new
    function applyConfig(menuRoot, config){
        if(!menuRoot) return;
        // hide or show existing items
        const anchors = Array.from(menuRoot.querySelectorAll('a'));
        anchors.forEach(a => a.style.transition = 'opacity .2s ease');

        // Map anchors by id heuristically (label+href) if no explicit id
        const mapAnchors = {};
        anchors.forEach(a => {
            const key = (a.getAttribute('data-menu-id')||a.id|| (a.textContent||'').trim()+ '|' + (a.getAttribute('href')||''));
            mapAnchors[key] = a;
        });

        // First hide elements marked disabled
        if(Array.isArray(config.items)){
            config.items.forEach(item => {
                if(item._type === 'existing'){
                    // try to find anchor
                    const keys = [item.id, item.id.replace(/^lme-\d+-/, '')];
                    let el = null;
                    // Try data-menu-id match
                    el = menuRoot.querySelector('[data-menu-id="'+item.id+'"]') || menuRoot.querySelector('#'+item.id);
                    if(!el){
                        // fallback by label+href
                        el = anchors.find(a => ((a.textContent||'').trim() === item.label && (a.getAttribute('href')||'') === (item.href||'')));
                    }
                    if(el){
                        el.style.display = item.disabled ? 'none' : '';
                        if(item.edited_label) el.textContent = item.edited_label;
                        if(item.edited_href) el.setAttribute('href', item.edited_href);
                    }
                }
            });
        }

        // Reorder and add new items at the end if needed
        if(Array.isArray(config.order) && config.order.length){
            // Build new order by moving existing anchors to new fragment
            const frag = document.createDocumentFragment();
            config.order.forEach(key => {
                // find by id or by label
                let el = menuRoot.querySelector('[data-menu-id="'+key+'"]') || menuRoot.querySelector('#'+key);
                if(!el){
                    el = anchors.find(a => ((a.getAttribute('href')||'')===key || (a.textContent||'').trim() === key));
                }
                if(el) frag.appendChild(el);
                else{
                    // maybe it's a custom item stored in config.custom
                    const custom = (config.custom||[]).find(c => c.id === key);
                    if(custom){
                        const a = buildAnchorForCustom(custom);
                        frag.appendChild(a);
                    }
                }
            });
            // Append remaining anchors not present in order
            anchors.forEach(a => {
                if(!frag.contains(a)) frag.appendChild(a);
            });
            // Attach frag
            menuRoot.innerHTML = '';
            menuRoot.appendChild(frag);
        } else {
            // ensure custom items exist
            if(Array.isArray(config.custom)){
                config.custom.forEach(c => {
                    if(!menuRoot.querySelector('[data-menu-id="'+c.id+'"]')){
                        menuRoot.appendChild(buildAnchorForCustom(c));
                    }
                });
            }
        }

    }

    function buildAnchorForCustom(custom){
        const a = document.createElement('a');
        a.setAttribute('href', custom.href || '#');
        a.textContent = custom.label || 'New item';
        a.setAttribute('data-menu-id', custom.id);
        a.className = custom.class || '';
        if(custom.iconHTML){
            const span = document.createElement('span');
            span.innerHTML = custom.iconHTML;
            a.prepend(span);
        }
        return a;
    }

    // UI: create modal editor
    function createEditorUI(menuRoot){
        // Avoid duplicate
        if(document.getElementById('lme-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'lme-modal';
        modal.innerHTML = `
            <style>
            #lme-modal{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:99999;background:#0b0b0b;border:2px solid #333;color:#ddd;padding:14px;width:720px;max-width:95vw;max-height:85vh;overflow:auto;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,.7)}
            #lme-modal h3{margin:0 0 8px 0;font-size:18px}
            #lme-close{position:absolute;right:8px;top:6px;cursor:pointer}
            #lme-list{margin-top:10px}
            .lme-row{display:flex;align-items:center;gap:8px;padding:6px;border-bottom:1px solid rgba(255,255,255,0.03)}
            .lme-row input[type=text]{flex:1;padding:6px;background:#111;border:1px solid #222;color:#ddd}
            .lme-row .lme-actions{display:flex;gap:6px}
            .lme-add{display:flex;gap:6px;margin-top:10px}
            .lme-footer{display:flex;gap:10px;justify-content:flex-end;margin-top:12px}
            .lme-btn{padding:6px 10px;background:#151515;border:1px solid #222;color:#ddd;cursor:pointer}
            .lme-btn.primary{background:#1866d1}
            </style>
            <div id="lme-close">✕</div>
            <h3>Menu Editor — Lampa</h3>
            <div id="lme-note">Оновлення меню буде застосовано відразу та збережено локально.</div>
            <div id="lme-list"></div>
            <div class="lme-add">
                <input id="lme-new-label" placeholder="Label" type="text">
                <input id="lme-new-href" placeholder="Href (e.g. #/catalog)" type="text">
                <button id="lme-add-btn" class="lme-btn">Add</button>
            </div>
            <div class="lme-footer">
                <button id="lme-reset" class="lme-btn">Reset</button>
                <button id="lme-save" class="lme-btn primary">Save & Apply</button>
            </div>
        `;

        document.body.appendChild(modal);

        const close = modal.querySelector('#lme-close');
        close.addEventListener('click', ()=> modal.remove());

        const listEl = modal.querySelector('#lme-list');

        // Load data
        const data = Storage.get(PLUGIN_KEY) || {items:[], custom:[], order:[]};

        // Build rows for current DOM anchors
        const anchors = Array.from(menuRoot.querySelectorAll('a'));

        // If stored items missing, initialize from DOM
        if(!data.items || data.items.length === 0){
            data.items = anchors.map((a, idx)=>{
                const id = a.getAttribute('data-menu-id') || a.id || ('lme-'+idx+'-'+(a.textContent||'').trim().slice(0,8).replace(/\s+/g,'_'));
                if(!a.getAttribute('data-menu-id')) a.setAttribute('data-menu-id', id);
                return {id, label:(a.textContent||'').trim(), href:(a.getAttribute('href')||''), disabled:false, _type:'existing'};
            });
            data.order = data.items.map(i=>i.id);
        }

        // Render list
        function render(){
            listEl.innerHTML = '';
            data.items.forEach((it, idx)=>{
                const row = document.createElement('div');
                row.className = 'lme-row';
                row.innerHTML = `
                    <input type="checkbox" data-id="${it.id}" ${it.disabled ? 'checked' : ''} title="Приховати"> 
                    <input type="text" data-id-label="${it.id}" value="${escapeHtml(it.edited_label||it.label)}">
                    <input type="text" data-id-href="${it.id}" value="${escapeHtml(it.edited_href||it.href)}" style="width:220px">
                    <div class="lme-actions">
                        <button class="lme-btn" data-up="${it.id}">▲</button>
                        <button class="lme-btn" data-down="${it.id}">▼</button>
                        <button class="lme-btn" data-remove="${it.id}">Remove</button>
                    </div>
                `;
                listEl.appendChild(row);
            });
            // custom items
            (data.custom||[]).forEach(c => {
                const row = document.createElement('div');
                row.className = 'lme-row';
                row.innerHTML = `
                    <span style="width:20px"></span>
                    <input type="text" data-id-label="${c.id}" value="${escapeHtml(c.label)}">
                    <input type="text" data-id-href="${c.id}" value="${escapeHtml(c.href)}" style="width:220px">
                    <div class="lme-actions">
                        <button class="lme-btn" data-up="${c.id}">▲</button>
                        <button class="lme-btn" data-down="${c.id}">▼</button>
                        <button class="lme-btn" data-remove="${c.id}">Remove</button>
                    </div>
                `;
                listEl.appendChild(row);
            });

            // attach handlers
            listEl.querySelectorAll('input[type=checkbox]').forEach(cb => cb.addEventListener('change', e=>{
                const id = e.target.getAttribute('data-id');
                const it = data.items.find(x=>x.id===id);
                if(it){ it.disabled = e.target.checked; }
            }));
            listEl.querySelectorAll('[data-id-label]').forEach(inp => inp.addEventListener('input', e=>{
                const id = e.target.getAttribute('data-id-label');
                const it = data.items.find(x=>x.id===id) || (data.custom||[]).find(x=>x.id===id);
                if(it) it.edited_label = e.target.value;
            }));
            listEl.querySelectorAll('[data-id-href]').forEach(inp => inp.addEventListener('input', e=>{
                const id = e.target.getAttribute('data-id-href');
                const it = data.items.find(x=>x.id===id) || (data.custom||[]).find(x=>x.id===id);
                if(it) it.edited_href = e.target.value;
            }));
            listEl.querySelectorAll('[data-up]').forEach(btn => btn.addEventListener('click', e=>{
                const id = e.target.getAttribute('data-up'); moveUp(data, id); render();
            }));
            listEl.querySelectorAll('[data-down]').forEach(btn => btn.addEventListener('click', e=>{
                const id = e.target.getAttribute('data-down'); moveDown(data, id); render();
            }));
            listEl.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', e=>{
                const id = e.target.getAttribute('data-remove'); removeItem(data, id); render();
            }));
        }

        function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

        function moveUp(data, id){
            const idx = data.order.indexOf(id);
            if(idx > 0){ [data.order[idx-1], data.order[idx]] = [data.order[idx], data.order[idx-1]]; }
            else{
                // maybe custom: move in arrays
                const i = (data.custom||[]).findIndex(x=>x.id===id);
                if(i>0) (data.custom||[]).splice(i-1,0,(data.custom||[]).splice(i,1)[0]);
            }
        }
        function moveDown(data, id){
            const idx = data.order.indexOf(id);
            if(idx >=0 && idx < data.order.length-1) { [data.order[idx+1], data.order[idx]] = [data.order[idx], data.order[idx+1]]; }
            else{
                const i = (data.custom||[]).findIndex(x=>x.id===id);
                if(i>=0 && i < (data.custom||[]).length-1) (data.custom||[]).splice(i+1,0,(data.custom||[]).splice(i,1)[0]);
            }
        }

        function removeItem(data, id){
            // remove from items or custom and from order
            data.items = (data.items||[]).filter(x=>x.id!==id);
            data.custom = (data.custom||[]).filter(x=>x.id!==id);
            data.order = (data.order||[]).filter(x=>x!==id);
        }

        render();

        // Add new custom
        modal.querySelector('#lme-add-btn').addEventListener('click', ()=>{
            const label = modal.querySelector('#lme-new-label').value.trim();
            const href = modal.querySelector('#lme-new-href').value.trim() || '#';
            if(!label) return alert('Label required');
            const id = 'custom-'+Date.now();
            data.custom = data.custom || [];
            data.custom.push({id, label, href});
            data.order = data.order || [];
            data.order.push(id);
            modal.querySelector('#lme-new-label').value = '';
            modal.querySelector('#lme-new-href').value = '';
            render();
        });

        modal.querySelector('#lme-reset').addEventListener('click', ()=>{
            if(!confirm('Скинути всі зміни меню?')) return;
            Storage.remove(PLUGIN_KEY);
            window.location.reload();
        });

        modal.querySelector('#lme-save').addEventListener('click', ()=>{
            // update items from inputs
            // build order from visual order: data.items + data.custom, preserve sequence in DOM
            const newOrder = [];
            const rows = Array.from(listEl.querySelectorAll('.lme-row'));
            rows.forEach(r =>{
                const labelInp = r.querySelector('[data-id-label]');
                const id = labelInp ? labelInp.getAttribute('data-id-label') : null;
                if(id) newOrder.push(id);
            });
            data.order = newOrder.length ? newOrder : data.order;

            Storage.set(PLUGIN_KEY, data);
            applyConfig(menuRoot, data);
            alert('Збережено. Зміни застосовано.');
        });

        return modal;
    }

    // Add floating editor button
    function addFloatingButton(menuRoot){
        if(document.getElementById('lme-open-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'lme-open-btn';
        btn.textContent = 'Menu Editor';
        btn.style.position = 'fixed';
        btn.style.right = '14px';
        btn.style.bottom = '14px';
        btn.style.zIndex = 99998;
        btn.style.padding = '10px 12px';
        btn.style.borderRadius = '8px';
        btn.style.border = '1px solid rgba(0,0,0,.3)';
        btn.style.background = '#1b1b1b';
        btn.style.color = '#fff';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 6px 20px rgba(0,0,0,.5)';
        btn.addEventListener('click', ()=> createEditorUI(menuRoot));
        document.body.appendChild(btn);
    }

    // Main init
    function init(){
        const menuRoot = findMenuContainer();
        if(!menuRoot){
            console.warn('Lampa Menu Editor: не знайдено контейнер меню. Спробуйте оновити селектори у плагіні.');
            // still create floating button which will show warning
            addFloatingButton({querySelector:()=>null});
            return;
        }

        // Ensure anchors have data-menu-id
        const anchors = Array.from(menuRoot.querySelectorAll('a'));
        anchors.forEach((a, idx)=>{
            if(!a.getAttribute('data-menu-id')){
                const id = 'lme-'+idx+'-'+(a.textContent||'').trim().slice(0,8).replace(/\s+/g,'_');
                a.setAttribute('data-menu-id', id);
            }
        });

        // load config and apply
        const cfg = Storage.get(PLUGIN_KEY);
        if(cfg) applyConfig(menuRoot, cfg);

        // UI button
        addFloatingButton(menuRoot);

        // auto-apply on DOM changes (e.g., SPA navigations)
        try{
            const obs = new MutationObserver(()=>{
                const cfg2 = Storage.get(PLUGIN_KEY);
                if(cfg2) applyConfig(menuRoot, cfg2);
            });
            obs.observe(menuRoot, {childList:true, subtree:true});
        }catch(e){/* ignore */}
    }

    // small helpers
    function ensure(){
        // Wait for DOM ready or Lampa root
        if(document.readyState === 'complete' || document.readyState === 'interactive') return init();
        document.addEventListener('DOMContentLoaded', init);
        setTimeout(init, 1500); // try again after load
    }

    ensure();

})();
