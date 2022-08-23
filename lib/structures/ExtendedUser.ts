import User from "./User";
import type Client from "../Client";
import type { EditSelfUserOptions, RawExtendedUser } from "../types/users";

/** Represents the currently authenticated user. */
export default class ExtendedUser extends User {
	/** The user's email. (always null for bots) */
	email: string | null;
	/** The flags of the user. */
	flags: number;
	/** The locale of the user */
	locale: string;
	/** If the user has mfa enabled on their account */
	mfaEnabled: boolean;
	/** If this user's email is verified. (always true for bots) */
	verified: boolean;
	constructor(data: RawExtendedUser, client: Client) {
		super(data, client);
		this.verified = !!data.verified;
		this.mfaEnabled = !!data.mfa_enabled;
		this.update(data);
	}

	protected update(data: Partial<RawExtendedUser>) {
		super.update(data);
		if (data.email !== undefined) this.email = data.email;
		if (data.flags !== undefined) this.flags = data.flags;
		if (data.locale !== undefined) this.locale = data.locale;
	}

	/**
	 * Modify this user.
	 *
	 * @param {Object} options
	 * @param {String} [options.username] - The new username
	 * @param {?(String | Buffer)} [options.avatar] - The new avatar (buffer, or full data url). `null` to remove the current avatar.
	 * @returns {Promise<ExtendedUser>}
	 */
	async edit(options: EditSelfUserOptions) {
		return this._client.rest.users.modifySelf(options);
	}
}
