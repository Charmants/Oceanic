/** @module User */
import Base from "./Base";
import type PrivateChannel from "./PrivateChannel";
import type Entitlement from "./Entitlement";
import type TestEntitlement from "./TestEntitlement";
import Clan from "./Clan";
import { EntitlementOwnerTypes, type ImageFormat } from "../Constants";
import * as Routes from "../util/Routes";
import type Client from "../Client";
import type { AvatarDecorationData, RawUser } from "../types/users";
import type { JSONUser } from "../types/json";
import type { SearchEntitlementsOptions } from "../types/applications";
import { UncachedError } from "../util/Errors";

/** Represents a user. */
export default class User extends Base {
    /** The user's banner color. If this member was received via the gateway, this will never be present. */
    accentColor?: number | null;
    /** The user's avatar hash. */
    avatar: string | null;
    /**
     * The hash of this user's avatar decoration.
     * @deprecated Use {@link Types/Users~AvatarDecorationData#asset | User#avatarDecorationData.asset} instead. This will be removed in 1.12.0.
     */
    avatarDecoration?: string | null;
    /** The data for this user's avatar decoration. */
    avatarDecorationData: AvatarDecorationData | null;
    /** The user's banner hash. If this member was received via the gateway, this will never be present. */
    banner?: string | null;
    /** If this user is a bot. */
    bot: boolean;
    /** The primary clan this user is in. */
    clan: Clan | null;
    /** The 4 digits after this user's username, if they have not been migrated. If migrated, this will be a single "0". */
    discriminator: string;
    /** The user's display name, if set. */
    globalName: string | null;
    /** The user's public [flags](https://discord.com/developers/docs/resources/user#user-object-user-flags). */
    publicFlags: number;
    /** If this user is an official discord system user. */
    system: boolean;
    /** The user's username. */
    username: string;
    constructor(data: RawUser, client: Client) {
        super(data.id, client);
        this.avatar = null;
        this.avatarDecorationData = null;
        this.bot = !!data.bot;
        this.clan = null;
        this.discriminator = data.discriminator;
        this.globalName = data.global_name;
        this.publicFlags = 0;
        this.system = !!data.system;
        this.username = data.username;
        this.update(data);
    }

    protected override update(data: Partial<RawUser>): void {
        if (data.accent_color !== undefined) {
            this.accentColor = data.accent_color;
        }
        if (data.avatar !== undefined) {
            this.avatar = data.avatar;
        }
        if (data.avatar_decoration_data !== undefined) {
            this.avatarDecorationData = data.avatar_decoration_data ? {
                asset: data.avatar_decoration_data.asset,
                skuID: data.avatar_decoration_data.sku_id
            } : null;
            this.avatarDecoration = data.avatar_decoration_data?.asset;
        }
        if (data.banner !== undefined) {
            this.banner = data.banner;
        }
        if (data.discriminator !== undefined) {
            this.discriminator = data.discriminator;
        }
        if (data.global_name !== undefined) {
            this.globalName = data.global_name;
        }
        if (data.public_flags !== undefined) {
            this.publicFlags = data.public_flags;
        }
        if (data.username !== undefined) {
            this.username = data.username;
        }
        if (data.clan !== undefined) {
            this.clan = data.clan ? new Clan(data.clan, this.client) : null;
        }
    }

    /** The default avatar value of this user. */
    get defaultAvatar(): number {
        if (this.isMigrated) {
            return Number(BigInt(this.id) >> 22n) % 6;
        }
        return Number(this.discriminator) % 5;
    }

    /** If this user has migrated to the new username system. */
    get isMigrated(): boolean {
        return (this.discriminator === undefined || this.discriminator === "0");
    }

    /** A string that will mention this user. */
    get mention(): string {
        return `<@${this.id}>`;
    }

    /** This user's unique username, if migrated, else a combination of the user's username and discriminator. */
    get tag(): string {
        if (this.isMigrated) {
            return this.username;
        }
        return `${this.username}#${this.discriminator}`;
    }

    /**
     * The url of this user's avatar decoration. This will always be a png.
     * Discord does not combine the decoration and their current avatar for you. This is ONLY the decoration.
     * @param size The dimensions of the image.
     */
    avatarDecorationURL(size?: number): string | null {
        return this.avatarDecorationData ? this.client.util.formatImage(Routes.AVATAR_DECORATION(this.avatarDecorationData.asset), "png", size) : null;
    }

    /**
     * The url of this user's avatar (or default avatar, if they have not set an avatar).
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    avatarURL(format?: ImageFormat, size?: number): string {
        return this.avatar === null ? this.defaultAvatarURL() : this.client.util.formatImage(Routes.USER_AVATAR(this.id, this.avatar), format, size);
    }

    /**
     * The url of this user's banner.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    bannerURL(format?: ImageFormat, size?: number): string | null {
        return this.banner ? this.client.util.formatImage(Routes.BANNER(this.id, this.banner), format, size) : null;
    }

    /**
     * Create a direct message with this user.
     */
    async createDM(): Promise<PrivateChannel> {
        return this.client.rest.channels.createDM(this.id);
    }

    /**
     * Create a test entitlement for this user.
     * @param skuID The ID of the SKU to create an entitlement for.
     * @param applicationID The ID of the application to create the entitlement for. If present, defaults to the logged in client's application id.
     */
    async createTestEntitlement(skuID: string, applicationID?: string): Promise<TestEntitlement> {
        if (applicationID === undefined && this.client["_application"] === undefined) {
            throw new UncachedError("Client#application is not present, you must provide an applicationID as a second argument. To not need to provide an ID, only call this after at least one shard is READY, or restMode is enabled.");
        }
        return this.client.rest.applications.createTestEntitlement(applicationID ?? this.client.application.id, {
            ownerID:   this.id,
            ownerType: EntitlementOwnerTypes.USER,
            skuID
        });
    }

    /**
     * The url of this user's default avatar.
     */
    defaultAvatarURL(): string {
        return this.client.util.formatImage(Routes.EMBED_AVATAR(this.defaultAvatar), "png");
    }

    /**
     * Get the entitlements for this guild.
     * @param options The options for getting the entitlements.
     */
    async getEntitlements(options?: Omit<SearchEntitlementsOptions, "userID">, applicationID?: string): Promise<Array<Entitlement | TestEntitlement>> {
        if (applicationID === undefined && this.client["_application"] === undefined) {
            throw new UncachedError("Client#application is not present, you must provide an applicationID as a second argument. To not need to provide an ID, only call this after at least one shard is READY, or restMode is enabled.");
        }
        return this.client.rest.applications.getEntitlements(applicationID ?? this.client.application.id, { userID: this.id, ...options });
    }

    override toJSON(): JSONUser {
        return {
            ...super.toJSON(),
            accentColor:          this.accentColor,
            avatar:               this.avatar,
            avatarDecorationData: this.avatarDecorationData,
            banner:               this.banner,
            bot:                  this.bot,
            discriminator:        this.discriminator,
            globalName:           this.globalName,
            publicFlags:          this.publicFlags,
            system:               this.system,
            username:             this.username
        };
    }
}
