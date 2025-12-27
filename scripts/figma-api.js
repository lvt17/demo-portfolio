/**
 * Figma API Script
 * Lấy thông tin design từ Figma API
 * 
 * Cách sử dụng:
 * 1. Lấy Personal Access Token từ: https://www.figma.com/settings
 * 2. Set environment variable: export FIGMA_TOKEN="your-token"
 * 3. Chạy: node scripts/figma-api.js
 */

const https = require('https');

// Figma file key từ URL
const FIGMA_FILE_KEY = 'oUakXzNPXoeolOQ0N9mLMY';

// Node IDs từ các link bạn đã gửi
const NODE_IDS = {
  home1: '78-158',
  home2: '78-167',
  dragon: '78-179',
  dragonEn: '78-190',
  preview1: '200-32',
  preview2: '237-113'
};

// Lấy token từ environment variable
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

if (!FIGMA_TOKEN) {
  console.error('❌ Vui lòng set FIGMA_TOKEN environment variable');
  console.log('Cách lấy token:');
  console.log('1. Vào https://www.figma.com/settings');
  console.log('2. Scroll xuống "Personal access tokens"');
  console.log('3. Tạo token mới');
  console.log('4. Chạy: export FIGMA_TOKEN="your-token"');
  process.exit(1);
}

/**
 * Fetch file info từ Figma API
 */
function fetchFigmaFile() {
  return new Promise((resolve, reject) => {
    const url = `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}`;
    
    const options = {
      headers: {
        'X-Figma-Token': FIGMA_TOKEN
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (e) {
            reject(new Error('Failed to parse JSON: ' + e.message));
          }
        } else {
          reject(new Error(`API Error: ${res.statusCode} - ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Fetch data từ Figma API với node ID
 */
function fetchFigmaData(nodeId) {
  return new Promise((resolve, reject) => {
    const url = `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/nodes?ids=${nodeId}`;
    
    const options = {
      headers: {
        'X-Figma-Token': FIGMA_TOKEN
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (e) {
            reject(new Error('Failed to parse JSON: ' + e.message));
          }
        } else {
          reject(new Error(`API Error: ${res.statusCode} - ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Extract CSS properties từ Figma node (bao gồm children)
 */
function extractCSSProperties(node) {
  if (!node || !node.document) {
    return null;
  }

  const doc = node.document;
  const styles = {
    name: doc.name || 'unnamed',
    type: doc.type || null,
    width: doc.absoluteBoundingBox?.width || null,
    height: doc.absoluteBoundingBox?.height || null,
    x: doc.absoluteBoundingBox?.x || null,
    y: doc.absoluteBoundingBox?.y || null,
    fills: doc.fills || [],
    strokes: doc.strokes || [],
    effects: doc.effects || [],
    opacity: doc.opacity || 1,
    fontFamily: doc.style?.fontFamily || null,
    fontSize: doc.style?.fontSize || null,
    fontWeight: doc.style?.fontWeight || null,
    letterSpacing: doc.style?.letterSpacing || null,
    lineHeight: doc.style?.lineHeightPx || null,
    textAlign: doc.style?.textAlignHorizontal || null,
    padding: {
      top: doc.paddingTop || 0,
      right: doc.paddingRight || 0,
      bottom: doc.paddingBottom || 0,
      left: doc.paddingLeft || 0
    },
    gap: doc.itemSpacing || null,
    layoutMode: doc.layoutMode || null,
    layoutAlign: doc.layoutAlign || null,
    children: []
  };

  // Extract từ children nodes
  if (doc.children && doc.children.length > 0) {
    doc.children.forEach((child, index) => {
      const childStyles = {
        name: child.name || `child-${index}`,
        type: child.type,
        width: child.absoluteBoundingBox?.width || null,
        height: child.absoluteBoundingBox?.height || null,
        x: child.absoluteBoundingBox?.x || null,
        y: child.absoluteBoundingBox?.y || null,
        fills: child.fills || [],
        fontFamily: child.style?.fontFamily || null,
        fontSize: child.style?.fontSize || null,
        fontWeight: child.style?.fontWeight || null,
        letterSpacing: child.style?.letterSpacing || null,
        lineHeight: child.style?.lineHeightPx || null,
        textAlign: child.style?.textAlignHorizontal || null,
        characters: child.characters || null, // Text content
        layoutMode: child.layoutMode || null,
        paddingTop: child.paddingTop || null,
        paddingRight: child.paddingRight || null,
        paddingBottom: child.paddingBottom || null,
        paddingLeft: child.paddingLeft || null,
        itemSpacing: child.itemSpacing || null
      };
      styles.children.push(childStyles);
    });
  }

  return styles;
}

/**
 * Convert Figma color to CSS
 */
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

/**
 * Generate CSS từ Figma styles
 */
function generateCSS(styles, className = 'element') {
  let css = `.${className} {\n`;
  
  if (styles.width) css += `  width: ${styles.width}px;\n`;
  if (styles.height) css += `  height: ${styles.height}px;\n`;
  
  if (styles.fills && styles.fills.length > 0) {
    const bgColor = figmaColorToCSS(styles.fills[0]);
    if (bgColor) css += `  background-color: ${bgColor};\n`;
  }
  
  if (styles.fontFamily) css += `  font-family: ${styles.fontFamily};\n`;
  if (styles.fontSize) css += `  font-size: ${styles.fontSize}px;\n`;
  if (styles.fontWeight) css += `  font-weight: ${styles.fontWeight};\n`;
  if (styles.letterSpacing) css += `  letter-spacing: ${styles.letterSpacing}px;\n`;
  if (styles.lineHeight) css += `  line-height: ${styles.lineHeight}px;\n`;
  if (styles.textAlign) css += `  text-align: ${styles.textAlign};\n`;
  
  if (styles.padding) {
    const p = styles.padding;
    if (p.top || p.right || p.bottom || p.left) {
      css += `  padding: ${p.top}px ${p.right}px ${p.bottom}px ${p.left}px;\n`;
    }
  }
  
  if (styles.gap) css += `  gap: ${styles.gap}px;\n`;
  if (styles.opacity !== 1) css += `  opacity: ${styles.opacity};\n`;
  
  css += '}\n';
  return css;
}

/**
 * Tìm node ID từ URL node-id
 */
function findNodeIdFromUrl(fileData, urlNodeId) {
  // URL format: node-id=78-158 -> cần tìm node có ID tương ứng
  // Thử format: 78:158 hoặc 78-158
  const parts = urlNodeId.split('-');
  if (parts.length === 2) {
    const pageId = parts[0];
    const frameId = parts[1];
    
    // Tìm trong document tree
    function searchNode(node, targetPage, targetFrame) {
      if (node.id && node.id.includes(targetPage) && node.id.includes(targetFrame)) {
        return node.id;
      }
      if (node.children) {
        for (const child of node.children) {
          const found = searchNode(child, targetPage, targetFrame);
          if (found) return found;
        }
      }
      return null;
    }
    
    if (fileData.document && fileData.document.children) {
      for (const page of fileData.document.children) {
        if (page.id && page.id.includes(pageId)) {
          const found = searchNode(page, pageId, frameId);
          if (found) return found;
        }
      }
    }
  }
  return null;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Đang lấy thông tin từ Figma API...\n');

  // Đầu tiên, lấy file info để tìm node IDs thực tế
  try {
    console.log('📋 Đang lấy file info...');
    const fileData = await fetchFigmaFile();
    
    console.log('✅ File info loaded\n');
    console.log('📄 Document structure:');
    if (fileData.document && fileData.document.children) {
      fileData.document.children.forEach((page, index) => {
        console.log(`  Page ${index + 1}: ${page.name} (ID: ${page.id})`);
        if (page.children) {
          page.children.slice(0, 5).forEach((child, childIndex) => {
            console.log(`    - ${child.name || 'Unnamed'} (ID: ${child.id})`);
          });
        }
      });
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Thử tìm và fetch các nodes
    for (const [name, urlNodeId] of Object.entries(NODE_IDS)) {
      try {
        console.log(`📦 Đang tìm node: ${name} (URL: ${urlNodeId})...`);
        
        // Thử với URL node ID trực tiếp
        let nodeId = urlNodeId.replace('-', ':');
        let data = await fetchFigmaData(nodeId);
        
        if (!data.nodes || !data.nodes[nodeId]) {
          // Thử tìm trong file structure
          const foundId = findNodeIdFromUrl(fileData, urlNodeId);
          if (foundId) {
            nodeId = foundId;
            data = await fetchFigmaData(nodeId);
          }
        }
        
        if (data.nodes && data.nodes[nodeId]) {
          const node = data.nodes[nodeId];
          const styles = extractCSSProperties(node);
          
          if (styles) {
            console.log(`\n✅ ${name} (Node ID: ${nodeId}):`);
            console.log(`📐 Frame: ${styles.width}x${styles.height}px`);
            if (styles.fills && styles.fills.length > 0) {
              const bgColor = figmaColorToCSS(styles.fills[0]);
              console.log(`🎨 Background: ${bgColor}`);
            }
            console.log(`\n📋 Children (${styles.children.length}):`);
            styles.children.forEach((child, idx) => {
              console.log(`  ${idx + 1}. ${child.name} (${child.type})`);
              if (child.fontSize) console.log(`     Font: ${child.fontFamily} ${child.fontSize}px`);
              if (child.characters) console.log(`     Text: "${child.characters.substring(0, 50)}..."`);
              if (child.width && child.height) console.log(`     Size: ${child.width}x${child.height}px`);
            });
            console.log(`\n📝 CSS Generated:`);
            console.log(generateCSS(styles, name));
            
            // Generate CSS cho children
            let allCSS = generateCSS(styles, name) + '\n';
            if (styles.children.length > 0) {
              console.log(`\n📝 Children CSS:`);
              styles.children.forEach((child, idx) => {
                const childCSS = generateCSS(child, `${name}-${child.name.toLowerCase().replace(/\s+/g, '-')}`);
                console.log(childCSS);
                allCSS += childCSS + '\n';
              });
            }
            
            // Lưu vào file
            saveToFile(`${name}.json`, JSON.stringify(styles, null, 2));
            saveToFile(`${name}.css`, allCSS);
          } else {
            console.log(`⚠️  Không tìm thấy styles cho ${name}`);
          }
        } else {
          console.log(`⚠️  Không tìm thấy node ${urlNodeId}`);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Delay để tránh rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Lỗi khi fetch ${name}:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi fetch file info:', error.message);
  }
}

// Lưu output vào file
const fs = require('fs');

/**
 * Save output to file
 */
function saveToFile(filename, content) {
  const outputDir = 'scripts/output';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(`${outputDir}/${filename}`, content, 'utf8');
  console.log(`💾 Đã lưu vào: ${outputDir}/${filename}`);
}

// Chạy script
main().catch(console.error);

