const fs = require('fs');

async function run() {
  const content = fs.readFileSync('a11y_output.txt', 'utf16le');
  
  // Encontra a area do aviso
  const start = content.indexOf('--- ACESSIBILITY ISSUES FOUND ---');
  if (start > -1) {
    const jsonStr = content.substring(start);
    console.log(jsonStr.substring(0, 3000));
  } else {
    console.log("Not found.");
  }
}

run();
