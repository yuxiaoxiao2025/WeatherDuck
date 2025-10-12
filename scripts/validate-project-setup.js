/**
 * 项目初始化验证脚本 (TDD - The Red Phase)
 * 验证WeatherDuck项目的开发环境配置是否完整
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProjectValidator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  validateFileExists(filePath, description) {
    const fullPath = path.join(this.projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      this.log(`${description} 存在: ${filePath}`);
      return true;
    } else {
      this.errors.push(`缺少 ${description}: ${filePath}`);
      this.log(`缺少 ${description}: ${filePath}`, 'error');
      return false;
    }
  }

  validatePackageJson() {
    this.log('验证 package.json 配置...');
    
    const packagePath = path.join(this.projectRoot, 'package.json');
    if (!this.validateFileExists('package.json', 'package.json')) return;

    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // 验证必要的依赖
      const requiredDeps = ['react', 'react-dom', 'framer-motion', 'lucide-react'];
      const requiredDevDeps = [
        'electron', '@electron-forge/cli', 'typescript', 'vite', 
        '@vitejs/plugin-react', 'tailwindcss', 'eslint', 'prettier'
      ];

      requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          this.log(`依赖 ${dep} 已配置`);
        } else {
          this.errors.push(`缺少生产依赖: ${dep}`);
        }
      });

      requiredDevDeps.forEach(dep => {
        if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
          this.log(`开发依赖 ${dep} 已配置`);
        } else {
          this.errors.push(`缺少开发依赖: ${dep}`);
        }
      });

      // 验证必要的脚本
      const requiredScripts = ['dev', 'build', 'start', 'lint', 'format'];
      requiredScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.log(`脚本 ${script} 已配置`);
        } else {
          this.errors.push(`缺少脚本: ${script}`);
        }
      });

    } catch (error) {
      this.errors.push(`package.json 解析错误: ${error.message}`);
    }
  }

  validateTypeScriptConfig() {
    this.log('验证 TypeScript 配置...');
    
    if (!this.validateFileExists('tsconfig.json', 'TypeScript 配置文件')) {
      return;
    }

    try {
      const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      
      // 验证关键配置
      const requiredOptions = ['target', 'module', 'moduleResolution', 'jsx'];
      requiredOptions.forEach(option => {
        if (tsconfig.compilerOptions && tsconfig.compilerOptions[option]) {
          this.log(`TypeScript 选项 ${option} 已配置`);
        } else {
          this.warnings.push(`建议配置 TypeScript 选项: ${option}`);
        }
      });

    } catch (error) {
      this.errors.push(`tsconfig.json 解析错误: ${error.message}`);
    }
  }

  validateTailwindConfig() {
    this.log('验证 Tailwind CSS 配置...');
    
    const configFiles = ['tailwind.config.js', 'tailwind.config.ts'];
    let found = false;
    
    for (const file of configFiles) {
      if (this.validateFileExists(file, 'Tailwind CSS 配置文件')) {
        found = true;
        break;
      }
    }
    
    if (!found) {
      this.errors.push('缺少 Tailwind CSS 配置文件 (tailwind.config.js 或 tailwind.config.ts)');
    }
  }

  validateESLintConfig() {
    this.log('验证 ESLint 配置...');
    
    const configFiles = ['.eslintrc.js', '.eslintrc.json', '.eslintrc.yml', 'eslint.config.js'];
    let found = false;
    
    for (const file of configFiles) {
      if (fs.existsSync(path.join(this.projectRoot, file))) {
        this.log(`ESLint 配置文件存在: ${file}`);
        found = true;
        break;
      }
    }
    
    if (!found) {
      this.errors.push('缺少 ESLint 配置文件');
    }
  }

  validateElectronForgeConfig() {
    this.log('验证 Electron Forge 配置...');
    
    const configFiles = ['forge.config.js', 'forge.config.ts'];
    let found = false;
    
    for (const file of configFiles) {
      if (fs.existsSync(path.join(this.projectRoot, file))) {
        this.log(`Electron Forge 配置文件存在: ${file}`);
        found = true;
        break;
      }
    }
    
    if (!found) {
      this.errors.push('缺少 Electron Forge 配置文件 (forge.config.js 或 forge.config.ts)');
    }
  }

  validateViteConfig() {
    this.log('验证 Vite 配置...');
    
    if (!this.validateFileExists('vite.config.ts', 'Vite 配置文件')) {
      return;
    }

    try {
      const viteConfigPath = path.join(this.projectRoot, 'vite.config.ts');
      const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
      
      // 检查是否包含React插件
      if (viteConfig.includes('@vitejs/plugin-react')) {
        this.log('Vite React 插件已配置');
      } else {
        this.errors.push('Vite 配置中缺少 React 插件');
      }

    } catch (error) {
      this.errors.push(`vite.config.ts 读取错误: ${error.message}`);
    }
  }

  validateProjectStructure() {
    this.log('验证项目结构...');
    
    const requiredDirs = [
      'src',
      'src/main',
      'src/renderer', 
      'src/shared',
      'src/web'
    ];

    const requiredFiles = [
      'src/main/main.ts',
      'src/main/preload.ts',
      'src/renderer/App.tsx',
      'src/renderer/index.tsx'
    ];

    requiredDirs.forEach(dir => {
      if (fs.existsSync(path.join(this.projectRoot, dir))) {
        this.log(`目录存在: ${dir}`);
      } else {
        this.errors.push(`缺少目录: ${dir}`);
      }
    });

    requiredFiles.forEach(file => {
      this.validateFileExists(file, `核心文件`);
    });
  }

  validateDependencyInstallation() {
    this.log('验证依赖安装状态...');
    
    if (!fs.existsSync(path.join(this.projectRoot, 'node_modules'))) {
      this.errors.push('node_modules 目录不存在，需要运行 npm install');
      return;
    }

    // 检查关键依赖是否已安装
    const criticalDeps = ['react', 'electron', 'typescript', 'vite'];
    criticalDeps.forEach(dep => {
      const depPath = path.join(this.projectRoot, 'node_modules', dep);
      if (fs.existsSync(depPath)) {
        this.log(`依赖已安装: ${dep}`);
      } else {
        this.errors.push(`依赖未安装: ${dep}`);
      }
    });
  }

  async run() {
    this.log('开始验证 WeatherDuck 项目初始化状态...');
    this.log('='.repeat(50));

    // 执行所有验证
    this.validatePackageJson();
    this.validateTypeScriptConfig();
    this.validateTailwindConfig();
    this.validateESLintConfig();
    this.validateElectronForgeConfig();
    this.validateViteConfig();
    this.validateProjectStructure();
    this.validateDependencyInstallation();

    // 输出结果
    this.log('='.repeat(50));
    this.log('验证完成');
    
    if (this.warnings.length > 0) {
      this.log(`发现 ${this.warnings.length} 个警告:`);
      this.warnings.forEach(warning => this.log(warning, 'warning'));
    }

    if (this.errors.length > 0) {
      this.log(`发现 ${this.errors.length} 个错误:`);
      this.errors.forEach(error => this.log(error, 'error'));
      this.log('项目初始化验证失败 ❌', 'error');
      process.exit(1);
    } else {
      this.log('项目初始化验证成功 ✅');
      process.exit(0);
    }
  }
}

// 运行验证
const validator = new ProjectValidator();
validator.run().catch(error => {
  console.error('验证过程中发生错误:', error);
  process.exit(1);
});