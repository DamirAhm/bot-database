const { createVkApi } = require( "./apiCreator" );

class VK_API {
    #apiKey;
    #api;
    constructor( key ) {
        this.#apiKey = key;
        this.#api = createVkApi( key );
    }

    getPhotoUrl = async ( at ) => {
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
};

module.exports = VK_API;