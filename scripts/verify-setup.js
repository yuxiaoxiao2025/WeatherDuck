#!/usr/bin/env node

/**
 * 天气鸭项目配置验证脚本
 * 检查项目初始化是否完整，所有必要的配置文件是否存在
 */

const fs = require('fs');
const path = require('path');

// 颜色输出函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// 必需的文件列表
const requiredFiles = [
  'package.json',
  '.gitignore',
  '.env.example',
  'README.md',
  '.github/workflows/ci.yml'
];

// 推荐的目录结构
const recommendedDirs = [
  'src',
  'src/main',
  'src/renderer',
  'src/shared',
  'src/assets',
  'tests',
  'docs'
];

// 验证函数
function checkFileExists(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  return fs.existsSync(fullPath);
}

function checkDirExists(dirPath) {
  const fullPath = path.join(process.cwd(), dirPath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
}

function validatePackageJson() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const requiredScripts = [
      'dev', 'build', 'test', 'lint', 'format',
      'electron:dev', 'electron:build'
    ];
    
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    return {
      valid: missingScripts.length === 0,
      missingScripts,
      hasElectron: !!packageJson.devDependencies?.electron,
      hasReact: !!packageJson.dependencies?.react,
      hasTypeScript: !!packageJson.devDependencies?.typescript
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function validateCIWorkflow() {
  try {
    const ciPath = path.join(process.cwd(), '.github/workflows/ci.yml');
    const ciContent = fs.readFileSync(ciPath, 'utf8');
    
    const requiredSteps = [
      'actions/checkout',
      'actions/setup-node',
      'npm ci',
      'npm run lint',
      'npm run test'
    ];
    
    const missingSteps = requiredSteps.filter(step => !ciContent.includes(step));
    
    return {
      valid: missingSteps.length === 0,
      missingSteps,
      hasMultiPlatform: ciContent.includes('matrix'),
      hasSecurityScan: ciContent.includes('audit') || ciContent.includes('snyk')
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// 主验证函数
function runVerification() {
  console.log(colors.bold('\n🦆 天气鸭项目配置验证\n'));
  
  let allValid = true;
  
  // 检查必需文件
  console.log(colors.blue('📁 检查必需文件:'));
  requiredFiles.forEach(file => {
    const exists = checkFileExists(file);
    const status = exists ? colors.green('✓') : colors.red('✗');
    console.log(`  ${status} ${file}`);
    if (!exists) allValid = false;
  });
  
  // 检查推荐目录
  console.log(colors.blue('\n📂 检查推荐目录结构:'));
  recommendedDirs.forEach(dir => {
    const exists = checkDirExists(dir);
    const status = exists ? colors.green('✓') : colors.yellow('○');
    console.log(`  ${status} ${dir}${exists ? '' : ' (推荐创建)'}`);
  });
  
  // 验证 package.json
  console.log(colors.blue('\n📦 验证 package.json:'));
  const packageValidation = validatePackageJson();
  if (packageValidation.valid) {
    console.log(`  ${colors.green('✓')} 所有必需脚本已配置`);
    console.log(`  ${colors.green('✓')} Electron: ${packageValidation.hasElectron ? '已安装' : '未安装'}`);
    console.log(`  ${colors.green('✓')} React: ${packageValidation.hasReact ? '已安装' : '未安装'}`);
    console.log(`  ${colors.green('✓')} TypeScript: ${packageValidation.hasTypeScript ? '已安装' : '未安装'}`);
  } else {
    console.log(`  ${colors.red('✗')} package.json 验证失败`);
    if (packageValidation.missingScripts?.length > 0) {
      console.log(`    缺少脚本: ${packageValidation.missingScripts.join(', ')}`);
    }
    if (packageValidation.error) {
      console.log(`    错误: ${packageValidation.error}`);
    }
    allValid = false;
  }
  
  // 验证 CI 工作流
  console.log(colors.blue('\n🔄 验证 CI 工作流:'));
  const ciValidation = validateCIWorkflow();
  if (ciValidation.valid) {
    console.log(`  ${colors.green('✓')} 所有必需步骤已配置`);
    console.log(`  ${colors.green('✓')} 多平台构建: ${ciValidation.hasMultiPlatform ? '已启用' : '未启用'}`);
    console.log(`  ${colors.green('✓')} 安全扫描: ${ciValidation.hasSecurityScan ? '已启用' : '未启用'}`);
  } else {
    console.log(`  ${colors.red('✗')} CI 工作流验证失败`);
    if (ciValidation.missingSteps?.length > 0) {
      console.log(`    缺少步骤: ${ciValidation.missingSteps.join(', ')}`);
    }
    if (ciValidation.error) {
      console.log(`    错误: ${ciValidation.error}`);
    }
    allValid = false;
  }
  
  // 输出总结
  console.log(colors.blue('\n📋 验证总结:'));
  if (allValid) {
    console.log(colors.green('🎉 项目配置验证通过！所有必需文件和配置都已正确设置。'));
    console.log(colors.blue('\n📝 下一步操作:'));
    console.log('  1. 运行 npm install 安装依赖');
    console.log('  2. 复制 .env.example 为 .env 并配置API密钥');
    console.log('  3. 创建 src 目录结构并开始开发');
    console.log('  4. 初始化 Git 仓库: git init');
    console.log('  5. 添加远程仓库: git remote add origin <your-repo-url>');
  } else {
    console.log(colors.red('❌ 项目配置验证失败！请检查上述错误并修复。'));
  }
  
  console.log('');
  return allValid;
}

// 运行验证
if (require.main === module) {
  const success = runVerification();
  process.exit(success ? 0 : 1);
}

module.exports = { runVerification };