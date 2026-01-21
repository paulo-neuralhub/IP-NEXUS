-- P60: Mejoras al Asistente Chat IP-Genius
-- Adaptar tablas existentes ai_conversations y ai_messages

-- 1. Añadir campos a ai_conversations
ALTER TABLE ai_conversations 
ADD COLUMN IF NOT EXISTS context_type TEXT CHECK (context_type IN ('general', 'matter', 'contact', 'document')),
ADD COLUMN IF NOT EXISTS context_id UUID,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- Crear índice para context_type
CREATE INDEX IF NOT EXISTS idx_ai_conversations_context ON ai_conversations(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_pinned ON ai_conversations(user_id, is_pinned) WHERE is_pinned = true;

-- 2. Añadir campos a ai_messages
ALTER TABLE ai_messages
ADD COLUMN IF NOT EXISTS actions_taken JSONB,
ADD COLUMN IF NOT EXISTS response_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS tokens_input INTEGER,
ADD COLUMN IF NOT EXISTS tokens_output INTEGER;

-- Renombrar feedback si es necesario (ya existe como TEXT, lo dejamos)
-- feedback ya existe como TEXT con valores 'positive'/'negative'
-- feedback_comment ya existe como TEXT

-- 3. Crear función para actualizar title automáticamente
CREATE OR REPLACE FUNCTION auto_title_genius_conversation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'user' THEN
    UPDATE ai_conversations 
    SET title = COALESCE(title, LEFT(NEW.content, 60) || CASE WHEN LENGTH(NEW.content) > 60 THEN '...' ELSE '' END)
    WHERE id = NEW.conversation_id AND title IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS trigger_auto_title_genius ON ai_messages;
CREATE TRIGGER trigger_auto_title_genius
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION auto_title_genius_conversation();

-- 4. Comentarios para documentación
COMMENT ON COLUMN ai_conversations.context_type IS 'Tipo de contexto: general, matter, contact, document';
COMMENT ON COLUMN ai_conversations.context_id IS 'ID del expediente/contacto/documento vinculado';
COMMENT ON COLUMN ai_conversations.is_pinned IS 'Conversación fijada en la parte superior';
COMMENT ON COLUMN ai_messages.actions_taken IS 'Acciones ejecutadas: [{type: "search_matters", results: 5}]';
COMMENT ON COLUMN ai_messages.response_time_ms IS 'Tiempo de respuesta en milisegundos';