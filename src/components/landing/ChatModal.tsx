import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Icon from '@/components/ui/icon'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
}

const CHAT_URL = 'https://functions.poehali.dev/d0bb56e3-933e-4c47-9f65-744948764d82'

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Привет! Я НейроМакс — ваш личный ИИ-помощник. Спросите меня что угодно!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.filter(m => m.role !== 'assistant' || newMessages.indexOf(m) > 0) })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Произошла ошибка. Попробуйте ещё раз.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-full max-w-2xl h-[600px] flex flex-col rounded-2xl overflow-hidden border border-[#7C3AFF]/30 bg-[#0a0a0a]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#7C3AFF]/20 bg-[#0d0d0d]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#7C3AFF]/20 border border-[#7C3AFF]/40 flex items-center justify-center">
                    <Icon name="Bot" size={18} className="text-[#7C3AFF]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">НейроМакс</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 text-xs">онлайн</span>
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                  <Icon name="X" size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-[#7C3AFF]/20 border border-[#7C3AFF]/40 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                        <Icon name="Bot" size={14} className="text-[#7C3AFF]" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#7C3AFF] text-white rounded-tr-sm'
                          : 'bg-[#1a1a1a] text-neutral-200 border border-white/5 rounded-tl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#7C3AFF]/20 border border-[#7C3AFF]/40 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <Icon name="Bot" size={14} className="text-[#7C3AFF]" />
                    </div>
                    <div className="bg-[#1a1a1a] border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#7C3AFF]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#7C3AFF]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#7C3AFF]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-4 border-t border-[#7C3AFF]/20 bg-[#0d0d0d]">
                <div className="flex items-end gap-3 bg-[#1a1a1a] border border-[#7C3AFF]/20 rounded-xl px-4 py-3 focus-within:border-[#7C3AFF]/50 transition-colors">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Напишите сообщение..."
                    rows={1}
                    className="flex-1 bg-transparent text-white text-sm placeholder-neutral-500 resize-none outline-none leading-relaxed"
                    style={{ maxHeight: '120px' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className="w-8 h-8 rounded-lg bg-[#7C3AFF] flex items-center justify-center transition-all hover:bg-[#6d28d9] disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Icon name="Send" size={15} className="text-white" />
                  </button>
                </div>
                <p className="text-neutral-600 text-xs text-center mt-2">Enter — отправить · Shift+Enter — новая строка</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
