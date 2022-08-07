import RESTGuildChannel from "./RESTGuildChannel";
import type RESTClient from "../../RESTClient";
import type { EditVoiceChannelOptions as EditVoiceChannelOptions, RawOverwrite, RawRESTVoiceChannel } from "../../routes/Channels";
import type { ChannelTypes, VideoQualityModes } from "../../Constants";
import PermissionOverwrite from "../PermissionOverwrite";

/** Represents a guild voice channel. */
export default class RESTVoiceChannel extends RESTGuildChannel {
	/** The bitrate of the voice channel. */
	bitrate: number;
	/** If this channel is age gated. */
	nsfw: boolean;
	/** The permission overwrites of this channel. */
	permissionOverwrites: Array<PermissionOverwrite>;
	/** The position of this channel on the sidebar. */
	position: number;
	/** The id of the voice region of the channel, `null` is automatic. */
	rtcRegion: string | null;
	/** The topic of the channel. */
	topic: string | null;
	declare type: ChannelTypes.GUILD_VOICE;
	/** The [video quality mode](https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes) of this channel. */
	videoQualityMode: VideoQualityModes;
	constructor(data: RawRESTVoiceChannel, client: RESTClient) {
		super(data, client);
		this.bitrate              = data.bitrate;
		this.nsfw                 = data.nsfw;
		this.permissionOverwrites = data.permission_overwrites.map(overwrite => new PermissionOverwrite(overwrite));
		this.position             = data.position;
		this.rtcRegion            = data.rtc_region;
		this.topic                = data.topic;
		this.videoQualityMode     = data.video_quality_mode;
	}

	/**
	 * Edit this channel.
	 *
	 * @param {Object} options
	 * @param {String} [options.name] - The name of the channel.
	 * @param {?Boolean} [options.nsfw] - If the channel is age gated.
	 * @param {?String} [options.parentID] - The id of the parent category channel.
	 * @param {?RawOverwrite[]} [options.permissionOverwrites] - [All Guild] Channel or category specific permissions
	 * @param {?Number} [options.position] - The position of the channel in the channel list.
	 * @param {?String} [options.rtcRegion] - The voice region id of the channel, null for automatic.
	 * @param {?Number} [options.userLimit] - The maximum amount of users in the channel. `0` is unlimited, values range 1-99.
	 * @param {?VideoQualityModes} [options.videoQualityMode] - The [video quality mode](https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes) of the channel.
	 * @param {String} [reason] - The reason to be displayed in the audit log.
	 * @returns {Promise<RESTVoiceChannel>}
	 */
	async edit(options: EditVoiceChannelOptions, reason?: string) {
		return this._client.channels.edit<RESTVoiceChannel>(this.id, options, reason);
	}
}
