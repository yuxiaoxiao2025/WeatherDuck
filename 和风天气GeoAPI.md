GeoAPI
和风天气GeoAPI提供全球地理位位置、全球城市搜索服务，支持经纬度坐标反查、多语言、模糊搜索等功能。

天气数据是基于地理位置的数据，因此获取天气之前需要先知道具体的位置信息。和风天气提供一个功能强大的位置信息搜索API服务：GeoAPI。通过GeoAPI，你可获取到需要查询城市或POI的基本信息，包括查询地区的Location ID（你需要这个ID去查询天气），多语言名称、经纬度、时区、海拔、Rank值、归属上级行政区域、所在行政区域等。

除此之外，GeoAPI还可以帮助你：

避免重名城市的困扰
支持名称模糊搜索
在你的应用或网站中根据用户输入的名称返回多个城市结果，便于用户选择准确的城市并返回该城市天气
在你的应用或网站中展示热门城市
不需要维护城市列表，城市信息更新实时获取
城市搜索
城市搜索API提供全球地理位位置、全球城市搜索服务，支持经纬度坐标反查、多语言、模糊搜索等功能。

城市搜索
平台: API iOS Android
城市搜索API提供全球地理位位置、全球城市搜索服务，支持经纬度坐标反查、多语言、模糊搜索等功能。

天气数据是基于地理位置的数据，因此获取天气之前需要先知道具体的位置信息。使用城市搜索，可获取到该城市的基本信息，包括城市的Location ID（你需要这个ID去查询天气），多语言名称、经纬度、时区、海拔、Rank值、归属上级行政区域、所在行政区域等。

另外，城市搜索也可以帮助你在你的APP中实现模糊搜索，用户只需要输入1-2个字即可获得结果。

请求路径 
/geo/v2/city/lookup
参数 
查询参数
location(必选)需要查询地区的名称，支持文字、以英文逗号分隔的经度,纬度坐标（十进制，最多支持小数点后两位）、LocationID或Adcode（仅限中国城市）。例如 location=北京 或 location=116.41,39.92
模糊搜索，当location传递的为文字时，支持模糊搜索，即用户可以只输入城市名称一部分进行搜索，最少一个汉字或2个字符，结果将按照相关性和Rank值进行排列，便于开发或用户进行选择他们需要查看哪个城市的天气。例如location=bei，将返回与bei相关性最强的若干结果，包括黎巴嫩的贝鲁特和中国的北京市

重名，当location传递的为文字时，可能会出现重名的城市，例如陕西省西安市、吉林省辽源市下辖的西安区和黑龙江省牡丹江市下辖的西安区，此时会根据Rank值排序返回所有结果。在这种情况下，可以通过adm参数的方式进一步确定需要查询的城市或地区，例如location=西安&adm=黑龙江

adm城市的上级行政区划，可设定只在某个行政区划范围内进行搜索，用于排除重名城市或对结果进行过滤。例如 adm=beijing
如请求参数为location=chaoyang&adm=beijing时，返回的结果只包括北京市的朝阳区，而不包括辽宁省的朝阳市

如请求参数仅为location=chaoyang时，返回的结果包括北京市的朝阳区、辽宁省的朝阳市以及长春市的朝阳区

range搜索范围，可设定只在某个国家或地区范围内进行搜索，国家和地区名称需使用ISO 3166 所定义的国家代码。如果不设置此参数，搜索范围将在所有城市。例如 range=cn
number返回结果的数量，取值范围1-20，默认返回10个结果。
lang多语言设置，请阅读多语言文档，了解我们的多语言是如何工作、如何设置以及数据是否支持多语言。
请求示例 
curl -X GET --compressed \
-H 'Authorization: Bearer your_token' \
'https://your_api_host/geo/v2/city/lookup?location=beij'
请将your_token替换为你的JWT身份认证，将your_api_host替换为你的API Host

返回数据 
返回数据是JSON格式并进行了Gzip压缩。

{
  "code":"200",
  "location":[
    {
      "name":"北京",
      "id":"101010100",
      "lat":"39.90499",
      "lon":"116.40529",
      "adm2":"北京",
      "adm1":"北京市",
      "country":"中国",
      "tz":"Asia/Shanghai",
      "utcOffset":"+08:00",
      "isDst":"0",
      "type":"city",
      "rank":"10",
      "fxLink":"https://www.qweather.com/weather/beijing-101010100.html"
    },
    {
      "name":"海淀",
      "id":"101010200",
      "lat":"39.95607",
      "lon":"116.31032",
      "adm2":"北京",
      "adm1":"北京市",
      "country":"中国",
      "tz":"Asia/Shanghai",
      "utcOffset":"+08:00",
      "isDst":"0",
      "type":"city",
      "rank":"15",
      "fxLink":"https://www.qweather.com/weather/haidian-101010200.html"
    },
    {
      "name":"朝阳",
      "id":"101010300",
      "lat":"39.92149",
      "lon":"116.48641",
      "adm2":"北京",
      "adm1":"北京市",
      "country":"中国",
      "tz":"Asia/Shanghai",
      "utcOffset":"+08:00",
      "isDst":"0",
      "type":"city",
      "rank":"15",
      "fxLink":"https://www.qweather.com/weather/chaoyang-101010300.html"
    },
    {
      "name":"昌平",
      "id":"101010700",
      "lat":"40.21809",
      "lon":"116.23591",
      "adm2":"北京",
      "adm1":"北京市",
      "country":"中国",
      "tz":"Asia/Shanghai",
      "utcOffset":"+08:00",
      "isDst":"0",
      "type":"city",
      "rank":"23",
      "fxLink":"https://www.qweather.com/weather/changping-101010700.html"
    },
    {
      "name":"房山",
      "id":"101011200",
      "lat":"39.73554",
      "lon":"116.13916",
      "adm2":"北京",
      "adm1":"北京市",
      "country":"中国",
      "tz":"Asia/Shanghai",
      "utcOffset":"+08:00",
      "isDst":"0",
      "type":"city",
      "rank":"23",
      "fxLink":"https://www.qweather.com/weather/fangshan-101011200.html"
    },
    {
      "name":"通州",
      "id":"101010600",
      "lat":"39.90249",
      "lon":"116.65860",
      "adm2":"北京",
      "adm1":"北京市",
      "country":"中国",
      "tz":"Asia/Shanghai",
      "utcOffset":"+08:00",
      "isDst":"0",
      "type":"city",
      "rank":"23",
      "fxLink":"https://www.qweather.com/weather/tongzhou-101010600.html"
    },
    {
      "name":"丰台",
      "id":"101010900",
      "lat":"39.86364",
      "lon":"116.28696",
      "adm2":"北京",
      "adm1":"北京市",
      "country":"中国",
      "tz":"Asia/Shanghai",
      "utcOffset":"+08:00",
      "isDst":"0",
      "type":"city",
      "rank":"25",
      "fxLink":"https://www.qweather.com/weather/fengtai-101010900.html"
    },
    {
      "name":"大兴",
      "id":"101011100",
      "lat":"39.72891",
      "lon":"116.33804",
      "adm2":"北京",
      "adm1":"北京市",
      "country":"中国",
      "tz":"Asia/Shanghai",
      "utcOffset":"+08:00",
      "isDst":"0",
      "type":"city",
      "rank":"25",
      "fxLink":"https://www.qweather.com/weather/daxing-101011100.html"
    },
    {
      "name":"延庆",
      "id":"101010800",
      "lat":"40.46532",
      "lon":"115.98501",
      "adm2":"北京",
      "adm1":"北京市",
      "country":"中国",
      "tz":"Asia/Shanghai",
      "utcOffset":"+08:00",
      "isDst":"0",
      "type":"city",
      "rank":"33",
      "fxLink":"https://www.qweather.com/weather/yanqing-101010800.html"
    },
    {
      "name":"平谷",
      "id":"101011500",
      "lat":"40.14478",
      "lon":"117.11234",
      "adm2":"北京",
      "adm1":"北京市",
      "country":"中国",
      "tz":"Asia/Shanghai",
      "utcOffset":"+08:00",
      "isDst":"0",
      "type":"city",
      "rank":"33",
      "fxLink":"https://www.qweather.com/weather/pinggu-101011500.html"
    }
  ],
  "refer":{
    "sources":[
      "QWeather"
    ],
    "license":[
      "QWeather Developers License"
    ]
  }
}
code 请参考状态码
location.name 地区/城市名称
location.id 地区/城市ID
location.lat 地区/城市纬度
location.lon 地区/城市经度
location.adm2 地区/城市的上级行政区划名称
location.adm1 地区/城市所属一级行政区域
location.country 地区/城市所属国家名称
location.tz 地区/城市所在时区
location.utcOffset 地区/城市目前与UTC时间偏移的小时数，参考详细说明
location.isDst 地区/城市是否当前处于夏令时。1 表示当前处于夏令时，0 表示当前不是夏令时。
location.type 地区/城市的属性
location.rank 地区评分
location.fxLink 该地区的天气预报网页链接，便于嵌入你的网站或应用
refer.sources 原始数据来源，或数据源说明，可能为空
refer.license 数据许可或版权声明，可能为空