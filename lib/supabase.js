import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://imrinujhndjxzflvofel.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltcmludWpobmRqeHpmbHZvZmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjQ1NTEsImV4cCI6MjA2NDgwMDU1MX0.Zl2YKo85en8OycrbdxcTDXpiD0c0-f8KxUoTSY7mljk'

export const supabase = createClient(supabaseUrl, supabaseKey)