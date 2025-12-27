/**
 * Script phân tích layout từ Figma data
 * Tính toán positions, spacing, và sizes chính xác
 */

const fs = require('fs');
const path = require('path');

function loadFigmaData(filename) {
  const filePath = path.join(__dirname, 'output', `${filename}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function analyzeLayout(data, frameName) {
  const frame = {
    width: data.width,
    height: data.height,
    x: data.x,
    y: data.y
  };
  
  console.log(`\n📐 ${frameName} Frame: ${frame.width}x${frame.height}px\n`);
  
  const textElements = data.children.filter(c => c.type === 'TEXT');
  const layout = {
    frame: frame,
    elements: []
  };
  
  textElements.forEach(el => {
    // Tính relative position trong frame
    const relX = el.x - frame.x;
    const relY = el.y - frame.y;
    
    // Tính percentage cho responsive
    const percentX = (relX / frame.width) * 100;
    const percentY = (relY / frame.height) * 100;
    
    // Scale cho mobile (375px width)
    const mobileWidth = 375;
    const scaleFactor = mobileWidth / frame.width;
    const mobileFontSize = Math.round(el.fontSize * scaleFactor);
    const mobileLineHeight = Math.round(el.lineHeight * scaleFactor);
    const mobileX = Math.round(relX * scaleFactor);
    const mobileY = Math.round(relY * scaleFactor);
    
    layout.elements.push({
      name: el.name,
      figma: {
        fontSize: el.fontSize,
        fontWeight: el.fontWeight,
        lineHeight: el.lineHeight,
        textAlign: el.textAlign,
        width: el.width,
        height: el.height,
        x: relX,
        y: relY,
        percentX: percentX.toFixed(2),
        percentY: percentY.toFixed(2)
      },
      mobile: {
        fontSize: mobileFontSize,
        lineHeight: mobileLineHeight,
        x: mobileX,
        y: mobileY,
        width: Math.round(el.width * scaleFactor),
        height: Math.round(el.height * scaleFactor)
      }
    });
  });
  
  return layout;
}

function generateCSS(layout, frameName) {
  let css = `/* === ${frameName.toUpperCase()} MOBILE LAYOUT === */\n`;
  css += `/* Frame: ${layout.frame.width}x${layout.frame.height}px -> Scaled to 375px width */\n\n`;
  
  layout.elements.forEach(el => {
    const selector = getSelector(el.name, frameName);
    if (!selector) return;
    
    css += `${selector} {\n`;
    css += `  /* Figma: ${el.figma.fontSize}px, ${el.figma.fontWeight}, ${el.figma.textAlign} */\n`;
    css += `  font-size: ${el.mobile.fontSize}px;\n`;
    css += `  font-weight: ${el.figma.fontWeight};\n`;
    css += `  line-height: ${el.mobile.lineHeight}px;\n`;
    css += `  text-align: ${el.figma.textAlign.toLowerCase()};\n`;
    css += `  /* Position: ${el.figma.percentX}% from left, ${el.figma.percentY}% from top */\n`;
    css += `}\n\n`;
  });
  
  return css;
}

function getSelector(name, frameName) {
  const map = {
    'home1': {
      'DoraChann': '.hero__name',
      'PortfoLio': '.hero__title'
    },
    'home2': {
      'WELCOME': '.hero__welcome span:first-child',
      'TO': '.hero__welcome .to',
      'my': '.hero__welcome .my',
      'Vietnameseland': '.hero__welcome .land'
    }
  };
  
  return map[frameName]?.[name] || null;
}

// Main
console.log('🔍 Phân tích layout từ Figma...\n');

const home1 = loadFigmaData('home1');
const home2 = loadFigmaData('home2');

const home1Layout = analyzeLayout(home1, 'home1');
const home2Layout = analyzeLayout(home2, 'home2');

console.log('📊 HOME1 Elements:');
home1Layout.elements.forEach(el => {
  console.log(`  ${el.name}:`);
  console.log(`    Figma: ${el.figma.fontSize}px, ${el.figma.fontWeight}, ${el.figma.textAlign}, pos(${el.figma.x}, ${el.figma.y})`);
  console.log(`    Mobile: ${el.mobile.fontSize}px, pos(${el.mobile.x}, ${el.mobile.y})`);
});

console.log('\n📊 HOME2 Elements:');
home2Layout.elements.forEach(el => {
  console.log(`  ${el.name}:`);
  console.log(`    Figma: ${el.figma.fontSize}px, ${el.figma.fontWeight}, ${el.figma.textAlign}, pos(${el.figma.x}, ${el.figma.y})`);
  console.log(`    Mobile: ${el.mobile.fontSize}px, pos(${el.mobile.x}, ${el.mobile.y})`);
});

// Generate CSS
const css1 = generateCSS(home1Layout, 'home1');
const css2 = generateCSS(home2Layout, 'home2');

fs.writeFileSync(path.join(__dirname, 'output', 'home1-mobile.css'), css1);
fs.writeFileSync(path.join(__dirname, 'output', 'home2-mobile.css'), css2);

console.log('\n✅ Đã generate CSS files:');
console.log('  - scripts/output/home1-mobile.css');
console.log('  - scripts/output/home2-mobile.css');


