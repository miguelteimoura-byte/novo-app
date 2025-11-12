"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Calendar, Plus, Users, MessageCircle, User, Settings, Clock, Heart, Star, ChevronLeft, ChevronRight, Target, Repeat, Edit, Trash2, Save, X, UserPlus, UserMinus, Check, Camera, Image as ImageIcon, Phone, Send, Brain, TrendingUp, Award, Zap, BookOpen, Dumbbell, Coffee, Music, Shield, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'

interface CalendarEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  category: 'work' | 'leisure' | 'sleep' | 'meals' | 'gaming' | 'social' | 'recurring' | 'goal' | 'ai-goal'
  description?: string
  date: string
  isRecurring?: boolean
  isGoal?: boolean
  isAIGoal?: boolean
  progress?: number
}

interface PartyInvite {
  friendId: string
  status: 'pending' | 'accepted' | 'declined'
  respondedAt?: string
}

interface Party {
  id: string
  title: string
  date: string
  time: string
  description: string
  creator: string
  creatorId: string
  invites: PartyInvite[]
  status: 'pending' | 'accepted' | 'declined'
  cost?: string
  chatId?: string
}

interface Friend {
  id: string
  name: string
  avatar: string
  status: 'online' | 'offline'
  lastActivity: string
}

interface RecurringTask {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  days: string[]
  category: 'work' | 'sport' | 'study' | 'health' | 'other'
  isActive: boolean
}

interface Goal {
  id: string
  title: string
  description: string
  targetDate: string
  targetTime: string
  priority: 'low' | 'medium' | 'high'
  isCompleted: boolean
  category: 'personal' | 'professional' | 'health' | 'learning' | 'other'
}

interface AIGoal {
  id: string
  title: string
  description: string
  category: 'fitness' | 'learning' | 'productivity' | 'wellness' | 'creativity' | 'social'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  dailyTimeMinutes: number
  schedule: {
    days: string[]
    time: string
  }
  milestones: AIGoalMilestone[]
  progress: number
  isActive: boolean
  startDate: string
  aiCoachMessages: AICoachMessage[]
  currentWeek: number
}

interface AIGoalMilestone {
  id: string
  title: string
  description: string
  week: number
  isCompleted: boolean
  completedDate?: string
}

interface AICoachMessage {
  id: string
  message: string
  type: 'motivation' | 'tip' | 'adjustment' | 'celebration'
  timestamp: string
  isRead: boolean
}

interface AIGoalSuggestion {
  id: string
  title: string
  description: string
  category: 'fitness' | 'learning' | 'productivity' | 'wellness' | 'creativity' | 'social'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: string
  benefits: string[]
  icon: string
}

const categoryColors = {
  work: 'from-amber-600 to-yellow-700',
  leisure: 'from-amber-500 to-orange-600',
  sleep: 'from-amber-700 to-yellow-800',
  meals: 'from-orange-500 to-amber-600',
  gaming: 'from-yellow-600 to-amber-700',
  social: 'from-amber-500 to-yellow-600',
  recurring: 'from-yellow-700 to-amber-800',
  goal: 'from-amber-400 to-yellow-500',
  'ai-goal': 'from-purple-500 to-pink-600'
}

const categoryIcons = {
  work: '💼',
  leisure: '🎯',
  sleep: '😴',
  meals: '🍽️',
  gaming: '🎮',
  social: '🎉',
  recurring: '🔄',
  goal: '🎯',
  'ai-goal': '🤖'
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const weekDays = [
  { value: 'sunday', label: 'Domingo' },
  { value: 'monday', label: 'Segunda' },
  { value: 'tuesday', label: 'Terça' },
  { value: 'wednesday', label: 'Quarta' },
  { value: 'thursday', label: 'Quinta' },
  { value: 'friday', label: 'Sexta' },
  { value: 'saturday', label: 'Sábado' }
]

const aiGoalSuggestions: AIGoalSuggestion[] = [
  {
    id: '1',
    title: 'Corrida Matinal',
    description: 'Desenvolva o hábito de correr todas as manhãs para melhorar sua saúde cardiovascular',
    category: 'fitness',
    difficulty: 'beginner',
    estimatedDuration: '4 semanas',
    benefits: ['Melhora cardiovascular', 'Mais energia', 'Disciplina matinal'],
    icon: '🏃‍♂️'
  },
  {
    id: '2',
    title: 'Leitura Diária',
    description: 'Leia 30 minutos por dia para expandir conhecimento e melhorar foco',
    category: 'learning',
    difficulty: 'beginner',
    estimatedDuration: '6 semanas',
    benefits: ['Conhecimento expandido', 'Melhor foco', 'Vocabulário rico'],
    icon: '📚'
  },
  {
    id: '3',
    title: 'Meditação Mindfulness',
    description: 'Pratique meditação diária para reduzir stress e aumentar bem-estar',
    category: 'wellness',
    difficulty: 'beginner',
    estimatedDuration: '8 semanas',
    benefits: ['Menos stress', 'Melhor sono', 'Clareza mental'],
    icon: '🧘‍♂️'
  },
  {
    id: '4',
    title: 'Aprender Programação',
    description: 'Dedique 1 hora diária para aprender uma nova linguagem de programação',
    category: 'learning',
    difficulty: 'intermediate',
    estimatedDuration: '12 semanas',
    benefits: ['Nova habilidade', 'Oportunidades profissionais', 'Lógica aprimorada'],
    icon: '💻'
  },
  {
    id: '5',
    title: 'Treino de Força',
    description: 'Programa de musculação 3x por semana para ganhar força e massa muscular',
    category: 'fitness',
    difficulty: 'intermediate',
    estimatedDuration: '16 semanas',
    benefits: ['Força aumentada', 'Massa muscular', 'Metabolismo acelerado'],
    icon: '💪'
  },
  {
    id: '6',
    title: 'Desenho Artístico',
    description: 'Desenvolva habilidades de desenho com prática diária de 45 minutos',
    category: 'creativity',
    difficulty: 'beginner',
    estimatedDuration: '10 semanas',
    benefits: ['Criatividade', 'Coordenação motora', 'Expressão artística'],
    icon: '🎨'
  },
  {
    id: '7',
    title: 'Networking Profissional',
    description: 'Conecte-se com 2 novos profissionais por semana para expandir rede',
    category: 'social',
    difficulty: 'intermediate',
    estimatedDuration: '8 semanas',
    benefits: ['Rede expandida', 'Oportunidades', 'Habilidades sociais'],
    icon: '🤝'
  },
  {
    id: '8',
    title: 'Organização Digital',
    description: 'Organize emails, arquivos e tarefas para aumentar produtividade',
    category: 'productivity',
    difficulty: 'beginner',
    estimatedDuration: '4 semanas',
    benefits: ['Mais produtividade', 'Menos stress', 'Tempo otimizado'],
    icon: '📋'
  }
]

export default function MyTimeSocial() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  
  const [activeTab, setActiveTab] = useState('calendar')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Trabalho',
      startTime: '09:00',
      endTime: '17:00',
      category: 'work',
      description: 'Reuniões e projetos',
      date: '2024-01-15'
    },
    {
      id: '2',
      title: 'Almoço',
      startTime: '12:00',
      endTime: '13:00',
      category: 'meals',
      date: '2024-01-15'
    },
    {
      id: '3',
      title: 'Gaming',
      startTime: '19:00',
      endTime: '21:00',
      category: 'gaming',
      description: 'Sessão de jogos',
      date: '2024-01-15',
      progress: 75
    }
  ])

  const [parties, setParties] = useState<Party[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [aiGoals, setAIGoals] = useState<AIGoal[]>([])

  // Verificar autenticação
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setIsAuthenticated(true)
      setUserEmail(session.user.email || '')
      
      // Verificar se é admin
      const adminEmails = ['admin@pilot.com', 'seu@email.com']
      setIsAdmin(adminEmails.includes(session.user.email || ''))
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1)
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        events: []
      })
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateString = date.toISOString().split('T')[0]
      const dayEvents = events.filter(event => event.date === dateString)
      
      days.push({
        date,
        isCurrentMonth: true,
        events: dayEvents
      })
    }
    
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        events: []
      })
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  const getEventsForSelectedDate = () => {
    const dateString = selectedDate.toISOString().split('T')[0]
    return events.filter(event => event.date === dateString)
  }

  const calendarDays = getDaysInMonth(currentDate)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
          <p className="mt-4 text-amber-600 font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-black text-white' 
        : 'bg-white text-gray-900'
    }`}>
      {/* Header */}
      <div className={`backdrop-blur-lg border-b sticky top-0 z-50 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-black/90 border-amber-800/30' 
          : 'bg-white/90 border-amber-200/50'
      }`}>
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-yellow-700 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-700 bg-clip-text text-transparent">
                  PILOT
                </h1>
                <p className="text-xs text-amber-600 font-medium">BE YOUR OWN PILOT</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </Button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/admin')}
                  className="rounded-full"
                >
                  <Shield className="w-4 h-4" />
                </Button>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm mx-auto">
                  <DialogHeader>
                    <DialogTitle>Definições</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="font-medium">Conta</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">{userEmail}</p>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Terminar Sessão
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-r from-amber-600 to-yellow-700 text-white text-xs">
                  EU
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 py-6">
            <TabsContent value="calendar" className="mt-0 space-y-6">
              {/* Calendário */}
              <Card className={`backdrop-blur-sm border-0 shadow-lg transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-900/70 text-white' 
                  : 'bg-amber-50/70 text-gray-900'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-amber-600" />
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigateMonth('prev')}
                        className="rounded-full w-8 h-8 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigateMonth('next')}
                        className="rounded-full w-8 h-8 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(day => (
                      <div key={day} className={`text-center text-xs font-medium py-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                      const hasEvents = day.events.length > 0
                      const isCurrentDay = isToday(day.date)
                      const isSelected = isSelectedDate(day.date)
                      
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedDate(day.date)}
                          className={`
                            relative aspect-square p-1 rounded-lg text-sm font-medium transition-all duration-200
                            ${day.isCurrentMonth 
                              ? `${isDarkMode ? 'text-white hover:bg-amber-900/20' : 'text-gray-900 hover:bg-amber-100'}` 
                              : `${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`
                            }
                            ${isCurrentDay 
                              ? 'bg-gradient-to-r from-amber-600 to-yellow-700 text-white shadow-lg' 
                              : ''
                            }
                            ${isSelected && !isCurrentDay 
                              ? `${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600'}` 
                              : ''
                            }
                          `}
                        >
                          <span className="relative z-10">
                            {day.date.getDate()}
                          </span>
                          
                          {hasEvents && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                              {day.events.slice(0, 3).map((event, eventIndex) => (
                                <div
                                  key={eventIndex}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isCurrentDay 
                                      ? 'bg-white/80' 
                                      : `bg-gradient-to-r ${categoryColors[event.category]}`
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Eventos do Dia */}
              <Card className={`backdrop-blur-sm border-0 shadow-lg transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-900/70 text-white' 
                  : 'bg-amber-50/70 text-gray-900'
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    {isToday(selectedDate) ? 'Hoje' : selectedDate.toLocaleDateString('pt-PT')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getEventsForSelectedDate().length > 0 ? (
                    getEventsForSelectedDate().map(event => (
                      <div key={event.id} className={`flex items-center gap-3 p-3 rounded-xl ${
                        isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
                      }`}>
                        <div className={`w-3 h-12 rounded-full bg-gradient-to-b ${categoryColors[event.category]}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{event.title}</h3>
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {event.startTime} - {event.endTime}
                            </span>
                          </div>
                          {event.description && (
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {event.description}
                            </p>
                          )}
                          {event.progress !== undefined && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progresso</span>
                                <span className="font-bold text-amber-600">{event.progress}%</span>
                              </div>
                              <Progress value={event.progress} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum evento neste dia</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parties" className="mt-0">
              <div className="text-center py-12">
                <p className="text-gray-500">Parties em breve!</p>
              </div>
            </TabsContent>

            <TabsContent value="friends" className="mt-0">
              <div className="text-center py-12">
                <p className="text-gray-500">Amigos em breve!</p>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <Card className="bg-gradient-to-br from-amber-600 via-yellow-700 to-amber-800 text-white border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-white/30">
                    <AvatarFallback className="bg-white/20 text-white text-xl">
                      EU
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold mb-2">O Meu Perfil</h2>
                  <p className="text-white/80 text-sm">{userEmail}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* Bottom Navigation */}
          <div className={`fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-black/90 border-amber-800/30' 
              : 'bg-white/90 border-amber-200/50'
          }`}>
            <div className="max-w-md mx-auto">
              <TabsList className="grid w-full grid-cols-4 bg-transparent h-16">
                <TabsTrigger 
                  value="calendar" 
                  className={`flex flex-col gap-1 rounded-none border-0 transition-all duration-300 ${
                    activeTab === 'calendar' 
                      ? `${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600'} scale-110` 
                      : ''
                  }`}
                >
                  <Calendar className={`w-5 h-5 ${activeTab === 'calendar' ? 'animate-bounce' : ''}`} />
                  <span className="text-xs font-medium">Calendário</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="parties"
                  className={`flex flex-col gap-1 rounded-none border-0 transition-all duration-300 ${
                    activeTab === 'parties' 
                      ? `${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600'} scale-110` 
                      : ''
                  }`}
                >
                  <div className={`text-xl ${activeTab === 'parties' ? 'animate-bounce' : ''}`}>🎉</div>
                  <span className="text-xs font-medium">Parties</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="friends"
                  className={`flex flex-col gap-1 rounded-none border-0 transition-all duration-300 ${
                    activeTab === 'friends' 
                      ? `${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600'} scale-110` 
                      : ''
                  }`}
                >
                  <Users className={`w-5 h-5 ${activeTab === 'friends' ? 'animate-bounce' : ''}`} />
                  <span className="text-xs font-medium">Amigos</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="profile"
                  className={`flex flex-col gap-1 rounded-none border-0 transition-all duration-300 ${
                    activeTab === 'profile' 
                      ? `${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600'} scale-110` 
                      : ''
                  }`}
                >
                  <User className={`w-5 h-5 ${activeTab === 'profile' ? 'animate-bounce' : ''}`} />
                  <span className="text-xs font-medium">Perfil</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </Tabs>
      </div>

      <div className="h-20" />
    </div>
  )
}
