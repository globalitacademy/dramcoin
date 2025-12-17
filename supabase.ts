
import { createClient } from '@supabase/supabase-js';

// Live Supabase Project Credentials
const supabaseUrl = 'https://dllpgztlzfuephmculrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsbHBnenRsemZ1ZXBobWN1bHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODYyOTEsImV4cCI6MjA4MTU2MjI5MX0.ocNJM4P3ycrq2aqQpLYa_2MvhLbhgqDHeqRjQTf2AbE';

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
