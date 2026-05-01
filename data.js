/* ======================================================
   DATA
====================================================== */
function recipe(id, name, ingList, steps, options = {}) {
  return {
    id,
    name,
    full: options.full || name,
    prep: options.prep || 10,
    cook: options.cook || 20,
    base: options.base || 4,
    tags: options.tags || ['simple'],
    allergens: options.allergens || [],
    ing: ingList,
    steps,
    perso: options.perso || null,
  };
}

function ing(n, q, u, c, p) {
  return { n, q, u, c, p };
}

function day(name, midi, soir) {
  return { name, midi, soir };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function baseIng(id, name, c, u, price) {
  return { id, name, c, u, price };
}

/* Prices:
   - g = price per kg
   - ml = price per liter
   - piece/pieces/tranches/cube/cs/cc = price per unit
*/
const BASE_INGREDIENTS = {
  'ail': baseIng('ail', 'Ail', 'legumes', 'piece', 0.12),
  'banane': baseIng('banane', 'Banane', 'legumes', 'piece', 0.35),
  'beurre-vegetal': baseIng('beurre-vegetal', 'Beurre vegetal', 'vegetal', 'g', 8.0),
  'boeuf-hache': baseIng('boeuf-hache', 'Boeuf hache', 'viandes', 'g', 12.0),
  'bouillon': baseIng('bouillon', 'Bouillon', 'epicerie', 'cube', 0.2),
  'carotte': baseIng('carotte', 'Carotte', 'legumes', 'piece', 0.25),
  'carottes': baseIng('carottes', 'Carottes', 'legumes', 'g', 2.0),
  'carottes-rapees': baseIng('carottes-rapees', 'Carottes rapees', 'legumes', 'piece', 0.2),
  'chocolat-noir': baseIng('chocolat-noir', 'Chocolat noir', 'epicerie', 'g', 12.0),
  'citron': baseIng('citron', 'Citron', 'legumes', 'piece', 0.4),
  'compote': baseIng('compote', 'Compote', 'epicerie', 'g', 3.0),
  'concombre': baseIng('concombre', 'Concombre', 'legumes', 'piece', 0.9),
  'courgettes': baseIng('courgettes', 'Courgettes', 'legumes', 'g', 3.5),
  'creme-vegetale': baseIng('creme-vegetale', 'Creme vegetale', 'vegetal', 'ml', 6.0),
  'cuisses-de-poulet': baseIng('cuisses-de-poulet', 'Cuisses de poulet', 'viandes', 'piece', 1.5),
  'farine': baseIng('farine', 'Farine', 'epicerie', 'g', 1.4),
  'filets-de-poisson': baseIng('filets-de-poisson', 'Filets de poisson', 'viandes', 'g', 12.5),
  'fromage-vegetal': baseIng('fromage-vegetal', 'Fromage vegetal', 'vegetal', 'g', 18.0),
  'fromage-vegetal-rape': baseIng('fromage-vegetal-rape', 'Fromage vegetal rape', 'vegetal', 'g', 20.0),
  'haricots-verts': baseIng('haricots-verts', 'Haricots verts', 'surgeles', 'g', 3.5),
  'herbes-de-provence': baseIng('herbes-de-provence', 'Herbes de Provence', 'epicerie', 'cc', 0.05),
  'huile-olive': baseIng('huile-olive', 'Huile olive', 'epicerie', 'cs', 0.08),
  'jambon': baseIng('jambon', 'Jambon', 'viandes', 'g', 13.0),
  'lait-vegetal': baseIng('lait-vegetal', 'Lait vegetal', 'vegetal', 'ml', 2.2),
  'laitue': baseIng('laitue', 'Laitue', 'legumes', 'piece', 1.2),
  'lardons': baseIng('lardons', 'Lardons', 'viandes', 'g', 13.0),
  'legumes-surgeles': baseIng('legumes-surgeles', 'Legumes surgeles', 'surgeles', 'g', 4.0),
  'lentilles-corail': baseIng('lentilles-corail', 'Lentilles corail', 'epicerie', 'g', 5.0),
  'levure-boulangere': baseIng('levure-boulangere', 'Levure boulangere', 'epicerie', 'g', 30.0),
  'levure-chimique': baseIng('levure-chimique', 'Levure chimique', 'epicerie', 'sachet', 0.25),
  'margarine-vegetale': baseIng('margarine-vegetale', 'Margarine vegetale', 'vegetal', 'g', 6.0),
  'oeufs': baseIng('oeufs', 'Oeufs', 'viandes', 'piece', 0.3),
  'pain-de-mie': baseIng('pain-de-mie', 'Pain de mie', 'feculents', 'tranches', 0.15),
  'pate-brisee': baseIng('pate-brisee', 'Pate brisee', 'feculents', 'piece', 1.2),
  'pates': baseIng('pates', 'Pates', 'feculents', 'g', 2.4),
  'pates-a-pizza': baseIng('pates-a-pizza', 'Pates a pizza', 'feculents', 'piece', 0.75),
  'pommes': baseIng('pommes', 'Pommes', 'legumes', 'piece', 0.45),
  'pommes-de-terre': baseIng('pommes-de-terre', 'Pommes de terre', 'feculents', 'g', 1.9),
  'poulet': baseIng('poulet', 'Poulet', 'viandes', 'g', 12.0),
  'riz': baseIng('riz', 'Riz', 'feculents', 'g', 2.7),
  'salade': baseIng('salade', 'Salade', 'legumes', 'piece', 1.0),
  'sauce-soja': baseIng('sauce-soja', 'Sauce soja', 'epicerie', 'cs', 0.1),
  'sauce-tomate': baseIng('sauce-tomate', 'Sauce tomate', 'epicerie', 'g', 3.2),
  'saucisses': baseIng('saucisses', 'Saucisses', 'viandes', 'piece', 1.0),
  'sel': baseIng('sel', 'Sel', 'epicerie', 'cc', 0.01),
  'steaks-haches': baseIng('steaks-haches', 'Steaks haches', 'viandes', 'piece', 1.25),
  'sucre': baseIng('sucre', 'Sucre', 'epicerie', 'g', 1.6),
  'thon-en-boite': baseIng('thon-en-boite', 'Thon en boite', 'viandes', 'g', 10.5),
  'tortillas': baseIng('tortillas', 'Tortillas', 'feculents', 'piece', 0.3),
  'vanille': baseIng('vanille', 'Vanille', 'epicerie', 'cc', 0.15),
  'yaourt-vegetal': baseIng('yaourt-vegetal', 'Yaourt vegetal', 'vegetal', 'g', 5.0),
};

const BASE_RECIPES = {
  'poulet-four': recipe('poulet-four', 'Poulet au four, PDT & carottes', [
    ing('Cuisses de poulet', 4, 'piece'),
    ing('Pommes de terre', 800, 'g'),
    ing('Carottes', 400, 'g'),
    ing('Huile olive', 3, 'cs'),
    ing('Herbes de Provence', 2, 'cc'),
    ing('Ail', 2, 'piece'),
  ], [
    'Prechauffer le four a 200 C.',
    'Couper pommes de terre et carottes en morceaux.',
    'Mettre le poulet et les legumes dans un plat avec huile, ail et herbes.',
    'Cuire environ 1 h en retournant a mi-cuisson.',
  ], { prep: 15, cook: 60, tags: ['four', 'simple'] }),

  'soupe-carotte': recipe('soupe-carotte', 'Soupe carotte & lentilles', [
    ing('Carottes', 700, 'g'),
    ing('Lentilles corail', 180, 'g'),
    ing('Bouillon', 1, 'cube'),
    ing('Creme vegetale', 150, 'ml'),
  ], [
    'Cuire carottes et lentilles dans de l eau avec le bouillon.',
    'Mixer finement.',
    'Ajouter la creme vegetale et ajuster la texture.',
  ], { prep: 10, cook: 25, tags: ['souper', 'vegetal'] }),

  'pates-bolo': recipe('pates-bolo', 'Pates bolognaise', [
    ing('Pates', 350, 'g'),
    ing('Boeuf hache', 350, 'g'),
    ing('Sauce tomate', 400, 'g'),
    ing('Carotte', 1, 'piece'),
  ], [
    'Cuire les pates.',
    'Faire revenir le boeuf hache.',
    'Ajouter carotte rapee et sauce tomate.',
    'Laisser mijoter puis servir avec les pates.',
  ], { prep: 10, cook: 20, tags: ['pates', 'viande'] }),

  'omelette-salade': recipe('omelette-salade', 'Omelette & salade', [
    ing('Oeufs', 6, 'piece'),
    ing('Laitue', 1, 'piece'),
    ing('Concombre', 1, 'piece'),
    ing('Huile olive', 1, 'cs'),
  ], [
    'Battre les oeufs avec un peu de sel.',
    'Cuire l omelette a la poele.',
    'Servir avec laitue et concombre.',
  ], { prep: 8, cook: 8, tags: ['rapide'] }),

  'riz-saute-poulet': recipe('riz-saute-poulet', 'Riz saute au poulet', [
    ing('Riz', 300, 'g'),
    ing('Poulet', 350, 'g'),
    ing('Legumes surgeles', 400, 'g'),
    ing('Sauce soja', 2, 'cs'),
  ], [
    'Cuire le riz.',
    'Faire revenir le poulet en morceaux.',
    'Ajouter les legumes puis le riz.',
    'Assaisonner avec sauce soja.',
  ], { prep: 10, cook: 20, tags: ['poelee'] }),

  'sandwich-chaud': recipe('sandwich-chaud', 'Sandwich chaud', [
    ing('Pain de mie', 8, 'tranches'),
    ing('Jambon', 160, 'g'),
    ing('Fromage vegetal', 120, 'g'),
    ing('Salade', 1, 'piece'),
  ], [
    'Garnir les tranches de pain.',
    'Toaster ou passer au four quelques minutes.',
    'Servir avec salade.',
  ], { prep: 8, cook: 8, tags: ['rapide'] }),

  'pizza-maison': recipe('pizza-maison', 'Pizza maison', [
    ing('Pates a pizza', 2, 'piece'),
    ing('Sauce tomate', 300, 'g'),
    ing('Jambon', 150, 'g'),
    ing('Fromage vegetal rape', 100, 'g'),
  ], [
    'Etaler les pates a pizza.',
    'Ajouter sauce tomate, jambon et fromage vegetal.',
    'Cuire au four chaud 12 a 15 min.',
  ], { prep: 10, cook: 15, tags: ['four'] }),

  'pates-creme-poulet': recipe('pates-creme-poulet', 'Pates creme vegetale & poulet', [
    ing('Pates', 350, 'g'),
    ing('Poulet', 300, 'g'),
    ing('Creme vegetale', 200, 'ml'),
    ing('Courgettes', 300, 'g'),
  ], [
    'Cuire les pates.',
    'Faire revenir poulet et courgettes.',
    'Ajouter la creme vegetale.',
    'Melanger avec les pates.',
  ], { prep: 10, cook: 18, tags: ['pates'] }),

  'poisson-riz': recipe('poisson-riz', 'Poisson & riz', [
    ing('Filets de poisson', 400, 'g'),
    ing('Riz', 300, 'g'),
    ing('Haricots verts', 400, 'g'),
    ing('Citron', 1, 'piece'),
  ], [
    'Cuire le riz.',
    'Cuire le poisson a la poele ou au four.',
    'Rechauffer les haricots verts.',
    'Servir avec citron.',
  ], { prep: 8, cook: 18, tags: ['poisson'] }),

  'poelee-legumes-oeufs': recipe('poelee-legumes-oeufs', 'Poelee legumes & oeufs', [
    ing('Oeufs', 6, 'piece'),
    ing('Courgettes', 300, 'g'),
    ing('Carottes', 200, 'g'),
    ing('Haricots verts', 150, 'g'),
  ], [
    'Faire revenir les legumes en petits morceaux.',
    'Creuser des espaces et casser les oeufs.',
    'Cuire a couvert quelques minutes.',
  ], { prep: 10, cook: 18, tags: ['vegetarien'] }),

  'wrap-poulet': recipe('wrap-poulet', 'Wrap poulet', [
    ing('Tortillas', 6, 'piece'),
    ing('Poulet', 350, 'g'),
    ing('Laitue', 1, 'piece'),
    ing('Carottes rapees', 2, 'piece'),
  ], [
    'Cuire le poulet en lamelles.',
    'Garnir les tortillas avec poulet et crudites.',
    'Rouler et servir.',
  ], { prep: 12, cook: 10, tags: ['wrap'] }),

  'steak-pates': recipe('steak-pates', 'Steak hache, pates & courgettes', [
    ing('Steaks haches', 4, 'piece'),
    ing('Pates', 350, 'g'),
    ing('Courgettes', 400, 'g'),
  ], [
    'Cuire les pates.',
    'Poeler les courgettes.',
    'Cuire les steaks haches et servir ensemble.',
  ], { prep: 8, cook: 18, tags: ['simple'] }),

  'quiche': recipe('quiche', 'Quiche sans lait', [
    ing('Pate brisee', 1, 'piece'),
    ing('Oeufs', 4, 'piece'),
    ing('Lardons', 150, 'g'),
    ing('Creme vegetale', 200, 'ml'),
  ], [
    'Prechauffer le four a 180 C.',
    'Melanger oeufs, creme vegetale et lardons.',
    'Verser sur la pate et cuire 35 a 40 min.',
  ], { prep: 10, cook: 40, tags: ['four'] }),

  'saucisse-puree': recipe('saucisse-puree', 'Saucisse & puree', [
    ing('Saucisses', 4, 'piece'),
    ing('Pommes de terre', 900, 'g'),
    ing('Creme vegetale', 150, 'ml'),
  ], [
    'Cuire les pommes de terre.',
    'Ecraser avec la creme vegetale.',
    'Cuire les saucisses et servir.',
  ], { prep: 10, cook: 25, tags: ['simple'] }),

  'pates-thon': recipe('pates-thon', 'Pates thon & creme vegetale', [
    ing('Pates', 350, 'g'),
    ing('Thon en boite', 280, 'g'),
    ing('Creme vegetale', 200, 'ml'),
    ing('Citron', 1, 'piece'),
  ], [
    'Cuire les pates.',
    'Melanger thon, creme vegetale et citron.',
    'Assembler avec les pates chaudes.',
  ], { prep: 5, cook: 12, tags: ['rapide'] }),

  'riz-oeufs-legumes': recipe('riz-oeufs-legumes', 'Riz, oeufs & legumes', [
    ing('Riz', 300, 'g'),
    ing('Oeufs', 6, 'piece'),
    ing('Legumes surgeles', 400, 'g'),
  ], [
    'Cuire le riz.',
    'Cuire les legumes.',
    'Ajouter les oeufs brouilles ou durs selon preference.',
  ], { prep: 8, cook: 18, tags: ['simple'] }),

  'brioche': recipe('brioche', 'Brioche sans lait', [
    ing('Farine', 500, 'g'),
    ing('Sucre', 70, 'g'),
    ing('Levure boulangere', 8, 'g'),
    ing('Lait vegetal', 220, 'ml'),
    ing('Oeufs', 2, 'piece'),
    ing('Margarine vegetale', 80, 'g'),
    ing('Sel', 1, 'cc'),
  ], [
    'Melanger farine, sucre, levure et sel.',
    'Ajouter lait vegetal tiede et oeufs.',
    'Incorporer la margarine et petrir.',
    'Laisser lever, faconner, laisser lever encore.',
    'Cuire environ 25 min a 180 C.',
  ], { prep: 25, cook: 25, base: 8, tags: ['gouter', 'extra'] }),

  'gateau-yaourt-sans-lait': recipe('gateau-yaourt-sans-lait', 'Gateau yaourt sans lait', [
    ing('Yaourt vegetal', 125, 'g'),
    ing('Farine', 250, 'g'),
    ing('Sucre', 120, 'g'),
    ing('Oeufs', 3, 'piece'),
    ing('Huile olive', 5, 'cs'),
    ing('Levure chimique', 1, 'sachet'),
  ], [
    'Melanger yaourt vegetal, sucre et oeufs.',
    'Ajouter farine, levure et huile.',
    'Verser dans un moule et cuire 30 a 35 min a 180 C.',
  ], { prep: 10, cook: 35, base: 8, tags: ['gouter', 'extra'] }),

  'compote-pommes': recipe('compote-pommes', 'Compote de pommes', [
    ing('Pommes', 6, 'piece'),
    ing('Sucre', 20, 'g'),
    ing('Vanille', 1, 'cc'),
  ], [
    'Eplucher et couper les pommes.',
    'Cuire avec un fond d eau, sucre et vanille.',
    'Mixer ou ecraser selon la texture souhaitee.',
  ], { prep: 10, cook: 20, base: 6, tags: ['gouter', 'fruit'] }),
};

const REST_RECIPE = recipe('restes', 'Restes', [], ['Rechauffer ou assembler les restes disponibles.'], {
  full: 'Restes / repas deja pret',
  base: 1,
  tags: ['reste', 'zero-course'],
  perso: 'Ce repas ne rajoute aucun ingredient a la liste de courses.',
});

const WEEKS_DEFAULT = {
  A: { label: 'Semaine A', days: [
    day('Lundi', 'poulet-four', 'soupe-carotte'),
    day('Mardi', 'pates-bolo', 'omelette-salade'),
    day('Mercredi', 'riz-saute-poulet', 'sandwich-chaud'),
    day('Jeudi', 'pizza-maison', 'pates-creme-poulet'),
    day('Vendredi', 'poisson-riz', 'poelee-legumes-oeufs'),
    day('Samedi', 'wrap-poulet', 'steak-pates'),
    day('Dimanche', 'quiche', 'saucisse-puree'),
  ]},
  B: { label: 'Semaine B', days: [
    day('Lundi', 'pates-thon', 'riz-oeufs-legumes'),
    day('Mardi', 'poulet-four', 'soupe-carotte'),
    day('Mercredi', 'steak-pates', 'omelette-salade'),
    day('Jeudi', 'pates-bolo', 'sandwich-chaud'),
    day('Vendredi', 'riz-saute-poulet', 'quiche'),
    day('Samedi', 'pizza-maison', 'poelee-legumes-oeufs'),
    day('Dimanche', 'poisson-riz', 'wrap-poulet'),
  ]},
  C: { label: 'Semaine C', days: [
    day('Lundi', 'saucisse-puree', 'pates-creme-poulet'),
    day('Mardi', 'riz-saute-poulet', 'soupe-carotte'),
    day('Mercredi', 'quiche', 'omelette-salade'),
    day('Jeudi', 'poisson-riz', 'riz-oeufs-legumes'),
    day('Vendredi', 'pates-bolo', 'steak-pates'),
    day('Samedi', 'poulet-four', 'pizza-maison'),
    day('Dimanche', 'pates-thon', 'wrap-poulet'),
  ]},
  D: { label: 'Semaine D', days: [
    day('Lundi', 'poelee-legumes-oeufs', 'soupe-carotte'),
    day('Mardi', 'steak-pates', 'pates-creme-poulet'),
    day('Mercredi', 'riz-saute-poulet', 'sandwich-chaud'),
    day('Jeudi', 'pates-bolo', 'omelette-salade'),
    day('Vendredi', 'poulet-four', 'quiche'),
    day('Samedi', 'poisson-riz', 'pizza-maison'),
    day('Dimanche', 'saucisse-puree', 'riz-oeufs-legumes'),
  ]},
};

const CATS = {
  viandes: { label: 'Viandes / Poissons / Oeufs' },
  feculents: { label: 'Feculents' },
  legumes: { label: 'Legumes frais' },
  surgeles: { label: 'Surgeles' },
  epicerie: { label: 'Epicerie' },
  vegetal: { label: 'Produits vegetaux / Alt. lait' },
  autres: { label: 'Autres' },
};

const CAT_ORDER = ['viandes', 'feculents', 'legumes', 'surgeles', 'epicerie', 'vegetal', 'autres'];

let S = {
  page: 'home',
  week: 'A',
  portions: 2.25,
  plans: clone(WEEKS_DEFAULT),
  checks: {},
  customRecipes: {},
  customIngredients: {},
};

let editCtx = {};
