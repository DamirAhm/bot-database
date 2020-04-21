// @ts-nocheck
const
    { DataBase } = require( '../DataBase' ),
    mongoose = require( "mongoose" ),
    Class = require( '../Models/ClassModel' ),
    { lessonsIndexesToLessonsNames } = require( '../utils/functions' );
const { getUniqueClassName, getUniqueVkId } = require( "../utils/functions" );
const { Lessons } = require( "../Models/utils" );
describe( "setSchedule", () => {
    let MockClass;
    beforeAll( async () => {
        MockClass = await DataBase.createClass( getUniqueClassName() );
    } );
    afterEach( async () => {
        Class.deleteMany( {} );
        MockClass = await DataBase.createClass( getUniqueClassName() );
    } );
    afterAll( async () => {
        await Class.deleteMany( {} )
    } );

    it( "should return true if all is ok", async () => {
        const lessons = [
            "1", "2", "3"
        ];
        const indexes = [
            [ 0, 1, 2 ],
            [ 2, 1, 0 ]
        ];

        const result = await DataBase.setSchedule( MockClass.name, indexes, lessons );

        return expect( result ).toBe( true );
    } );
    it( "should change class's schedule to new", async () => {
        const lessons = [
            "1", "2", "3"
        ];
        const indexes = [
            [ 0, 1, 2 ],
            [ 2, 1, 0 ]
        ];

        await DataBase.setSchedule( MockClass.name, indexes, lessons );

        const updatedClass = await DataBase.getClassBy_Id( MockClass._id );

        return expect( JSON.parse( JSON.stringify( updatedClass.schedule ) ) ).toEqual( lessonsIndexesToLessonsNames( lessons, indexes ) );
    } );
    it( "should throw error if className is not type of string", async () => {
        return DataBase.setSchedule()
            .catch( e => expect( e ).toBeInstanceOf( TypeError ) );
    } );
    it( "should return false if className is not belongs to any class", async () => {
        const result = await DataBase.setSchedule( "not real class name" );

        return expect( result ).toBe( false );
    } );
} );

describe( "getSchedule", () => {
    let MockClass;
    let schedule
    beforeAll( async () => {
        const _class = await DataBase.createClass( getUniqueClassName() );
        schedule = [
            [ "Математика", "Русский", "История" ],
            [ "Математика", "ОБЖ", "Английский" ],
            [ "Информатика", "Обществознание", "Физика" ],
            [ "Физкультура", "Биология", "Химия" ],
            [ "Классный час", "Русский", "Английский" ],
            [ "Математика", "Русский", "Астрономия" ],
        ]
        await _class.updateOne( { schedule } );

        MockClass = await DataBase.getClassBy_Id( _class._id );
    } )
    afterEach( async () => {
        Class.deleteMany( {} );
        const _class = await DataBase.createClass( getUniqueClassName() );
        schedule = [
            [ "Математика", "Русский", "История" ],
            [ "Математика", "ОБЖ", "Английский" ],
            [ "Информатика", "Обществознание", "Физика" ],
            [ "Физкультура", "Биология", "Химия" ],
            [ "Классный час", "Русский", "Английский" ],
            [ "Математика", "Русский", "Астрономия" ],
        ]
        await _class.updateOne( { schedule } );

        MockClass = await DataBase.getClassBy_Id( _class._id );
    } )

    it( "should return array of arrays of lessons", async () => {
        const sch = await DataBase.getSchedule( MockClass.name );

        expect( Array.isArray( sch ) ).toBe( true );
        expect( sch.length ).toBe( 6 );
        expect( sch.every( Array.isArray ) ).toBe( true );
        expect( sch.every( e => e.every( e => Lessons.includes( e ) ) ) ).toBe( true );
    } )
} )

describe( "changeDay", () => {
    let MockClass;
    let schedule
    beforeAll( async () => {
        const _class = await DataBase.createClass( getUniqueClassName() );
        schedule = [
            [ "Математика", "Русский", "История" ],
            [ "Математика", "ОБЖ", "Английский" ],
            [ "Информатика", "Обществознание", "Физика" ],
            [ "Физкультура", "Биология", "Химия" ],
            [ "Классный час", "Русский", "Английский" ],
            [ "Математика", "Русский", "Астрономия" ],
        ]
        await _class.updateOne( { schedule } );

        MockClass = await DataBase.getClassBy_Id( _class._id );
    } )
    afterEach( async () => {
        Class.deleteMany( {} );
        const _class = await DataBase.createClass( getUniqueClassName() );
        schedule = [
            [ "Математика", "Русский", "История" ],
            [ "Математика", "ОБЖ", "Английский" ],
            [ "Информатика", "Обществознание", "Физика" ],
            [ "Физкультура", "Биология", "Химия" ],
            [ "Классный час", "Русский", "Английский" ],
            [ "Математика", "Русский", "Астрономия" ],
        ]
        await _class.updateOne( { schedule } );

        MockClass = await DataBase.getClassBy_Id( _class._id );
    } )

    it( "should return updated schedule", async () => {
        const index = 1;
        const newDay = [ "Ничего", "Ничего", "Ничего" ];

        const newSchedule = await DataBase.changeDay( MockClass.name, index, newDay );

        expect( newSchedule ).toBeInstanceOf( Array );
        expect( newSchedule.length ).toBe( 6 );
    } )
    it( "should return update class' schedule", async () => {
        const index = 1;
        const newDay = [ "Ничего", "Ничего", "Ничего" ];

        const newSchedule = await DataBase.changeDay( MockClass.name, index, newDay );

        const actualSchedule = await DataBase.getClassByName( MockClass.name ).then( c => c.schedule );

        expect( newSchedule ).toBeInstanceOf( Array );
        expect( newSchedule.length ).toBe( 6 );
        expect( JSON.stringify( newSchedule ) ).toBe( JSON.stringify( actualSchedule ) );
    } )
    it( "should return update day at index to new day", async () => {
        const index = 1;
        const newDay = [ "Ничего", "Ничего", "Ничего" ];

        const newSchedule = await DataBase.changeDay( MockClass.name, index, newDay );

        expect( newSchedule.every( ( d, i ) => i === index ? d === newDay : d === schedule[ i ] ) )
    } )
} )