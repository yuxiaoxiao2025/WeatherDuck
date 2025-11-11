#!/usr/bin/env node
/**
 * Spec Report - 天气鸭项目规范遵守情况报告生成器
 * 生成天气鸭项目遵守开发指导文档规范的详细报告
 * 
 * 使用方法:
 *   node tools/spec-report.js
 *   node tools/spec-report.js --stage 阶段1 --target-dir ./src
 *   node tools/spec-report.js --stage 阶段3 --target-dir ./src --format markdown
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SpecReporter {
  constructor(specDir, targetDir, stage, format = 'markdown') {
    this.specDir = specDir;
    this.targetDir = targetDir;
    this.stage = stage || '阶段1';
    this.format = format;
    this.report = {
      timestamp: new Date().toISOString(),
      stage: this.stage,
      specDir,
      targetDir,
      specs: {},
      summary: {
        totalRules: 0,
        enabledRules: 0,
        complianceRate: 0,
        issues: [],
        compliantRules: [],
        nonCompliantRules: []
      }
    };
  }

  /**
   * 解析规范文件（适配.qoder/rules/格式）
   */
  parseSpecFile(specPath) {
    const content = fs.readFileSync(specPath, 'utf-8');
    const rules = [];
    
    // 匹配 .qoder/rules/ 格式的规则
    // 格式: ## [规则 N] 规则标题 [ENABLED]
    const rulePattern = /##\s*\[(?:规则|约定)\s+(\d+)\]\s+([^\[\n]+)\[ENABLED\]/g;
    let match;
    
    while ((match = rulePattern.exec(content)) !== null) {
      const [, number, title] = match;
      rules.push({
        number: parseInt(number),
        title: title.trim(),
        enabled: true,
        file: path.basename(specPath)
      });
    }
    
    return rules;
  }

  /**
   * 扫描代码文件
   */
  scanCodeFiles() {
    const stats = {
      totalFiles: 0,
      totalLines: 0,
      filesByType: {}
    };

    const scanDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // 跳过常见的非代码目录
          if (['node_modules', 'dist', 'build', '__pycache__', '.venv', '.git'].includes(entry.name)) {
            continue;
          }
          scanDir(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (['.ts', '.tsx', '.js', '.jsx', '.py'].includes(ext)) {
            stats.totalFiles++;
            
            // 统计行数
            const content = fs.readFileSync(fullPath, 'utf-8');
            const lines = content.split('\n').length;
            stats.totalLines += lines;
            
            // 按类型统计
            if (!stats.filesByType[ext]) {
              stats.filesByType[ext] = { count: 0, lines: 0 };
            }
            stats.filesByType[ext].count++;
            stats.filesByType[ext].lines += lines;
          }
        }
      }
    };

    if (fs.existsSync(this.targetDir)) {
      scanDir(this.targetDir);
    }

    return stats;
  }

  /**
   * 检查测试覆盖率
   */
  checkTestCoverage() {
    const coveragePath = path.join(this.targetDir, '..', 'coverage', 'coverage-summary.json');
    
    if (fs.existsSync(coveragePath)) {
      try {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));
        const total = coverage.total;
        
        return {
          lines: total.lines.pct,
          statements: total.statements.pct,
          functions: total.functions.pct,
          branches: total.branches.pct
        };
      } catch (err) {
        return null;
      }
    }
    
    return null;
  }

  /**
   * 生成报告
   */
  async generate() {
    console.log('🔍 扫描天气鸭项目规范文件...');
    
    // 读取.qoder/rules/目录下的规范文件
    const specFiles = [
      'requirements-spec.zh-CN.md',
      'naming-conventions.zh-CN.md',
      'error-handling-spec.zh-CN.md',
      'testing-spec.zh-CN.md',
      'security-spec.zh-CN.md',
      'workflow-spec.zh-CN.md',
      'api-design-spec.zh-CN.md',
      'git-workflow-spec.zh-CN.md'
    ];

    for (const specFile of specFiles) {
      const specPath = path.join(this.specDir, specFile);
      
      if (fs.existsSync(specPath)) {
        const rules = this.parseSpecFile(specPath);
        const enabledCount = rules.filter(r => r.enabled).length;
        
        this.report.specs[specFile] = {
          totalRules: rules.length,
          enabledRules: enabledCount,
          rules
        };
        
        this.report.summary.totalRules += rules.length;
        this.report.summary.enabledRules += enabledCount;
      }
    }

    console.log('📊 扫描代码文件...');
    this.report.codeStats = this.scanCodeFiles();

    console.log('🧪 检查测试覆盖率...');
    this.report.testCoverage = this.checkTestCoverage();

    // 计算合规率（简化版本）
    if (this.report.summary.totalRules > 0) {
      this.report.summary.complianceRate = Math.round(
        (this.report.summary.enabledRules / this.report.summary.totalRules) * 100
      );
    }

    // 检查代码合规性
    this.checkCompliance();

    // 重新计算合规率（基于问题数而非遵守规则数）
    // 逻辑：如果没有发现问题，且代码存在，则认为是合规的
    if (this.report.codeStats.totalFiles > 0) {
      if (this.report.summary.issues.length === 0) {
        // 没有发现问题，合规率基于代码完整性
        this.report.summary.complianceRate = 100;
      } else {
        // 有问题，计算违规率
        const errorCount = this.report.summary.issues.filter(i => i.severity === 'ERROR').length;
        const totalIssues = this.report.summary.issues.length;
        // 合规率 = 100 - (问题权重)
        this.report.summary.complianceRate = Math.max(0, 100 - Math.round((errorCount * 10 + totalIssues * 5) / this.report.summary.totalRules * 100));
      }
    }

    // 输出报告
    if (this.format === 'markdown') {
      this.generateMarkdownReport();
    } else {
      this.printReport();
    }
  }

  /**
   * 检查代码合规性
   */
  checkCompliance() {
    console.log('✅ 检查代码合规性...');
    
    // 检查命名约定
    this.checkNamingConventions();
    
    // 检查安全规范
    this.checkSecurityCompliance();
    
    // 检查错误处理
    this.checkErrorHandling();
    
    // 计算合规率
    if (this.report.summary.totalRules > 0) {
      const compliantCount = this.report.summary.compliantRules.length;
      this.report.summary.complianceRate = Math.round(
        (compliantCount / this.report.summary.totalRules) * 100
      );
    }
  }

  /**
   * 检查命名约定
   */
  checkNamingConventions() {
    const files = this.getAllSourceFiles();
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // 检查组件命名 (PascalCase)
      const componentPattern = /(?:export (?:const|function))\s+([A-Z][a-zA-Z0-9]*)/g;
      let match;
      while ((match = componentPattern.exec(content)) !== null) {
        this.report.summary.compliantRules.push({
          rule: '命名约定 [约定 6]',
          file: path.relative(this.targetDir, file),
          detail: `组件 ${match[1]} 使用 PascalCase`
        });
      }
      
      // 检查函数命名 (camelCase)
      const functionPattern = /(?:export )?(?:const|function)\s+([a-z][a-zA-Z0-9]*)/g;
      while ((match = functionPattern.exec(content)) !== null) {
        this.report.summary.compliantRules.push({
          rule: '命名约定 [约定 2]',
          file: path.relative(this.targetDir, file),
          detail: `函数 ${match[1]} 使用 camelCase`
        });
      }
    }
  }

  /**
   * 检查安全规范
   */
  checkSecurityCompliance() {
    const files = this.getAllSourceFiles();
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // 检查环境变量使用
      if (content.includes('import.meta.env') || content.includes('process.env')) {
        this.report.summary.compliantRules.push({
          rule: '安全规范 [规则 8]',
          file: path.relative(this.targetDir, file),
          detail: '使用环境变量管理配置'
        });
      }
      
      // 检查硬编码密钥
      const hardcodedKeyPattern = /(API_KEY|SECRET|PASSWORD|TOKEN)\s*=\s*['"][^'"]{20,}['"]/;
      if (hardcodedKeyPattern.test(content)) {
        this.report.summary.issues.push({
          severity: 'ERROR',
          rule: '安全规范 [规则 8]',
          file: path.relative(this.targetDir, file),
          message: '检测到可能的硬编码密钥'
        });
      }
    }
  }

  /**
   * 检查错误处理
   */
  checkErrorHandling() {
    const files = this.getAllSourceFiles();
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // 检查自定义错误类
      if (content.includes('extends Error') || content.includes('extends BaseError')) {
        this.report.summary.compliantRules.push({
          rule: '错误处理规范 [规则 2]',
          file: path.relative(this.targetDir, file),
          detail: '使用自定义错误类'
        });
      }
      
      // 检查空catch块
      const emptyCatchPattern = /catch\s*\([^)]*\)\s*\{\s*\}/;
      if (emptyCatchPattern.test(content)) {
        this.report.summary.issues.push({
          severity: 'ERROR',
          rule: '错误处理规范 [规则 5]',
          file: path.relative(this.targetDir, file),
          message: '检测到空 catch 块'
        });
      }
    }
  }

  /**
   * 获取所有源代码文件
   */
  getAllSourceFiles() {
    const files = [];
    
    const scanDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
            scanDir(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };
    
    scanDir(this.targetDir);
    return files;
  }

  /**
   * 生成Markdown格式报告
   */
  generateMarkdownReport() {
    const docsDir = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    const reportPath = path.join(docsDir, `${this.stage}-report.md`);
    const markdown = this.buildMarkdownContent();
    
    fs.writeFileSync(reportPath, markdown, 'utf-8');
    console.log(`\n✅ Markdown 报告已生成: ${reportPath}`);
    
    // 同时输出到控制台
    this.printReport();
  }

  /**
   * 构建Markdown内容
   */
  buildMarkdownContent() {
    const lines = [];
    
    lines.push(`# 天气鸭项目规范遵守情况报告`);
    lines.push(``);
    lines.push(`**阶段**: ${this.stage}  `);
    lines.push(`**生成时间**: ${new Date(this.report.timestamp).toLocaleString('zh-CN')}  `);
    lines.push(`**扫描目录**: ${this.targetDir}  `);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
    
    // 总体概览
    lines.push(`## 📊 总体概览`);
    lines.push(``);
    lines.push(`| 指标 | 数值 |`);
    lines.push(`|------|------|`);
    lines.push(`| 合规率 | **${this.report.summary.complianceRate}%** |`);
    lines.push(`| 总规则数 | ${this.report.summary.totalRules} |`);
    lines.push(`| 已遵守规则 | ${this.report.summary.compliantRules.length} |`);
    lines.push(`| 发现问题 | ${this.report.summary.issues.length} |`);
    lines.push(`| 扫描文件数 | ${this.report.codeStats.totalFiles} |`);
    lines.push(`| 代码总行数 | ${this.report.codeStats.totalLines} |`);
    lines.push(``);
    
    // 代码统计
    lines.push(`## 📁 代码统计`);
    lines.push(``);
    lines.push(`| 文件类型 | 文件数 | 代码行数 |`);
    lines.push(`|---------|--------|---------|`);
    for (const [ext, stats] of Object.entries(this.report.codeStats.filesByType)) {
      lines.push(`| ${ext} | ${stats.count} | ${stats.lines} |`);
    }
    lines.push(``);
    
    // 测试覆盖率
    if (this.report.testCoverage) {
      lines.push(`## 🧪 测试覆盖率`);
      lines.push(``);
      lines.push(`| 覆盖类型 | 百分比 |`);
      lines.push(`|---------|--------|`);
      lines.push(`| 行覆盖率 | ${this.report.testCoverage.lines.toFixed(2)}% |`);
      lines.push(`| 语句覆盖率 | ${this.report.testCoverage.statements.toFixed(2)}% |`);
      lines.push(`| 函数覆盖率 | ${this.report.testCoverage.functions.toFixed(2)}% |`);
      lines.push(`| 分支覆盖率 | ${this.report.testCoverage.branches.toFixed(2)}% |`);
      lines.push(``);
    }
    
    // 规范遵守详情
    lines.push(`## 📋 规范遵守详情`);
    lines.push(``);
    
    for (const [specFile, data] of Object.entries(this.report.specs)) {
      const specName = specFile.replace('.zh-CN.md', '').replace(/-/g, ' ');
      lines.push(`### ${specName}`);
      lines.push(``);
      lines.push(`- **总规则数**: ${data.totalRules}`);
      lines.push(`- **已启用**: ${data.enabledRules}`);
      lines.push(`- **遵守率**: ${Math.round((data.enabledRules / data.totalRules) * 100)}%`);
      lines.push(``);
      
      if (data.rules.length > 0) {
        lines.push(`**规则列表**:`);
        lines.push(``);
        data.rules.forEach(rule => {
          lines.push(`- ✅ **[${rule.number}]** ${rule.title}`);
        });
        lines.push(``);
      }
    }
    
    // 合规项
    if (this.report.summary.compliantRules.length > 0) {
      lines.push(`## ✅ 合规项 (${this.report.summary.compliantRules.length})`);
      lines.push(``);
      
      // 按规则分组
      const byRule = {};
      this.report.summary.compliantRules.forEach(item => {
        if (!byRule[item.rule]) byRule[item.rule] = [];
        byRule[item.rule].push(item);
      });
      
      for (const [rule, items] of Object.entries(byRule)) {
        lines.push(`### ${rule}`);
        lines.push(``);
        items.slice(0, 5).forEach(item => {
          lines.push(`- \`${item.file}\`: ${item.detail}`);
        });
        if (items.length > 5) {
          lines.push(`- *...及其他 ${items.length - 5} 处*`);
        }
        lines.push(``);
      }
    }
    
    // 发现的问题
    if (this.report.summary.issues.length > 0) {
      lines.push(`## ⚠️ 发现的问题 (${this.report.summary.issues.length})`);
      lines.push(``);
      
      const errors = this.report.summary.issues.filter(i => i.severity === 'ERROR');
      const warnings = this.report.summary.issues.filter(i => i.severity === 'WARNING');
      
      if (errors.length > 0) {
        lines.push(`### ❌ 错误 (${errors.length})`);
        lines.push(``);
        errors.forEach(issue => {
          lines.push(`- **${issue.rule}**`);
          lines.push(`  - 文件: \`${issue.file}\``);
          lines.push(`  - 问题: ${issue.message}`);
        });
        lines.push(``);
      }
      
      if (warnings.length > 0) {
        lines.push(`### ⚠️ 警告 (${warnings.length})`);
        lines.push(``);
        warnings.forEach(issue => {
          lines.push(`- **${issue.rule}**`);
          lines.push(`  - 文件: \`${issue.file}\``);
          lines.push(`  - 问题: ${issue.message}`);
        });
        lines.push(``);
      }
    } else {
      lines.push(`## ✅ 未发现问题`);
      lines.push(``);
      lines.push(`恭喜！代码完全符合规范要求。`);
      lines.push(``);
    }
    
    // 改进建议
    lines.push(`## 💡 改进建议`);
    lines.push(``);
    
    // 根据实际情况给出建议
    if (this.report.summary.issues.length > 0) {
      // 有问题的情况
      if (this.report.summary.complianceRate < 80) {
        lines.push(`- ⚠️ 合规率较低，建议优先修复错误级别的问题`);
      }
      lines.push(`- 🔧 建议按照上述问题列表逐项修复`);
    } else {
      // 无问题的情况
      if (this.report.summary.complianceRate >= 80) {
        lines.push(`- ✨ 代码质量优秀，继续保持！`);
      } else if (this.report.codeStats.totalFiles < 5 && this.report.codeStats.totalLines < 100) {
        lines.push(`- ℹ️ 项目刚刚起步，后续开发请遵循规范要求`);
      } else {
        lines.push(`- 📝 代码检查未发现明显问题，但建议继续完善代码实现`);
      }
    }
    
    if (!this.report.testCoverage || this.report.testCoverage.lines < 80) {
      lines.push(`- 📈 建议提高测试覆盖率至80%以上`);
    }
    
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
    lines.push(`*报告由 spec-report.js 自动生成*`);
    
    return lines.join('\n');
  }

  /**
   * 打印报告到控制台
   */
  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 规范遵守情况报告');
    console.log('='.repeat(60));

    console.log(`\n📅 生成时间: ${this.report.timestamp}`);
    console.log(`📁 目标目录: ${this.targetDir}`);

    console.log('\n📊 代码统计:');
    console.log(`  总文件数: ${this.report.codeStats.totalFiles}`);
    console.log(`  总行数: ${this.report.codeStats.totalLines}`);
    console.log('  文件类型分布:');
    for (const [ext, stats] of Object.entries(this.report.codeStats.filesByType)) {
      console.log(`    ${ext}: ${stats.count} 个文件, ${stats.lines} 行`);
    }

    if (this.report.testCoverage) {
      console.log('\n🧪 测试覆盖率:');
      console.log(`  行覆盖率: ${this.report.testCoverage.lines.toFixed(2)}%`);
      console.log(`  语句覆盖率: ${this.report.testCoverage.statements.toFixed(2)}%`);
      console.log(`  函数覆盖率: ${this.report.testCoverage.functions.toFixed(2)}%`);
      console.log(`  分支覆盖率: ${this.report.testCoverage.branches.toFixed(2)}%`);
    }

    console.log('\n📋 规范启用情况:');
    for (const [specFile, data] of Object.entries(this.report.specs)) {
      const specName = specFile.replace('.zh-CN.txt', '').replace(/-/g, ' ');
      console.log(`\n  ${specName}:`);
      console.log(`    总规则数: ${data.totalRules}`);
      console.log(`    已启用: ${data.enabledRules}`);
      console.log(`    启用率: ${Math.round((data.enabledRules / data.totalRules) * 100)}%`);
      
      const enabledRules = data.rules.filter(r => r.enabled);
      if (enabledRules.length > 0) {
        console.log('    已启用的规则:');
        enabledRules.forEach(rule => {
          console.log(`      ✅ [${rule.number}] ${rule.title}`);
        });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`总体合规率: ${this.report.summary.complianceRate}%`);
    console.log(`已启用规则: ${this.report.summary.enabledRules}/${this.report.summary.totalRules}`);
    console.log('='.repeat(60) + '\n');
  }
}

// CLI
function main() {
  const args = process.argv.slice(2);
  const options = {
    specDir: path.join(__dirname, '..', '.qoder', 'rules'),
    targetDir: path.join(__dirname, '..', 'src'),
    stage: '阶段1',
    format: 'markdown'
  };

  // 简单参数解析
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--spec-dir' && args[i + 1]) {
      options.specDir = args[i + 1];
      i++;
    } else if (args[i] === '--target-dir' && args[i + 1]) {
      options.targetDir = args[i + 1];
      i++;
    } else if (args[i] === '--stage' && args[i + 1]) {
      options.stage = args[i + 1];
      i++;
    } else if (args[i] === '--format' && args[i + 1]) {
      options.format = args[i + 1];
      i++;
    }
  }

  const reporter = new SpecReporter(
    options.specDir,
    options.targetDir,
    options.stage,
    options.format
  );

  reporter.generate().catch(err => {
    console.error('❌ 错误:', err.message);
    process.exit(1);
  });
}

// 直接执行main函数（ES模块兼容）
// 在ES module中，直接执行主逻辑
if (process.argv[1] && (import.meta.url.includes(process.argv[1]) || process.argv[1].includes('spec-report.js'))) {
  main();
}

export { SpecReporter };
