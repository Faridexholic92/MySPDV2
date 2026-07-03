"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { AuthedUser } from "@/lib/types";

const SESSION_KEY = "myspdUser";

function saveSession(u: AuthedUser) {
	sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
}
function loadSession(): AuthedUser | null {
	const raw = sessionStorage.getItem(SESSION_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as AuthedUser;
	} catch {
		return null;
	}
}
function clearSession() {
	sessionStorage.removeItem(SESSION_KEY);
}

export type AuthStatus = "loading" | "loggedOut" | "loggedIn" | "passwordRecovery";

export function useAuth() {
	const sb = getSupabaseClient();
	const [status, setStatus] = useState<AuthStatus>("loading");
	const [user, setUser] = useState<AuthedUser | null>(null);
	const [error, setError] = useState<string | null>(null);
	const recoveryHandled = useRef(false);

	const handleUser = useCallback(
		async (authUser: { id: string; email?: string | null }) => {
			const { data: profile } = await sb
				.from("profiles")
				.select("role, nama, jawatan, gred, cawangan, no_tel, avatar_url, session_version")
				.eq("id", authUser.id)
				.single();

			// Force logout if an admin bumped this user's session_version (remote sign-out).
			const svKey = `myspd.sv.${authUser.id}`;
			const known = localStorage.getItem(svKey);
			const cur = String(profile?.session_version ?? 1);
			if (known !== null && Number(cur) > Number(known)) {
				localStorage.removeItem(svKey);
				await sb.auth.signOut();
				clearSession();
				setUser(null);
				setStatus("loggedOut");
				setError("Sesi anda telah ditamatkan oleh pentadbir.");
				return;
			}
			localStorage.setItem(svKey, cur);

			const role = (profile?.role as AuthedUser["role"]) || "staf";
			const namaPenuh =
				profile?.nama && profile.nama.trim()
					? profile.nama.trim()
					: (authUser.email || "USER").split("@")[0].toUpperCase();

			const uiUser: AuthedUser = {
				id: authUser.id,
				email: authUser.email || "",
				name: namaPenuh,
				role,
				nama: profile?.nama || "",
				jawatan: profile?.jawatan || "",
				gred: profile?.gred || "",
				cawangan: profile?.cawangan || "",
				no_tel: profile?.no_tel || "",
				avatar_url: profile?.avatar_url || null,
			};
			setUser(uiUser);
			saveSession(uiUser);
			setStatus("loggedIn");
		},
		[sb],
	);

	useEffect(() => {
		const cached = loadSession();
		if (cached) setUser(cached);

		const hash = window.location.hash || "";
		const search = window.location.search || "";
		if (hash.includes("type=recovery") || search.includes("type=recovery")) {
			setStatus("passwordRecovery");
		}

		const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
			if (event === "TOKEN_REFRESHED") return;
			if (event === "PASSWORD_RECOVERY") {
				recoveryHandled.current = true;
				setStatus("passwordRecovery");
				return;
			}
			if (session?.user) {
				void handleUser(session.user);
			} else {
				setUser(null);
				clearSession();
				if (!recoveryHandled.current) setStatus("loggedOut");
			}
		});

		// Also check current session on first load.
		sb.auth.getSession().then(({ data }) => {
			if (data.session?.user) void handleUser(data.session.user);
			else if (status === "loading") setStatus("loggedOut");
		});

		return () => sub.subscription.unsubscribe();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const login = useCallback(
		async (email: string, password: string) => {
			setError(null);
			if (!email) {
				setError("Sila isi email.");
				return false;
			}
			if (!password) {
				setError("Sila isi kata laluan.");
				return false;
			}
			const { error: err } = await sb.auth.signInWithPassword({ email, password });
			if (err) {
				const msg = err.message || "";
				if (msg.includes("Invalid login")) setError("Email atau kata laluan tidak sah.");
				else if (msg.includes("Too many")) setError("Terlalu banyak percubaan. Cuba selepas beberapa minit.");
				else setError("Login gagal: " + (msg || "Unknown error"));
				return false;
			}
			return true;
		},
		[sb],
	);

	const logout = useCallback(async () => {
		try {
			await sb.auth.signOut();
		} catch {
			/* ignore */
		}
		clearSession();
		setUser(null);
		setStatus("loggedOut");
	}, [sb]);

	return { status, user, error, setError, login, logout, sb };
}
