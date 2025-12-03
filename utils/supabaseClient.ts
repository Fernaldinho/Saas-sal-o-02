import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tcgbyjeyulidflpxuklh.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjZ2J5amV5dWxpZGZscHh1a2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODMwMjQsImV4cCI6MjA4MDM1OTAyNH0.vjhIhHtzafBdcRRJHmM0xwGS8einmXbRC1mcAvf1Igk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);