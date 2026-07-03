"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	// Fails loudly at build/runtime instead of silently breaking auth calls.
	throw new Error(
		"Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and fill in real values.",
	);
}

// Single shared browser client (avoids creating a new client on every import).
let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
	if (!_client) {
		_client = createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
			auth: {
				persistSession: true,
				autoRefreshToken: true,
				detectSessionInUrl: true,
			},
		});
	}
	return _client;
}
