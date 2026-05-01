/* ======================================================
   HELPERS
====================================================== */
function recipes() {
  return Object.assign({ restes: REST_RECIPE }, BASE_RECIPES, S.customRecipes || {});
}

function ingredients() {
  return Object.assign({}, BASE_INGREDIENTS, S.customIngredients || {});
}

function mealId(meal) {
  return typeof meal === 'string' ? meal : meal.id;
}

function mealPortions(meal) {
  return typeof meal === 'object' && meal.portions ? Number(meal.portions) : S.portions;
}

function fmtNum(n) {
  return Number(n).toString().replace('.', ',');
}

function h(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[c]));
}

function mealLabel(meal) {
  const id = mealId(meal);
  const r = recipes()[id];
  const portions = mealPortions(meal);
  const suffix = portions !== S.portions ? ` (${fmtNum(portions)} p.)` : '';
  return `${h(r?.name || id)}${suffix}`;
}

function mealExcludes(meal) {
  return typeof meal === 'object' && Array.isArray(meal.exclude) ? meal.exclude : [];
}

function itemKey(item) {
  const base = ingredientForItem(item);
  return base ? base.id : ingredientId(item.n);
}

function mealHasExcludes(meal) {
  return mealExcludes(meal).length > 0;
}

function dayExtras(day) {
  if (!Array.isArray(day.extras)) day.extras = [];
  return day.extras;
}

function fmtQty(q, u) {
  const r = Math.round(q * 10) / 10;
  if (u === 'g' && r >= 1000) return `${(r / 1000).toFixed(1).replace('.', ',')} kg`;
  if (u === 'g') return `${Math.round(r)} g`;
  if (u === 'ml' && r >= 1000) return `${(r / 1000).toFixed(1).replace('.', ',')} L`;
  if (u === 'ml') return `${Math.round(r)} ml`;
  if (['piece', 'pieces', 'tranches'].includes(u)) return `x${Math.ceil(r)}`;
  if (['cs', 'cc', 'cube'].includes(u)) return `${Math.ceil(r)} ${u}`;
  return `${r} ${u}`;
}

function fmtPrice(n) {
  const value = Math.round((Number(n) || 0) * 100) / 100;
  return value.toFixed(2).replace('.', ',');
}

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'recette';
}

function ingredientId(name) {
  return slugify(name);
}

function ingredientForItem(item) {
  if (item.ref && ingredients()[item.ref]) return ingredients()[item.ref];
  return ingredients()[ingredientId(item.n)];
}

function sameUnit(a, b) {
  if (a === b) return true;
  return ['piece', 'pieces'].includes(a) && ['piece', 'pieces'].includes(b);
}

function ingredientCost(item) {
  const base = ingredientForItem(item);
  if (!base) return Number(item.p) || 0;
  if (sameUnit(item.u, base.u)) {
    if (base.u === 'g' || base.u === 'ml') return (Number(item.q) || 0) / 1000 * (Number(base.price) || 0);
    return (Number(item.q) || 0) * (Number(base.price) || 0);
  }
  return Number(item.p) || 0;
}

/* ======================================================
   STORAGE / EXPORT
====================================================== */
function load() {
  try {
    const raw = localStorage.getItem('repas-famille-v2');
    if (raw) S = Object.assign(S, JSON.parse(raw));
    S.customRecipes = S.customRecipes || {};
    S.customIngredients = S.customIngredients || {};
    S.checks = S.checks || {};
    S.plans = S.plans || clone(WEEKS_DEFAULT);
  } catch(e) {}
}

function save() {
  try {
    localStorage.setItem('repas-famille-v2', JSON.stringify(S));
  } catch(e) {}
}

function exportData() {
  const payload = {
    app: 'repas-famille',
    version: 1,
    exportedAt: new Date().toISOString(),
    state: S,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `repas-famille-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files && event.target.files[0];
  event.target.value = '';
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const nextState = data.state || data;
      if (!nextState || !nextState.plans) {
        alert('Fichier de sauvegarde invalide.');
        return;
      }
      if (!confirm('Importer cette sauvegarde ? Les donnees locales seront remplacees.')) return;

      S = Object.assign({
        page: 'courses',
        week: 'A',
        portions: 2.25,
        plans: clone(WEEKS_DEFAULT),
        checks: {},
        customRecipes: {},
        customIngredients: {},
      }, nextState);
      save();
      navigate(S.page || 'courses');
      alert('Sauvegarde importee.');
    } catch(e) {
      alert('Impossible de lire ce fichier de sauvegarde.');
    }
  };
  reader.readAsText(file);
}

/* ======================================================
   NAVIGATION / RENDER
====================================================== */
function navigate(page) {
  S.page = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.getElementById(`nav-${page}`).classList.add('active');
  render(page);
  save();
}

function render(p) {
  if (p === 'home') renderHome();
  if (p === 'planning') renderPlanning();
  if (p === 'courses') renderCourses();
  if (p === 'recettes') renderRecettes();
}

function renderWS(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = ['A', 'B', 'C', 'D'].map(w =>
    `<button class="week-btn${S.week === w ? ' active' : ''}" onclick="selectWeek('${w}')">${w}<small>Sem. ${w}</small></button>`
  ).join('');
}

function selectWeek(w) {
  S.week = w;
  save();
  render(S.page);
}

function resetDefaultPlans() {
  if (!confirm('Recharger les semaines par defaut ? Le planning actuel, les extras et les exclusions de stock seront remplaces.')) return;
  S.plans = clone(WEEKS_DEFAULT);
  S.checks = {};
  save();
  render(S.page);
  alert('Semaines par defaut rechargees.');
}

function renderHome() {
  renderWS('ws-home');
  const plan = S.plans[S.week];
  document.getElementById('home-summary').innerHTML = `
    <div class="card">
      <div class="card-title">${h(plan.label)} - Apercu des repas</div>
      ${plan.days.map(d => `
        <div class="day-row${dayExtras(d).length ? ' has-extra' : ''}">
          <div class="day-lbl">${h(d.name.slice(0, 3))}</div>
          <div>
            <div class="slot-lbl">Midi</div>
            <span class="meal-link" onclick="openRecipe('${h(mealId(d.midi))}', ${mealPortions(d.midi)})">${mealLabel(d.midi)}</span>
          </div>
          <div>
            <div class="slot-lbl">Soir</div>
            <span class="meal-link" onclick="openRecipe('${h(mealId(d.soir))}', ${mealPortions(d.soir)})">${mealLabel(d.soir)}</span>
          </div>
          ${dayExtras(d).length ? `
            <div class="extra-summary">
              <div class="slot-lbl">Extras</div>
              ${dayExtras(d).map(extra => `<span class="meal-link" onclick="openRecipe('${h(mealId(extra))}', ${mealPortions(extra)})">${mealLabel(extra)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>`;
}

function renderPlanning() {
  document.getElementById('plan-subtitle').textContent = WEEKS_DEFAULT[S.week].label;
  document.getElementById('ptn-display').textContent = fmtNum(S.portions);
  renderWS('ws-plan');
  renderTable();
}

function renderTable() {
  const plan = S.plans[S.week];
  document.getElementById('plan-table').innerHTML = `
    <thead><tr><th style="width:46px">Jour</th><th>Midi</th><th>Soir</th><th>Extras</th></tr></thead>
    <tbody>${plan.days.map((d, i) => `
      <tr>
        <td class="day-col">${h(d.name.slice(0, 3))}</td>
        <td><div class="meal-cell">
          <span class="meal-nm" onclick="openRecipe('${h(mealId(d.midi))}', ${mealPortions(d.midi)})">${mealLabel(d.midi)}</span>
          <button class="edit-btn stock-btn${mealHasExcludes(d.midi) ? ' has-exclude' : ''}" onclick="openExclude(${i}, 'midi')" title="Stock">stock</button>
          <button class="edit-btn" onclick="openEdit(${i}, 'midi')" title="Modifier">...</button>
        </div></td>
        <td><div class="meal-cell">
          <span class="meal-nm" onclick="openRecipe('${h(mealId(d.soir))}', ${mealPortions(d.soir)})">${mealLabel(d.soir)}</span>
          <button class="edit-btn stock-btn${mealHasExcludes(d.soir) ? ' has-exclude' : ''}" onclick="openExclude(${i}, 'soir')" title="Stock">stock</button>
          <button class="edit-btn" onclick="openEdit(${i}, 'soir')" title="Modifier">...</button>
        </div></td>
        <td>
          <div class="extra-list">
            ${dayExtras(d).map((extra, extraIdx) => `
              <div class="meal-cell extra-meal">
                <span class="meal-nm" onclick="openRecipe('${h(mealId(extra))}', ${mealPortions(extra)})">${mealLabel(extra)}</span>
                <button class="edit-btn stock-btn${mealHasExcludes(extra) ? ' has-exclude' : ''}" onclick="openExclude(${i}, 'extra', ${extraIdx})" title="Stock">stock</button>
                <button class="edit-btn" onclick="removeExtra(${i}, ${extraIdx})" title="Supprimer">x</button>
              </div>
            `).join('')}
            <button class="btn btn-outline add-extra-btn" onclick="openEdit(${i}, 'extra')">+ plat</button>
          </div>
        </td>
      </tr>`).join('')}
    </tbody>`;
}

function changePtn(delta) {
  S.portions = Math.max(0.5, Math.round((S.portions + delta) * 4) / 4);
  document.getElementById('ptn-display').textContent = fmtNum(S.portions);
  save();
}

function openEdit(dayIdx, slot) {
  editCtx = { dayIdx, slot };
  const d = S.plans[S.week].days[dayIdx];
  const label = slot === 'midi' ? 'Midi' : slot === 'soir' ? 'Soir' : 'Extra';
  document.getElementById('edit-title').textContent = `${d.name} - ${label}`;
  document.getElementById('edit-portions').value = slot === 'extra' ? S.portions : mealPortions(d[slot]);
  document.getElementById('picker-grid').innerHTML = Object.values(recipes()).map(r =>
    `<button class="pick-btn" onclick="pickMeal('${h(r.id)}')">${h(r.name)}</button>`
  ).join('');
  document.getElementById('edit-overlay').classList.add('open');
}

function closeEdit() {
  document.getElementById('edit-overlay').classList.remove('open');
}

function pickMeal(id) {
  const portions = Math.max(0.5, Number(document.getElementById('edit-portions').value) || S.portions);
  const day = S.plans[S.week].days[editCtx.dayIdx];
  if (editCtx.slot === 'extra') dayExtras(day).push({ id, portions });
  else day[editCtx.slot] = { id, portions };
  save();
  closeEdit();
  renderTable();
}

function removeExtra(dayIdx, extraIdx) {
  const day = S.plans[S.week].days[dayIdx];
  dayExtras(day).splice(extraIdx, 1);
  save();
  renderTable();
}

let excludeCtx = {};

function mealRef(dayIdx, slot, extraIdx = null) {
  const day = S.plans[S.week].days[dayIdx];
  if (slot === 'extra') return dayExtras(day)[extraIdx];
  return day[slot];
}

function setMealRef(dayIdx, slot, meal, extraIdx = null) {
  const day = S.plans[S.week].days[dayIdx];
  if (slot === 'extra') dayExtras(day)[extraIdx] = meal;
  else day[slot] = meal;
}

function editableMeal(meal) {
  if (typeof meal === 'object') {
    meal.exclude = meal.exclude || [];
    return meal;
  }
  return { id: meal, portions: S.portions, exclude: [] };
}

function openExclude(dayIdx, slot, extraIdx = null) {
  excludeCtx = { dayIdx, slot, extraIdx };
  const meal = editableMeal(mealRef(dayIdx, slot, extraIdx));
  setMealRef(dayIdx, slot, meal, extraIdx);
  const r = recipes()[mealId(meal)];
  if (!r) return;

  document.getElementById('exclude-title').textContent = `Stock - ${r.name}`;
  document.getElementById('exclude-list').innerHTML = r.ing.map(item => {
    const key = itemKey(item);
    const checked = meal.exclude.includes(key);
    return `<label class="exclude-item">
      <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleMealExclude('${h(key)}', this.checked)">
      <span>${h(item.n)}</span>
      <span class="shop-qty">${h(fmtQty(item.q * (mealPortions(meal) / r.base), item.u))}</span>
    </label>`;
  }).join('');
  document.getElementById('exclude-overlay').classList.add('open');
}

function toggleMealExclude(key, checked) {
  const meal = editableMeal(mealRef(excludeCtx.dayIdx, excludeCtx.slot, excludeCtx.extraIdx));
  meal.exclude = meal.exclude.filter(k => k !== key);
  if (checked) meal.exclude.push(key);
  setMealRef(excludeCtx.dayIdx, excludeCtx.slot, meal, excludeCtx.extraIdx);
  save();
  renderTable();
}

function closeExclude() {
  document.getElementById('exclude-overlay').classList.remove('open');
}

/* ======================================================
   COURSES
====================================================== */
function buildShopList() {
  const agg = {};
  function addMeal(meal) {
    const r = recipes()[mealId(meal)];
    if (!r || !r.ing.length) return;
    const scale = mealPortions(meal) / r.base;
    const excludes = mealExcludes(meal);
    r.ing.forEach(item => {
      if (excludes.includes(itemKey(item))) return;
      const base = ingredientForItem(item);
      const name = base ? base.name : item.n;
      const unit = item.u || (base ? base.u : 'piece');
      const cat = base ? base.c : item.c;
      const key = `${name}|${unit}`;
      if (!agg[key]) agg[key] = { n: name, q: 0, u: unit, c: cat, p: 0 };
      agg[key].q += item.q * scale;
      agg[key].p += ingredientCost(item) * scale;
    });
  }

  S.plans[S.week].days.forEach(d => {
    ['midi', 'soir'].forEach(slot => {
      addMeal(d[slot]);
    });
    dayExtras(d).forEach(addMeal);
  });
  const byCat = {};
  Object.values(agg).forEach(item => {
    const c = item.c || 'autres';
    if (!byCat[c]) byCat[c] = [];
    byCat[c].push(item);
  });
  const total = Object.values(agg).reduce((sum, item) => sum + item.p, 0);
  return { byCat, total };
}

function renderCourses() {
  document.getElementById('courses-subtitle').textContent = `${WEEKS_DEFAULT[S.week].label} - portions selon planning`;
  renderWS('ws-courses');
  const { byCat, total } = buildShopList();
  document.getElementById('budget-wrap').innerHTML = `
    <div class="budget-card">
      <h3>Budget estime</h3>
      <div class="budget-amount">~${Math.round(total)} EUR</div>
      <div class="budget-sub">Selon le planning et les portions de chaque repas</div>
    </div>`;
  const sl = document.getElementById('shop-list');
  sl.innerHTML = '';
  CAT_ORDER.forEach(cat => {
    const items = byCat[cat];
    if (!items || !items.length) return;
    const ci = CATS[cat] || CATS.autres;
    const sorted = [...items].sort((a, b) => a.n.localeCompare(b.n, 'fr'));
    const sec = document.createElement('div');
    sec.innerHTML = `<div class="cat-title">${h(ci.label)}</div>
      <div class="card" style="padding:6px 12px">
        ${sorted.map(item => {
          const id = `${cat}|${item.n}`;
          const safeId = id.replace(/'/g, "\\'");
          const checked = S.checks[id] || false;
          return `<div class="shop-item${checked ? ' checked' : ''}" onclick="toggleChk('${safeId}')">
            <input type="checkbox"${checked ? ' checked' : ''} onclick="event.stopPropagation();toggleChk('${safeId}')">
            <span class="shop-nm">${h(item.n)}</span>
            <span class="shop-side">
              <span class="shop-qty">${h(fmtQty(item.q, item.u))}</span>
              <span class="shop-price">~${fmtPrice(item.p)} EUR</span>
            </span>
          </div>`;
        }).join('')}
      </div>`;
    sl.appendChild(sec);
  });
}

function toggleChk(id) {
  S.checks[id] = !S.checks[id];
  save();
  renderCourses();
}

function resetChecks() {
  S.checks = {};
  save();
  renderCourses();
}

/* ======================================================
   RECETTES
====================================================== */
let recipeEditId = null;
let ingredientEditId = null;
let recipesPanel = 'list';

function renderRecettes() {
  renderIngredientTools();
  showRecipePanel(recipesPanel || 'list');
  renderRecipeFilterOptions();
  const filtered = filteredRecipes();
  document.getElementById('recipes-grid').innerHTML = filtered.map(r => `
    <div class="recipe-card">
      <div class="rc-name">${h(r.name)}</div>
      <div class="rc-meta">${r.prep + r.cook} min</div>
      <div class="rc-tags">
        ${r.tags.slice(0, 2).map(t => `<span class="tag tag-g">${h(t)}</span>`).join('')}
        ${r.allergens.length ? `<span class="tag tag-o">${h(r.allergens[0])}</span>` : '<span class="tag tag-g">sans lait</span>'}
      </div>
      <div class="actions-bar" style="margin:10px 0 0">
        <button class="btn btn-outline" onclick="openRecipe('${h(r.id)}')">Voir</button>
        <button class="btn btn-outline" onclick="editRecipe('${h(r.id)}')">Modifier</button>
        ${S.customRecipes[r.id] ? `<button class="btn btn-outline" onclick="deleteCustomRecipe('${h(r.id)}')">Supprimer</button>` : ''}
      </div>
    </div>`).join('');
}

function renderRecipeFilterOptions() {
  const select = document.getElementById('recipe-filter-ingredient');
  const current = select.value;
  const used = new Map();
  Object.values(recipes()).forEach(r => {
    r.ing.forEach(item => {
      const key = itemKey(item);
      const base = ingredients()[key];
      used.set(key, base ? base.name : item.n);
    });
  });
  const options = [...used.entries()].sort((a, b) => a[1].localeCompare(b[1], 'fr'));
  select.innerHTML = '<option value="">Tous les ingredients</option>' +
    options.map(([id, name]) => `<option value="${h(id)}">${h(name)}</option>`).join('');
  select.value = options.some(([id]) => id === current) ? current : '';
}

function filteredRecipes() {
  const text = document.getElementById('recipe-filter-text').value.trim().toLowerCase();
  const selected = document.getElementById('recipe-filter-ingredient').value;
  return Object.values(recipes()).filter(r => {
    if (r.id === 'restes') return false;
    if (!text && !selected) return true;
    return r.ing.some(item => {
      const key = itemKey(item);
      const base = ingredients()[key];
      const name = (base ? base.name : item.n).toLowerCase();
      return (selected && key === selected) || (text && name.includes(text));
    });
  });
}

function clearRecipeFilters() {
  document.getElementById('recipe-filter-text').value = '';
  document.getElementById('recipe-filter-ingredient').value = '';
  renderRecettes();
}

function showRecipePanel(panel) {
  recipesPanel = panel;
  document.getElementById('panel-recipes-list').style.display = panel === 'list' ? 'block' : 'none';
  document.getElementById('panel-recipe-form').classList.toggle('active', panel === 'recipe');
  document.getElementById('panel-ingredients').classList.toggle('active', panel === 'ingredients');
  document.querySelectorAll('.subtab-btn').forEach(btn => btn.classList.remove('active'));
  const activeId = panel === 'list' ? 'tab-recipes-list' : panel === 'recipe' ? 'tab-recipe-form' : 'tab-ingredients';
  document.getElementById(activeId).classList.add('active');
  if (panel === 'recipe' && !recipeEditId) resetRecipeForm(false);
}

function renderIngredientTools() {
  const list = Object.values(ingredients()).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  document.getElementById('ingredient-names').innerHTML = list
    .map(i => `<option value="${h(i.name)}"></option>`)
    .join('');
  document.getElementById('recipe-ingredient-pick').innerHTML = list
    .map(i => `<option value="${h(i.id)}">${h(i.name)}</option>`)
    .join('');
  document.getElementById('ingredient-list').innerHTML = `
    <div class="cat-title">Ingredients en base</div>
    <div style="padding:6px 0">
      ${list.map(i => `
        <div class="shop-item">
          <span class="shop-nm">${h(i.name)} <span class="rc-meta">${h(CATS[i.c]?.label || i.c)} - ${h(i.u)}</span></span>
          <span class="shop-qty">${fmtNum(i.price || 0)} EUR</span>
          <button class="edit-btn" onclick="editIngredient('${h(i.id)}')" title="Modifier">...</button>
          ${S.customIngredients[i.id] ? `<button class="edit-btn" onclick="deleteIngredient('${h(i.id)}')" title="Supprimer">x</button>` : ''}
        </div>
      `).join('')}
    </div>`;
}

function addIngredientLineToRecipe() {
  const id = document.getElementById('recipe-ingredient-pick').value;
  const item = ingredients()[id];
  if (!item) return;
  const qty = Number(document.getElementById('recipe-ingredient-qty').value);
  if (!qty) return alert('Ajoute une quantite.');
  const unit = document.getElementById('recipe-ingredient-unit').value || item.u || 'piece';
  const line = `${item.name} | ${qty} | ${unit}`;
  const area = document.getElementById('new-recipe-ingredients');
  area.value = area.value.trim() ? `${area.value.trim()}\n${line}` : line;
  document.getElementById('recipe-ingredient-qty').value = '';
  document.getElementById('recipe-ingredient-unit').value = '';
}

function saveIngredientForm() {
  const name = document.getElementById('ingredient-name').value.trim();
  if (!name) return alert('Ajoute un nom d ingredient.');
  const id = ingredientEditId && S.customIngredients[ingredientEditId] ? ingredientEditId : ingredientId(name);
  S.customIngredients[id] = {
    id,
    name,
    c: document.getElementById('ingredient-category').value,
    u: document.getElementById('ingredient-unit').value,
    price: Number((document.getElementById('ingredient-price').value || '0').replace(',', '.')) || 0,
  };
  save();
  resetIngredientForm();
  renderIngredientTools();
  renderCourses();
  showRecipePanel('ingredients');
  alert('Ingredient enregistre.');
}

function editIngredient(id) {
  const item = ingredients()[id];
  if (!item) return;
  ingredientEditId = id;
  document.getElementById('ingredient-name').value = item.name;
  document.getElementById('ingredient-category').value = item.c || 'autres';
  document.getElementById('ingredient-unit').value = item.u || 'piece';
  document.getElementById('ingredient-price').value = item.price || 0;
  document.getElementById('ingredient-form-title').textContent = S.customIngredients[id] ? 'Modifier ingredient' : 'Modifier une copie ingredient';
  document.getElementById('ingredient-save-btn').textContent = S.customIngredients[id] ? 'Enregistrer' : 'Creer une copie modifiable';
  document.getElementById('ingredient-cancel-btn').style.display = 'inline-flex';
  showRecipePanel('ingredients');
}

function resetIngredientForm() {
  ingredientEditId = null;
  document.getElementById('ingredient-name').value = '';
  document.getElementById('ingredient-category').value = 'viandes';
  document.getElementById('ingredient-unit').value = 'g';
  document.getElementById('ingredient-price').value = '';
  document.getElementById('ingredient-form-title').textContent = 'Base ingredients';
  document.getElementById('ingredient-save-btn').textContent = 'Enregistrer ingredient';
  document.getElementById('ingredient-cancel-btn').style.display = 'none';
}

function deleteIngredient(id) {
  if (!S.customIngredients[id]) return;
  if (!confirm('Supprimer cet ingredient personnalise ?')) return;
  delete S.customIngredients[id];
  save();
  resetIngredientForm();
  renderIngredientTools();
  renderCourses();
  showRecipePanel('ingredients');
}

function parseIngredients(raw, fallbackBudget) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const budgetPerLine = fallbackBudget > 0 && lines.length ? fallbackBudget / lines.length : 0;
  return lines.map(line => {
    const parts = line.split('|').map(p => p.trim());
    const base = ingredients()[ingredientId(parts[0])];
    return {
      n: parts[0],
      q: Number((parts[1] || '1').replace(',', '.')) || 1,
      u: parts[2] || base?.u || 'piece',
      c: parts[3] || base?.c || 'autres',
      p: parts[4] ? (Number(parts[4].replace(',', '.')) || 0) : budgetPerLine,
      ref: base?.id || null,
    };
  }).filter(item => item.n);
}

function formatIngredients(ingList) {
  return ingList.map(item => `${item.n} | ${item.q} | ${item.u} | ${item.c || 'autres'} | ${item.p || 0}`).join('\n');
}

function formatSteps(steps) {
  return (steps || []).join('\n');
}

function recipeFromForm(id) {
  const name = document.getElementById('new-recipe-name').value.trim();
  const base = Number(document.getElementById('new-recipe-base').value) || 4;
  const budget = Number((document.getElementById('new-recipe-price').value || '0').replace(',', '.')) || 0;
  const ingList = parseIngredients(document.getElementById('new-recipe-ingredients').value, budget);
  const steps = document.getElementById('new-recipe-steps').value.split('\n').map(s => s.trim()).filter(Boolean);
  if (!name) return alert('Ajoute au moins un nom de recette.');
  if (!ingList.length) return alert('Ajoute au moins un ingredient.');
  return recipe(id, name, ingList, steps.length ? steps : ['Preparer selon tes habitudes.'], {
    base: Math.max(1, base),
    tags: ['perso'],
  });
}

function saveRecipeForm() {
  if (recipeEditId) {
    const existing = recipes()[recipeEditId];
    if (!existing) return resetRecipeForm();
    const editingCustom = Boolean(S.customRecipes[recipeEditId]);

    const baseId = editingCustom ? recipeEditId : `custom-${slugify(document.getElementById('new-recipe-name').value || existing.name)}`;
    let finalId = baseId;
    let i = 2;
    while (!editingCustom && recipes()[finalId]) finalId = `${baseId}-${i++}`;

    const next = recipeFromForm(finalId);
    if (!next) return;
    S.customRecipes[finalId] = next;
    if (!editingCustom) replaceRecipeInPlans(recipeEditId, finalId);

    save();
    resetRecipeForm();
    renderRecettes();
    alert(editingCustom ? 'Recette modifiee.' : 'Copie personnalisee creee.');
    return;
  }

  const name = document.getElementById('new-recipe-name').value.trim();
  let id = `custom-${slugify(name)}`;
  let i = 2;
  while (recipes()[id]) id = `custom-${slugify(name)}-${i++}`;
  const next = recipeFromForm(id);
  if (!next) return;
  S.customRecipes[id] = next;
  save();
  resetRecipeForm();
  renderRecettes();
  alert('Recette ajoutee.');
}

function resetRecipeForm(switchToList = true) {
  ['new-recipe-name', 'new-recipe-price', 'new-recipe-ingredients', 'new-recipe-steps'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('new-recipe-base').value = 4;
  recipeEditId = null;
  document.getElementById('recipe-form-title').textContent = 'Ajouter une recette';
  document.getElementById('recipe-save-btn').textContent = '+ Ajouter la recette';
  document.getElementById('recipe-cancel-btn').style.display = 'none';
  if (switchToList) showRecipePanel('list');
}

function editRecipe(id) {
  const r = recipes()[id];
  if (!r || id === 'restes') return;
  recipeEditId = id;
  document.getElementById('new-recipe-name').value = r.name;
  document.getElementById('new-recipe-base').value = r.base || 4;
  document.getElementById('new-recipe-price').value = '';
  document.getElementById('new-recipe-ingredients').value = formatIngredients(r.ing || []);
  document.getElementById('new-recipe-steps').value = formatSteps(r.steps || []);
  document.getElementById('recipe-form-title').textContent = S.customRecipes[id] ? 'Modifier la recette' : 'Modifier une copie';
  document.getElementById('recipe-save-btn').textContent = S.customRecipes[id] ? 'Enregistrer' : 'Creer une copie modifiable';
  document.getElementById('recipe-cancel-btn').style.display = 'inline-flex';
  showRecipePanel('recipe');
  window.scrollTo({ top: document.getElementById('page-recettes').offsetTop, behavior: 'smooth' });
}

function deleteCustomRecipe(id) {
  if (!S.customRecipes[id]) return;
  if (!confirm('Supprimer cette recette personnalisee ?')) return;
  delete S.customRecipes[id];
  replaceRecipeInPlans(id, 'restes');
  save();
  resetRecipeForm();
  renderRecettes();
  alert('Recette supprimee. Les repas qui l utilisaient sont passes en Restes.');
}

function replaceRecipeInPlans(fromId, toId) {
  Object.values(S.plans).forEach(plan => {
    plan.days.forEach(d => {
      ['midi', 'soir'].forEach(slot => {
        if (mealId(d[slot]) === fromId) {
          d[slot] = typeof d[slot] === 'object'
            ? { id: toId, portions: mealPortions(d[slot]) }
            : toId;
        }
      });
    });
  });
}

/* ======================================================
   MODALS
====================================================== */
function openRecipe(id, portionsArg) {
  const r = recipes()[id];
  if (!r) return;
  const portions = portionsArg ? Number(portionsArg) : S.portions;
  const sc = portions / r.base;
  document.getElementById('modal-emoji').textContent = '';
  document.getElementById('modal-title').textContent = r.full;
  let html = `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
    <span class="tag tag-b">Prep ${r.prep} min</span>
    ${r.cook > 0 ? `<span class="tag tag-b">Cuisson ${r.cook} min</span>` : ''}
    <span class="tag tag-g">${fmtNum(portions)} portion${portions > 1 ? 's' : ''}</span>
  </div>`;
  html += `<h3 class="sec-title">Ingredients</h3>
    <ul class="ing-list">${r.ing.map(item => `
      <li><span>${h(item.n)}</span><span class="ing-qty">${h(fmtQty(item.q * sc, item.u))}</span></li>`).join('')}
    </ul>`;
  html += `<h3 class="sec-title">Preparation</h3>
    <ol class="step-list">${r.steps.map(s => `<li>${h(s)}</li>`).join('')}</ol>`;
  if (r.perso) html += `<div class="perso-box"><strong>Note : </strong>${h(r.perso)}</div>`;
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('recipe-overlay').classList.add('open');
}

function closeRecipe() {
  document.getElementById('recipe-overlay').classList.remove('open');
}

['recipe-overlay', 'edit-overlay', 'exclude-overlay'].forEach(id => {
  document.getElementById(id).addEventListener('click', function(e) {
    if (e.target === this) {
      closeRecipe();
      closeEdit();
      closeExclude();
    }
  });
});

load();
navigate(S.page || 'home');
