#!/usr/bin/env python3
"""
Spec Lint - 天气鸭项目规范检查工具
检查代码是否符合天气鸭项目开发指导文档中的规范要求

使用方法:
    python tools/spec-lint.py
    python tools/spec-lint.py --spec-dir .qoder/rules --target-dir src
    python tools/spec-lint.py --stage 阶段3

遵循规范:
- requirements-spec.zh-CN.md
- naming-conventions.zh-CN.md
- error-handling-spec.zh-CN.md
- testing-spec.zh-CN.md
- security-spec.zh-CN.md
- workflow-spec.zh-CN.md
- api-design-spec.zh-CN.md
"""

import os
import re
import sys
import argparse
import subprocess
from pathlib import Path
from typing import List, Dict, Set
from dataclasses import dataclass


@dataclass
class LintIssue:
    """Lint 检查问题"""
    file_path: str
    line_number: int
    rule: str
    severity: str  # ERROR, WARNING, INFO
    message: str


class SpecLinter:
    """规范检查器"""
    
    def __init__(self, spec_dir: Path, target_dir: Path):
        self.spec_dir = spec_dir
        self.target_dir = target_dir
        self.issues: List[LintIssue] = []
        self.enabled_rules = self._load_enabled_rules()
    
    def _load_enabled_rules(self) -> Dict[str, Set[str]]:
        """加载启用的规则"""
        enabled = {}
        
        spec_files = [
            'requirements-spec.zh-CN.md',
            'naming-conventions.zh-CN.md',
            'error-handling-spec.zh-CN.md',
            'testing-spec.zh-CN.md',
            'security-spec.zh-CN.md',
            'workflow-spec.zh-CN.md',
            'api-design-spec.zh-CN.md',
            'git-workflow-spec.zh-CN.md'
        ]
        
        for spec_file in spec_files:
            spec_path = self.spec_dir / spec_file
            if spec_path.exists():
                enabled[spec_file] = self._parse_enabled_rules(spec_path)
        
        return enabled
    
    def _parse_enabled_rules(self, spec_path: Path) -> Set[str]:
        """解析启用的规则（适配.qoder/rules/格式）"""
        enabled = set()
        
        with open(spec_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # 匹配 .qoder/rules/ 格式
            # 格式1: ## [规则 N] 标题 [ENABLED]
            # 格式2: ## [约定 N] 标题 [ENABLED]
            # 注意:在规范文件中,[ENABLED]标记在标题后面
            pattern = r'##\s*\[(?:规则|约定)\s+(\d+)\]\s+[^\[\n]+\[ENABLED\]'
            matches = re.finditer(pattern, content, re.MULTILINE)
            
            for match in matches:
                rule_num = match.group(1)
                enabled.add(f"RULE_{rule_num}")
        
        return enabled
    
    def check_naming_conventions(self, file_path: Path):
        """检查命名约定"""
        if file_path.suffix not in ['.ts', '.tsx', '.js', '.jsx']:
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        for i, line in enumerate(lines, 1):
            # 检查组件命名 (CONVENTION 6) - PascalCase
            if 'RULE_6' in self.enabled_rules.get('naming-conventions.zh-CN.md', set()):
                component_pattern = r'(?:export (?:const|function))\s+([A-Z][a-zA-Z0-9]*)'
                match = re.search(component_pattern, line)
                if match:
                    comp_name = match.group(1)
                    # 验证是否严格遵循PascalCase
                    if comp_name[0].isupper():
                        continue  # 符合规范
            
            # 检查函数命名 (CONVENTION 2) - camelCase
            if 'RULE_2' in self.enabled_rules.get('naming-conventions.zh-CN.md', set()):
                func_pattern = r'(?:export )?(?:const|function)\s+([a-z][a-zA-Z0-9]*)'
                match = re.search(func_pattern, line)
                if match:
                    func_name = match.group(1)
                    # 检查是否使用下划线（不符合camelCase）
                    if '_' in func_name and not func_name.startswith('_'):
                        self.issues.append(LintIssue(
                            file_path=str(file_path),
                            line_number=i,
                            rule='naming-conventions CONVENTION 2',
                            severity='WARNING',
                            message=f'函数 {func_name} 应使用 camelCase 命名，避免使用下划线'
                        ))
            
            # 检查常量命名 (CONVENTION 4) - UPPER_SNAKE_CASE
            if 'RULE_4' in self.enabled_rules.get('naming-conventions.zh-CN.md', set()):
                const_pattern = r'export const\s+([A-Z][A-Z0-9_]*)\s*='
                match = re.search(const_pattern, line)
                if match:
                    const_name = match.group(1)
                    # 验证是否全大写加下划线
                    if not re.match(r'^[A-Z][A-Z0-9_]*$', const_name):
                        self.issues.append(LintIssue(
                            file_path=str(file_path),
                            line_number=i,
                            rule='naming-conventions CONVENTION 4',
                            severity='WARNING',
                            message=f'常量 {const_name} 应使用 UPPER_SNAKE_CASE 命名'
                        ))
    
    def check_security(self, file_path: Path):
        """检查安全问题"""
        if file_path.suffix not in ['.ts', '.tsx', '.js', '.jsx']:
            return
        
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            lines = content.split('\n')
        
        # 检查硬编码密钥 (RULE 8 - 环境配置)
        if 'RULE_8' in self.enabled_rules.get('security-spec.zh-CN.md', set()):
            # 更精确的硬编码密钥检测模式
            suspicious_patterns = [
                # API密钥模式(长度>=20的字符串)
                (r'(?:API_?KEY|APIKEY)\s*[=:]\s*["\'][a-zA-Z0-9_-]{20,}["\']', '检测到可能硬编码的API密钥'),
                # 密钥/令牌模式
                (r'(?:SECRET|TOKEN|PASSWORD)\s*[=:]\s*["\'][^"\' \n]{10,}["\']', '检测到可能硬编码的密钥或令牌'),
                # JWT令牌模式
                (r'["\']eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+["\']', '检测到可能硬编码的JWT令牌'),
            ]
            
            for i, line in enumerate(lines, 1):
                # 跳过注释行
                stripped = line.strip()
                if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
                    continue
                
                # 跳过环境变量使用
                if 'import.meta.env' in line or 'process.env' in line or 'Deno.env' in line:
                    continue
                    
                for pattern, message in suspicious_patterns:
                    if re.search(pattern, line, re.IGNORECASE):
                        # 排除示例代码和测试代码中的占位符
                        if 'your-api-key' in line.lower() or 'example' in line.lower():
                            continue
                        
                        self.issues.append(LintIssue(
                            file_path=str(file_path),
                            line_number=i,
                            rule='security-spec RULE 8',
                            severity='ERROR',
                            message=f'{message},应使用环境变量(import.meta.env)'
                        ))
                        break  # 每行只报告一次
        
        # 检查输入验证 (RULE 1)
        if 'RULE_1' in self.enabled_rules.get('security-spec.zh-CN.md', set()):
            # 检查直接的innerHTML使用(XSS风险)
            if re.search(r'\.innerHTML\s*=\s*[^D]', content):
                for i, line in enumerate(lines, 1):
                    if '.innerHTML' in line and 'DOMPurify' not in line and 'sanitize' not in line:
                        self.issues.append(LintIssue(
                            file_path=str(file_path),
                            line_number=i,
                            rule='security-spec RULE 1',
                            severity='WARNING',
                            message='使用innerHTML可能导致XSS,建议使用textContent或DOMPurify.sanitize()'
                        ))
    
    def check_error_handling(self, file_path: Path):
        """检查错误处理"""
        if file_path.suffix not in ['.ts', '.tsx', '.js', '.jsx']:
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
        
        # 检查空 catch 块 (RULE 5)
        if 'RULE_5' in self.enabled_rules.get('error-handling-spec.zh-CN.md', set()):
            # 检测空 catch 块或只有注释的catch块
            catch_pattern = r'catch\s*\([^)]*\)\s*\{\s*(?://.*)?\s*\}'
            if re.search(catch_pattern, content):
                self.issues.append(LintIssue(
                    file_path=str(file_path),
                    line_number=0,
                    rule='error-handling-spec RULE 5',
                    severity='ERROR',
                    message='检测到空 catch 块，应记录错误或重新抛出'
                ))
        
        # 检查自定义错误类 (RULE 2)
        if 'RULE_2' in self.enabled_rules.get('error-handling-spec.zh-CN.md', set()):
            # 检查是否使用自定义错误类
            if 'extends Error' in content or 'extends BaseError' in content:
                # 符合规范，不报告
                pass
            else:
                # 检查是否有throw new Error，建议使用自定义错误类
                if 'throw new Error' in content:
                    for i, line in enumerate(lines, 1):
                        if 'throw new Error' in line:
                            self.issues.append(LintIssue(
                                file_path=str(file_path),
                                line_number=i,
                                rule='error-handling-spec RULE 2',
                                severity='WARNING',
                                message='建议使用自定义错误类代替 Error'
                            ))
    
    def check_completeness(self, file_path: Path):
        """检查代码完整性"""
        if file_path.suffix not in ['.ts', '.tsx', '.js', '.jsx']:
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # 检查 TODO/FIXME/占位符 (RULE 1)
        if 'RULE_1' in self.enabled_rules.get('requirements-spec.zh-CN.md', set()):
            for i, line in enumerate(lines, 1):
                # 检查TODO/FIXME标记
                if re.search(r'(TODO|FIXME|XXX|HACK):', line, re.IGNORECASE):
                    self.issues.append(LintIssue(
                        file_path=str(file_path),
                        line_number=i,
                        rule='requirements-spec RULE 1',
                        severity='WARNING',
                        message='代码包含 TODO/FIXME，应在提交前完成'
                    ))
                
                # 检查占位符
                if 'your-' in line.lower() or 'placeholder' in line.lower():
                    self.issues.append(LintIssue(
                        file_path=str(file_path),
                        line_number=i,
                        rule='requirements-spec RULE 1',
                        severity='ERROR',
                        message='检测到占位符，必须替换为实际值'
                    ))
        
        # 检查import语句是否正确 (RULE 10)
        if 'RULE_10' in self.enabled_rules.get('requirements-spec.zh-CN.md', set()):
            for i, line in enumerate(lines, 1):
                # 检查相对路径导入
                if 'import' in line and ('../' in line or './' in line):
                    # 检查是否使用了路径别名
                    if not ('@/' in line or '@components/' in line or '@hooks/' in line):
                        # 相对路径过深
                        if line.count('../') > 2:
                            self.issues.append(LintIssue(
                                file_path=str(file_path),
                                line_number=i,
                                rule='requirements-spec RULE 10',
                                severity='INFO',
                                message='建议使用路径别名(@/)代替深层相对路径'
                            ))
    
    def lint_file(self, file_path: Path):
        """检查单个文件"""
        self.check_naming_conventions(file_path)
        self.check_security(file_path)
        self.check_error_handling(file_path)
        self.check_completeness(file_path)
    
    def lint_directory(self):
        """检查整个目录"""
        extensions = {'.ts', '.tsx', '.js', '.jsx'}
        
        for file_path in self.target_dir.rglob('*'):
            if file_path.is_file() and file_path.suffix in extensions:
                # 跳过 node_modules, dist, build 等目录
                if any(part in file_path.parts for part in ['node_modules', 'dist', 'build', 'dist-electron', 'dist-web', '.git']):
                    continue
                
                self.lint_file(file_path)
    
    def generate_markdown_report(self, stage: str) -> bool:
        """生成Markdown格式报告（调用spec-report.js）"""
        try:
            # 获取项目根目录
            project_root = Path(__file__).parent.parent
            report_script = project_root / 'tools' / 'spec-report.js'
            
            if not report_script.exists():
                print(f"⚠️  警告: 报告生成工具不存在: {report_script}")
                return False
            
            print(f"\n📝 正在生成 Markdown 格式报告...")
            
            # 调用 Node.js 生成报告
            result = subprocess.run(
                ['node', str(report_script), '--stage', stage],
                cwd=str(project_root),
                capture_output=True,
                text=True,
                encoding='utf-8'
            )
            
            if result.returncode == 0:
                # 从输出中提取报告路径
                for line in result.stdout.split('\n'):
                    if 'report.md' in line or '报告已生成' in line:
                        print(f"✅ {line.strip()}")
                return True
            else:
                print(f"⚠️  报告生成失败: {result.stderr}")
                return False
                
        except FileNotFoundError:
            print("⚠️  警告: Node.js 未安装或不在 PATH 中，跳过报告生成")
            return False
        except Exception as e:
            print(f"⚠️  报告生成出错: {e}")
            return False
    
    def report(self, generate_report: bool = False, stage: str = '阶段1') -> int:
        """输出报告并返回退出码"""
        if not self.issues:
            print("\n✅ 所有检查通过！未发现问题。")
            print(f"\n已加载 {len(self.enabled_rules)} 个规范文件")
            for spec_file, rules in self.enabled_rules.items():
                print(f"  - {spec_file}: {len(rules)} 条规则")
            
            # 生成报告
            if generate_report:
                self.generate_markdown_report(stage)
            
            return 0
        
        # 按严重程度分组
        errors = [i for i in self.issues if i.severity == 'ERROR']
        warnings = [i for i in self.issues if i.severity == 'WARNING']
        infos = [i for i in self.issues if i.severity == 'INFO']
        
        print(f"\n发现 {len(self.issues)} 个问题:")
        print(f"  ❌ 错误: {len(errors)}")
        print(f"  ⚠️  警告: {len(warnings)}")
        print(f"  ℹ️  提示: {len(infos)}\n")
        
        # 按文件分组输出
        issues_by_file: Dict[str, List[LintIssue]] = {}
        for issue in self.issues:
            if issue.file_path not in issues_by_file:
                issues_by_file[issue.file_path] = []
            issues_by_file[issue.file_path].append(issue)
        
        for file_path, file_issues in sorted(issues_by_file.items()):
            rel_path = os.path.relpath(file_path, self.target_dir)
            print(f"\n📄 {rel_path}")
            
            # 按严重程度排序
            severity_order = {'ERROR': 0, 'WARNING': 1, 'INFO': 2}
            sorted_issues = sorted(file_issues, key=lambda x: (severity_order[x.severity], x.line_number))
            
            for issue in sorted_issues:
                if issue.severity == 'ERROR':
                    icon = "❌"
                elif issue.severity == 'WARNING':
                    icon = "⚠️"
                else:
                    icon = "ℹ️"
                
                line_info = f"L{issue.line_number}" if issue.line_number > 0 else "全局"
                print(f"  {icon} {line_info:6} [{issue.rule}]")
                print(f"           {issue.message}")
        
        # 输出总结
        print("\n" + "="*60)
        if errors:
            print(f"❌ 发现 {len(errors)} 个错误,必须修复")
        if warnings:
            print(f"⚠️  发现 {len(warnings)} 个警告,建议修复")
        if infos:
            print(f"ℹ️  发现 {len(infos)} 个提示,可选优化")
        print("="*60 + "\n")
        
        # 生成报告
        if generate_report:
            self.generate_markdown_report(stage)
        
        return 1 if errors else 0


def main():
    # 设置输出编码为UTF-8（Windows兼容）
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    parser = argparse.ArgumentParser(
        description='天气鸭项目规范检查工具 - 检查代码是否符合开发指导文档规范'
    )
    parser.add_argument(
        '--spec-dir',
        type=Path,
        default=Path(__file__).parent.parent / '.qoder' / 'rules',
        help='规范文件目录 (默认: .qoder/rules)'
    )
    parser.add_argument(
        '--target-dir',
        type=Path,
        default=Path(__file__).parent.parent / 'src',
        help='要检查的目标目录 (默认: src)'
    )
    parser.add_argument(
        '--stage',
        type=str,
        default='阶段1',
        help='开发阶段名称 (默认: 阶段1)'
    )
    parser.add_argument(
        '--generate-report',
        action='store_true',
        help='检查完成后自动生成 Markdown 格式报告'
    )
    
    args = parser.parse_args()
    
    if not args.spec_dir.exists():
        print(f"❌ 错误: 规范目录不存在: {args.spec_dir}", file=sys.stderr)
        return 1
    
    if not args.target_dir.exists():
        print(f"❌ 错误: 目标目录不存在: {args.target_dir}", file=sys.stderr)
        return 1
    
    print(f"🔍 检查目录: {args.target_dir}")
    print(f"📋 规范目录: {args.spec_dir}\n")
    
    linter = SpecLinter(args.spec_dir, args.target_dir)
    linter.lint_directory()
    
    return linter.report(generate_report=args.generate_report, stage=args.stage)


if __name__ == '__main__':
    sys.exit(main())
