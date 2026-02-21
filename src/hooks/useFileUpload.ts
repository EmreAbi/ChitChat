import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { isImageMimeType } from '../lib/types'
import type { FileMessageContent } from '../lib/types'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function useFileUpload(conversationId: string | undefined) {
  const { session } = useAuth()
  const [uploading, setUploading] = useState(false)

  const uploadFile = useCallback(async (file: File) => {
    if (!conversationId || !session) return

    if (file.size > MAX_FILE_SIZE) {
      alert('Dosya boyutu 10MB\'dan buyuk olamaz.')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop() || ''
      const filePath = `${conversationId}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('Dosya yuklenemedi.')
        return
      }

      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath)

      const fileContent: FileMessageContent = {
        url: urlData.publicUrl,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      }

      const messageType = isImageMimeType(file.type) ? 'image' : 'file'

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: session.user.id,
        content: JSON.stringify(fileContent),
        type: messageType,
      })
    } catch (err) {
      console.error('File upload failed:', err)
      alert('Dosya yuklenemedi.')
    } finally {
      setUploading(false)
    }
  }, [conversationId, session])

  return { uploading, uploadFile }
}
