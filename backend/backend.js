import { createClient } from "@supabase/supabase-js";
import express from 'express';
import cors from 'cors';
import { supabase } from "../config/supabase";

const url= "https://vyxeojjzxwapzoevbrpb.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5eGVvamp6eHdhcHpvZXZicnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzY1OTYsImV4cCI6MjA3OTc1MjU5Nn0.zn1cG4IpjglAIpwVKNkHre2m3555qbJUwBMFZo-gB9M";
const supabase = createClient(url,key);