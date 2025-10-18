// src/cascade/static/Audio.ts
// Static utility namespace for sound and voice-over management

/**
 * Static utility namespace for audio operations.
 * Provides methods for playing sounds, voice-overs, and audio control.
 */
export namespace Audio {
    /**
     * Plays a sound for all players.
     * @param sound The sound effect to play.
     * @param amplitude The amplitude/volume of the sound.
     */
    export function playSound(sound: mod.SFX, amplitude: number): void {
        mod.PlaySound(sound, amplitude);
    }

    /**
     * Plays a sound for a specific player.
     * @param sound The sound effect to play.
     * @param amplitude The amplitude/volume of the sound.
     * @param player The player to play the sound for.
     */
    export function playSoundForPlayer(
        sound: mod.SFX,
        amplitude: number,
        player: mod.Player
    ): void {
        mod.PlaySound(sound, amplitude, player);
    }

    /**
     * Plays a sound for a specific team.
     * @param sound The sound effect to play.
     * @param amplitude The amplitude/volume of the sound.
     * @param team The team to play the sound for.
     */
    export function playSoundForTeam(
        sound: mod.SFX,
        amplitude: number,
        team: mod.Team
    ): void {
        mod.PlaySound(sound, amplitude, team);
    }

    /**
     * Plays a sound for a specific squad.
     * @param sound The sound effect to play.
     * @param amplitude The amplitude/volume of the sound.
     * @param squad The squad to play the sound for.
     */
    export function playSoundForSquad(
        sound: mod.SFX,
        amplitude: number,
        squad: mod.Squad
    ): void {
        mod.PlaySound(sound, amplitude, squad);
    }

    /**
     * Plays a sound at a specific location for all players.
     * @param sound The sound effect to play.
     * @param amplitude The amplitude/volume of the sound.
     * @param location The location to play the sound at.
     * @param attenuationRange The range over which the sound attenuates.
     */
    export function playSoundAtLocation(
        sound: mod.SFX,
        amplitude: number,
        location: mod.Vector,
        attenuationRange: number
    ): void {
        mod.PlaySound(sound, amplitude, location, attenuationRange);
    }

    /**
     * Plays a sound at a specific location for a player.
     * @param sound The sound effect to play.
     * @param amplitude The amplitude/volume of the sound.
     * @param location The location to play the sound at.
     * @param attenuationRange The range over which the sound attenuates.
     * @param player The player to play the sound for.
     */
    export function playSoundAtLocationForPlayer(
        sound: mod.SFX,
        amplitude: number,
        location: mod.Vector,
        attenuationRange: number,
        player: mod.Player
    ): void {
        mod.PlaySound(sound, amplitude, location, attenuationRange, player);
    }

    /**
     * Plays a sound at a specific location for a team.
     * @param sound The sound effect to play.
     * @param amplitude The amplitude/volume of the sound.
     * @param location The location to play the sound at.
     * @param attenuationRange The range over which the sound attenuates.
     * @param team The team to play the sound for.
     */
    export function playSoundAtLocationForTeam(
        sound: mod.SFX,
        amplitude: number,
        location: mod.Vector,
        attenuationRange: number,
        team: mod.Team
    ): void {
        mod.PlaySound(sound, amplitude, location, attenuationRange, team);
    }

    /**
     * Plays a sound at a specific location for a squad.
     * @param sound The sound effect to play.
     * @param amplitude The amplitude/volume of the sound.
     * @param location The location to play the sound at.
     * @param attenuationRange The range over which the sound attenuates.
     * @param squad The squad to play the sound for.
     */
    export function playSoundAtLocationForSquad(
        sound: mod.SFX,
        amplitude: number,
        location: mod.Vector,
        attenuationRange: number,
        squad: mod.Squad
    ): void {
        mod.PlaySound(sound, amplitude, location, attenuationRange, squad);
    }

    /**
     * Stops a sound for all players.
     * @param objectId The sound object ID.
     */
    export function stopSound(objectId: number): void {
        mod.StopSound(objectId);
    }

    /**
     * Stops a sound for a specific player.
     * @param objectId The sound object ID.
     * @param player The player to stop the sound for.
     */
    export function stopSoundForPlayer(
        objectId: number,
        player: mod.Player
    ): void {
        mod.StopSound(objectId, player);
    }

    /**
     * Stops a sound for a specific team.
     * @param objectId The sound object ID.
     * @param team The team to stop the sound for.
     */
    export function stopSoundForTeam(objectId: number, team: mod.Team): void {
        mod.StopSound(objectId, team);
    }

    /**
     * Stops a sound for a specific squad.
     * @param objectId The sound object ID.
     * @param squad The squad to stop the sound for.
     */
    export function stopSoundForSquad(
        objectId: number,
        squad: mod.Squad
    ): void {
        mod.StopSound(objectId, squad);
    }

    /**
     * Plays a voice-over event clip for all players.
     * @param voiceOver The voice-over to play.
     * @param event The voice-over event.
     * @param flag The voice-over flags.
     */
    export function playVO(
        voiceOver: mod.VO,
        event: mod.VoiceOverEvents2D,
        flag: mod.VoiceOverFlags
    ): void {
        mod.PlayVO(voiceOver, event, flag);
    }

    /**
     * Plays a voice-over event clip for a specific player.
     * @param voiceOver The voice-over to play.
     * @param event The voice-over event.
     * @param flag The voice-over flags.
     * @param player The player to play for.
     */
    export function playVOForPlayer(
        voiceOver: mod.VO,
        event: mod.VoiceOverEvents2D,
        flag: mod.VoiceOverFlags,
        player: mod.Player
    ): void {
        mod.PlayVO(voiceOver, event, flag, player);
    }

    /**
     * Plays a voice-over event clip for a specific squad.
     * @param voiceOver The voice-over to play.
     * @param event The voice-over event.
     * @param flag The voice-over flags.
     * @param squad The squad to play for.
     */
    export function playVOForSquad(
        voiceOver: mod.VO,
        event: mod.VoiceOverEvents2D,
        flag: mod.VoiceOverFlags,
        squad: mod.Squad
    ): void {
        mod.PlayVO(voiceOver, event, flag, squad);
    }

    /**
     * Plays a voice-over event clip for a specific team.
     * @param voiceOver The voice-over to play.
     * @param event The voice-over event.
     * @param flag The voice-over flags.
     * @param team The team to play for.
     */
    export function playVOForTeam(
        voiceOver: mod.VO,
        event: mod.VoiceOverEvents2D,
        flag: mod.VoiceOverFlags,
        team: mod.Team
    ): void {
        mod.PlayVO(voiceOver, event, flag, team);
    }

    /**
     * Sets the volume of a sound effect.
     * @param sound The sound effect.
     * @param volume The volume level.
     */
    export function setSFXVolume(sound: mod.SFX, volume: number): void {
        mod.SetSFXVolume(sound, volume);
    }

    /**
     * Enables or disables a world sound effect.
     * @param sound The sound effect.
     * @param enabled Whether the sound is enabled.
     */
    export function enableSFX(sound: mod.SFX, enabled: boolean): void {
        mod.EnableSFX(sound, enabled);
    }
}
