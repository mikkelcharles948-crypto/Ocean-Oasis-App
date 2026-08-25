// Translated section titles + dish name/description for each DINING_MENUS
// entry in src/data/mockData.js, keyed by venue id. Sections and items are
// matched to the mockData arrays by position (see getLocalizedMenu in
// ./index.js), so the order here must mirror mockData.js exactly.
export const diningMenus = {
  v_1: {
    sections: [
      {
        title: { en: 'Starters', fr: 'Entrées', es: 'Entrantes', zh: '前菜' },
        items: [
          {
            name: { en: 'Callaloo Soup', fr: 'Soupe de callaloo', es: 'Sopa de callaloo', zh: '卡拉鲁浓汤' },
            description: {
              en: `Dasheen leaves, coconut milk, local herbs.`,
              fr: `Feuilles de dasheen, lait de coco, herbes locales.`,
              es: `Hojas de dasheen, leche de coco, hierbas locales.`,
              zh: `芋头叶、椰奶、本地香草。`,
            },
          },
          {
            name: { en: 'Christophene Fritters', fr: 'Beignets de christophine', es: 'Buñuelos de chayote', zh: '佛手瓜炸饼' },
            description: {
              en: `Chayote squash, saltfish, scotch bonnet aioli.`,
              fr: `Chayote, morue salée, aïoli au piment scotch bonnet.`,
              es: `Chayote, bacalao salado, alioli de ají scotch bonnet.`,
              zh: `佛手瓜、腌鳕鱼、苏格兰帽辣椒蒜泥蛋黄酱。`,
            },
          },
          {
            name: { en: 'Dock-Caught Ceviche', fr: 'Ceviche du jour', es: 'Ceviche del muelle', zh: '码头鲜捕塞维切' },
            description: {
              en: `Chef's daily catch, lime, red onion, plantain crisps.`,
              fr: `Prise du jour du chef, citron vert, oignon rouge, chips de plantain.`,
              es: `Captura del día del chef, lima, cebolla morada, chips de plátano.`,
              zh: `主厨每日鲜鱼、青柠、红洋葱、大蕉脆片。`,
            },
          },
        ],
      },
      {
        title: { en: 'Mains', fr: 'Plats', es: 'Platos principales', zh: '主菜' },
        items: [
          {
            name: { en: 'Grilled Mahi Mahi', fr: 'Mahi-mahi grillé', es: 'Mahi mahi a la parrilla', zh: '炭烤鬼头刀鱼' },
            description: {
              en: `Coconut rice, callaloo, tamarind glaze.`,
              fr: `Riz au coco, callaloo, glaçage au tamarin.`,
              es: `Arroz de coco, callaloo, glaseado de tamarindo.`,
              zh: `椰香米饭、卡拉鲁菜、罗望子酱汁。`,
            },
          },
          {
            name: { en: 'Braised Oxtail', fr: 'Queue de bœuf braisée', es: 'Rabo de toro braseado', zh: '红烩牛尾' },
            description: {
              en: `Slow-cooked, butter beans, provision mash.`,
              fr: `Cuisson lente, haricots beurre, purée de légumes racines locaux.`,
              es: `Cocción lenta, judías mantequilla, puré de viandas locales.`,
              zh: `慢炖牛尾、黄油豆、本地薯类泥。`,
            },
          },
          {
            name: { en: 'Roasted Vegetable Curry', fr: 'Curry de légumes rôtis', es: 'Curry de verduras asadas', zh: '烤时蔬咖喱' },
            description: {
              en: `Seasonal market vegetables, coconut curry, roti.`,
              fr: `Légumes de saison du marché, curry au coco, roti.`,
              es: `Verduras de temporada del mercado, curry de coco, roti.`,
              zh: `时令市场蔬菜、椰香咖喱、印度薄饼(roti)。`,
            },
          },
        ],
      },
      {
        title: { en: 'Desserts', fr: 'Desserts', es: 'Postres', zh: '甜点' },
        items: [
          {
            name: { en: 'Coconut Tart', fr: 'Tarte à la noix de coco', es: 'Tarta de coco', zh: '椰子挞' },
            description: {
              en: `Toasted coconut, passionfruit coulis.`,
              fr: `Noix de coco grillée, coulis de fruit de la passion.`,
              es: `Coco tostado, coulis de maracuyá.`,
              zh: `烤椰丝、百香果酱汁。`,
            },
          },
          {
            name: { en: 'Rum Cake', fr: 'Gâteau au rhum', es: 'Pastel de ron', zh: '朗姆酒蛋糕' },
            description: {
              en: `Dominican rum, spiced butter sauce.`,
              fr: `Rhum dominiquais, sauce au beurre épicée.`,
              es: `Ron dominiqués, salsa de mantequilla especiada.`,
              zh: `多米尼克朗姆酒、香料黄油酱汁。`,
            },
          },
        ],
      },
    ],
  },
  v_2: {
    sections: [
      {
        title: { en: 'Breakfast', fr: 'Petit-déjeuner', es: 'Desayuno', zh: '早餐' },
        items: [
          {
            name: { en: 'Continental Spread', fr: 'Buffet continental', es: 'Bufé continental', zh: '欧陆式早餐拼盘' },
            description: {
              en: `Pastries, tropical fruit, yogurt, cereals.`,
              fr: `Viennoiseries, fruits tropicaux, yaourt, céréales.`,
              es: `Bollería, fruta tropical, yogur, cereales.`,
              zh: `糕点、热带水果、酸奶、谷物。`,
            },
          },
          {
            name: { en: 'Bakes & Saltfish', fr: 'Bakes et morue salée', es: 'Bakes y bacalao salado', zh: '炸面饼配腌鳕鱼' },
            description: {
              en: `Traditional fried bakes with saltfish souse.`,
              fr: `Bakes frits traditionnels accompagnés de morue salée en souse.`,
              es: `Bakes fritos tradicionales con bacalao salado en escabeche.`,
              zh: `传统炸面饼配腌鳕鱼沙拉。`,
            },
          },
        ],
      },
      {
        title: { en: 'Lunch & Dinner', fr: 'Déjeuner et dîner', es: 'Almuerzo y cena', zh: '午餐与晚餐' },
        items: [
          {
            name: { en: 'Grilled Chicken Sandwich', fr: 'Sandwich au poulet grillé', es: 'Sándwich de pollo a la parrilla', zh: '烤鸡三明治' },
            description: {
              en: `House pepper sauce, provision chips.`,
              fr: `Sauce pimentée maison, chips de légumes racines.`,
              es: `Salsa picante de la casa, chips de vianda.`,
              zh: `自制辣椒酱、本地薯类脆片。`,
            },
          },
          {
            name: { en: 'Terrace Salad', fr: 'Salade de la terrasse', es: 'Ensalada de la terraza', zh: '露台沙拉' },
            description: {
              en: `Local greens, avocado, citrus vinaigrette.`,
              fr: `Verdures locales, avocat, vinaigrette aux agrumes.`,
              es: `Verduras locales, aguacate, vinagreta de cítricos.`,
              zh: `本地时蔬、牛油果、柑橘油醋汁。`,
            },
          },
          {
            name: { en: 'Wood-Fired Flatbread', fr: 'Galette cuite au feu de bois', es: 'Pan plano al horno de leña', zh: '柴烤薄饼' },
            description: {
              en: `Chef's daily topping selection.`,
              fr: `Sélection de garnitures du jour par le chef.`,
              es: `Selección diaria de coberturas del chef.`,
              zh: `主厨每日精选配料。`,
            },
          },
        ],
      },
    ],
  },
  v_3: {
    sections: [
      {
        title: { en: 'Signature Cocktails', fr: 'Cocktails signature', es: 'Cócteles de la casa', zh: '招牌鸡尾酒' },
        items: [
          {
            name: { en: 'Sunset Special', fr: 'Spécial coucher de soleil', es: 'Especial del atardecer', zh: '日落特饮' },
            description: {
              en: `Rum, passionfruit, lime, ginger beer.`,
              fr: `Rhum, fruit de la passion, citron vert, bière de gingembre.`,
              es: `Ron, maracuyá, lima, cerveza de jengibre.`,
              zh: `朗姆酒、百香果、青柠、姜汁啤酒。`,
            },
          },
          {
            name: { en: 'Dominica Sour', fr: 'Sour dominiquais', es: 'Sour dominiqués', zh: '多米尼克酸酒' },
            description: {
              en: `Local rum, bitters, egg white.`,
              fr: `Rhum local, bitters, blanc d'œuf.`,
              es: `Ron local, amargo de angostura, clara de huevo.`,
              zh: `本地朗姆酒、苦精、蛋清。`,
            },
          },
        ],
      },
      {
        title: { en: 'Light Bites', fr: 'Collations légères', es: 'Aperitivos ligeros', zh: '轻食小吃' },
        items: [
          {
            name: { en: 'Plantain Chips & Dip', fr: 'Chips de plantain et sauce', es: 'Chips de plátano con salsa', zh: '大蕉脆片配蘸酱' },
            description: {
              en: `House pepper aioli.`,
              fr: `Aïoli pimenté maison.`,
              es: `Alioli picante de la casa.`,
              zh: `自制辣椒蒜泥蛋黄酱。`,
            },
          },
          {
            name: { en: 'Coconut Shrimp', fr: 'Crevettes à la noix de coco', es: 'Camarones al coco', zh: '椰香虾' },
            description: {
              en: `Sweet chili glaze.`,
              fr: `Glaçage au chili doux.`,
              es: `Glaseado de chile dulce.`,
              zh: `甜辣酱汁。`,
            },
          },
        ],
      },
    ],
  },
  v_4: {
    sections: [
      {
        title: { en: 'Available 24 Hours', fr: 'Disponible 24h/24', es: 'Disponible las 24 horas', zh: '全天24小时供应' },
        items: [
          {
            name: { en: 'Club Sandwich', fr: 'Club sandwich', es: 'Sándwich club', zh: '总汇三明治' },
            description: {
              en: `Triple-decker, hand-cut fries.`,
              fr: `Triple étage, frites coupées à la main.`,
              es: `Triple piso, papas fritas cortadas a mano.`,
              zh: `三层夹心、手切薯条。`,
            },
          },
          {
            name: { en: 'Caribbean Fruit Plate', fr: 'Assiette de fruits caribéens', es: 'Plato de frutas caribeñas', zh: '加勒比水果拼盘' },
            description: {
              en: `Chef's seasonal selection.`,
              fr: `Sélection saisonnière du chef.`,
              es: `Selección de temporada del chef.`,
              zh: `主厨时令精选。`,
            },
          },
          {
            name: { en: 'Late-Night Pasta', fr: 'Pâtes de nuit', es: 'Pasta de medianoche', zh: '深夜意面' },
            description: {
              en: `Garlic, chili, herb oil.`,
              fr: `Ail, piment, huile aux herbes.`,
              es: `Ajo, chile, aceite de hierbas.`,
              zh: `大蒜、辣椒、香草油。`,
            },
          },
        ],
      },
    ],
  },
};

export default diningMenus;
