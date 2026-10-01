import type { User } from "firebase/auth";

export type AccountOutletContext = {
	user: User;
	onDisplayNameChange: (displayName: string) => void;
};
