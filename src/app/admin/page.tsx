"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Brain, 
  UserPlus, 
  Activity,
  Clock,
  Shield,
  Search,
  Ban,
  Trash2,
  Bell,
  BarChart3,
  ArrowLeft
} from 'lucide-react'

interface UserStats {
  total_users: number
  active_users_24h: number
  active_users_7d: number
  active_users_30d: number
  daily_active_users: number
  monthly_active_users: number
  events_created_30d: number
  ai_interactions: number
}

interface UserData {
  id: string
  email: string
  full_name?: string
  created_at: string
  last_sign_in: string
  is_suspended: boolean
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<UserStats>({
    total_users: 0,
    active_users_24h: 0,
    active_users_7d: 0,
    active_users_30d: 0,
    daily_active_users: 0,
    monthly_active_users: 0,
    events_created_30d: 0,
    ai_interactions: 0
  })
  const [users, setUsers] = useState<UserData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')

  useEffect(() => {
    checkAdminAccess()
    loadStats()
    loadUsers()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Verificar se é admin (você pode adicionar uma coluna is_admin na tabela de usuários)
      // Por enquanto, vamos usar o email como verificação
      const adminEmails = ['admin@pilot.com', 'seu@email.com'] // Adicione seus emails de admin aqui
      const isUserAdmin = adminEmails.includes(user.email || '')
      
      setIsAdmin(isUserAdmin)
      
      if (!isUserAdmin) {
        router.push('/')
      }
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Aqui você faria queries reais ao Supabase
      // Por enquanto, vamos usar dados mockados
      setStats({
        total_users: 1247,
        active_users_24h: 89,
        active_users_7d: 342,
        active_users_30d: 856,
        daily_active_users: 89,
        monthly_active_users: 856,
        events_created_30d: 3421,
        ai_interactions: 1893
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadUsers = async () => {
    try {
      // Query real ao Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      
      // Se não houver dados, usar mock
      if (!data || data.length === 0) {
        setUsers([
          {
            id: '1',
            email: 'user1@example.com',
            full_name: 'João Silva',
            created_at: new Date().toISOString(),
            last_sign_in: new Date().toISOString(),
            is_suspended: false
          },
          {
            id: '2',
            email: 'user2@example.com',
            full_name: 'Maria Santos',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            last_sign_in: new Date().toISOString(),
            is_suspended: false
          }
        ])
      } else {
        setUsers(data)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleSuspendUser = async (userId: string) => {
    try {
      // Implementar suspensão de usuário
      const { error } = await supabase
        .from('users')
        .update({ is_suspended: true })
        .eq('id', userId)

      if (error) throw error
      
      loadUsers()
      alert('Usuário suspenso com sucesso!')
    } catch (error) {
      console.error('Error suspending user:', error)
      alert('Erro ao suspender usuário')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja apagar este usuário? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error
      
      loadUsers()
      alert('Usuário apagado com sucesso!')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Erro ao apagar usuário')
    }
  }

  const handleSendNotification = async () => {
    if (!notificationTitle || !notificationMessage) {
      alert('Preencha todos os campos')
      return
    }

    try {
      // Implementar envio de notificação
      // Aqui você pode usar uma tabela de notificações no Supabase
      const { error } = await supabase
        .from('notifications')
        .insert({
          title: notificationTitle,
          message: notificationMessage,
          created_at: new Date().toISOString(),
          is_global: true
        })

      if (error) throw error
      
      alert('Notificação enviada com sucesso!')
      setNotificationTitle('')
      setNotificationMessage('')
    } catch (error) {
      console.error('Error sending notification:', error)
      alert('Erro ao enviar notificação')
    }
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
          <p className="mt-4 text-white font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-lg border-b border-amber-800/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-yellow-700 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Painel de Administração</h1>
                  <p className="text-xs text-amber-400">PILOT - Centro de Controlo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Utilizadores Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_users.toLocaleString()}</div>
              <p className="text-xs text-blue-100 mt-1">Ativos na plataforma</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Novos Registos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.active_users_24h}</div>
              <div className="flex gap-2 mt-1 text-xs text-green-100">
                <span>7d: {stats.active_users_7d}</span>
                <span>•</span>
                <span>30d: {stats.active_users_30d}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                DAU / MAU
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.daily_active_users}</div>
              <p className="text-xs text-purple-100 mt-1">MAU: {stats.monthly_active_users}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-600 to-yellow-700 border-0 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Eventos Criados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.events_created_30d.toLocaleString()}</div>
              <p className="text-xs text-amber-100 mt-1">Últimos 30 dias</p>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas Adicionais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Desempenho Meta AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Interações Bem-Sucedidas</span>
                    <span className="text-purple-400 font-bold">{stats.ai_interactions}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">87%</div>
                    <div className="text-xs text-gray-400">Taxa de Sucesso</div>
                  </div>
                  <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-pink-400">4.8</div>
                    <div className="text-xs text-gray-400">Avaliação Média</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                  <span className="text-sm">Logins nas últimas 24h</span>
                  <Badge className="bg-blue-600">{stats.active_users_24h}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                  <span className="text-sm">Eventos criados hoje</span>
                  <Badge className="bg-green-600">142</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                  <span className="text-sm">Metas AI ativas</span>
                  <Badge className="bg-purple-600">89</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                  <span className="text-sm">Parties criadas</span>
                  <Badge className="bg-amber-600">34</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gestão de Utilizadores */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Gerir Utilizadores
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar utilizadores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.full_name || 'Sem nome'}</h3>
                      {user.is_suspended && (
                        <Badge variant="destructive" className="text-xs">Suspenso</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                      <span>Criado: {new Date(user.created_at).toLocaleDateString('pt-PT')}</span>
                      <span>•</span>
                      <span>Último acesso: {new Date(user.last_sign_in).toLocaleDateString('pt-PT')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSuspendUser(user.id)}
                      className="border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
                      disabled={user.is_suspended}
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteUser(user.id)}
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Publicar Avisos/Notificações */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Publicar Aviso/Notificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="notification-title">Título</Label>
                <Input
                  id="notification-title"
                  placeholder="Ex: Manutenção Programada"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="notification-message">Mensagem</Label>
                <Textarea
                  id="notification-message"
                  placeholder="Digite a mensagem que será exibida para todos os utilizadores..."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white min-h-24"
                />
              </div>
              <Button
                onClick={handleSendNotification}
                className="w-full bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800"
              >
                <Bell className="w-4 h-4 mr-2" />
                Enviar Notificação para Todos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
