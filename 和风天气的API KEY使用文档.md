API KEY 
API KEY是一种常见、操作简单的身份认证方式。相比较JWT而言，API KEY在一些场景下安全性较低。

注意：为了提高安全性，SDK 5+将不再支持API KEY。从2027年1月1日起，我们将限制使用API KEY进行身份认证的每日请求数量。

生成API KEY 
你可以登录控制台快速的生成API KEY：

点击左侧菜单中的“项目管理”
点击需要添加API KEY的项目名称
在凭据设置区域点击绿色的创建凭据按钮
身份认证方式选择API KEY
输入凭据名称，比如“旅游APP测试”
点击创建按钮
你可以随时在控制台-项目管理中查看生成的API KEY。

发送API KEY请求 
注意：请不要同时使用多种身份认证方式，可能会导致身份认证失败。

我们支持两种形式使用API KEY进行身份验证:

请求标头
在你的请求Header中加入X-QW-Api-Key: your-key，例如：

curl -H "X-QW-Api-Key: ABCD1234EFGH" --compressed \
'https://abcxyz.qweatherapi.com/v7/weather/now?location=101010100'
请求参数
在请求参数中加入key=your-key，例如：

curl --compressed \
'https://abcxyz.qweatherapi.com/v7/weather/now?location=101010100&key=ABCD1234EFGH'
API KEY数字签名 
API KEY的数字签名方式已经不再被支持。

兼容性 
参考下方表格了解不同服务对身份认证方式的兼容性。

 	JWT	API KEY	API KEY数字签名
API v7	✅	✅	✅ 仅2024-11-01前的凭据可用
GeoAPI v2	✅	✅	✅ 仅2024-11-01前的凭据可用
GeoAPI v3	✅	✅	❌
Air quality API v1	✅	✅	❌
Console API v1	✅	✅	❌
SDK 4+	❌	❌	✅
SDK 5+	✅	❌	❌