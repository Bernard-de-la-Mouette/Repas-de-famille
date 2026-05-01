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
  'cumin-doux': baseIng('cumin-doux', 'Cumin doux', 'epicerie', 'cc', 0.05),
  'curry-doux': baseIng('curry-doux', 'Curry doux', 'epicerie', 'cc', 0.07),
  'cuisses-de-poulet': baseIng('cuisses-de-poulet', 'Cuisses de poulet', 'viandes', 'piece', 1.5),
  'dinde': baseIng('dinde', 'Dinde', 'viandes', 'g', 13.0),
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
  'pois-chiches': baseIng('pois-chiches', 'Pois chiches', 'epicerie', 'g', 4.0),
  'riz': baseIng('riz', 'Riz', 'feculents', 'g', 2.7),
  'salade': baseIng('salade', 'Salade', 'legumes', 'piece', 1.0),
  'sauce-soja': baseIng('sauce-soja', 'Sauce soja', 'epicerie', 'cs', 0.1),
  'sauce-tomate': baseIng('sauce-tomate', 'Sauce tomate', 'epicerie', 'g', 3.2),
  'saucisses': baseIng('saucisses', 'Saucisses', 'viandes', 'piece', 1.0),
  'sel': baseIng('sel', 'Sel', 'epicerie', 'cc', 0.01),
  'semoule': baseIng('semoule', 'Semoule', 'feculents', 'g', 2.2),
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

  'hachis-parmentier-vegetalise': recipe('hachis-parmentier-vegetalise', 'Hachis parmentier sans lait', [
    ing('Pommes de terre', 900, 'g'),
    ing('Boeuf hache', 350, 'g'),
    ing('Carottes', 300, 'g'),
    ing('Creme vegetale', 150, 'ml'),
    ing('Huile olive', 2, 'cs'),
    ing('Herbes de Provence', 1, 'cc'),
  ], [
    'Cuire les pommes de terre dans l eau.',
    'Ecraser les pommes de terre avec la creme vegetale.',
    'Faire revenir le boeuf hache avec les carottes coupees finement.',
    'Mettre la viande dans un plat puis couvrir avec la puree.',
    'Cuire au four a 180 C pendant 20 minutes.',
  ], { prep: 15, cook: 30, tags: ['familial', 'four', 'economique'], perso: 'Pour une version plus douce pour enfant, limiter le sel.' }),

  'gratin-poulet-pommes-de-terre': recipe('gratin-poulet-pommes-de-terre', 'Gratin de poulet et pommes de terre sans lait', [
    ing('Poulet', 400, 'g'),
    ing('Pommes de terre', 800, 'g'),
    ing('Courgettes', 300, 'g'),
    ing('Creme vegetale', 250, 'ml'),
    ing('Ail', 1, 'piece'),
    ing('Huile olive', 1, 'cs'),
  ], [
    'Prechauffer le four a 180 C.',
    'Couper les pommes de terre et les courgettes en fines rondelles.',
    'Couper le poulet en morceaux.',
    'Mettre le tout dans un plat avec la creme vegetale, l ail et l huile.',
    'Cuire 40 minutes au four.',
  ], { prep: 15, cook: 40, tags: ['four', 'familial', 'simple'], perso: 'Ajouter du fromage vegetal rape si souhaite.' }),

  'boulettes-boeuf-riz-carottes': recipe('boulettes-boeuf-riz-carottes', 'Boulettes de boeuf, riz et carottes', [
    ing('Boeuf hache', 400, 'g'),
    ing('Oeufs', 1, 'piece'),
    ing('Riz', 300, 'g'),
    ing('Carottes', 400, 'g'),
    ing('Huile olive', 2, 'cs'),
    ing('Herbes de Provence', 1, 'cc'),
  ], [
    'Melanger le boeuf hache avec l oeuf et les herbes.',
    'Former des boulettes.',
    'Cuire le riz dans une casserole.',
    'Cuire les carottes en rondelles.',
    'Faire dorer les boulettes a la poele puis servir avec le riz et les carottes.',
  ], { prep: 15, cook: 20, tags: ['viande', 'familial', 'economique'], allergens: ['oeufs'], perso: 'Pour toi, ajouter oignons ou poivrons poeles a part.' }),

  'emince-dinde-pates-creme': recipe('emince-dinde-pates-creme', 'Emince de dinde, pates et creme vegetale', [
    ing('Dinde', 400, 'g'),
    ing('Pates', 350, 'g'),
    ing('Creme vegetale', 200, 'ml'),
    ing('Courgettes', 300, 'g'),
    ing('Huile olive', 1, 'cs'),
  ], [
    'Cuire les pates.',
    'Couper la dinde en petits morceaux.',
    'Faire revenir la dinde avec les courgettes.',
    'Ajouter la creme vegetale.',
    'Melanger avec les pates.',
  ], { prep: 10, cook: 20, tags: ['rapide', 'pates', 'simple'], perso: 'Remplacer la dinde par du poulet selon les prix.' }),

  'poulet-citron-riz-haricots': recipe('poulet-citron-riz-haricots', 'Poulet citron, riz et haricots verts', [
    ing('Poulet', 450, 'g'),
    ing('Riz', 300, 'g'),
    ing('Haricots verts', 500, 'g'),
    ing('Citron', 1, 'piece'),
    ing('Huile olive', 2, 'cs'),
  ], [
    'Cuire le riz.',
    'Cuire les haricots verts.',
    'Faire revenir le poulet en morceaux avec l huile.',
    'Ajouter le jus de citron en fin de cuisson.',
    'Servir le poulet avec le riz et les haricots.',
  ], { prep: 10, cook: 25, tags: ['simple', 'equilibre'], perso: 'Plat pratique avec haricots verts surgeles.' }),

  'cabillaud-pommes-de-terre-carottes': recipe('cabillaud-pommes-de-terre-carottes', 'Cabillaud, pommes de terre et carottes au four', [
    ing('Filets de poisson', 500, 'g'),
    ing('Pommes de terre', 700, 'g'),
    ing('Carottes', 400, 'g'),
    ing('Citron', 1, 'piece'),
    ing('Huile olive', 2, 'cs'),
  ], [
    'Prechauffer le four a 190 C.',
    'Couper les pommes de terre et les carottes en morceaux fins.',
    'Les mettre au four avec l huile pendant 20 minutes.',
    'Ajouter les filets de poisson et le citron.',
    'Poursuivre la cuisson 10 minutes.',
  ], { prep: 10, cook: 30, tags: ['poisson', 'four', 'simple'], allergens: ['poisson'], perso: 'Utiliser du poisson surgele pour optimiser le budget.' }),

  'thon-riz-concombre-carottes': recipe('thon-riz-concombre-carottes', 'Salade de riz au thon sans tomate', [
    ing('Riz', 300, 'g'),
    ing('Thon en boite', 280, 'g'),
    ing('Concombre', 1, 'piece'),
    ing('Carottes rapees', 2, 'piece'),
    ing('Huile olive', 2, 'cs'),
    ing('Citron', 1, 'piece'),
  ], [
    'Cuire le riz puis le laisser refroidir.',
    'Egoutter le thon.',
    'Couper le concombre.',
    'Melanger riz, thon, concombre et carottes.',
    'Assaisonner avec huile et citron.',
  ], { prep: 15, cook: 10, tags: ['rapide', 'froid', 'poisson'], allergens: ['poisson'], perso: 'Pour toi, ajouter des tomates a part dans ton assiette.' }),

  'saumon-pommes-de-terre-courgettes': recipe('saumon-pommes-de-terre-courgettes', 'Saumon, pommes de terre et courgettes', [
    ing('Filets de poisson', 500, 'g'),
    ing('Pommes de terre', 700, 'g'),
    ing('Courgettes', 400, 'g'),
    ing('Citron', 1, 'piece'),
    ing('Huile olive', 2, 'cs'),
  ], [
    'Prechauffer le four a 190 C.',
    'Couper les pommes de terre et courgettes.',
    'Les cuire 15 minutes avec un peu d huile.',
    'Ajouter le poisson et le citron.',
    'Cuire encore 10 minutes.',
  ], { prep: 10, cook: 25, tags: ['poisson', 'four', 'equilibre'], allergens: ['poisson'], perso: 'Remplacer le saumon par colin ou cabillaud pour reduire le prix.' }),

  'galettes-thon-pomme-de-terre': recipe('galettes-thon-pomme-de-terre', 'Galettes de thon et pomme de terre', [
    ing('Pommes de terre', 700, 'g'),
    ing('Thon en boite', 200, 'g'),
    ing('Oeufs', 1, 'piece'),
    ing('Farine', 40, 'g'),
    ing('Huile olive', 2, 'cs'),
  ], [
    'Cuire les pommes de terre puis les ecraser.',
    'Ajouter le thon, l oeuf et la farine.',
    'Former des petites galettes.',
    'Faire dorer les galettes a la poele.',
    'Servir avec une salade ou des legumes.',
  ], { prep: 15, cook: 20, tags: ['poisson', 'economique', 'familial'], allergens: ['poisson', 'oeufs'], perso: 'Recette pratique pour utiliser des restes de pommes de terre.' }),

  'frittata-pommes-de-terre-courgettes': recipe('frittata-pommes-de-terre-courgettes', 'Frittata pommes de terre et courgettes', [
    ing('Oeufs', 8, 'piece'),
    ing('Pommes de terre', 500, 'g'),
    ing('Courgettes', 300, 'g'),
    ing('Creme vegetale', 100, 'ml'),
    ing('Huile olive', 1, 'cs'),
  ], [
    'Cuire les pommes de terre en petits cubes.',
    'Faire revenir les courgettes.',
    'Battre les oeufs avec la creme vegetale.',
    'Verser sur les legumes.',
    'Cuire a feu doux ou au four jusqu a prise.',
  ], { prep: 10, cook: 20, tags: ['oeufs', 'vegetarien', 'rapide'], allergens: ['oeufs'], perso: 'Peut se manger chaud ou froid.' }),

  'oeufs-brouilles-riz-legumes': recipe('oeufs-brouilles-riz-legumes', 'Oeufs brouilles, riz et legumes', [
    ing('Oeufs', 6, 'piece'),
    ing('Riz', 300, 'g'),
    ing('Legumes surgeles', 500, 'g'),
    ing('Sauce soja', 1, 'cs'),
    ing('Huile olive', 1, 'cs'),
  ], [
    'Cuire le riz.',
    'Faire revenir les legumes surgeles.',
    'Battre les oeufs puis les cuire en brouillade.',
    'Melanger le riz, les legumes et les oeufs.',
    'Ajouter un peu de sauce soja.',
  ], { prep: 8, cook: 15, tags: ['rapide', 'economique', 'oeufs'], allergens: ['oeufs'], perso: 'Verifier que le melange de legumes ne contient pas d oignons ni poivrons pour ta femme.' }),

  'quiche-courgette-jambon': recipe('quiche-courgette-jambon', 'Quiche courgette jambon sans lait', [
    ing('Pate brisee', 1, 'piece'),
    ing('Oeufs', 4, 'piece'),
    ing('Jambon', 150, 'g'),
    ing('Courgettes', 300, 'g'),
    ing('Creme vegetale', 200, 'ml'),
  ], [
    'Prechauffer le four a 180 C.',
    'Couper les courgettes en petits morceaux.',
    'Melanger les oeufs, la creme vegetale, le jambon et les courgettes.',
    'Verser sur la pate.',
    'Cuire 35 minutes.',
  ], { prep: 10, cook: 35, tags: ['four', 'familial', 'simple'], allergens: ['oeufs'], perso: 'Servir avec une salade.' }),

  'lentilles-corail-riz-carottes': recipe('lentilles-corail-riz-carottes', 'Lentilles corail, riz et carottes', [
    ing('Lentilles corail', 250, 'g'),
    ing('Riz', 250, 'g'),
    ing('Carottes', 400, 'g'),
    ing('Creme vegetale', 150, 'ml'),
    ing('Bouillon', 1, 'cube'),
  ], [
    'Cuire le riz.',
    'Cuire les lentilles corail avec les carottes en petits morceaux et le bouillon.',
    'Ajouter la creme vegetale en fin de cuisson.',
    'Servir les lentilles avec le riz.',
  ], { prep: 10, cook: 25, tags: ['vegetarien', 'economique', 'equilibre'], perso: 'Recette douce et facile pour enfant.' }),

  'pates-courgettes-creme-vegetale': recipe('pates-courgettes-creme-vegetale', 'Pates courgettes et creme vegetale', [
    ing('Pates', 350, 'g'),
    ing('Courgettes', 500, 'g'),
    ing('Creme vegetale', 200, 'ml'),
    ing('Ail', 1, 'piece'),
    ing('Huile olive', 1, 'cs'),
  ], [
    'Cuire les pates.',
    'Couper les courgettes en petits morceaux.',
    'Faire revenir les courgettes avec l huile et l ail.',
    'Ajouter la creme vegetale.',
    'Melanger avec les pates.',
  ], { prep: 8, cook: 15, tags: ['vegetarien', 'rapide', 'pates'], perso: 'Pour toi, ajouter champignons ou oignons poeles a part.' }),

  'curry-doux-legumes-riz': recipe('curry-doux-legumes-riz', 'Curry doux de legumes et riz', [
    ing('Riz', 300, 'g'),
    ing('Carottes', 300, 'g'),
    ing('Courgettes', 300, 'g'),
    ing('Lait vegetal', 250, 'ml'),
    ing('Curry doux', 1, 'cc'),
    ing('Huile olive', 1, 'cs'),
  ], [
    'Cuire le riz.',
    'Couper les legumes en petits morceaux.',
    'Faire revenir les legumes avec l huile.',
    'Ajouter le lait vegetal et le curry doux.',
    'Laisser mijoter puis servir avec le riz.',
  ], { prep: 10, cook: 25, tags: ['vegetarien', 'economique', 'exotique'], perso: 'Verifier que le curry doux ne contient pas de traces d arachide.' }),

  'galettes-pommes-de-terre-carottes': recipe('galettes-pommes-de-terre-carottes', 'Galettes pommes de terre et carottes', [
    ing('Pommes de terre', 700, 'g'),
    ing('Carottes', 300, 'g'),
    ing('Oeufs', 2, 'piece'),
    ing('Farine', 50, 'g'),
    ing('Huile olive', 2, 'cs'),
  ], [
    'Raper les pommes de terre et les carottes.',
    'Melanger avec les oeufs et la farine.',
    'Former des galettes.',
    'Cuire a la poele jusqu a ce qu elles soient dorees.',
    'Servir avec une salade.',
  ], { prep: 15, cook: 20, tags: ['vegetarien', 'economique', 'familial'], allergens: ['oeufs'], perso: 'Faire de petites galettes pour l enfant.' }),

  'semoule-legumes-pois-chiches': recipe('semoule-legumes-pois-chiches', 'Semoule, legumes et pois chiches', [
    ing('Semoule', 300, 'g'),
    ing('Pois chiches', 300, 'g'),
    ing('Carottes', 300, 'g'),
    ing('Courgettes', 300, 'g'),
    ing('Bouillon', 1, 'cube'),
  ], [
    'Cuire les carottes et courgettes en morceaux avec le bouillon.',
    'Rechauffer les pois chiches.',
    'Preparer la semoule avec de l eau chaude.',
    'Servir les legumes et pois chiches sur la semoule.',
  ], { prep: 10, cook: 15, tags: ['vegetarien', 'rapide', 'economique'], allergens: ['gluten'], perso: 'Ajouter des epices douces selon tolerance.' }),

  'tartines-chaudes-jambon-courgette': recipe('tartines-chaudes-jambon-courgette', 'Tartines chaudes jambon et courgette', [
    ing('Pain de mie', 8, 'tranches'),
    ing('Jambon', 160, 'g'),
    ing('Courgettes', 250, 'g'),
    ing('Fromage vegetal rape', 100, 'g'),
  ], [
    'Prechauffer le four a 180 C.',
    'Couper les courgettes en fines lamelles.',
    'Garnir le pain avec jambon, courgette et fromage vegetal.',
    'Cuire 10 minutes au four.',
    'Servir avec des crudites.',
  ], { prep: 10, cook: 10, tags: ['rapide', 'four', 'simple'], allergens: ['gluten'], perso: 'Version rapide pour soir de semaine.' }),

  'wrap-oeuf-carotte-concombre': recipe('wrap-oeuf-carotte-concombre', 'Wrap oeuf, carotte et concombre', [
    ing('Tortillas', 6, 'piece'),
    ing('Oeufs', 6, 'piece'),
    ing('Carottes rapees', 2, 'piece'),
    ing('Concombre', 1, 'piece'),
    ing('Yaourt vegetal', 150, 'g'),
  ], [
    'Cuire les oeufs durs.',
    'Couper le concombre.',
    'Melanger le yaourt vegetal avec un peu de citron.',
    'Garnir les tortillas avec oeufs, carottes, concombre et sauce.',
    'Rouler les wraps.',
  ], { prep: 12, cook: 10, tags: ['rapide', 'vegetarien', 'froid'], allergens: ['oeufs', 'gluten'], perso: 'Pratique pour un repas froid ou un pique-nique.' }),

  'compote-pomme-banane': recipe('compote-pomme-banane', 'Compote pomme banane', [
    ing('Pommes', 5, 'piece'),
    ing('Banane', 2, 'piece'),
    ing('Vanille', 1, 'cc'),
  ], [
    'Eplucher et couper les pommes.',
    'Cuire les pommes avec un fond d eau.',
    'Ajouter les bananes en morceaux.',
    'Mixer ou ecraser selon la texture souhaitee.',
  ], { prep: 10, cook: 15, tags: ['gouter', 'fruit', 'simple'], perso: 'Sans sucre ajoute si les fruits sont bien murs.' }),

  'crepes-sans-lait': recipe('crepes-sans-lait', 'Crepes sans lait de vache', [
    ing('Farine', 250, 'g'),
    ing('Oeufs', 3, 'piece'),
    ing('Lait vegetal', 500, 'ml'),
    ing('Sucre', 30, 'g'),
    ing('Huile olive', 1, 'cs'),
  ], [
    'Melanger farine et sucre.',
    'Ajouter les oeufs puis le lait vegetal progressivement.',
    'Ajouter l huile.',
    'Laisser reposer si possible.',
    'Cuire les crepes a la poele.',
  ], { prep: 10, cook: 20, tags: ['gouter', 'extra', 'familial'], allergens: ['oeufs', 'gluten'], perso: 'Servir avec compote ou chocolat noir fondu.' }),

  'muffins-banane-chocolat': recipe('muffins-banane-chocolat', 'Muffins banane chocolat sans lait', [
    ing('Banane', 3, 'piece'),
    ing('Farine', 220, 'g'),
    ing('Oeufs', 2, 'piece'),
    ing('Chocolat noir', 100, 'g'),
    ing('Levure chimique', 1, 'sachet'),
    ing('Lait vegetal', 100, 'ml'),
  ], [
    'Ecraser les bananes.',
    'Ajouter les oeufs et le lait vegetal.',
    'Incorporer farine et levure.',
    'Ajouter le chocolat noir coupe en morceaux.',
    'Cuire 20 minutes a 180 C.',
  ], { prep: 10, cook: 20, base: 8, tags: ['gouter', 'four', 'extra'], allergens: ['oeufs', 'gluten'], perso: 'Verifier que le chocolat noir ne contient pas de lait.' }),

  'dhal-lentilles-corail-riz': recipe('dhal-lentilles-corail-riz', 'Dhal doux de lentilles corail et riz', [
    ing('Lentilles corail', 280, 'g'),
    ing('Riz', 250, 'g'),
    ing('Carottes', 300, 'g'),
    ing('Lait vegetal', 300, 'ml'),
    ing('Curry doux', 1, 'cc'),
    ing('Bouillon', 1, 'cube'),
  ], [
    'Cuire le riz.',
    'Cuire les lentilles avec les carottes, le bouillon et un peu d eau.',
    'Ajouter le lait vegetal et le curry doux.',
    'Laisser mijoter jusqu a texture cremeuse.',
    'Servir avec le riz.',
  ], { prep: 10, cook: 25, tags: ['exotique', 'vegetarien', 'economique'], perso: 'Verifier les ingredients du curry doux pour eviter toute trace d arachide.' }),

  'poulet-curry-doux-semoule': recipe('poulet-curry-doux-semoule', 'Poulet curry doux et semoule', [
    ing('Poulet', 450, 'g'),
    ing('Semoule', 300, 'g'),
    ing('Carottes', 300, 'g'),
    ing('Courgettes', 300, 'g'),
    ing('Lait vegetal', 250, 'ml'),
    ing('Curry doux', 1, 'cc'),
  ], [
    'Couper le poulet en morceaux.',
    'Faire revenir le poulet avec les carottes et courgettes.',
    'Ajouter le lait vegetal et le curry doux.',
    'Preparer la semoule avec de l eau chaude.',
    'Servir le poulet curry sur la semoule.',
  ], { prep: 10, cook: 20, tags: ['exotique', 'poulet', 'rapide'], allergens: ['gluten'], perso: 'Pour ta femme, garder la recette sans oignon ni poivron.' }),

  'riz-saute-facon-asiatique': recipe('riz-saute-facon-asiatique', 'Riz saute facon asiatique', [
    ing('Riz', 320, 'g'),
    ing('Oeufs', 4, 'piece'),
    ing('Poulet', 250, 'g'),
    ing('Carottes', 250, 'g'),
    ing('Haricots verts', 250, 'g'),
    ing('Sauce soja', 2, 'cs'),
  ], [
    'Cuire le riz.',
    'Faire cuire le poulet en petits morceaux.',
    'Ajouter les carottes et haricots verts.',
    'Ajouter le riz puis les oeufs battus.',
    'Assaisonner avec la sauce soja.',
  ], { prep: 10, cook: 20, tags: ['exotique', 'rapide', 'oeufs'], allergens: ['oeufs', 'soja'], perso: 'Utiliser une sauce soja simple et verifier les traces d allergenes.' }),

  'boulettes-poulet-semoule-epices-douces': recipe('boulettes-poulet-semoule-epices-douces', 'Boulettes de poulet, semoule et epices douces', [
    ing('Poulet', 450, 'g'),
    ing('Oeufs', 1, 'piece'),
    ing('Farine', 30, 'g'),
    ing('Semoule', 300, 'g'),
    ing('Carottes', 300, 'g'),
    ing('Cumin doux', 1, 'cc'),
  ], [
    'Mixer ou hacher le poulet.',
    'Melanger avec l oeuf, la farine et le cumin doux.',
    'Former des boulettes.',
    'Cuire les boulettes a la poele.',
    'Servir avec semoule et carottes cuites.',
  ], { prep: 15, cook: 20, tags: ['exotique', 'familial', 'poulet'], allergens: ['oeufs', 'gluten'], perso: 'Adapter les epices pour l enfant.' }),

  'poisson-coco-doux-riz': recipe('poisson-coco-doux-riz', 'Poisson coco doux et riz', [
    ing('Filets de poisson', 500, 'g'),
    ing('Riz', 300, 'g'),
    ing('Lait vegetal', 300, 'ml'),
    ing('Carottes', 250, 'g'),
    ing('Courgettes', 250, 'g'),
    ing('Citron', 1, 'piece'),
  ], [
    'Cuire le riz.',
    'Couper carottes et courgettes en petits morceaux.',
    'Cuire les legumes avec le lait vegetal.',
    'Ajouter le poisson en morceaux et cuire doucement.',
    'Ajouter le citron en fin de cuisson.',
  ], { prep: 10, cook: 20, tags: ['exotique', 'poisson', 'simple'], allergens: ['poisson'], perso: 'Utiliser du lait de coco uniquement s il est tolere et sans traces d arachide.' }),
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
