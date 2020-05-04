// @ts-nocheck
const { createVkApi } = require( "./apiCreator" );
const fetch = require( "node-fetch" );
const config = require( "config" );

class VK_API {
    #apiKey;
    #api;
    constructor( key ) {
        this.#apiKey = key;
        this.#api = createVkApi( key );
    }

    async getPhotoUrl ( at ) {
        if ( at ) {
            let url;
            if ( /^photo/.test( at ) ) {
                const [ owner_id, photo_ids ] = at.slice( 5 ).split( "_" );
                url = await this.#api( "photos.get", {
                    owner_id,
                    photo_ids,
                    album_id: "saved"
                } ).then( photo => photo.items[ 0 ].sizes[ 4 ].url );
            }

            return url;
        } else {
            return "#";
        }
    }
    async getUser ( userId ) {
        return await this.#api( "users.get", { user_ids: userId } )
    }

    async uploadPhotoToServer ( formData ) {
        const res = await fetch( config.get( "ATTACHMENT_UPLOAD_SERVER" ), {
            method: "POST",
            body: formData
        } ).then( res => res.json );

        return res;
    }
    async savePhoto ( formData ) {
        const { hash, photos_list, server } = await uploadPhotoToServer( formData );

        const res = await this.#api( "photos.save", {
            album_id: config.get( "ALBUM_ID" ),
            group_id: config.get( "GROUP_ID" ),
            server,
            hash,
            photos_list,
        } )

        if ( res ) {
            return {
                url: res.sizes[ 4 ].url,
                value: `photos${res.owner_id}_${res.id}`,
                album: res.album_id
            }
        } else {
            return null;
        }
    }
};

module.exports = VK_API;