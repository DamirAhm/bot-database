// @ts-nocheck
const mongoose = require( "mongoose" );
const uuid4 = require( "uuid4" );
const { Lessons, isURL } = require( "./utils" );

const isLesson = str => Lessons.includes( str );

const attachment = mongoose.Schema( {
    value: {
        type: String,
        validate: {
            validator: str => /^photo.+(_.+)*/.test( str ),
            message: "url must be a valid vk attachment"
        },
        required: true,
    },
    url: {
        type: String,
        validate: {
            validator: isURL,
            message: "url must be a valid URL"
        },
        required: true,
    },
    album_id: {
        type: Number
    }
} );

const classSchema = mongoose.Schema( {
    students: {
        type: [ {
            type: mongoose.Schema.ObjectId,
            ref: "Student",
        } ],
        default: []
    },
    name: {
        type: String,
        validate: {
            validator: ( name ) => {
                if ( /(\d)+([A-Z]|[А-Я])/.test( name ) ) {
                    if ( ( name.match( /\d/ )[ 0 ] !== "0" && +name.match( /\d/ )[ 0 ] <= 11 && +name.match( /\d/ )[ 0 ] === ~~+name.match( /\d/ )[ 0 ] ) || name === "0Z" ) {
                        return true;
                    }
                }
                return false;
            },
            message: "Class name must match digit + letter"
        },
        required: true,
        unique: true
    },
    homework: {
        type: [
            {
                lesson: {
                    required: true,
                    type: String,
                    validate: {
                        validator: isLesson,
                        message: "Lesson must be one of existing"
                    }
                },
                text: {
                    required: true,
                    type: String
                },
                to: {
                    type: Date,
                    default: new Date( Date.now() + 1000 * 60 * 60 * 24 * 7 ),
                },
                attachments: [ attachment ],
                createdBy: {
                    type: Number,
                    validate: {
                        validator: Number.isInteger,
                        message: "Created by must be integer means vk id of user created it"
                    }
                },
                _id: {
                    type: mongoose.Schema.ObjectId,
                    default: new mongoose.Types.ObjectId()
                }
            }
        ],
        default: []
    },
    schedule: {
        type:
            [
                [
                    {
                        type: String,
                        validate: {
                            validator: isLesson,
                            message: "Lesson must be one of existing"
                        }
                    }
                ]
            ],
        default: [
            [], [], [],
            [], [], []
        ]
    },
    changes: {
        type: [ {
            text: String,
            attachments: [ attachment ],
            to: Date,
            createdBy: {
                type: Number,
                validate: {
                    validator: Number.isInteger,
                    message: "Created by must be integer means vk id of user created it"
                }
            },
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                default: new mongoose.Types.ObjectId()
            }
        } ],
        default: []
    },
    roleUpCodes: {
        type: [ String ],
        default: [],
        validate: {
            validator: ( arrayOfCodes ) => arrayOfCodes.every( code => uuid4.valid( code ) ),
            message: "All roleUp codes must be valid uuid4 codes"
        }
    }
} );


module.exports = mongoose.model( "Class", classSchema );
