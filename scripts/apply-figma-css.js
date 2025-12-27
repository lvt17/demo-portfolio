/**
 * Script tự động apply CSS từ Figma vào code
 * 
 * Cách sử dụng:
 * node scripts/apply-figma-css.js
 */

const fs = require('fs');
const path = require('path');

// Mapping từ Figma node names đến CSS selectors
const FIGMA_TO_CSS_MAP = {
  'home1': {
    'DoraChann': '.hero__name',
    'PortfoLio': '.hero__title'
  },
  'home2': {
    'WELCOME': '.hero__welcome span:first-child',
    'TO': '.hero__welcome .to',
    'my': '.hero__welcome .my',
    'Vietnameseland': '.hero__welcome .land'
  },
  'dragon': {
    'ĐỐI VỚI TÔI...': '.philosophy__title',
    'Văn hoá, là nói lên bản sắc của một dân tộc.': '.philosophy__quote--first p',
    'Văn hoá còn thì dân tộc còn, văn hoá mất thì dân tộc mất.': '.philosophy__quote--second p',
    'Tổng Bí thư Nguyễn Phú Trọng - Hội nghị Văn hoá toàn quốc 2021': '.philosophy__attribution',
    'Read more about me': '.philosophy__cta .btn'
  }
};

// Đọc file JSON từ Figma
function loadFigmaData(filename) {
  const filePath = path.join(__dirname, 'output', `${filename}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File không tồn tại: ${filePath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Convert Figma color to CSS
function figmaColorToCSS(fill) {
  if (!fill || fill.type !== 'SOLID') return null;
  const color = fill.color;
  const opacity = fill.opacity || 1;
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  if (opacity === 1) {
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
}

// Generate CSS từ Figma data
function generateMobileCSS(figmaData, nodeName) {
  const cssRules = [];
  const map = FIGMA_TO_CSS_MAP[nodeName] || {};
  
  if (!figmaData || !figmaData.children) {
    return cssRules;
  }
  
  figmaData.children.forEach(child => {
    const selector = map[child.name];
    if (!selector) return;
    
    const rules = [];
    
    // Font properties
    if (child.fontFamily) {
      rules.push(`  font-family: ${child.fontFamily};`);
    }
    if (child.fontSize) {
      // Scale down for mobile (440px frame -> ~375px screen)
      const mobileSize = Math.round((child.fontSize / 440) * 375);
      rules.push(`  font-size: ${mobileSize}px;`);
    }
    if (child.fontWeight) {
      rules.push(`  font-weight: ${child.fontWeight};`);
    }
    if (child.lineHeight) {
      const mobileLineHeight = Math.round((child.lineHeight / 440) * 375);
      rules.push(`  line-height: ${mobileLineHeight}px;`);
    }
    if (child.textAlign) {
      const align = child.textAlign.toLowerCase();
      rules.push(`  text-align: ${align};`);
    }
    
    // Color
    if (child.fills && child.fills.length > 0) {
      const color = figmaColorToCSS(child.fills[0]);
      if (color) {
        rules.push(`  color: ${color};`);
      }
    }
    
    if (rules.length > 0) {
      cssRules.push(`${selector} {`);
      cssRules.push(...rules);
      cssRules.push('}');
      cssRules.push('');
    }
  });
  
  return cssRules;
}

// Apply CSS vào file
function applyCSSToFile(cssFile, newRules, sectionComment) {
  if (!fs.existsSync(cssFile)) {
    console.error(`❌ File không tồn tại: ${cssFile}`);
    return false;
  }
  
  let content = fs.readFileSync(cssFile, 'utf8');
  
  // Tìm section mobile và thay thế
  const mobileSectionRegex = new RegExp(
    `(\\/\\* === ${sectionComment}.*?\\*\\/)([\\s\\S]*?)(?=\\n\\s*\\/\\*|$)`,
    'm'
  );
  
  const newSection = `/* === ${sectionComment} === */\n${newRules.join('\n')}`;
  
  if (mobileSectionRegex.test(content)) {
    content = content.replace(mobileSectionRegex, newSection);
    console.log(`✅ Đã update section: ${sectionComment}`);
  } else {
    // Thêm vào cuối file
    content += `\n\n${newSection}`;
    console.log(`✅ Đã thêm section mới: ${sectionComment}`);
  }
  
  fs.writeFileSync(cssFile, content, 'utf8');
  return true;
}

// Main function
function main() {
  console.log('🚀 Đang apply CSS từ Figma...\n');
  
  const cssFile = path.join(__dirname, '..', 'css', 'style.css');
  
  // Process home1
  console.log('📦 Processing home1...');
  const home1Data = loadFigmaData('home1');
  if (home1Data) {
    const home1CSS = generateMobileCSS(home1Data, 'home1');
    if (home1CSS.length > 0) {
      const mobileCSS = `@media (max-width: 576px) {\n${home1CSS.map(rule => '  ' + rule).join('\n')}}`;
      // Apply vào file (cần tìm đúng section)
      console.log('📝 Generated CSS:');
      console.log(mobileCSS);
    }
  }
  
  // Process home2
  console.log('\n📦 Processing home2...');
  const home2Data = loadFigmaData('home2');
  if (home2Data) {
    const home2CSS = generateMobileCSS(home2Data, 'home2');
    if (home2CSS.length > 0) {
      const mobileCSS = `@media (max-width: 576px) {\n${home2CSS.map(rule => '  ' + rule).join('\n')}}`;
      console.log('📝 Generated CSS:');
      console.log(mobileCSS);
    }
  }
  
  // Process dragon
  console.log('\n📦 Processing dragon...');
  const dragonData = loadFigmaData('dragon');
  if (dragonData) {
    const dragonCSS = generateMobileCSS(dragonData, 'dragon');
    if (dragonCSS.length > 0) {
      const mobileCSS = `@media (max-width: 576px) {\n${dragonCSS.map(rule => '  ' + rule).join('\n')}}`;
      console.log('📝 Generated CSS:');
      console.log(mobileCSS);
    }
  }
  
  console.log('\n✅ Hoàn thành!');
  console.log('💡 Xem output ở trên và apply vào css/style.css thủ công hoặc cải thiện script để tự động apply.');
}

main();


