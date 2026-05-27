const { execSync } = require('child_process');
const path = require('path');

console.log('--- NeuroAds Git Worktree Cleaner ---');
const mainPath = path.resolve(__dirname).toLowerCase();

try {
  console.log('Fetching active Git worktrees...');
  const output = execSync('git worktree list').toString();
  const lines = output.trim().split('\n');
  
  let count = 0;
  for (const line of lines) {
    const match = line.match(/^([^\s]+)/);
    if (!match) continue;
    
    const wtPath = path.resolve(match[1]);
    if (wtPath.toLowerCase() === mainPath) {
      console.log(`ℹ️ Keeping main directory: ${wtPath}`);
      continue;
    }
    
    console.log(`🧹 Removing worktree at: ${wtPath}`);
    try {
      execSync(`git worktree remove --force "${wtPath}"`);
      console.log(`   └─ Removed successfully!`);
      count++;
    } catch (e) {
      console.warn(`   └─ Warning: Failed to remove using git command. Attempting manual database prune.`);
    }
  }
  
  console.log('🧹 Pruning Git worktrees database...');
  execSync('git worktree prune');
  
  console.log(`\n✅ SUCCESS: Cleaned up ${count} worktrees! Your VS Code Source Control panel should now be clean and show only the main repository.`);
} catch (err) {
  console.error('❌ ERROR: Failed to clean up worktrees:', err.message);
  console.log('\nAlternative manual command you can run in your terminal:');
  console.log('git worktree prune');
}
