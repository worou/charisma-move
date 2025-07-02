const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage de Charisma\'Move...\n');

// Fonction pour lancer un processus
function startProcess(command, args, cwd, name) {
  const process = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true
  });

  process.on('error', (error) => {
    console.error(`❌ Erreur lors du démarrage de ${name}:`, error.message);
  });

  process.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ ${name} s'est arrêté avec le code ${code}`);
    }
  });

  return process;
}

// Vérifier si les dépendances sont installées
const fs = require('fs');
const frontendNodeModules = path.join(__dirname, 'node_modules');
const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');

if (!fs.existsSync(frontendNodeModules)) {
  console.log('📦 Installation des dépendances frontend...');
  startProcess('npm', ['install'], __dirname, 'Frontend dependencies');
}

if (!fs.existsSync(backendNodeModules)) {
  console.log('📦 Installation des dépendances backend...');
  startProcess('npm', ['install'], path.join(__dirname, 'backend'), 'Backend dependencies');
}

// Attendre un peu avant de démarrer les services
setTimeout(() => {
  console.log('🔧 Démarrage du backend...');
  const backend = startProcess('npm', ['start'], path.join(__dirname, 'backend'), 'Backend');

  // Attendre que le backend démarre
  setTimeout(() => {
    console.log('🎨 Démarrage du frontend...');
    const frontend = startProcess('npm', ['run', 'dev'], __dirname, 'Frontend');

    console.log('\n✅ Charisma\'Move est en cours de démarrage...');
    console.log('📱 Frontend: http://localhost:3000');
    console.log('🔌 Backend: http://localhost:3001');
    console.log('📚 API Docs: http://localhost:3001/api-docs');
    console.log('\n💡 Appuyez sur Ctrl+C pour arrêter tous les services\n');

    // Gestion de l'arrêt propre
    process.on('SIGINT', () => {
      console.log('\n🛑 Arrêt des services...');
      backend.kill();
      frontend.kill();
      process.exit(0);
    });
  }, 3000);
}, 2000); 