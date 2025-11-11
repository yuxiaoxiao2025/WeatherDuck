#!/usr/bin/env python3
"""
天气鸭项目规范检查工具
检查代码是否符合项目定义的开发规范

使用方法:
    python weather-duck-lint.py
    python weather-duck-lint.py --target-dir ./src
    python weather-duck-lint.py --severity ERROR

适用规范:
- core/requirements-spec.zh-CN.md
- core/naming-conventions.zh-CN.md
- quality/error-handling-spec.zh-CN.md
- quality/testing-spec.zh-CN.md
- quality/security-spec.zh-CN.md
"""

import os
import re
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Set, Tuple
from dataclasses import dataclass
from datetime import datetime


@dataclass
class LintIssue:
    """Lint 检查问题"""
    file_path: str
    line_number: int
    rule_file: str  # 规范文件名
    rule_id: str    # 规则编号
    rule_name: str  # 规则名称
    severity: str   # ERROR, WARNING, INFO
    message: str
    suggestion: str = ""  # 修复建议


class WeatherDuckLinter:
    """天气鸭项目规范检查器"""
    
    def __init__(self, project_root: Path, target_dir: Path):
        self.project_root = project_root
        self.target_dir = target_dir
        self.issues: List[LintIssue] = []
        self.spec_rules = self._load_spec_rules()
        
    def _load_spec_rules(self) -> Dict[str, Dict]:
        """加载项目规范文件"""
        specs = {}
        
        spec_locations = {
            'requirements-spec.zh-CN.md': 'core',
            'naming-conventions.zh-CN.md': 'core',
            'workflow-spec.zh-CN.md': 'core',
            'error-handling-spec.zh-CN.md': 'quality',
            'testing-spec.zh-CN.md': 'quality',
            'security-spec.zh-CN.md': 'quality',
        }
        
        for spec_file, folder in spec_locations.items():
            spec_path = self.project_root / folder / spec_file
            if spec_path.exists():
                specs[spec_file] = self._parse_spec_file(spec_path)
        
        return specs
    
    def _parse_spec_file(self, spec_path: Path) -> Dict:
        """解析规范文件，提取启用的规则"""
        rules = {}
        
        with open(spec_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # 匹配规则或约定: ## [规则 N] 标题 [ENABLED]
            pattern = r'##\s*\[(?:规则|约定)\s+(\d+)\]\s+([^\[]+?)(?:\s+\[(ENABLED|DISABLED)\])?'
            matches = re.finditer(pattern, content, re.MULTILINE)
            
            for match in matches:
                rule_num = match.group(1)
                rule_title = match.group(2).strip()
                status = match.group(3) if match.group(3) else 'ENABLED'
                
                if status == 'ENABLED':
                    rules[f"RULE_{rule_num}"] = {
                        'number': rule_num,
                        'title': rule_title,
                        'enabled': True
                    }
        
        return rules
    
    def _is_enabled(self, spec_file: str, rule_id: str) -> bool:
        """检查规则是否启用"""
        return (spec_file in self.spec_rules and 
                rule_id in self.spec_rules[spec_file] and
                self.spec_rules[spec_file][rule_id]['enabled'])
    
    def check_requirements_spec(self, file_path: Path, content: str, lines: List[str]):
        """检查开发需求规范"""
        spec_file = 'requirements-spec.zh-CN.md'
        
        # [规则 1] 生成完整可运行代码 - 检查 TODO/FIXME
        if self._is_enabled(spec_file, 'RULE_1'):
            for i, line in enumerate(lines, 1):
                if re.search(r'(TODO|FIXME|XXX|HACK|WIP)[\s:]', line, re.IGNORECASE):
                    self.issues.append(LintIssue(
                        file_path=str(file_path.relative_to(self.project_root)),
                        line_number=i,
                        rule_file=spec_file,
                        rule_id='规则 1',
                        rule_name='生成完整可运行代码',
                        severity='WARNING',
                        message='代码包含 TODO/FIXME 标记，应在提交前完成实现',
                        suggestion='完成该部分实现或创建任务追踪'
                    ))
        
        # [规则 10] 确保代码成功编译 - 检查导入语句
        if self._is_enabled(spec_file, 'RULE_10'):
            # 检查可能的错误导入
            for i, line in enumerate(lines, 1):
                # TypeScript/JavaScript 导入
                if re.search(r'import\s+.*\s+from\s+["\']@/', line):
                    # 检查路径别名是否在配置中
                    pass  # 简化检查
        
        # [规则 13] 只使用真实存在的库 - 检查可疑的导入
        if self._is_enabled(spec_file, 'RULE_13'):
            suspicious_imports = [
                'super-magic-lib', 'fake-package', 'non-existent',
                'magic-helper', 'dummy-lib'
            ]
            for i, line in enumerate(lines, 1):
                for suspicious in suspicious_imports:
                    if suspicious in line and ('import' in line or 'require' in line):
                        self.issues.append(LintIssue(
                            file_path=str(file_path.relative_to(self.project_root)),
                            line_number=i,
                            rule_file=spec_file,
                            rule_id='规则 13',
                            rule_name='只使用真实存在的库',
                            severity='ERROR',
                            message=f'可能导入了不存在的库: {suspicious}',
                            suggestion='验证该库是否在 npm/package 注册表中存在'
                        ))
    
    def check_naming_conventions(self, file_path: Path, content: str, lines: List[str]):
        """检查命名约定"""
        spec_file = 'naming-conventions.zh-CN.md'
        is_ts = file_path.suffix in ['.ts', '.tsx', '.js', '.jsx']
        is_py = file_path.suffix == '.py'
        
        # [约定 1] 变量命名
        if self._is_enabled(spec_file, 'RULE_1'):
            for i, line in enumerate(lines, 1):
                # Python 应使用 snake_case
                if is_py:
                    # 检查驼峰命名的变量 (非类名)
                    pattern = r'^\s*([a-z]+[A-Z][a-zA-Z]*)\s*='
                    match = re.search(pattern, line)
                    if match and not line.strip().startswith('class '):
                        var_name = match.group(1)
                        self.issues.append(LintIssue(
                            file_path=str(file_path.relative_to(self.project_root)),
                            line_number=i,
                            rule_file=spec_file,
                            rule_id='约定 1',
                            rule_name='变量命名',
                            severity='WARNING',
                            message=f'Python 变量应使用 snake_case: {var_name}',
                            suggestion=f'改为: {self._to_snake_case(var_name)}'
                        ))
        
        # [约定 4] 常量命名 - 应使用 UPPER_SNAKE_CASE
        if self._is_enabled(spec_file, 'RULE_4'):
            for i, line in enumerate(lines, 1):
                # 检测常量定义但未使用大写
                if is_ts:
                    pattern = r'const\s+([a-z][a-zA-Z0-9_]*)\s*=\s*(?:["\'].*["\']|\d+|true|false)'
                    match = re.search(pattern, line)
                    if match and match.group(1).isupper() == False:
                        # 判断是否为配置常量 (值为字面量)
                        if re.search(r'=\s*(?:["\'][A-Z_]+["\']|\d+)', line):
                            const_name = match.group(1)
                            self.issues.append(LintIssue(
                                file_path=str(file_path.relative_to(self.project_root)),
                                line_number=i,
                                rule_file=spec_file,
                                rule_id='约定 4',
                                rule_name='常量命名',
                                severity='INFO',
                                message=f'常量建议使用 UPPER_SNAKE_CASE: {const_name}',
                                suggestion=f'改为: {self._to_upper_snake_case(const_name)}'
                            ))
        
        # [约定 9] 环境变量命名
        if self._is_enabled(spec_file, 'RULE_9'):
            for i, line in enumerate(lines, 1):
                # 检查 .env 文件或环境变量定义
                if file_path.name == '.env' or file_path.name.startswith('.env.'):
                    pattern = r'^([a-z][a-zA-Z0-9_]*)\s*='
                    match = re.search(pattern, line)
                    if match:
                        env_var = match.group(1)
                        self.issues.append(LintIssue(
                            file_path=str(file_path.relative_to(self.project_root)),
                            line_number=i,
                            rule_file=spec_file,
                            rule_id='约定 9',
                            rule_name='环境变量命名',
                            severity='WARNING',
                            message=f'环境变量应使用 UPPER_SNAKE_CASE: {env_var}',
                            suggestion=f'改为: {env_var.upper()}'
                        ))
    
    def check_security_spec(self, file_path: Path, content: str, lines: List[str]):
        """检查安全规范"""
        spec_file = 'security-spec.zh-CN.md'
        
        # [规则 8] 安全配置管理 - 不硬编码密钥
        if self._is_enabled(spec_file, 'RULE_8'):
            patterns = [
                (r'API_KEY\s*[=:]\s*["\'](?!process\.env|import\.meta\.env)[^"\']{10,}["\']', 'API 密钥'),
                (r'SECRET(?:_KEY)?\s*[=:]\s*["\'][^"\']{10,}["\']', '密钥'),
                (r'PASSWORD\s*[=:]\s*["\'][^"\']+["\']', '密码'),
                (r'TOKEN\s*[=:]\s*["\'][^"\']{20,}["\']', '令牌'),
            ]
            
            for i, line in enumerate(lines, 1):
                # 排除环境变量使用
                if 'process.env' in line or 'import.meta.env' in line or 'os.getenv' in line:
                    continue
                
                for pattern, key_type in patterns:
                    if re.search(pattern, line, re.IGNORECASE):
                        self.issues.append(LintIssue(
                            file_path=str(file_path.relative_to(self.project_root)),
                            line_number=i,
                            rule_file=spec_file,
                            rule_id='规则 8',
                            rule_name='安全配置管理',
                            severity='ERROR',
                            message=f'可能硬编码了{key_type}，应使用环境变量',
                            suggestion='使用 process.env.VARIABLE_NAME 或配置文件'
                        ))
        
        # [规则 1] 输入验证与清理 - SQL 注入风险
        if self._is_enabled(spec_file, 'RULE_1'):
            sql_injection_pattern = r'(SELECT|INSERT|UPDATE|DELETE).*?["\'][^"\']*\$\{.*?\}[^"\']*["\']'
            if re.search(sql_injection_pattern, content, re.IGNORECASE):
                self.issues.append(LintIssue(
                    file_path=str(file_path.relative_to(self.project_root)),
                    line_number=0,
                    rule_file=spec_file,
                    rule_id='规则 1',
                    rule_name='输入验证与清理',
                    severity='ERROR',
                    message='检测到可能的 SQL 注入风险（字符串拼接）',
                    suggestion='使用参数化查询或 ORM'
                ))
    
    def check_error_handling_spec(self, file_path: Path, content: str, lines: List[str]):
        """检查错误处理规范"""
        spec_file = 'error-handling-spec.zh-CN.md'
        
        # [规则 5] 避免空 catch 块
        if self._is_enabled(spec_file, 'RULE_5'):
            # 检测空 catch 块
            empty_catch_patterns = [
                r'catch\s*\([^)]*\)\s*\{\s*\}',
                r'catch\s*\([^)]*\)\s*\{\s*//.*?\n\s*\}',
            ]
            
            for pattern in empty_catch_patterns:
                if re.search(pattern, content):
                    self.issues.append(LintIssue(
                        file_path=str(file_path.relative_to(self.project_root)),
                        line_number=0,
                        rule_file=spec_file,
                        rule_id='规则 5',
                        rule_name='避免空 catch 块',
                        severity='ERROR',
                        message='检测到空 catch 块，应记录错误或重新抛出',
                        suggestion='添加 logger.error() 或 throw new CustomError()'
                    ))
        
        # [规则 3] 使用自定义错误类
        if self._is_enabled(spec_file, 'RULE_3'):
            # 检查是否直接 throw new Error
            generic_error_pattern = r'throw\s+new\s+Error\s*\('
            for i, line in enumerate(lines, 1):
                if re.search(generic_error_pattern, line):
                    self.issues.append(LintIssue(
                        file_path=str(file_path.relative_to(self.project_root)),
                        line_number=i,
                        rule_file=spec_file,
                        rule_id='规则 3',
                        rule_name='使用自定义错误类',
                        severity='INFO',
                        message='建议使用自定义错误类而非通用 Error',
                        suggestion='定义 BusinessError, ValidationError 等自定义错误类'
                    ))
    
    def check_testing_spec(self, file_path: Path, content: str, lines: List[str]):
        """检查测试规范"""
        spec_file = 'testing-spec.zh-CN.md'
        
        # 检查测试文件命名
        if file_path.suffix in ['.test.ts', '.test.tsx', '.test.js', '.spec.ts']:
            # [规则 1] 新功能必须有测试
            # 这里只是标记测试文件存在
            pass
    
    def _to_snake_case(self, name: str) -> str:
        """转换为 snake_case"""
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
    
    def _to_upper_snake_case(self, name: str) -> str:
        """转换为 UPPER_SNAKE_CASE"""
        return self._to_snake_case(name).upper()
    
    def lint_file(self, file_path: Path):
        """检查单个文件"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
            
            # 执行各项检查
            self.check_requirements_spec(file_path, content, lines)
            self.check_naming_conventions(file_path, content, lines)
            self.check_security_spec(file_path, content, lines)
            self.check_error_handling_spec(file_path, content, lines)
            self.check_testing_spec(file_path, content, lines)
            
        except Exception as e:
            print(f"⚠️  跳过文件 {file_path}: {e}")
    
    def lint_directory(self):
        """检查整个目录"""
        extensions = {'.ts', '.tsx', '.js', '.jsx', '.py', '.env'}
        exclude_dirs = {'node_modules', 'dist', 'build', '__pycache__', '.venv', '.git', 'coverage'}
        
        for file_path in self.target_dir.rglob('*'):
            if file_path.is_file():
                # 跳过排除的目录
                if any(excluded in file_path.parts for excluded in exclude_dirs):
                    continue
                
                # 检查文件扩展名或特殊文件名
                if file_path.suffix in extensions or file_path.name.startswith('.env'):
                    self.lint_file(file_path)
    
    def report(self, severity_filter: str | None = None) -> int:
        """输出报告并返回退出码"""
        # 过滤问题
        filtered_issues = self.issues
        if severity_filter:
            filtered_issues = [i for i in self.issues if i.severity == severity_filter]
        
        if not filtered_issues:
            print("✅ 所有检查通过！未发现问题。")
            return 0
        
        # 按严重程度分组
        errors = [i for i in filtered_issues if i.severity == 'ERROR']
        warnings = [i for i in filtered_issues if i.severity == 'WARNING']
        infos = [i for i in filtered_issues if i.severity == 'INFO']
        
        print("\n" + "="*80)
        print("🦆 天气鸭项目规范检查报告")
        print("="*80)
        print(f"\n发现 {len(filtered_issues)} 个问题:")
        print(f"  ❌ 错误 (ERROR):   {len(errors)}")
        print(f"  ⚠️  警告 (WARNING): {len(warnings)}")
        print(f"  ℹ️  提示 (INFO):    {len(infos)}\n")
        
        # 按文件分组输出
        issues_by_file: Dict[str, List[LintIssue]] = {}
        for issue in filtered_issues:
            if issue.file_path not in issues_by_file:
                issues_by_file[issue.file_path] = []
            issues_by_file[issue.file_path].append(issue)
        
        for file_path, file_issues in sorted(issues_by_file.items()):
            print(f"\n📄 {file_path}")
            for issue in file_issues:
                icon = {"ERROR": "❌", "WARNING": "⚠️", "INFO": "ℹ️"}[issue.severity]
                line_info = f"L{issue.line_number}" if issue.line_number > 0 else "文件级"
                print(f"  {icon} {line_info:8} [{issue.rule_id}] {issue.rule_name}")
                print(f"     问题: {issue.message}")
                if issue.suggestion:
                    print(f"     建议: {issue.suggestion}")
                print(f"     规范: {issue.rule_file}")
                print()
        
        print("="*80)
        print(f"总计: {len(filtered_issues)} 个问题需要处理")
        print("="*80 + "\n")
        
        return 1 if errors else 0


def main():
    parser = argparse.ArgumentParser(
        description='天气鸭项目规范检查工具',
        epilog='示例: python weather-duck-lint.py --target-dir ./src --severity ERROR'
    )
    parser.add_argument(
        '--target-dir',
        type=Path,
        default=Path(__file__).parent.parent / 'src',
        help='要检查的目标目录 (默认: ../src)'
    )
    parser.add_argument(
        '--severity',
        choices=['ERROR', 'WARNING', 'INFO'],
        help='只显示指定严重程度的问题'
    )
    
    args = parser.parse_args()
    
    # 项目根目录
    project_root = Path(__file__).parent.parent
    
    if not args.target_dir.exists():
        print(f"❌ 错误: 目标目录不存在: {args.target_dir}", file=sys.stderr)
        return 1
    
    print(f"🦆 天气鸭项目规范检查工具")
    print(f"🔍 检查目录: {args.target_dir}")
    print(f"📁 项目根目录: {project_root}")
    if args.severity:
        print(f"🎯 严重程度过滤: {args.severity}")
    print()
    
    linter = WeatherDuckLinter(project_root, args.target_dir)
    linter.lint_directory()
    
    return linter.report(args.severity)


if __name__ == '__main__':
    sys.exit(main())
