const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('businesses-export.json', 'utf8'));
  const categories = new Set();
  const subCategories = new Set();

  data.forEach(business => {
    if (business.category) categories.add(business.category);
    if (business.sub_category) subCategories.add(business.sub_category);
    if (business.es_category) categories.add(business.es_category);
    if (business.es_sub_category) subCategories.add(business.es_sub_category);
  });

  console.log('--- CATEGORIES ---');
  console.log(Array.from(categories));
  console.log('--- SUB-CATEGORIES ---');
  console.log(Array.from(subCategories));
} catch (e) {
  console.error('Error analyzing JSON:', e.message);
}
