//@ts-nocheck
const
    mongoose = require( "mongoose" ),
    Class = require( '../Models/ClassModel' ),
    Student = require( "../Models/StudentModel" ),
    { DataBase } = require( '../DataBase' ),
    { isURL } = require( '../Models/utils' ),
    { getUniqueClassName, getUniqueVkId, isObjectId } = require( "../utils/functions" );


//TODO remove this sheat
const createTestData = async ( studentVkIds, isAddHomework = false ) => {
    let MockClass = await DataBase.createClass( getUniqueClassName() );

    await MockClass.updateOne( {
        schedule: [
            [ "Математика", "Русский", "Английский" ]
        ]
    } );

    if ( isAddHomework ) {
        await DataBase.addHomework( MockClass.name, "Русский", { text: "1" }, -1, new Date( 2020, 0, 2 ) );
        await DataBase.addHomework( MockClass.name, "Математика", { text: "2" }, -1, new Date( 2020, 0, 2 ) );
        await DataBase.addHomework( MockClass.name, "Математика", { text: "2" }, -1, new Date( 2019, 0, 2 ) ); //Не должен добавляться
    }

    for ( let id of studentVkIds ) {
        await DataBase.createStudent( id, MockClass._id );
    }
    return await DataBase.getClassByName( MockClass.name );
};

describe( "addHomework", () => {
    let MockClass;
    beforeAll( async () => {
        MockClass = await DataBase.createClass( getUniqueClassName() );
        await MockClass.updateOne( {
            schedule: [
                [ "Математика", "Русский", "Английский" ],
                [ "Английский", "История", "ОБЖ" ],
                [ "Математика", "История", "Обществознание" ],
                [ "Русский", "Английский", "Обществознание" ]
            ]
        } )
    } );
    afterEach( async () => {
        await Class.deleteMany( {} );
        await Student.deleteMany( {} );
        MockClass = await DataBase.createClass( getUniqueClassName() );
        await MockClass.updateOne( {
            schedule: [
                [ "Математика", "Русский", "Английский" ],
                [ "Английский", "История", "ОБЖ" ],
                [ "Математика", "История", "Обществознание" ],
                [ "Русский", "Английский", "Обществознание" ]
            ]
        } )
        await DataBase.addHomework( MockClass.name, "Математика", { text: "text" }, -1 );
        MockClass = await DataBase.getClassBy_Id( MockClass._id );
    } );
    afterAll( async () => {
        await Class.deleteMany( {} )
    } );

    it( "should return homework id if all is ok", async () => {
        const text = "Сделай дз уже блять сука блять";
        const lesson = "Обществознание";
        const studentVkId = getUniqueVkId();

        const result = await DataBase.addHomework( MockClass.name, lesson, { text }, studentVkId );

        const updatedHomework = await DataBase.getClassBy_Id( MockClass._id ).then( c => c.homework );
        expect( typeof result ).toBe( "object" );
        expect( updatedHomework.find( hw => hw._id.toString() === result.toString() ) );

    } );
    it( "should add one homework with right params", async () => {
        const text = "Сделай дз уже блять сука блять";
        const attachments = [ { value: "photo227667805_457239951_d18b007165cb0d264e", album_id: "-15" } ]
        const lesson = "Обществознание";
        const studentVkId = getUniqueVkId();
        const initialLength = MockClass.homework.length;

        const id = await DataBase.addHomework( MockClass.name, lesson, { text, attachments }, studentVkId, new Date( 2020, 2, 18 ) );

        const updatedClass = await DataBase.getClassBy_Id( MockClass._id );

        expect( updatedClass.homework.find( hw => hw._id.toString() === id.toString() ) ).not.toBeUndefined();

        const homework = updatedClass.homework.find( hw => hw._id.toString() === id.toString() );

        expect( updatedClass.homework.length - 1 ).toBe( initialLength );
        expect( homework.lesson ).toBe( lesson );
        expect( homework.to ).toEqual( new Date( 2020, 2, 18 ) );
        expect( homework.createdBy ).toBe( studentVkId );
        expect( homework.text ).toBe( text );
        expect( homework._id ).toEqual( id );
        expect( Array.isArray( homework.attachments ) ).toBe( true );
        expect( homework.attachments.length ).toBe( 1 );
        expect( homework.attachments.every( at => typeof at === "object" ) ).toBe( true );
        expect( homework.attachments.every( at => attachments.find( atach => atach.value === at.value ) !== undefined ) ).toBe( true );
        expect( homework.attachments.every( at => isURL( at.url ) ) ).toBe( true );
        expect( homework.attachments.every( at => isObjectId( at._id ) ) ).toBe( true );
    } );
    it( "should set homework's 'to' to given date if it passes", async () => {
        const text = "Сделай дз уже блять сука блять";
        const lesson = "Обществознание";
        const studentVkId = getUniqueVkId();

        await DataBase.addHomework( MockClass.name, lesson, { text }, studentVkId, new Date( 2019, 9, 22 ) );
        const updatedClass = await DataBase.getClassBy_Id( MockClass._id );
        const homework = updatedClass.homework.find( dz => dz.text === text );

        expect( homework.to ).toEqual( new Date( 2019, 9, 22 ) );
    } )
} );

describe( "getHomework", () => {
    let MockClass;
    beforeAll( async () => {
        MockClass = await DataBase.createClass( getUniqueClassName() );
        await MockClass.updateOne( {
            schedule: [
                [ "Математика", "Русский", "Английский" ]
            ]
        } );

        await DataBase.addHomework( MockClass.name, "Русский", { text: "Пошалить )" }, -1 );
        await DataBase.addHomework( MockClass.name, "Математика", { text: "Да" }, -1 );
        await DataBase.addHomework( MockClass.name, "Английский", { text: "Нет" }, -1, new Date( 2020, 0, 1 ) );
    } );
    afterAll( async () => {
        await Class.deleteMany( {} )
    } );
    afterEach( async () => {
        await Class.deleteMany( {} );
        await Student.deleteMany( {} );
        MockClass = await DataBase.createClass( getUniqueClassName() );
        await MockClass.updateOne( {
            schedule: [
                [ "Математика", "Русский", "Английский" ]
            ]
        } );

        await DataBase.addHomework( MockClass.name, "Русский", { text: "Пошалить )" }, -1 );
        await DataBase.addHomework( MockClass.name, "Математика", { text: "Да" }, -1 );
        await DataBase.addHomework( MockClass.name, "Английский", { text: "Нет" }, -1, new Date( 2020, 0, 1 ) );
    } )
    it( "should return list of homework", async () => {
        const result = await DataBase.getHomework( MockClass.name );

        expect( result.length ).toBe( 3 );
        expect( result[ 0 ].lesson ).toBe( "Русский" );
        expect( result[ 1 ].lesson ).toBe( "Математика" );
    } );
    it( "if date is passed should return homework only for this date", async () => {
        const result = await DataBase.getHomework( MockClass.name, new Date( 2020, 0, 1 ) );

        expect( result.length ).toBe( 1 );
        expect( result[ 0 ].lesson ).toBe( "Английский" );
    } )
} );

describe( "parseHomeworkToNotifications", () => {
    let studentVkIds1 = [ getUniqueVkId(), getUniqueVkId() ];
    let studentVkIds2 = [ getUniqueVkId(), getUniqueVkId() ];
    beforeAll( async () => {
        MockClass1 = await createTestData( studentVkIds1, true );
        MockClass2 = await createTestData( studentVkIds2, false );
    } );
    afterEach( async () => {
        await Class.deleteMany( {} )
        await Student.deleteMany( {} )
        MockClass1 = await createTestData( studentVkIds1, true );
        MockClass2 = await createTestData( studentVkIds2, false );
    } )
    it( "should return array of arrays where first element is array of vkIds and second is array of homework for them", async () => {
        const [ notificationArray1, notificationArray2 ] = await DataBase.parseHomeworkToNotifications( new Date( 2020, 0, 1, 17 ) );

        expect( notificationArray1 instanceof Array ).toBe( true ); //[vkIds, homework]
        expect( notificationArray2 ).toBeUndefined(); //Потому что дз нету
        expect( notificationArray1[ 0 ] instanceof Array ).toBe( true );
        expect( notificationArray1[ 1 ] instanceof Array ).toBe( true );

        expect( notificationArray1[ 0 ].every( vkId => studentVkIds1.includes( vkId ) ) ).toBe( true );
        expect( notificationArray1[ 1 ].find( e => e.text === "1" ) !== undefined && notificationArray1[ 1 ].find( e => e.text === "2" ) !== undefined ).toBe( true );

        expect( notificationArray1[ 0 ].length ).toBe( 2 ); //students amt
        expect( notificationArray1[ 1 ].length ).toBe( 2 ); //homework amt
    } )
} );

describe( "removeHomework", () => {
    let MockClass;
    let homeworkId1;
    beforeAll( async () => {
        MockClass = await DataBase.createClass( getUniqueClassName() );
        await MockClass.updateOne( {
            schedule: [
                [ "Математика", "Русский", "Английский" ]
            ]
        } );

        homeworkId1 = await DataBase.addHomework( MockClass.name, "Русский", { text: "Пошалить )" }, -1 );
        homeworkId2 = await DataBase.addHomework( MockClass.name, "Математика", { text: "Да" }, -1 );
    } );
    afterEach( async () => {
        await Class.deleteMany( {} );
        await Student.deleteMany( {} );
        MockClass = await DataBase.createClass( getUniqueClassName() );
        await MockClass.updateOne( {
            schedule: [
                [ "Математика", "Русский", "Английский" ]
            ]
        } );

        homeworkId1 = await DataBase.addHomework( MockClass.name, "Русский", { text: "Пошалить )" }, -1 );
        homeworkId2 = await DataBase.addHomework( MockClass.name, "Математика", { text: "Да" }, -1 );
    } )

    it( "should return true if all is ok", async () => {
        const result = await DataBase.removeHomework( MockClass.name, homeworkId1 );

        expect( result ).toBe( true );
    } )
    it( "should remove homework from class", async () => {
        await DataBase.removeHomework( MockClass.name, homeworkId1 );

        const updatedClass = await DataBase.getClassByName( MockClass.name );

        expect( updatedClass.homework.length ).toBe( 1 );
        expect( updatedClass.homework.every( hw => hw._id.toString() !== homeworkId1.toString() ) ).toBe( true );
    } )
    it( "should return false if class is not exists", async () => {
        const result = await DataBase.removeHomework( "not a name", homeworkId1 );

        expect( result ).toBe( false );
    } )
} )

describe( "updateHomework", () => {
    const content1 = {
        attachments: [ { value: "photo227667805_457239951_d18b007165cb0d264e", album_id: "-15" } ],
        text: "changes1"
    };
    const content2 = {
        attachments: [ { value: "photo227667805_457239951_d18b007165cb0d264e", album_id: "-15" } ],
        text: "changes2"
    };
    let chId1;
    let chId2;
    let className;

    beforeAll( async () => {
        const c = await createTestData( [] );
        className = c.name;
        chId1 = await DataBase.addHomework( className, "Математика", content1 );
        chId2 = await DataBase.addHomework( className, "Математика", content2 );
    } );
    afterAll( async () => {
        await Class.deleteMany( {} );
        await Student.deleteMany( {} );
    } )
    afterEach( async () => {
        await Student.deleteMany( {} );
        await Class.deleteMany( {} );
        const c = await createTestData( [] );
        className = c.name;
        chId1 = await DataBase.addHomework( className, "Математика", content1 );
        chId2 = await DataBase.addHomework( className, "Математика", content2 );
    } )

    it( "should return array of updated homework", async () => {
        const updateHomeworks = await DataBase.updateHomework( className, chId1, { text: "new text" } );

        expect( updateHomeworks.length ).toBe( 2 );

        expect( updateHomeworks.find( ch => ch._id.toString() === chId1.toString() ) ).toBeDefined();
        expect( updateHomeworks.find( ch => ch._id.toString() === chId2.toString() ) ).toBeDefined();
    } )

    it( "should updated change with given id", async () => {
        const updateHomework = await DataBase.updateHomework( className, chId1, { text: "new text" } );
        expect( updateHomework.find( ch => ch._id.toString() === chId1.toString() ).text ).toBe( "new text" );
    } )

    it( "should not update other changes", async () => {
        const textBeforeUpdate = ( await DataBase.getClassByName( className ) ).homework.find( ch => ch._id.toString() === chId2.toString() ).text;
        const updateHomework = await DataBase.updateHomework( className, chId1, { text: "new text" } );

        expect( updateHomework.find( ch => ch._id.toString() === chId2.toString() ).text ).toEqual( textBeforeUpdate );
    } )
} )