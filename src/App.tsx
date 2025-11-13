import { useState } from 'react'
import { AppContainer, Header } from '@/components/Layout'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'

function App() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleSettings = () => {}

  return (
    <AppContainer>
      <Header onRefresh={handleRefresh} onSettings={handleSettings} />
      <main className="flex-1 overflow-y-auto p-5" aria-live="polite">
        <Card variant="glass" className="mb-5">
          <h2 className="text-xl font-bold text-blue-900 mb-2">UI 框架搭建完成</h2>
          <p className="text-blue-600 mb-4">Tailwind CSS 和基础组件库已就绪</p>
          <div className="space-y-3">
            <Button variant="primary" leftIcon={<Icon name="Cloud" size={18} />} isLoading={isRefreshing} type="button">刷新天气</Button>
            <Button variant="secondary" type="button">次要按钮</Button>
            <Button variant="ghost" type="button">幽灵按钮</Button>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <Card hoverable>
            <div className="text-center">
              <Icon name="Droplets" size={32} color="#3b82f6" />
              <div className="mt-2 text-sm text-blue-600">湿度</div>
              <div className="text-xl font-bold text-blue-900">62%</div>
            </div>
          </Card>
          <Card hoverable>
            <div className="text-center">
              <Icon name="Wind" size={32} color="#3b82f6" />
              <div className="mt-2 text-sm text-blue-600">风速</div>
              <div className="text-xl font-bold text-blue-900">18km/h</div>
            </div>
          </Card>
        </div>
      </main>
    </AppContainer>
  )
}

export default App
