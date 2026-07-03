"use client";

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, className, ...rest }: IconProps) {
	return (
		<svg className={`icon ${className || ""}`} viewBox="0 0 24 24" {...rest}>
			{children}
		</svg>
	);
}

export const LogoMark = (p: IconProps) => (
	<Base {...p}>
		<path d="M12 2 3 7l9 5 9-5-9-5Z" />
		<path d="M3 12l9 5 9-5" />
		<path d="M3 17l9 5 9-5" />
	</Base>
);

export const IconGrid = (p: IconProps) => (
	<Base {...p}>
		<rect x="3" y="3" width="7" height="7" rx="1.5" />
		<rect x="14" y="3" width="7" height="7" rx="1.5" />
		<rect x="3" y="14" width="7" height="7" rx="1.5" />
		<rect x="14" y="14" width="7" height="7" rx="1.5" />
	</Base>
);

export const IconFile = (p: IconProps) => (
	<Base {...p}>
		<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
		<path d="M14 2v6h6" />
	</Base>
);

export const IconCalendar = (p: IconProps) => (
	<Base {...p}>
		<rect x="3" y="4" width="18" height="18" rx="2" />
		<path d="M16 2v4M8 2v4M3 10h18" />
	</Base>
);

export const IconActivity = (p: IconProps) => (
	<Base {...p}>
		<path d="M3 3v18h18" />
		<path d="m19 9-5 5-4-4-3 3" />
	</Base>
);

export const IconGraduation = (p: IconProps) => (
	<Base {...p}>
		<path d="M22 10 12 5 2 10l10 5 10-5Z" />
		<path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
	</Base>
);

export const IconCheckCircle = (p: IconProps) => (
	<Base {...p}>
		<path d="m9 12 2 2 4-4" />
		<circle cx="12" cy="12" r="9" />
	</Base>
);

export const IconEdit = (p: IconProps) => (
	<Base {...p}>
		<path d="M12 20h9" />
		<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
	</Base>
);

export const IconShield = (p: IconProps) => (
	<Base {...p}>
		<path d="M12 2 3 6v6c0 5 3.8 8.7 9 10 5.2-1.3 9-5 9-10V6l-9-4Z" />
	</Base>
);

export const IconUsers = (p: IconProps) => (
	<Base {...p}>
		<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
		<circle cx="9" cy="7" r="4" />
		<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
		<path d="M16 3.13a4 4 0 0 1 0 7.75" />
	</Base>
);

export const IconSearch = (p: IconProps) => (
	<Base {...p}>
		<circle cx="11" cy="11" r="7" />
		<path d="m21 21-4.3-4.3" />
	</Base>
);

export const IconBell = (p: IconProps) => (
	<Base {...p}>
		<path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6Z" />
		<path d="M10 20a2 2 0 0 0 4 0" />
	</Base>
);

export const IconSun = (p: IconProps) => (
	<Base {...p}>
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
	</Base>
);

export const IconMoon = (p: IconProps) => (
	<Base {...p}>
		<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
	</Base>
);

export const IconChevronDown = (p: IconProps) => (
	<Base {...p}>
		<path d="m6 9 6 6 6-6" />
	</Base>
);

export const IconPlus = (p: IconProps) => (
	<Base {...p}>
		<path d="M12 5v14M5 12h14" />
	</Base>
);

export const IconMoreVertical = (p: IconProps) => (
	<Base {...p}>
		<circle cx="12" cy="5" r="1.5" />
		<circle cx="12" cy="12" r="1.5" />
		<circle cx="12" cy="19" r="1.5" />
	</Base>
);

export const IconEye = (p: IconProps) => (
	<Base {...p}>
		<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
		<circle cx="12" cy="12" r="3" />
	</Base>
);

export const IconEyeOff = (p: IconProps) => (
	<Base {...p}>
		<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.6 21.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a21.6 21.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
		<path d="M1 1l22 22" />
	</Base>
);

export const IconAlertCircle = (p: IconProps) => (
	<Base {...p}>
		<circle cx="12" cy="12" r="9" />
		<path d="M12 8v5" />
		<path d="M12 16h.01" />
	</Base>
);

export const IconCheck = (p: IconProps) => (
	<Base {...p}>
		<path d="m5 13 4 4L19 7" />
	</Base>
);

export const IconLogOut = (p: IconProps) => (
	<Base {...p}>
		<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
		<path d="M16 17l5-5-5-5" />
		<path d="M21 12H9" />
	</Base>
);

export const IconX = (p: IconProps) => (
	<Base {...p}>
		<path d="M18 6 6 18M6 6l12 12" />
	</Base>
);

export const IconClock = (p: IconProps) => (
	<Base {...p}>
		<circle cx="12" cy="12" r="9" />
		<path d="M12 7v5l3 3" />
	</Base>
);

export const IconGift = (p: IconProps) => (
	<Base {...p}>
		<rect x="3" y="8" width="18" height="4" rx="1" />
		<path d="M12 8v13M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
		<path d="M12 8c-2.5 0-3.5-1.5-3.5-3A2.5 2.5 0 0 1 12 8Z" />
		<path d="M12 8c2.5 0 3.5-1.5 3.5-3A2.5 2.5 0 0 0 12 8Z" />
	</Base>
);

export const IconSatellite = (p: IconProps) => (
	<Base {...p}>
		<path d="M13 7 9 3 4.5 7.5 8.5 11.5" />
		<path d="m15 9-6 6" />
		<path d="m17 11 4.5 4.5L17 20l-4-4" />
		<path d="M2 22c2-4 4-6 8-8" />
	</Base>
);

export const IconClipboard = (p: IconProps) => (
	<Base {...p}>
		<rect x="5" y="4" width="14" height="17" rx="2" />
		<path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
		<path d="M9 11h6M9 15h6M9 19h3" />
	</Base>
);
