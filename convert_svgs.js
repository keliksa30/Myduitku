const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, 'public/cat');
const outPath = path.join(__dirname, 'components/Cat/CatSvgs.tsx');

const files = fs.readdirSync(svgDir).filter(f => f.startsWith('cat_') && f.endsWith('.svg'));

let componentCode = `import React from 'react';\n\n`;

for (const file of files) {
  const name = file.replace('.svg', '').split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  let content = fs.readFileSync(path.join(svgDir, file), 'utf8');
  
  // Extract content inside <svg> tags
  const svgMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  if (!svgMatch) continue;
  let inner = svgMatch[1];
  
  // Fix style tag for JSX
  inner = inner.replace(/<style[^>]*>([\s\S]*?)<\/style>/g, (match, p1) => {
    return `<style type="text/css">{\`${p1}\`}</style>`;
  });

  // ONLY convert class to className, do NOT touch stroke-width etc because they are in CSS!
  inner = inner.replace(/class=/g, 'className=');
  
  // Inject animation classes
  inner = inner.replace(/id="ekor"/, 'id="ekor" className="cat-tail"');
  inner = inner.replace(/id="badan"/, 'id="badan" className="cat-breathe"');
  inner = inner.replace(/id="kepala"/, 'id="kepala" className="cat-head-bob"');
  inner = inner.replace(/id="mata_kanan"/, 'id="mata_kanan" className="cat-eye-blink"');
  inner = inner.replace(/id="mata_kiri"/, 'id="mata_kiri" className="cat-eye-blink"');
  inner = inner.replace(/id="whiskker_kiri"/, 'id="whiskker_kiri" className="whisker-l"');
  inner = inner.replace(/id="whisker_kanan"/, 'id="whisker_kanan" className="whisker-r"');
  
  // Wrap all facial features in a single head group
  inner = inner.replace(/(<g id="kepala"[\s\S]*?<g id="hidung">[\s\S]*?<\/g>)/, '<g id="kepala_keseluruhan" className="cat-head-group">\n$1\n</g>');
  
  componentCode += `export const ${name} = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="150 250 780 780" {...props}>
      ${inner}
    </svg>
  );\n\n`;
}

fs.writeFileSync(outPath, componentCode);
console.log('Successfully generated CatSvgs.tsx');
