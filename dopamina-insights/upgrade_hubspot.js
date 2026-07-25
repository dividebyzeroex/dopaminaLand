const fs = require('fs');
const path = '/Users/joaopaulo/Documents/Dopamina/dopamina-insights/src/components/insights/HubSpotTab.tsx';

let content = fs.readFileSync(path, 'utf8');

// Replace all slate occurrences with zinc to match the rest of Dopamina's dark mode
content = content.replace(/slate-/g, 'zinc-');
content = content.replace(/text-slate/g, 'text-zinc');
content = content.replace(/bg-slate/g, 'bg-zinc');
content = content.replace(/border-slate/g, 'border-zinc');

// Make borders sharper and backgrounds slightly darker for premium look
content = content.replace(/rounded-3xl/g, 'rounded-2xl');
content = content.replace(/shadow-2xl/g, 'shadow-[0_0_40px_rgba(249,115,22,0.05)]');

fs.writeFileSync(path, content);
console.log('HubSpotTab.tsx updated successfully');
