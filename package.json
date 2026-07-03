export type UserRole = "staf" | "superadmin";

export type Profile = {
	id: string;
	email: string;
	role: UserRole;
	nama: string;
	jawatan: string;
	gred: string;
	cawangan: string;
	no_tel: string;
	avatar_url: string | null;
	session_version: number;
};

export type AuthedUser = {
	id: string;
	email: string;
	name: string;
	role: UserRole;
	nama: string;
	jawatan: string;
	gred: string;
	cawangan: string;
	no_tel: string;
	avatar_url: string | null;
};

export type AuditLogEntry = {
	actor_email: string;
	action: string;
	target_email: string;
	detail: string | null;
	created_at: string;
};

export type ToastType = "info" | "ok" | "err";

export type Toast = {
	id: number;
	message: string;
	type: ToastType;
};
